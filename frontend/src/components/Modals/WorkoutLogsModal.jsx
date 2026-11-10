import React, { useCallback, useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"
import "./ModalStyles.css"

const groupLog = (log) => {
    const raw = log.activities || []
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
    return {
        logId: log.id,
        baseWorkout: log.base_workout,
        date: log.date,
        groupedActivities: Object.values(groups),
    }
}

/**
 * View & inline-edit today's workout logs.
 * GET  /workouts/log/list/?date=YYYY-MM-DD
 * PATCH /workouts/log/:id/
 */
export default function WorkoutLogsModal({ open, onClose, date, onSuccess }) {
    const [edit, setEdit] = useState([]) // grouped/editable version
    const [savingIndex, setSavingIndex] = useState(-1)
    const [error, setError] = useState(null)

    const load = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get("/workouts/log/list/", { params: { date } })
            setEdit((data || []).map(groupLog))
        } catch {
            setEdit([])
        }
    }, [date])

    useEffect(() => {
        if (!open) return
        setError(null)
        setSavingIndex(-1)
        load()
    }, [open, load])

    const flatten = (groupedActivities) => {
        const out = []
        groupedActivities.forEach(g => {
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

    const updateGroupField = (logIdx, gIdx, field, value) => {
        setEdit(prev => prev.map((l, i) => {
            if (i !== logIdx) return l
            const groups = [...l.groupedActivities]
            groups[gIdx] = { ...groups[gIdx], [field]: value }
            return { ...l, groupedActivities: groups }
        }))
    }

    const updateSetField = (logIdx, gIdx, sIdx, field, value) => {
        setEdit(prev => prev.map((l, i) => {
            if (i !== logIdx) return l
            const groups = [...l.groupedActivities]
            const sets = [...(groups[gIdx].setsData || [])]
            sets[sIdx] = { ...sets[sIdx], [field]: value }
            groups[gIdx] = { ...groups[gIdx], setsData: sets }
            return { ...l, groupedActivities: groups }
        }))
    }

    const saveLog = async (logIdx) => {
        try {
            setSavingIndex(logIdx)
            const item = edit[logIdx]
            const payload = {
                base_workout: item.baseWorkout?.id || item.baseWorkout, // keep id
                date: item.date,
                activities: flatten(item.groupedActivities),
            }
            await axiosInstance.patch(`/workouts/log/${item.logId}/`, payload)
            onSuccess && onSuccess()
            await load()
        } catch {
            setError("Failed to save workout log.")
        } finally {
            setSavingIndex(-1)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Today's Workout Logs</h2>

                {edit.length === 0 ? (
                    <p className="message" style={{ color: "var(--muted)" }}>No logs for this date.</p>
                ) : (
                    edit.map((log, idx) => (
                        <div key={log.logId} className="activity-block">
                            <div className="form-group">
                                <label>Log #{log.logId} — {log.baseWorkout?.name || `Workout ${log.baseWorkout}`}</label>
                                <div style={{ fontSize: ".9rem", color: "var(--muted)" }}>Date: {log.date}</div>
                            </div>

                            {log.groupedActivities.map((g, gIdx) => (
                                <div key={`${g.activityId}-${gIdx}`} className="recipe-ingredient-row">
                                    <div className="form-group" style={{ display: "flex", gap: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Activity ID</label>
                                            <input
                                                type="number"
                                                value={g.activityId}
                                                onChange={(e) => updateGroupField(idx, gIdx, "activityId", e.target.value)}
                                            />
                                        </div>
                                        <div style={{ width: 180 }}>
                                            <label>Type</label>
                                            <select
                                                value={g.type}
                                                onChange={(e) => updateGroupField(idx, gIdx, "type", e.target.value)}
                                            >
                                                <option value="Cardio">Cardio</option>
                                                <option value="Lifting">Lifting</option>
                                            </select>
                                        </div>
                                    </div>

                                    {g.type === "Cardio" ? (
                                        <div className="form-group">
                                            <label>Unit</label>
                                            <input
                                                value={g.unit}
                                                onChange={(e) => updateGroupField(idx, gIdx, "unit", e.target.value)}
                                            />
                                            <label style={{ marginTop: 8 }}>Entries</label>
                                            {(g.setsData || []).map((s, sIdx) => (
                                                <input
                                                    key={sIdx}
                                                    type="number"
                                                    value={s.amount}
                                                    onChange={(e) => updateSetField(idx, gIdx, sIdx, "amount", e.target.value)}
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
                                                        onChange={(e) => updateSetField(idx, gIdx, sIdx, "weight", e.target.value)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="reps"
                                                        value={s.reps}
                                                        onChange={(e) => updateSetField(idx, gIdx, sIdx, "reps", e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="modal-button-container">
                                <button
                                    type="button"
                                    className="modal-button"
                                    disabled={savingIndex === idx}
                                    onClick={() => saveLog(idx)}
                                >
                                    {savingIndex === idx ? "Saving..." : "Save Log"}
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                <div className="modal-button-container">
                    <button type="button" className="modal-button cancel-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
