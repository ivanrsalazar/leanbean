import React from "react"
import { Link, useNavigate } from "react-router-dom"
import "./NavBar.css"

export default function NavBar() {
    const navigate = useNavigate()
    const username = localStorage.getItem("username") || ""

    const signOut = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("username")
        navigate("/home")
    }

    return (
        <header className="topbar">
            <div className="topbar-inner">
                {/* Left: brand */}
                <Link to="/" className="brand">LeanBean</Link>

                {/* Right: links + user */}
                <nav className="topbar-right">
                    <Link to="/" className="toplink">Home</Link>

                    {username ? (
                        <div className="dropdown">
                            <button className="user-button" aria-haspopup="true" aria-expanded="false">
                                <span className="user-name">{username}</span>
                                <svg className="caret" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            <div className="dropdown-content user-menu" role="menu">
                                <button onClick={signOut} className="user-menu-item" role="menuitem">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="toplink">Login</Link>
                            <Link to="/register" className="toplink accent">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}