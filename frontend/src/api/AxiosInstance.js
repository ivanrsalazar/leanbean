// frontend/src/api/AxiosInstance.js
// Central axios instance with JWT auth + refresh handling

import axios from "axios"

// Prefer env, fallback to local dev API
const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    "/api"

// ---- Token helpers (exported so login/logout can reuse) ----
export const getAccess = () => localStorage.getItem("access_token")
export const getRefresh = () => localStorage.getItem("refresh_token")
export const setTokens = (access, refresh) => {
    if (access) localStorage.setItem("access_token", access)
    if (refresh) localStorage.setItem("refresh_token", refresh)
}
export const clearTokens = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

// Optional: where to send the user when refresh fails
const onAuthFailure = () => {
    // You can customize this (toast, route change, etc.)
    if (window.location.pathname !== "/login") {
        window.location.assign("/login")
    }
}

// ---- Axios instance ----
const axiosInstance = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
    // If you ever switch to cookie-based auth, set withCredentials: true
})

// ---- Refresh coordination to avoid parallel refresh calls ----
let isRefreshing = false
let pendingQueue = []
const queueRequest = (cb) => pendingQueue.push(cb)
const flushQueue = (newAccess) => {
    pendingQueue.forEach((cb) => cb(newAccess))
    pendingQueue = []
}

// ---- Auto‑refresh on 401, then retry the original request ----
axiosInstance.interceptors.request.use((config) => {
    const url = (config.url || "").toString()

    // Normalize full path the interceptor sees
    const fullPath = url.startsWith("http") ? url : `${config.baseURL?.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`

    // Don’t attach Authorization for public auth endpoints
    const isAuthEndpoint =
        fullPath.endsWith("/auth/login/") ||
        fullPath.endsWith("/auth/register/") ||
        fullPath.endsWith("/auth/refresh/")

    if (!isAuthEndpoint) {
        const token = localStorage.getItem("access_token")
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }

    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        const refresh = getRefresh()

        if (error.response?.status !== 401 || original?._retry || !refresh) {
            return Promise.reject(error)
        }

        original._retry = true

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queueRequest((newAccess) => {
                    if (!newAccess) {
                        reject(error)
                        return
                    }
                    original.headers.Authorization = `Bearer ${newAccess}`
                    resolve(axiosInstance(original))
                })
            })
        }

        isRefreshing = true
        try {
            const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh })
            setTokens(data.access, data.refresh)
            flushQueue(data.access)
            original.headers.Authorization = `Bearer ${data.access}`
            return axiosInstance(original)
        } catch (refreshError) {
            clearTokens()
            flushQueue(null)
            onAuthFailure()
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    },
)

export default axiosInstance
