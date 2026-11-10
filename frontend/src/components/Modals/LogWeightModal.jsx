import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"

export default function LogWeightModal({ open, onClose, date, onSuccess }) {
    const [weight, setWeight] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setWeight("")
        setError(null)
        setSaving(false)
    }, [open])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!date) return
        setSaving(true)
        setError(null)
        try {
            await axiosInstance.post("/weights/", {
                weight: parseFloat(weight),
                date, // YYYY-MM-DD
            })
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to log weight.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <h2>Log Weight</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Enter your weight</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving}>
                            {saving ? "Saving..." : "Submit"}
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
