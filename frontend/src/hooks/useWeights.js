import { useCallback, useEffect, useState } from 'react'
import { listWeightsForDate, logWeight } from '../services/weights'

export default function useWeights(date) {
    const [weights, setWeights] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = useCallback(async () => {
        if (!date) return
        setLoading(true); setError(null)
        try { setWeights(await listWeightsForDate(date)) } catch (e) { setError(e) } finally { setLoading(false) }
    }, [date])

    const create = async (payload) => { await logWeight(payload); await refresh() }

    useEffect(() => { refresh() }, [refresh])
    return { weights, loading, error, refresh, create }
}

export function useWeeklyWeights() {
    const [weekly, setWeekly] = useState([])
    const [avg, setAvg] = useState(0)

    useEffect(() => {
        ; (async () => {
            const today = new Date()
            const days = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today); d.setDate(today.getDate() - i)
                const dateStr = d.toISOString().split('T')[0]
                try {
                    const day = await listWeightsForDate(dateStr)
                    if (Array.isArray(day) && day.length) {
                        days.push({ date: dateStr, weight: Number(day[day.length - 1].weight) })
                    } else {
                        days.push({ date: dateStr, weight: null })
                    }
                } catch {
                    days.push({ date: dateStr, weight: null })
                }
            }
            setWeekly(days)
            const vals = days.map(d => d.weight).filter(v => v !== null && !Number.isNaN(v) && v > 0)
            setAvg(vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0)
        })()
    }, [])

    return { weeklyWeights: weekly, weeklyAverageWeight: avg }
}
