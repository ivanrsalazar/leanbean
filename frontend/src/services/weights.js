import AxiosInstance from '../api/AxiosInstance'

export const listWeightsForDate = (date) =>
    AxiosInstance.get('/weights/', { params: { date } }).then(r => r.data)

export const logWeight = ({ weight, date }) =>
    AxiosInstance.post('/weights/', { weight, date }).then(r => r.data)