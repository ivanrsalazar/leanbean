export default function DateNavigator({
    assignedDate,           // "YYYY-MM-DD"
    today,                   // optional "YYYY-MM-DD" (fallbacks to local today)
    dec,                     // function: go to previous day
    inc,                     // function: go to next day (should already guard against > today)
}) {
    const localToday = today || new Date().toLocaleDateString('en-CA')
    const disableNext = assignedDate >= localToday

    return (
        <div className="flex items-center justify-center gap-3 my-4">
            <button className="btn" onClick={dec} aria-label="Previous day">◀</button>
            <h2 className="text-xl font-semibold">{assignedDate}</h2>
            <button className="btn" onClick={inc} disabled={disableNext} aria-label="Next day">▶</button>
        </div>
    )
}