// src/components/TopActionBar.jsx
import React from "react"
import "./TopActionBar.css"

export default function TopActionBar({
    // CREATE
    onCreateRecipe,
    onCreateWorkout,

    // LOG
    onLogMeal,
    onLogWeight,
    onLogWorkout,

    // ADD
    onAddIngredient,
    onAddActivity,

    // VIEW
    onViewMeals,
    onViewWorkouts,

    // EDIT
    onEditRecipe,
    onEditUserDetails,
    onEditBaseWorkout,
}) {
    return (
        <div className="button-container">
            {/* CREATE */}
            <div className="dropdown">
                <button type="button" className="modal-button">Create</button>
                <div className="dropdown-content" role="menu" aria-label="Create">
                    <button type="button" onClick={onCreateRecipe}>Recipe</button>
                    <button type="button" onClick={onCreateWorkout}>Workout</button>
                </div>
            </div>

            {/* LOG */}
            <div className="dropdown">
                <button type="button" className="modal-button">Log</button>
                <div className="dropdown-content" role="menu" aria-label="Log">
                    <button type="button" onClick={onLogMeal}>Meal</button>
                    <button type="button" onClick={onLogWeight}>Weight</button>
                    <button type="button" onClick={onLogWorkout}>Workout</button>
                </div>
            </div>

            {/* ADD */}
            <div className="dropdown">
                <button type="button" className="modal-button">Add</button>
                <div className="dropdown-content" role="menu" aria-label="Add">
                    <button type="button" onClick={onAddIngredient}>Ingredient</button>
                    <button type="button" onClick={onAddActivity}>Activity</button>
                </div>
            </div>

            {/* VIEW */}
            <div className="dropdown">
                <button type="button" className="modal-button">View</button>
                <div className="dropdown-content" role="menu" aria-label="View">
                    <button type="button" onClick={onViewMeals}>Today&apos;s Meals</button>
                    <button type="button" onClick={onViewWorkouts}>Today&apos;s Workouts</button>
                </div>
            </div>

            {/* EDIT */}
            <div className="dropdown">
                <button type="button" className="modal-button">Edit</button>
                <div className="dropdown-content" role="menu" aria-label="Edit">
                    <button type="button" onClick={onEditRecipe}>Recipe</button>
                    <button type="button" onClick={onEditUserDetails}>User Details</button>
                    <button type="button" onClick={onEditBaseWorkout}>Base Workout</button>
                </div>
            </div>
        </div>
    )
}