// src/pages/CalorieTracker.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react"
import axiosInstance from "../api/AxiosInstance"
import "./CalorieTracker.css"

import NavBar from "../components/NavBar.jsx"
import TopActionBar from "../components/TopActionBar.jsx"

import DailyMacroDonut from "../components/Charts/DailyMacroDonut.jsx"
import WeeklyCaloriesStackedBar from "../components/Charts/WeeklyCaloriesStackedBar.jsx"
import WeeklyWeightLine from "../components/Charts/WeeklyWeightLine.jsx"

/* --- Modals --- */
import TodayMealsModal from "../components/Modals/TodayMealsModal.jsx"
import AddIngredientModal from "../components/Modals/AddIngredientModal.jsx"
import CreateRecipeModal from "../components/Modals/CreateRecipeModal.jsx"
import EditRecipeModal from "../components/Modals/EditRecipeModal.jsx"
import LogMealModal from "../components/Modals/LogMealModal.jsx"
import LogWeightModal from "../components/Modals/LogWeightModal.jsx"
import AddActivityModal from "../components/Modals/AddActivityModal.jsx"
import CreateWorkoutModal from "../components/Modals/CreateWorkoutModal.jsx"
import LogWorkoutModal from "../components/Modals/LogWorkoutModal.jsx"
import EditWorkoutModal from "../components/Modals/EditWorkoutModal.jsx"
import WorkoutLogsModal from "../components/Modals/WorkoutLogsModal.jsx"
import UserDetailsModal from "../components/Modals/UserDetailsModal.jsx"



