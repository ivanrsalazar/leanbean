// src/components/Charts/WeeklyCaloriesStackedBar.jsx
import React, { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)

const num = v => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

export default function WeeklyCaloriesStackedBar({ weeklyMacros = [] }) {
    const { labels, carbsCals, fatCals, proteinCals, miscCals, totalCals } = useMemo(() => {
        const labels = [], carbsCals = [], fatCals = [], proteinCals = [], miscCals = [], totalCals = []
        for (const d of weeklyMacros) {
            const date = d?.date ?? ""
            const calories = Math.max(0, num(d?.calories))
            const carbs = Math.max(0, num(d?.carbs))
            const fat = Math.max(0, num(d?.fat))
            const protein = Math.max(0, num(d?.protein))

            const cCals = carbs * 4
            const fCals = fat * 9
            const pCals = protein * 4
            const remainder = Math.max(0, calories - (cCals + fCals + pCals))

            labels.push(date)
            carbsCals.push(cCals)
            fatCals.push(fCals)
            proteinCals.push(pCals)
            miscCals.push(remainder)
            totalCals.push(cCals + fCals + pCals + remainder)
        }
        return { labels, carbsCals, fatCals, proteinCals, miscCals, totalCals }
    }, [weeklyMacros])

    if (!labels.length) return <div style={{ height: 300, display: "grid", placeItems: "center" }}>No data</div>

    const datasets = [
        { label: "Carbs", data: carbsCals, backgroundColor: "rgba(16,185,129,0.25)", stack: "kcal" },
        { label: "Fat", data: fatCals, backgroundColor: "rgba(16,185,129,0.45)", stack: "kcal" },
        { label: "Protein", data: proteinCals, backgroundColor: "rgba(16,185,129,0.75)", stack: "kcal" },
        { label: "Misc.", data: miscCals, backgroundColor: "rgba(16,185,129,1)", stack: "kcal" },
    ]

    // Helper: for a given bar (by index), find the last visible dataset with a positive value
    const lastVisibleStackFor = (chart, dataIndex) => {
        const ds = chart.data.datasets
        for (let i = ds.length - 1; i >= 0; i--) {
            // respect visibility toggles from legend
            if (chart.isDatasetVisible(i) && num(ds[i].data?.[dataIndex]) > 0) return i
        }
        return -1
    }

    const data = { labels, datasets }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = num(ctx.raw)
                        const idx = ctx.dataIndex
                        const total = num(totalCals[idx])
                        const pct = total ? ((value / total) * 100).toFixed(1) : "0.0"
                        return `${ctx.dataset.label}: ${value.toFixed(0)} kcal (${pct}%)`
                    },
                },
            },
            datalabels: {
                color: "#e5e7eb",
                anchor: "end",
                align: "top",
                offset: 6,
                display: (ctx) => {
                    const chart = ctx.chart
                    const i = ctx.dataIndex
                    // only draw the total on the topmost visible slice
                    return ctx.datasetIndex === lastVisibleStackFor(chart, i)
                },
                formatter: (_value, ctx) => {
                    const i = ctx.dataIndex
                    const total = num(totalCals[i])
                    return total ? `${Math.round(total)} kcal` : ""
                },
            },
        },
        scales: {
            x: { stacked: true, ticks: { color: "#e5e7eb" }, grid: { display: false } },
            y: {
                stacked: true, beginAtZero: true, ticks: { color: "#e5e7eb" },
                grid: { color: "rgba(148,163,184,0.15)" }
            },
        },
    }

    return <div style={{ height: 300 }}><Bar data={data} options={options} /></div>
}