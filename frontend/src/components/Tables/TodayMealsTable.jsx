import React from 'react'

export default function TodayMealsTable({
    meals = [],
    dailyMacros = { total_calories: 0, total_carbs: 0, total_fat: 0, total_protein: 0 },
    mealHelpingsUpdates = {},
    setMealHelpingsUpdates,
    computeMealIngredientMacros,
    computeMealTotals,
    onUpdateMealServings,
    onDeleteMeal,
}) {
    if (!meals || meals.length === 0) {
        return <p>No meals logged for this date.</p>
    }

    return (
        <div className="overflow-auto max-h-[80vh] border border-neutral-800 rounded-xl">
            <table className="w-full text-left">
                <thead className="bg-neutral-900">
                    <tr>
                        <th className="px-4 py-2">Meal</th>
                        <th className="px-4 py-2">Ingredient</th>
                        <th className="px-4 py-2 text-right"># Servings</th>
                        <th className="px-4 py-2 text-right">Calories</th>
                        <th className="px-4 py-2 text-right">Carbs (g)</th>
                        <th className="px-4 py-2 text-right">Fat (g)</th>
                        <th className="px-4 py-2 text-right">Protein (g)</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {meals.map(meal => {
                        const mealTotals = computeMealTotals(meal)
                        return (
                            <React.Fragment key={meal.id}>
                                <tr className="bg-neutral-950/60">
                                    <td className="px-4 py-2" colSpan={3}>
                                        <strong>{meal.recipe ? meal.recipe.name : 'Custom Meal'}</strong>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            className="input w-24"
                                            value={
                                                mealHelpingsUpdates[meal.id] !== undefined
                                                    ? mealHelpingsUpdates[meal.id]
                                                    : meal.servings
                                            }
                                            onChange={e =>
                                                setMealHelpingsUpdates({
                                                    ...mealHelpingsUpdates,
                                                    [meal.id]: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-2" colSpan={2}>
                                        <button
                                            className="btn-accent"
                                            onClick={() =>
                                                onUpdateMealServings(
                                                    meal.id,
                                                    mealHelpingsUpdates[meal.id] || meal.servings
                                                )
                                            }
                                        >
                                            Update
                                        </button>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            className="btn"
                                            onClick={() => onDeleteMeal(meal.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>

                                {meal.ingredients.map((row, idx) => {
                                    const macros = computeMealIngredientMacros(row)
                                    return (
                                        <tr key={idx} className="border-t border-neutral-900">
                                            <td className="px-4 py-2" />
                                            <td className="px-4 py-2">{row.ingredient.name}</td>
                                            <td className="px-4 py-2 text-right">{row.quantity}</td>
                                            <td className="px-4 py-2 text-right">{macros.calories.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">{macros.carbs.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">{macros.fat.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">{macros.protein.toFixed(2)}</td>
                                            <td className="px-4 py-2" />
                                        </tr>
                                    )
                                })}

                                <tr className="bg-neutral-900/60">
                                    <td className="px-4 py-2" colSpan={3}>
                                        <strong>Meal Total:</strong>
                                    </td>
                                    <td className="px-4 py-2 text-right">{mealTotals.calories.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{mealTotals.carbs.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{mealTotals.fat.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right">{mealTotals.protein.toFixed(2)}</td>
                                    <td className="px-4 py-2" />
                                </tr>
                            </React.Fragment>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr className="bg-neutral-950">
                        <td className="px-4 py-3" colSpan={8}>
                            <strong>Daily Totals:</strong>{' '}
                            Calories: {Number(dailyMacros.total_calories || 0).toFixed(2)},{' '}
                            Carbs: {Number(dailyMacros.total_carbs || 0).toFixed(2)} g,{' '}
                            Fat: {Number(dailyMacros.total_fat || 0).toFixed(2)} g,{' '}
                            Protein: {Number(dailyMacros.total_protein || 0).toFixed(2)} g
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}