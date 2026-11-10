// Macro helpers
export function macroPercents({ calories = 0, carbs = 0, fat = 0, protein = 0 }) {
    const total = Number(calories) || 0
    if (!total) return { carbPct: 0, fatPct: 0, proteinPct: 0 }
    const carbPct = ((Number(carbs) * 4) / total) * 100
    const fatPct = ((Number(fat) * 9) / total) * 100
    const proteinPct = ((Number(protein) * 4) / total) * 100
    return { carbPct, fatPct, proteinPct }
}

// Optional shared totalizer plugin for Chart.js stacked bars
export const totalizer = {
    id: 'totalizer',
    beforeUpdate(chart) {
        if (Array.isArray(chart.data.totalCalories)) {
            const utmost = chart.data.datasets.findIndex((_, i) => chart.isDatasetVisible(i))
            chart.$totalizer = { totals: chart.data.totalCalories, utmost }
            return
        }
        const totals = {}
        let utmost = 0
        chart.data.datasets.forEach((ds, di) => {
            if (!chart.isDatasetVisible(di)) return
            utmost = di
            ds.data.forEach((v, idx) => { totals[idx] = (totals[idx] || 0) + Number(v || 0) })
        })
        chart.$totalizer = { totals, utmost }
    },
}