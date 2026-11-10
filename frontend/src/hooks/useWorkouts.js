import { useEffect, useState, useCallback } from 'react'
import {
    listBaseWorkouts, getBaseWorkout, createBaseWorkout, updateBaseWorkout,
    listWorkoutLogsForDate, createWorkoutLog, updateWorkoutLog
} from '../services/workouts'
import { groupLogActivities, flattenLogActivities } from '../utils/workouts'

export default function useWorkouts(date) {
    const [baseWorkouts, setBaseWorkouts] = useState([])
    const [workoutLogs, setWorkoutLogs] = useState([])
    const [editLogs, setEditLogs] = useState([]) // grouped/editable logs
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refreshBase = async () => {
        setLoading(true); setError(null)
        try { setBaseWorkouts(await listBaseWorkouts()) } catch (e) { setError(e) } finally { setLoading(false) }
    }

    const refreshLogs = useCallback(async () => {
        if (!date) return
        setLoading(true); setError(null)
        try {
            const logs = await listWorkoutLogsForDate(date)
            setWorkoutLogs(logs)
            setEditLogs(logs.map(groupLogActivities))
        } catch (e) { setError(e) } finally { setLoading(false) }
    }, [date])

    const createBase = async (payload) => { await createBaseWorkout(payload); await refreshBase() }
    const updateBase = async (id, payload) => { await updateBaseWorkout(id, payload); await refreshBase() }
    const fetchBaseById = async (id) => getBaseWorkout(id)

    const createLog = async (payload) => { await createWorkoutLog(payload); await refreshLogs() }
    const updateLog = async (logIndex) => {
        const log = editLogs[logIndex]
        const activities = flattenLogActivities(log.groupedActivities)
        const payload = { base_workout: log.baseWorkout?.id || null, date: log.date, activities }
        await updateWorkoutLog(log.logId, payload)
        await refreshLogs()
    }

    useEffect(() => { refreshBase() }, [])
    useEffect(() => { refreshLogs() }, [refreshLogs])

    return {
        baseWorkouts, workoutLogs, editLogs, setEditLogs,
        loading, error,
        refreshBase, refreshLogs,
        createBase, updateBase, fetchBaseById,
        createLog, updateLog,
    }
}