import { Navigate, Outlet, useLocation } from "react-router-dom"

export default function Protected() {
    const location = useLocation()
    const token = localStorage.getItem("access_token")

    if (!token) {
        // bounce to login, but remember where they were going
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return <Outlet />
}