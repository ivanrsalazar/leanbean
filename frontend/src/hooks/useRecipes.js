import { useEffect, useState } from 'react'
import { listBaseRecipes, createRecipe, updateRecipe } from '../services/recipes'

export default function useRecipes(auto = true) {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const refresh = async () => {
        setLoading(true); setError(null)
        try { setRecipes(await listBaseRecipes()) } catch (e) { setError(e) } finally { setLoading(false) }
    }

    const create = async (payload) => { await createRecipe(payload); await refresh() }
    const update = async (id, payload) => { await updateRecipe(id, payload); await refresh() }

    useEffect(() => { if (auto) refresh() }, [auto])
    return { recipes, loading, error, refresh, create, update }
}