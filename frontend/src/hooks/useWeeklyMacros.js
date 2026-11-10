import { useEffect, useState } from 'react'
import { getDailyMacros } from '../services/macros'

export default function useWeeklyMacros() {
    const [weekly, setWeekly] = useState([])
    const [averages, setAverages] = useState({ calories: 0, carbs: 0, fat: 0, protein: 0 })

    useEffect(() => {
        ; (async () => {
            const today = new Date()
            const data = []
            for (let i = 7; i >= 1; i--) {
                const d = new Date(today); d.setDate(today.getDate() - i)
                const date = d.toLocaleDateString('en-CA')
                try {
                    const m = await getDailyMacros(date)
                    data.push({
                        date,
                        calories: m?.total_calories || 0,
                        carbs: m?.total_carbs || 0,
                        fat: m?.total_fat || 0,
                        protein: m?.total_protein || 0,
                    })
                } catch {
                    data.push({ date, calories: 0, carbs: 0, fat: 0, protein: 0 })
                }
            }
            setWeekly(data)
            const avg = (arr, k) => {
                const vals = arr.map(d => d[k]).filter(v => v > 0)
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
            }
            setAverages({
                calories: avg(data, 'calories'),
                carbs: avg(data, 'carbs'),
                fat: avg(data, 'fat'),
                protein: avg(data, 'protein'),
            })
        })()
    }, [])

    return { weeklyMacros: weekly, weeklyAverageMacros: averages }
}