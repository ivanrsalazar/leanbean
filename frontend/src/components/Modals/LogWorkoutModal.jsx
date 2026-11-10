import React, { useEffect, useMemo, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"
import "./ModalStyles.css"

/**
 * Log a workout by selecting an existing Base Workout and (optionally)
 * tweaking pre-populated grouped activities before submitting.
 *
 * POST /workouts/log/
 * payload: { base_workout, date, activities: [ {activity_id, unit, amount, reps?}, ... ] }
 */
export default function LogWorkoutModal({ open, onClose, date, onSuccess }) {
    const [baseWorkouts, setBaseWorkouts] = useState([])
    const [selectedWorkoutId, setSelectedWorkoutId] = useState("")
    const [groupedActivities, setGroupedActivities] = useState([]) // [{activityId, type, unit, setsData:[...]}]
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setSelectedWorkoutId("")
        setGroupedActivities([])
        setError(null)
        setSaving(false)

        axiosInstance.get("/workouts/").then(res => {
            setBaseWorkouts(Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []))
        }).catch(() => setBaseWorkouts([]))
    }, [open])

    // When workout changes, fetch and group its activities
    useEffect(() => {
        if (!open || !selectedWorkoutId) return
        axiosInstance.get(`/workouts/${selectedWorkoutId}/`)
            .then(res => {
                const raw = res.data?.activities || []
                const groups = raw.reduce((acc, cur) => {
                    const id = cur.activity?.id
                    if (!id) return acc
                    const isLifting = cur.activity?.type === "Lifting"

                    if (!acc[id]) {
                        acc[id] = isLifting
                            ? { activityId: id, type: "Lifting", unit: "reps", setsData: [] }
                            : { activityId: id, type: "Cardio", unit: cur.unit || "", setsData: [] }
                    }

                    if (isLifting) {
                        acc[id].setsData.push({ weight: cur.amount || "", reps: cur.reps || "" })
                    } else {
                        acc[id].setsData.push({ amount: cur.amount || "" })
                    }

                    return acc
                }, {})
                setGroupedActivities(Object.values(groups))
            })
            .catch(() => setGroupedActivities([]))
    }, [open, selectedWorkoutId])

    const flattenActivities = useMemo(() => {
        return (groups) => {
            const out = []
            groups.forEach(g => {
                if (g.type === "Lifting") {
                    (g.setsData || []).forEach(s => {
                        out.push({
                            activity_id: g.activityId,
                            unit: "reps",
                            amount: parseFloat(s.weight || "0"),
                            reps: parseInt(s.reps || "0", 10),
                        })
                    })
                } else {
                    (g.setsData || []).forEach(s => {
                        out.push({
                            activity_id: g.activityId,
                            unit: g.unit,
                            amount: parseFloat(s.amount || "0"),
                        })
                    })
                }
            })
            return out
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const payload = {
                base_workout: Number(selectedWorkoutId),
                date, // YYYY-MM-DD
                activities: flattenActivities(groupedActivities),
            }
            await axiosInstance.post("/workouts/log/", payload)
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to log workout.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Log Workout</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Base Workout</label>
                        <select
                            value={selectedWorkoutId}
                            onChange={(e) => setSelectedWorkoutId(e.target.value)}
                            required
                        >
                            <option value="">-- Select --</option>
                            {baseWorkouts.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Minimal inline editor, adjusts amounts/reps */}
                    {groupedActivities.map((g, idx) => (
                        <div key={idx} className="activity-block">
                            <div className="form-group">
                                <label>Activity #{g.activityId} — {g.type}</label>
                            </div>

                            {g.type === "Cardio" ? (
                                <div className="form-group">
                                    <label>Unit</label>
                                    <input
                                        value={g.unit}
                                        onChange={(e) => {
                                            const clone = [...groupedActivities]
                                            clone[idx].unit = e.target.value
                                            setGroupedActivities(clone)
                                        }}
                                    />
                                    <label style={{ marginTop: 8 }}>Amount</label>
                                    {(g.setsData || []).map((s, sIdx) => (
                                        <input
                                            key={sIdx}
                                            type="number"
                                            value={s.amount}
                                            onChange={(e) => {
                                                const clone = [...groupedActivities]
                                                clone[idx].setsData[sIdx].amount = e.target.value
                                                setGroupedActivities(clone)
                                            }}
                                            style={{ marginTop: 6 }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Sets (weight / reps)</label>
                                    {(g.setsData || []).map((s, sIdx) => (
                                        <div key={sIdx} style={{ display: "flex", gap: 8 }}>
                                            <input
                                                type="number"
                                                placeholder="weight"
                                                value={s.weight}
                                                onChange={(e) => {
                                                    const clone = [...groupedActivities]
                                                    clone[idx].setsData[sIdx].weight = e.target.value
                                                    setGroupedActivities(clone)
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="reps"
                                                value={s.reps}
                                                onChange={(e) => {
                                                    const clone = [...groupedActivities]
                                                    clone[idx].setsData[sIdx].reps = e.target.value
                                                    setGroupedActivities(clone)
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving || !selectedWorkoutId}>
                            {saving ? "Logging..." : "Log Workout"}
                        </button>
                        <button type="button" className="modal-button cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
