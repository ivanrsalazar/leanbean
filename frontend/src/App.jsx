// src/App.jsx
import React from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"

import NavBar from "./components/NavBar.jsx"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import CalorieTracker from "./pages/CalorieTracker.jsx"

// Guarded route wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token")
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Header is always visible */}
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/calorie-tracker"
          element={
            <ProtectedRoute>
              <CalorieTracker />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}