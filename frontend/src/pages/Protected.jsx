import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Protected() {
    const [me, setMe] = useState(null)
    const [err, setErr] = useState('')

    useEffect(() => {
        api.get('/me/')
            .then(({ data }) => setMe(data))
            .catch(() => setErr('Please log in first.'))
    }, [])

    return (
        <div className="card">
            <h1 className="mb-3 text-2xl font-bold">Protected</h1>
            {me ? (
                <pre className="text-sm text-neutral-300">{JSON.stringify(me, null, 2)}</pre>
            ) : (
                <p className="text-neutral-400">{err || 'Loading...'}</p>
            )}
        </div>
    )
}