import AxiosInstance from '../api/AxiosInstance'

export const listBaseRecipes = () =>
    AxiosInstance.get('/recipes/list/').then(r => r.data)

export const createRecipe = ({ name, ingredients }) =>
    AxiosInstance.post('/recipes/', { name, ingredients }).then(r => r.data)

export const updateRecipe = (id, { name, ingredients }) =>
    AxiosInstance.patch(`/recipes/${id}/`, { name, ingredients }).then(r => r.data)