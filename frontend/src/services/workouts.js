import AxiosInstance from '../api/AxiosInstance'

/* Base workouts (templates) */
export const listBaseWorkouts = () =>
    AxiosInstance.get('/workouts/').then(r => r.data)

export const getBaseWorkout = (id) =>
    AxiosInstance.get(`/workouts/${id}/`).then(r => r.data)

export const createBaseWorkout = ({ name, activities }) =>
    AxiosInstance.post('/workouts/', { name, activities }).then(r => r.data)

export const updateBaseWorkout = (id, { name, activities }) =>
    AxiosInstance.patch(`/workouts/${id}/`, { name, activities }).then(r => r.data)

/* Workout logs (performed workouts) */
export const listWorkoutLogsForDate = (date) =>
    AxiosInstance.get('/workouts/log/list/', { params: { date } }).then(r => r.data)

export const createWorkoutLog = ({ base_workout, date, activities }) =>
    AxiosInstance.post('/workouts/log/', { base_workout, date, activities }).then(r => r.data)

export const updateWorkoutLog = (logId, { base_workout, date, activities }) =>
    AxiosInstance.patch(`/workouts/log/${logId}/`, { base_workout, date, activities }).then(r => r.data)