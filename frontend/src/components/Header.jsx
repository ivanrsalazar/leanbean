// src/components/Header.jsx
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Header() {
    const navigate = useNavigate()
    const username =
        localStorage.getItem("leanbean_username") || localStorage.getItem("username")
    const isAuthed = !!localStorage.getItem("access_token")

    const signOut = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("leanbean_username")
        localStorage.removeItem("username")
        navigate("/", { replace: true })
    }

    // for click-to-open on touch devices
    const [open, setOpen] = useState(false)

    return (
        <header className="w-full bg-emerald-900/90 text-emerald-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="h-14 flex items-center justify-between">
                    {/* Logo (closer to left edge via small px) */}
                    <Link to="/" className="font-semibold tracking-wide">
                        LeanBean
                    </Link>

                    {/* Right side */}
                    {!isAuthed ? (
                        <div className="flex gap-3">
                            <Link
                                to="/register"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                            >
                                Create account
                            </Link>
                            <Link
                                to="/login"
                                className="px-3 py-1.5 rounded-lg border border-emerald-500/60 hover:border-emerald-400"
                            >
                                Log in
                            </Link>
                        </div>
                    ) : (
                        // Hoverable wrapper; keeps menu open when pointer moves into it
                        <div
                            className="relative group"
                            onMouseEnter={() => setOpen(true)}
                            onMouseLeave={() => setOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => setOpen((v) => !v)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/70"
                            >
                                {username}
                            </button>

                            {/* Dropdown */}
                            <div
                                className={`
                  absolute right-0 mt-2 w-44 rounded-lg border border-emerald-700/60
                  bg-gray-900 shadow-lg z-50
                  ${open ? "block" : "hidden"}
                  group-hover:block
                `}
                            >
                                <Link
                                    to="/calorie-tracker"
                                    className="block px-3 py-2 text-sm hover:bg-gray-800"
                                >
                                    Calorie Tracker
                                </Link>
                                <button
                                    onClick={signOut}
                                    className="w-full text-left block px-3 py-2 text-sm hover:bg-gray-800"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}