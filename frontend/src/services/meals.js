import AxiosInstance from '../api/AxiosInstance'

export const listMealsForDate = (date) =>
    AxiosInstance.get('/meals/today/', { params: { date } }).then(r => r.data)

export const logMeal = ({ recipe, servings, ingredients, date }) =>
    AxiosInstance.post('/meals/', { recipe, servings, ingredients, date }).then(r => r.data)

export const deleteMeal = (id) =>
    AxiosInstance.delete(`/meals/${id}/`).then(r => r.data)

export const updateMealServings = (id, servings) =>
    AxiosInstance.patch(`/meals/${id}/`, { servings }).then(r => r.data)