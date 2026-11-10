import AxiosInstance from '../api/AxiosInstance'

export const getDailyMacros = (date) =>
    AxiosInstance.get('/daily-macros/', { params: { date } }).then(r => r.data)