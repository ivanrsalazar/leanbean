// src/components/Modals/TodayMealsModal.jsx
import React from 'react'
import TodayMealsTable from '../Tables/TodayMealsTable'

export default function TodayMealsModal({
    open,
    meals = [],
    dailyMacros = { total_calories: 0, total_carbs: 0, total_fat: 0, total_protein: 0 },
    mealHelpingsUpdates = {},
    setMealHelpingsUpdates,
    computeMealIngredientMacros,
    computeMealTotals,
    onUpdateMealServings,
    onDeleteMeal,
    onUpdateMeals,
    onClose,
}) {
    if (!open) return null

    return (
        <div className="modal-overlay full-screen-modal">
            <div className="modal-content modal-today-meals full-screen-modal-content">
                <h2>Today's Meals</h2>

                <TodayMealsTable
                    meals={meals}
                    dailyMacros={dailyMacros}
                    mealHelpingsUpdates={mealHelpingsUpdates}
                    setMealHelpingsUpdates={setMealHelpingsUpdates}
                    computeMealIngredientMacros={computeMealIngredientMacros}
                    computeMealTotals={computeMealTotals}
                    onUpdateMealServings={onUpdateMealServings}
                    onDeleteMeal={onDeleteMeal}
                />

                <div className="modal-button-container mt-4 flex gap-2">
                    <button className="btn-accent" onClick={onUpdateMeals}>Update</button>
                    <button className="btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}