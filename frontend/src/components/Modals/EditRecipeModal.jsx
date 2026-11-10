import React, { useEffect, useMemo, useState } from "react"
import axiosInstance from "../../api/AxiosInstance"

export default function EditRecipeModal({ open, onClose, onSuccess }) {
    const [recipes, setRecipes] = useState([])
    const [ingredients, setIngredients] = useState([])

    const [selectedId, setSelectedId] = useState("")
    const [recipeName, setRecipeName] = useState("")
    const [rows, setRows] = useState([])

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!open) return
        setSelectedId("")
        setRecipeName("")
        setRows([])
        setError(null)

        axiosInstance.get("/recipes/")
            .then(res => setRecipes(Array.isArray(res.data) ? res.data : []))
            .catch(() => setRecipes([]))

        axiosInstance.get("/ingredients/")
            .then(res => setIngredients(res.data))
            .catch(() => setIngredients([]))
    }, [open])

    const selectedRecipe = useMemo(
        () => recipes.find(r => String(r.id) === String(selectedId)),
        [recipes, selectedId]
    )

    useEffect(() => {
        if (!selectedRecipe) {
            setRecipeName("")
            setRows([])
            return
        }
        // If your /recipes/ list already returns embedded ingredients:
        // r.ingredients = [{ ingredient: {id,...}, quantity }]
        const ingRows = (selectedRecipe.ingredients || []).map(ri => ({
            ingredient: ri.ingredient?.id ?? ri.ingredient, // handle both shapes
            quantity: ri.quantity ?? "",
        }))
        setRecipeName(selectedRecipe.name || "")
        setRows(ingRows)
    }, [selectedRecipe])

    const addRow = () => setRows(prev => [...prev, { ingredient: "", quantity: "" }])
    const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx))
    const updateRow = (idx, field, value) => {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!selectedId) return
        setSaving(true)
        setError(null)
        try {
            const payload = {
                name: recipeName,
                ingredients: rows.map(r => ({
                    ingredient: Number(r.ingredient),
                    quantity: parseFloat(r.quantity || "0"),
                })),
            }
            await axiosInstance.patch(`/recipes/${selectedId}/`, payload)
            onClose()
            onSuccess && onSuccess()
        } catch {
            setError("Failed to save recipe.")
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null
    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content modal-recipe">
                <h2>Edit Recipe</h2>

                <div className="form-group">
                    <label>Select Base Recipe</label>
                    <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                        <option value="">--Select--</option>
                        {recipes.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>

                {selectedId && (
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label>Recipe Name</label>
                            <input value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
                        </div>

                        <h3>Ingredients</h3>
                        {rows.length === 0 ? (
                            <p>No ingredients in this recipe. Please add one.</p>
                        ) : (
                            rows.map((row, idx) => (
                                <div key={idx} className="recipe-ingredient-row" style={{ position: "relative" }}>
                                    <div className="remove-ingredient">
                                        <button
                                            type="button"
                                            className="remove-ingredient-button"
                                            onClick={() => removeRow(idx)}
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
                                            {ingredients.map(ing => (
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
                                            onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                        <button type="button" className="modal-button add-row-button" onClick={addRow}>
                            Add Another Ingredient
                        </button>

                        {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                        <div className="modal-button-container">
                            <button type="submit" className="modal-button" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button type="button" className="modal-button cancel-button" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
