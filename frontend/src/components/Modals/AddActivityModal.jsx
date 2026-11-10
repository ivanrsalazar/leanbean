import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"

export default function AddActivityModal({ open, onClose, onSuccess }) {
    const [type, setType] = useState("")            // "Cardio" | "Lifting"
    const [name, setName] = useState("")
    const [unit, setUnit] = useState("")            // for Cardio
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setType("")
        setName("")
        setUnit("")
        setSaving(false)
        setError(null)
    }, [open])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const payload =
                type === "Lifting"
                    ? { type, name, units: ["reps"] } // server expects possible units list
                    : { type, name, units: [unit || "steps"] }

            await axiosInstance.post("/activities/", payload)
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to add activity.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Add Activity</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Activity Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="">--Select--</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Lifting">Lifting</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Activity Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {type === "Cardio" && (
                        <div className="form-group">
                            <label>Possible Unit (one for now)</label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
                                <option value="">--Select Unit--</option>
                                <option value="steps">Steps</option>
                                <option value="miles">Miles</option>
                            </select>
                        </div>
                    )}

                    {type === "Lifting" && (
                        <div className="form-group">
                            <label>Possible Unit</label>
                            <input value="reps" readOnly />
                        </div>
                    )}

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving}>
                            {saving ? "Adding..." : "Add Activity"}
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
