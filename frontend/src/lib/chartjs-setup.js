// Register Chart.js once for the whole app (scales, elements, plugins)
import { Chart, registerables } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

// If you have a custom plugin like "totalizer", export it from utils and import here.
// Example (uncomment and adjust path if you use it):
// import { totalizer } from "../utils/charts"

Chart.register(...registerables)
Chart.register(ChartDataLabels)

// If you use totalizer plugin, register it too:
// Chart.register(totalizer)

export default Chart