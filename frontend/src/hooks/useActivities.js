import { useEffect, useState } from 'react'
import { listActivities, createActivity } from '../services/activities'

export default function useActivities(auto = true) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = async () => {
        setLoading(true); setError(null)
        try { setActivities(await listActivities()) } catch (e) { setError(e) } finally { setLoading(false) }
    }

    const create = async (payload) => { await createActivity(payload); await refresh() }

    useEffect(() => { if (auto) refresh() }, [auto])
    return { activities, loading, error, refresh, create }
}