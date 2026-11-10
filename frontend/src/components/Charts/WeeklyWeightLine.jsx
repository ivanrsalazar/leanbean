import { useEffect, useRef } from "react"
import { createChart, LineSeries } from "lightweight-charts"

export default function WeeklyWeightLine({ weeklyWeights = [], height = 300 }) {
    const containerRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current) return

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height,
            layout: { background: { type: "solid", color: "#3a3a3a" }, textColor: "#d9d9d9" },
            grid: { vertLines: { color: "#444" }, horzLines: { color: "#444" } },
            rightPriceScale: { borderColor: "#444" },
            timeScale: { borderColor: "#444" },
        })

        // Use the generic addSeries API with LineSeries for broad version compatibility
        const series = chart.addSeries(LineSeries, {})

        chartRef.current = { chart, series }

        // Debounced resize handling
        let t
        const onResize = () => {
            clearTimeout(t)
            t = setTimeout(() => {
                if (containerRef.current && chartRef.current) {
                    chartRef.current.chart.applyOptions({ width: containerRef.current.clientWidth })
                }
            }, 100)
        }
        window.addEventListener("resize", onResize)

        return () => {
            clearTimeout(t)
            window.removeEventListener("resize", onResize)
            chart.remove()
            chartRef.current = null
        }
    }, [height])

    useEffect(() => {
        if (!chartRef.current) return
        const data = (weeklyWeights || [])
            .filter(d => d && d.date && d.weight != null && !Number.isNaN(Number(d.weight)))
            .map(d => ({ time: d.date, value: Number(d.weight) }))
        chartRef.current.series.setData(data)
        chartRef.current.chart.timeScale().fitContent()
    }, [weeklyWeights])

    return <div ref={containerRef} style={{ width: "100%", height }} />
}