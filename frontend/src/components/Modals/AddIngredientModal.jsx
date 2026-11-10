import React, { useState, useEffect } from "react"
import axiosInstance from "../../api/AxiosInstance"

export default function AddIngredientModal({ open, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        serving_size: "",
        serving_size_unit: "",
        calories: "",
        carbs: "",
        fat: "",
        protein: "",
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!open) {
            setForm({
                name: "",
                serving_size: "",
                serving_size_unit: "",
                calories: "",
                carbs: "",
                fat: "",
                protein: "",
            })
            setError("")
            setSubmitting(false)
        }
    }, [open])

    if (!open) return null

    const update = (key) => (e) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")
        try {
            // POST to your API
            await axiosInstance.post("/ingredients/", {
                name: form.name,
                serving_size: parseFloat(form.serving_size),
                serving_size_unit: form.serving_size_unit,
                calories: parseFloat(form.calories),
                carbs: parseFloat(form.carbs),
                fat: parseFloat(form.fat),
                protein: parseFloat(form.protein),
            })
            onSuccess?.()
            onClose()
        } catch (err) {
            console.error("Add ingredient failed:", err)
            setError("Failed to add ingredient. Please check your inputs.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="add-ing-title">
                <h2 id="add-ing-title">Add Ingredient</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Food Name</label>
                        <input value={form.name} onChange={update("name")} required />
                    </div>
                    <div className="form-group">
                        <label>Serving Size (e.g., 4)</label>
                        <input type="number" step="any" value={form.serving_size} onChange={update("serving_size")} required />
                    </div>
                    <div className="form-group">
                        <label>Serving Unit (e.g., oz)</label>
                        <input value={form.serving_size_unit} onChange={update("serving_size_unit")} required />
                    </div>
                    <div className="form-group">
                        <label>Calories / serving</label>
                        <input type="number" step="any" value={form.calories} onChange={update("calories")} required />
                    </div>
                    <div className="form-group">
                        <label>Carbs (g)</label>
                        <input type="number" step="any" value={form.carbs} onChange={update("carbs")} required />
                    </div>
                    <div className="form-group">
                        <label>Fat (g)</label>
                        <input type="number" step="any" value={form.fat} onChange={update("fat")} required />
                    </div>
                    <div className="form-group">
                        <label>Protein (g)</label>
                        <input type="number" step="any" value={form.protein} onChange={update("protein")} required />
                    </div>

                    {error && <p className="message" style={{ color: "#ef4444" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button className="modal-button" type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : "Add Ingredient"}
                        </button>
                        <button className="modal-button cancel-button" type="button" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}