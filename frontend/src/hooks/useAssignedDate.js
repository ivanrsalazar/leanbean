import { useMemo, useState } from 'react'

export default function useAssignedDate() {
    const today = useMemo(() => new Date().toLocaleDateString('en-CA'), [])
    const [assignedDate, setAssignedDate] = useState(today)
    const canInc = assignedDate < today
    const dec = () => {
        const d = new Date(assignedDate); d.setDate(d.getDate() - 1)
        setAssignedDate(d.toISOString().split('T')[0])
    }
    const inc = () => {
        if (!canInc) return
        const d = new Date(assignedDate); d.setDate(d.getDate() + 1)
        setAssignedDate(d.toISOString().split('T')[0])
    }
    return { assignedDate, setAssignedDate, canInc, dec, inc, today }
}