export default function CalorieTracker() {
    // Dates
    const currentDateStr = new Date().toLocaleDateString("en-CA")
    const [assignedDate, setAssignedDate] = useState(currentDateStr)

    // Data
    const [dailyMacros, setDailyMacros] = useState(null)
    const [meals, setMeals] = useState([])
    const [weeklyMacros, setWeeklyMacros] = useState([])
    const [weeklyAverageMacros, setWeeklyAverageMacros] = useState(null)
    const [weeklyWeights, setWeeklyWeights] = useState([])
    const [weeklyAverageWeight, setWeeklyAverageWeight] = useState(null)

    // UI — modals
    const [showTodayMealsModal, setShowTodayMealsModal] = useState(false)

    const [showAddIngredientModal, setShowAddIngredientModal] = useState(false)
    const [showAddActivityModal, setShowAddActivityModal] = useState(false)
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false)
    const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false)
    const [showLogMealModal, setShowLogMealModal] = useState(false)
    const [showLogWeightModal, setShowLogWeightModal] = useState(false)
    const [showLogWorkoutModal, setShowLogWorkoutModal] = useState(false)
    const [showEditRecipeModal, setShowEditRecipeModal] = useState(false)
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
    const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false)
    const [showWorkoutLogsModal, setShowWorkoutLogsModal] = useState(false)

    /* NEW */
    const [, setShowLogSingleIngredientModal] = useState(false)

    // Meals inline state
    const [mealHelpingsUpdates, setMealHelpingsUpdates] = useState({})

    // Helpers
    const computeMealIngredientMacros = useCallback((row) => {
        const qty = parseFloat(row.quantity) || 0
        const ing = row.ingredient
        return {
            calories: qty * parseFloat(ing.calories),
            carbs: qty * parseFloat(ing.carbs),
            fat: qty * parseFloat(ing.fat),
            protein: qty * parseFloat(ing.protein),
        }
    }, [])

    const computeMealTotals = useCallback((meal) => {
        return meal.ingredients.reduce(
            (totals, row) => {
                const m = computeMealIngredientMacros(row)
                return {
                    calories: totals.calories + m.calories,
                    carbs: totals.carbs + m.carbs,
                    fat: totals.fat + m.fat,
                    protein: totals.protein + m.protein,
                }
            },
            { calories: 0, carbs: 0, fat: 0, protein: 0 }
        )
    }, [computeMealIngredientMacros])

    // Fetchers
    const fetchDailyMacros = useCallback(async (dateStr) => {
        const { data } = await axiosInstance.get("/daily-macros/", { params: { date: dateStr } })
        setDailyMacros(data)
    }, [])

    const fetchMeals = useCallback(async (dateStr) => {
        const { data } = await axiosInstance.get("/meals/today/", { params: { date: dateStr } })
        setMeals(data)
    }, [])

    const fetchWeeklyMacros = useCallback(async () => {
        const today = new Date()
        const dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - (6 - i))
            return d.toLocaleDateString("en-CA")
        })

        const results = await Promise.all(
            dates.map(d =>
                axiosInstance
                    .get("/daily-macros/", { params: { date: d } })
                    .then(r => r.data)
                    .catch(() => ({ total_calories: 0, total_carbs: 0, total_fat: 0, total_protein: 0 }))
            )
        )

        const weekly = results.map((m, idx) => ({
            date: dates[idx],
            calories: m.total_calories || 0,
            carbs: m.total_carbs || 0,
            fat: m.total_fat || 0,
            protein: m.total_protein || 0,
        }))

        const sums = weekly.reduce(
            (acc, d) => ({
                c: acc.c + (d.calories > 0 ? d.calories : 0),
                cb: acc.cb + (d.carbs > 0 ? d.carbs : 0),
                f: acc.f + (d.fat > 0 ? d.fat : 0),
                p: acc.p + (d.protein > 0 ? d.protein : 0),
                nc: acc.nc + (d.calories > 0 ? 1 : 0),
                ncb: acc.ncb + (d.carbs > 0 ? 1 : 0),
                nf: acc.nf + (d.fat > 0 ? 1 : 0),
                np: acc.np + (d.protein > 0 ? 1 : 0),
            }),
            { c: 0, cb: 0, f: 0, p: 0, nc: 0, ncb: 0, nf: 0, np: 0 }
        )

        setWeeklyMacros(weekly)
        setWeeklyAverageMacros({
            calories: sums.nc ? sums.c / sums.nc : 0,
            carbs: sums.ncb ? sums.cb / sums.ncb : 0,
            fat: sums.nf ? sums.f / sums.nf : 0,
            protein: sums.np ? sums.p / sums.np : 0,
        })
    }, [])

    const fetchWeeklyWeight = useCallback(async () => {
        const today = new Date()
        const dates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - (6 - i))
            return d.toISOString().split("T")[0]
        })

        const responses = await Promise.all(
            dates.map(dateStr =>
                axiosInstance.get("/weights/", { params: { date: dateStr } }).catch(() => ({ data: [] }))
            )
        )

        const weeklyData = responses.map((res, idx) => {
            const arr = res.data || []
            const w = arr.length ? arr[arr.length - 1].weight : null
            return { date: dates[idx], weight: w }
        })

        let sum = 0, count = 0
        for (const d of weeklyData) {
            if (d.weight != null && !Number.isNaN(+d.weight)) { sum += +d.weight; count++ }
        }

        setWeeklyWeights(weeklyData)
        setWeeklyAverageWeight(count ? sum / count : 0)
    }, [])

    // Effects
    useEffect(() => {
        fetchDailyMacros(assignedDate)
        fetchMeals(assignedDate)
    }, [assignedDate, fetchDailyMacros, fetchMeals])

    useEffect(() => {
        fetchWeeklyMacros()
        fetchWeeklyWeight()
    }, [fetchWeeklyMacros, fetchWeeklyWeight])

    // Date nav
    const decrementDate = useCallback(() => {
        const prevDate = new Date(assignedDate)
        prevDate.setDate(prevDate.getDate() - 1)
        setAssignedDate(prevDate.toISOString().split("T")[0])
    }, [assignedDate])

    const incrementDate = useCallback(() => {
        if (assignedDate < currentDateStr) {
            const nextDate = new Date(assignedDate)
            nextDate.setDate(nextDate.getDate() + 1)
            const next = nextDate.toISOString().split("T")[0]
            setAssignedDate(next)
        }
    }, [assignedDate, currentDateStr])

    // Meals actions
    const handleUpdateMealServings = useCallback(async (id, newServings) => {
        await axiosInstance.patch(`/meals/${id}/`, { servings: parseFloat(newServings) })
        setMealHelpingsUpdates(prev => ({ ...prev, [id]: undefined }))
        await Promise.all([fetchDailyMacros(assignedDate), fetchMeals(assignedDate)])
    }, [assignedDate, fetchDailyMacros, fetchMeals])

    const handleDeleteMeal = useCallback(async (id) => {
        await axiosInstance.delete(`/meals/${id}/`)
        await Promise.all([fetchDailyMacros(assignedDate), fetchMeals(assignedDate)])
    }, [assignedDate, fetchDailyMacros, fetchMeals])

    const handleRefreshDay = useCallback(async () => {
        await Promise.all([fetchDailyMacros(assignedDate), fetchMeals(assignedDate)])
    }, [assignedDate, fetchDailyMacros, fetchMeals])

    // Titles
    const weeklyCaloriesAvgTitle = useMemo(
        () => `Weekly Calories Average: ${weeklyAverageMacros ? weeklyAverageMacros.calories.toFixed(0) : 0} kcal`,
        [weeklyAverageMacros]
    )
    const weeklyWeightAvgTitle = useMemo(
        () => `Weekly Weight Average: ${weeklyAverageWeight ? weeklyAverageWeight.toFixed(1) : 0} lbs.`,
        [weeklyAverageWeight]
    )

    return (
        <div className="calorie-tracker-container">
            {/* Date header */}
            <div className="date-header" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <button className="date-button" onClick={decrementDate}>◀</button>
                <h2 style={{ margin: 0 }}>{assignedDate}</h2>
                <button className="date-button" onClick={incrementDate} disabled={assignedDate === currentDateStr}>▶</button>
            </div>

            {/* ACTION BAR */}
            <TopActionBar
                onCreateRecipe={() => setShowAddRecipeModal(true)}
                onCreateWorkout={() => setShowCreateWorkoutModal(true)}
                onLogMeal={() => setShowLogMealModal(true)}
                onLogWeight={() => setShowLogWeightModal(true)}
                onLogWorkout={() => setShowLogWorkoutModal(true)}
                onAddIngredient={() => setShowAddIngredientModal(true)}
                onAddActivity={() => setShowAddActivityModal(true)}
                onViewMeals={() => setShowTodayMealsModal(true)}
                onViewWorkouts={() => setShowWorkoutLogsModal(true)}
                onEditRecipe={() => setShowEditRecipeModal(true)}
                onEditUserDetails={() => setShowUserDetailsModal(true)}
                onEditBaseWorkout={() => setShowEditWorkoutModal(true)}
                /* NEW */
                onLogSingleIngredient={() => setShowLogSingleIngredientModal(true)}
            />

            {/* Charts */}
            <div className="charts-container">
                <div className="left-chart">
                    <h1 className="donut-chart-title">Daily Macro Breakdown</h1>
                    {dailyMacros && (
                        <div className="donut-chart-wrapper">
                            <DailyMacroDonut dailyMacros={dailyMacros} />
                            <div className="donut-chart-center">
                                <p><strong>Calories:</strong> {dailyMacros.total_calories.toFixed(2)}</p>
                                <p className="carbs-text"><strong>Carbs:</strong> {dailyMacros.total_carbs.toFixed(2)} g</p>
                                <p className="fat-text"><strong>Fat:</strong> {dailyMacros.total_fat.toFixed(2)} g</p>
                                <p className="protein-text"><strong>Protein:</strong> {dailyMacros.total_protein.toFixed(2)} g</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="right-charts">
                    <div className="right-chart">
                        <h2 className="chart-title-accent">{weeklyCaloriesAvgTitle}</h2>
                        <WeeklyCaloriesStackedBar weeklyMacros={weeklyMacros} />
                    </div>
                    <div className="right-chart">
                        <h2 className="chart-title-accent">{weeklyWeightAvgTitle}</h2>
                        <div style={{ width: "100%", height: 300 }}>
                            <WeeklyWeightLine weeklyWeights={weeklyWeights} height={300} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RENDER ALL MODALS --- */}
            <TodayMealsModal
                open={showTodayMealsModal}
                meals={meals}
                dailyMacros={dailyMacros || { total_calories: 0, total_carbs: 0, total_fat: 0, total_protein: 0 }}
                mealHelpingsUpdates={mealHelpingsUpdates}
                setMealHelpingsUpdates={setMealHelpingsUpdates}
                computeMealIngredientMacros={computeMealIngredientMacros}
                computeMealTotals={computeMealTotals}
                onUpdateMealServings={handleUpdateMealServings}
                onDeleteMeal={handleDeleteMeal}
                onUpdateMeals={handleRefreshDay}
                onClose={() => setShowTodayMealsModal(false)}
            />

            <AddIngredientModal
                open={showAddIngredientModal}
                onClose={() => setShowAddIngredientModal(false)}
                onSuccess={() => {
                    setShowAddIngredientModal(false)
                    handleRefreshDay()
                }}
            />

            <CreateRecipeModal
                open={showAddRecipeModal}
                onClose={() => setShowAddRecipeModal(false)}
                onSuccess={() => {
                    setShowAddRecipeModal(false)
                    handleRefreshDay()
                }}
            />

            <EditRecipeModal
                open={showEditRecipeModal}
                onClose={() => setShowEditRecipeModal(false)}
                onSuccess={() => {
                    setShowEditRecipeModal(false)
                    handleRefreshDay()
                }}
            />

            <LogMealModal
                open={showLogMealModal}
                date={assignedDate}
                onClose={() => setShowLogMealModal(false)}
                onSuccess={() => {
                    setShowLogMealModal(false)
                    handleRefreshDay()
                }}
            />

            <LogWeightModal
                open={showLogWeightModal}
                date={assignedDate}
                onClose={() => setShowLogWeightModal(false)}
                onSuccess={() => {
                    setShowLogWeightModal(false)
                    fetchWeeklyWeight()
                    handleRefreshDay()
                }}
            />

            <AddActivityModal
                open={showAddActivityModal}
                onClose={() => setShowAddActivityModal(false)}
                onSuccess={() => setShowAddActivityModal(false)}
            />

            <CreateWorkoutModal
                open={showCreateWorkoutModal}
                onClose={() => setShowCreateWorkoutModal(false)}
                onSuccess={() => setShowCreateWorkoutModal(false)}
            />

            <LogWorkoutModal
                open={showLogWorkoutModal}
                date={assignedDate}
                onClose={() => setShowLogWorkoutModal(false)}
                onSuccess={() => {
                    setShowLogWorkoutModal(false)
                    setShowWorkoutLogsModal(true)
                }}
            />

            <EditWorkoutModal
                open={showEditWorkoutModal}
                onClose={() => setShowEditWorkoutModal(false)}
                onSuccess={() => setShowEditWorkoutModal(false)}
            />

            <WorkoutLogsModal
                open={showWorkoutLogsModal}
                date={assignedDate}
                onClose={() => setShowWorkoutLogsModal(false)}
            />

            <UserDetailsModal
                open={showUserDetailsModal}
                onClose={() => setShowUserDetailsModal(false)}
                onSuccess={() => setShowUserDetailsModal(false)}
            />
        </div>
    )
}
