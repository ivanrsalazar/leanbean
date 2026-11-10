// src/pages/Home.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function Home() {
    const isAuthed = !!localStorage.getItem("access_token")

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-slate-100">
            {/* MAIN */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <section className="py-16 sm:py-24">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                                <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                                    Eat smarter. Train better.
                                </span>
                            </h1>

                            <p className="mt-4 text-lg sm:text-xl text-slate-300">
                                Log meals, visualize macros, and record workouts — all in one tidy dashboard.
                            </p>

                            <div className="mt-8 flex items-center gap-3">
                                <Link
                                    to="/calorie-tracker"
                                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30"
                                >
                                    Open Calorie Tracker
                                </Link>

                                {!isAuthed && (
                                    <span className="text-slate-400 text-sm">
                                        Tip: log in from the top right to save your data.
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="mt-auto border-t border-emerald-800/40 bg-gray-900/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between text-sm text-slate-400">
                    <span>© {new Date().getFullYear()} LeanBean</span>
                    <span>v1.0</span>
                </div>
            </footer>
        </div>
    )
}