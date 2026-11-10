import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"
import "./ModalStyles.css"

/**
 * Edit a Base Workout’s name and activities.
 * GET /workouts/:id/
 * PATCH /workouts/:id/
 */
export default function EditWorkoutModal({ open, onClose, onSuccess }) {
    const [workouts, setWorkouts] = useState([])
    const [selectedId, setSelectedId] = useState("")
    const [name, setName] = useState("")
    const [groups, setGroups] = useState([]) // [{activityId, type, unit, setsData:[]}]
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setSelectedId("")
        setName("")
        setGroups([])
        setSaving(false)
        setError(null)

        axiosInstance.get("/workouts/").then(res => {
            setWorkouts(Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []))
        }).catch(() => setWorkouts([]))
    }, [open])

    useEffect(() => {
        if (!open || !selectedId) return
        axiosInstance.get(`/workouts/${selectedId}/`)
            .then(res => {
                setName(res.data?.name || "")
                const raw = res.data?.activities || []
                const grouped = raw.reduce((acc, cur) => {
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
                setGroups(Object.values(grouped))
            })
            .catch(() => {
                setName("")
                setGroups([])
            })
    }, [open, selectedId])

    const addGroup = () => setGroups(prev => [...prev, { activityId: "", type: "Cardio", unit: "steps", setsData: [{ amount: "" }] }])
    const removeGroup = (idx) => setGroups(prev => prev.filter((_, i) => i !== idx))

    const addSet = (idx) => {
        setGroups(prev => prev.map((g, i) => {
            if (i !== idx) return g
            const isLifting = g.type === "Lifting"
            return {
                ...g,
                setsData: [...(g.setsData || []), isLifting ? { weight: "", reps: "" } : { amount: "" }]
            }
        }))
    }

    const updateGroupField = (idx, field, value) => {
        setGroups(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g))
    }

    const updateSetField = (idx, sIdx, field, value) => {
        setGroups(prev => prev.map((g, i) => {
            if (i !== idx) return g
            const sets = [...(g.setsData || [])]
            sets[sIdx] = { ...sets[sIdx], [field]: value }
            return { ...g, setsData: sets }
        }))
    }

    const toPayload = () => {
        const out = []
        groups.forEach(g => {
            if (g.type === "Lifting") {
                (g.setsData || []).forEach(s => {
                    out.push({
                        activity_id: Number(g.activityId),
                        unit: "reps",
                        amount: parseFloat(s.weight || "0"),
                        reps: parseInt(s.reps || "0", 10),
                    })
                })
            } else {
                (g.setsData || []).forEach(s => {
                    out.push({
                        activity_id: Number(g.activityId),
                        unit: g.unit,
                        amount: parseFloat(s.amount || "0"),
                    })
                })
            }
        })
        return out
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await axiosInstance.patch(`/workouts/${selectedId}/`, {
                name,
                activities: toPayload(),
            })
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to update workout.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Edit Base Workout</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Workout</label>
                        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                            <option value="">-- Select --</option>
                            {workouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    {selectedId && (
                        <>
                            <div className="form-group">
                                <label>Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>

                            {groups.map((g, idx) => (
                                <div key={idx} className="activity-block">
                                    <div className="form-group" style={{ display: "flex", gap: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Activity ID</label>
                                            <input
                                                type="number"
                                                value={g.activityId}
                                                onChange={(e) => updateGroupField(idx, "activityId", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div style={{ width: 180 }}>
                                            <label>Type</label>
                                            <select
                                                value={g.type}
                                                onChange={(e) => updateGroupField(idx, "type", e.target.value)}
                                            >
                                                <option value="Cardio">Cardio</option>
                                                <option value="Lifting">Lifting</option>
                                            </select>
                                        </div>
                                    </div>

                                    {g.type === "Cardio" ? (
                                        <div className="form-group">
                                            <label>Unit</label>
                                            <input value={g.unit} onChange={(e) => updateGroupField(idx, "unit", e.target.value)} />
                                            <label style={{ marginTop: 8 }}>Entries</label>
                                            {(g.setsData || []).map((s, sIdx) => (
                                                <input
                                                    key={sIdx}
                                                    type="number"
                                                    value={s.amount}
                                                    onChange={(e) => updateSetField(idx, sIdx, "amount", e.target.value)}
                                                    style={{ marginTop: 6 }}
                                                />
                                            ))}
                                            <div className="modal-button-container" style={{ justifyContent: "flex-start" }}>
                                                <button type="button" className="add-row-button modal-button" onClick={() => addSet(idx)}>
                                                    Add Entry
                                                </button>
                                            </div>
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
                                                        onChange={(e) => updateSetField(idx, sIdx, "weight", e.target.value)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="reps"
                                                        value={s.reps}
                                                        onChange={(e) => updateSetField(idx, sIdx, "reps", e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            <div className="modal-button-container" style={{ justifyContent: "flex-start" }}>
                                                <button type="button" className="add-row-button modal-button" onClick={() => addSet(idx)}>
                                                    Add Set
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="modal-button-container" style={{ justifyContent: "flex-end" }}>
                                        <button type="button" className="remove-ingredient-button" onClick={() => removeGroup(idx)}>
                                            Remove Activity
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="modal-button-container" style={{ justifyContent: "flex-start" }}>
                                <button type="button" className="modal-button add-row-button" onClick={addGroup}>
                                    Add Activity
                                </button>
                            </div>
                        </>
                    )}

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving || !selectedId}>
                            {saving ? "Saving..." : "Save Changes"}
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
