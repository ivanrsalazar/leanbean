import { useEffect, useState } from 'react'
import { listIngredients, createIngredient } from '../services/ingredients'

export default function useIngredients(auto = true) {
    const [ingredients, setIngredients] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = async () => {
        setLoading(true); setError(null)
        try { setIngredients(await listIngredients()) } catch (e) { setError(e) } finally { setLoading(false) }
    }

    const create = async (payload) => { await createIngredient(payload); await refresh() }

    useEffect(() => { if (auto) refresh() }, [auto])
    return { ingredients, loading, error, refresh, create }
}