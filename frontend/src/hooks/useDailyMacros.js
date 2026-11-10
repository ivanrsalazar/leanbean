import { useCallback, useEffect, useState } from 'react'
import { getDailyMacros } from '../services/macros'

export default function useDailyMacros(date) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = useCallback(async () => {
        setLoading(true); setError(null)
        try { setData(await getDailyMacros(date)) } catch (e) { setError(e) } finally { setLoading(false) }
    }, [date])

    useEffect(() => { if (date) refresh() }, [date, refresh])
    return { data, loading, error, refresh }
}
