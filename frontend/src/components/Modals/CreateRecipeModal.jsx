import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"

export default function CreateRecipeModal({ open, onClose, onSuccess }) {
    const [allIngredients, setAllIngredients] = useState([])
    const [recipeName, setRecipeName] = useState("")
    const [rows, setRows] = useState([{ ingredient: "", quantity: "" }])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        // load ingredients
        axiosInstance.get("/ingredients/")
            .then(res => setAllIngredients(res.data))
            .catch(() => setAllIngredients([]))
    }, [open])

    const addRow = () => setRows(prev => [...prev, { ingredient: "", quantity: "" }])
    const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx))
    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            const payload = {
                name: recipeName,
                ingredients: rows.map(r => ({
                    ingredient: Number(r.ingredient),
                    quantity: parseFloat(r.quantity || "0"),
                })),
            }
            await axiosInstance.post("/recipes/", payload)
            setRecipeName("")
            setRows([{ ingredient: "", quantity: "" }])
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to create recipe.")
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content modal-recipe">
                <h2>Create Recipe</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Recipe Name</label>
                        <input value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
                    </div>

                    <h3>Ingredients</h3>
                    {rows.map((row, idx) => (
                        <div key={idx} className="recipe-ingredient-row" style={{ position: "relative" }}>
                            {rows.length > 1 && (
                                <div className="remove-ingredient">
                                    <button
                                        type="button"
                                        className="remove-ingredient-button"
                                        onClick={() => removeRow(idx)}
                                    >
                                        X
                                    </button>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Select Ingredient</label>
                                <select
                                    value={row.ingredient}
                                    onChange={(e) => updateRow(idx, "ingredient", e.target.value)}
                                    required
                                >
                                    <option value="">--Select--</option>
                                    {allIngredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name} ({ing.serving_size} {ing.serving_size_unit}/serving)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label># of Servings</label>
                                <input
                                    type="number"
                                    value={row.quantity}
                                    min="0"
                                    onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                    <button type="button" className="modal-button add-row-button" onClick={addRow}>
                        Add Another Ingredient
                    </button>

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Recipe"}
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
