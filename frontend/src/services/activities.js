import AxiosInstance from '../api/AxiosInstance'

export const listActivities = () =>
    AxiosInstance.get('/activities/').then(r => r.data)

/**
 * For Lifting, the UI forces unit to 'reps'.
 * For Cardio, pass { type: 'Cardio', name, units: ['steps'] } (or another unit).
 */
export const createActivity = (payload) =>
    AxiosInstance.post('/activities/', payload).then(r => r.data)