// ISO helpers (local timezone)
export function toLocalISO(d = new Date()) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function addDays(isoDate, days) {
    const d = new Date(isoDate)
    d.setDate(d.getDate() + Number(days))
    return toLocalISO(d)
}

export function isBefore(aISO, bISO) {
    return new Date(aISO) < new Date(bISO)
}

export function isAfter(aISO, bISO) {
    return new Date(aISO) > new Date(bISO)
}

export function clampDate(isoDate, minISO, maxISO) {
    if (minISO && isBefore(isoDate, minISO)) return minISO
    if (maxISO && isAfter(isoDate, maxISO)) return maxISO
    return isoDate
}

export function startOfWeekISO(isoDate, weekStartsOn = 0) {
    // weekStartsOn: 0=Sunday, 1=Monday
    const d = new Date(isoDate)
    const day = d.getDay()
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
    d.setDate(d.getDate() - diff)
    return toLocalISO(d)
}

export function lastNDaysISO(n, endISO = toLocalISO(new Date())) {
    const out = []
    const end = new Date(endISO)
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(end)
        d.setDate(end.getDate() - i)
        out.push(toLocalISO(d))
    }
    return out
}

export function human(isoDate) {
    const d = new Date(isoDate)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}