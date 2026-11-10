import AxiosInstance from '../api/AxiosInstance'

export const listIngredients = () =>
    AxiosInstance.get('/ingredients/').then(r => r.data)

export const createIngredient = (payload) =>
    AxiosInstance.post('/ingredients/', payload).then(r => r.data)