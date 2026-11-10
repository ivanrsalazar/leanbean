import { useCallback, useEffect, useState } from 'react'
import { listMealsForDate, logMeal, deleteMeal, updateMealServings } from '../services/meals'

export default function useMeals(date) {
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = useCallback(async () => {
        if (!date) return
        setLoading(true); setError(null)
        try { setMeals(await listMealsForDate(date)) } catch (e) { setError(e) } finally { setLoading(false) }
    }, [date])

    const create = async (payload) => { await logMeal({ ...payload, date }); await refresh() }
    const remove = async (id) => { await deleteMeal(id); await refresh() }
    const updateServings = async (id, servings) => { await updateMealServings(id, servings); await refresh() }

    useEffect(() => { refresh() }, [refresh])
    return { meals, loading, error, refresh, create, remove, updateServings }
}
