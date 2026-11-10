import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"

const toNum = (v, fallback = 0) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

export default function LogMealModal({ open, onClose, date, onSuccess }) {
    const [baseRecipes, setBaseRecipes] = useState([])
    const [allIngredients, setAllIngredients] = useState([])

    const [selectedRecipe, setSelectedRecipe] = useState("")   // optional
    const [servings, setServings] = useState(1)
    const [customRows, setCustomRows] = useState([])

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setSelectedRecipe("")
        setServings(1)
        setCustomRows([])
        setError(null)

        axiosInstance.get("/recipes/")
            .then(res => setBaseRecipes(Array.isArray(res.data) ? res.data : []))
            .catch(() => setBaseRecipes([]))

        axiosInstance.get("/ingredients/")
            .then(res => setAllIngredients(res.data))
            .catch(() => setAllIngredients([]))
    }, [open])

    const addRow = () => setCustomRows(prev => [...prev, { ingredient: "", quantity: "" }])
    const removeRow = (idx) => setCustomRows(prev => prev.filter((_, i) => i !== idx))
    const updateRow = (idx, field, value) => {
        setCustomRows(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            // Clean up rows: keep only rows with both fields filled and valid numbers
            const cleanedRows = customRows
                .map(r => ({
                    ingredient: r.ingredient ? Number(r.ingredient) : null,
                    quantity: toNum(r.quantity, NaN)
                }))
                .filter(r => Number.isInteger(r.ingredient) && Number.isFinite(r.quantity) && r.quantity > 0)

            // If no recipe selected, require at least one valid custom row
            if (!selectedRecipe && cleanedRows.length === 0) {
                setError("Pick a base recipe or add at least one ingredient.")
                setSubmitting(false)
                return
            }

            const payload = {
                recipe: selectedRecipe ? Number(selectedRecipe) : null,
                servings: toNum(servings, 1),
                ingredients: cleanedRows,
                date, // YYYY-MM-DD
            }

            await axiosInstance.post("/meals/", payload)
            onClose?.()
            onSuccess?.()
        } catch {
            setError("Failed to log meal.")
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content modal-log-meal">
                <h2>Log Meal</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Base Recipe (optional)</label>
                        {/* NOT required — leaving blank enables single-ingredient logging */}
                        <select value={selectedRecipe} onChange={(e) => setSelectedRecipe(e.target.value)}>
                            <option value="">--Select--</option>
                            {baseRecipes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Meal Servings</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            required
                        />
                    </div>

                    <h3>Custom Ingredients (Optional if a recipe is selected)</h3>
                    {customRows.length === 0 ? (
                        <p>
                            {selectedRecipe
                                ? "No custom ingredients. Base recipe ingredients will be used."
                                : "Add at least one ingredient if you’re not selecting a recipe."}
                        </p>
                    ) : (
                        customRows.map((row, idx) => (
                            <div key={idx} className="recipe-ingredient-row" style={{ position: "relative" }}>
                                <div className="remove-ingredient">
                                    <button
                                        type="button"
                                        className="remove-ingredient-button"
                                        onClick={() => removeRow(idx)}
                                        aria-label="Remove ingredient row"
                                    >
                                        X
                                    </button>
                                </div>
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
                                    <label>Custom Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={row.quantity}
                                        onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        ))
                    )}

                    <button type="button" className="modal-button add-row-button" onClick={addRow}>
                        Add Custom Ingredient
                    </button>

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={submitting}>
                            {submitting ? "Logging..." : "Log Meal"}
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
