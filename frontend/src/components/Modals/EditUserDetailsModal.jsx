import React, { useEffect, useState } from "react"
import "./ModalStyles.css"

/**
 * Simple user details modal — adjust fields to match your backend.
 * If you don’t have a user-details endpoint yet, you can just keep it local
 * or POST to a placeholder.
 */
export default function EditUserDetailsModal({ open, onClose, onSuccess }) {
    const [age, setAge] = useState("")
    const [sex, setSex] = useState("")
    const [heightFeet, setHeightFeet] = useState("")
    const [heightInches, setHeightInches] = useState("")
    const [waist, setWaist] = useState("")
    const [neck, setNeck] = useState("")
    const [includeOptional, setIncludeOptional] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        // If you have a GET endpoint to prefill, call it here.
        setSaving(false)
        setError(null)
    }, [open])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            // Adjust to your backend if you wire it later.
            // await axiosInstance.post("/user-details/", { age, sex, height: totalInches(), waist, neck })
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to update user details.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Edit User Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Sex</label>
                        <select value={sex} onChange={(e) => setSex(e.target.value)} required>
                            <option value="">--Select--</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                            <label>Height (ft)</label>
                            <input
                                type="number"
                                value={heightFeet}
                                onChange={(e) => setHeightFeet(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Height (in)</label>
                            <input
                                type="number"
                                value={heightInches}
                                onChange={(e) => setHeightInches(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ alignItems: "flex-start" }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={includeOptional}
                                onChange={(e) => setIncludeOptional(e.target.checked)}
                            />
                            Include Waist and Neck Circumference
                        </label>
                    </div>

                    {includeOptional && (
                        <div className="form-group" style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                                <label>Waist (in.)</label>
                                <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Neck (in.)</label>
                                <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving}>
                            {saving ? "Saving..." : "Save"}
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
