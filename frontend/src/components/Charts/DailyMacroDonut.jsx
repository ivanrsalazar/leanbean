import "../../lib/chartjs-setup" // side-effect import to ensure Chart.js is registered once
import { useMemo } from "react"
import { Doughnut } from "react-chartjs-2"

export default function DailyMacroDonut({ dailyMacros }) {
    const { data, options } = useMemo(() => {
        if (!dailyMacros) {
            return {
                data: { labels: [], datasets: [{ data: [] }] },
                options: { responsive: true, maintainAspectRatio: false },
            }
        }

        const PALETTE = {
            carbs: '#f97316', // orange
            fat: '#3b82f6', // blue
            protein: '#22c55e', // green
        }
        const total = Number(dailyMacros.total_calories || 0)
        const carbs = Number(dailyMacros.total_carbs || 0)
        const fat = Number(dailyMacros.total_fat || 0)
        const protein = Number(dailyMacros.total_protein || 0)
        const pct = (v, calPerUnit) => (total ? ((v * calPerUnit) / total) * 100 : 0)

        const carbPct = pct(carbs, 4)
        const fatPct = pct(fat, 9)
        const proteinPct = pct(protein, 4)

        return {
            data: {
                labels: [
                    `Carbs ${carbPct.toFixed(1)}%`,
                    `Fat ${fatPct.toFixed(1)}%`,
                    `Protein ${proteinPct.toFixed(1)}%`,
                ],
                datasets: [
                    {
                        data: [carbPct, fatPct, proteinPct], backgroundColor: [PALETTE.carbs, PALETTE.fat, PALETTE.protein],
                        hoverBackgroundColor: [PALETTE.carbs, PALETTE.fat, PALETTE.protein],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                cutout: "70%",
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    datalabels: {
                        color: "#fff",
                        font: { weight: "bold", size: 14 },
                        formatter: (v) => `${v.toFixed(1)}%`,
                    },
                },
            },
        }
    }, [dailyMacros])

    if (!dailyMacros) return null
    return <Doughnut data={data} options={options} />
}