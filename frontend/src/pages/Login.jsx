import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axiosInstance, { setTokens } from "../api/AxiosInstance"

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [form, setForm] = useState({ username: "", password: "" })
    const [error, setError] = useState("")

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axiosInstance.post("/auth/login/", form, {
                headers: { "Content-Type": "application/json" },
            });

            setTokens(res.data.access, res.data.refresh);
            localStorage.setItem("leanbean_username", form.username);
            localStorage.setItem("username", form.username);

            const redirectTo = location.state?.from?.pathname || "/calorie-tracker";
            navigate(redirectTo, { replace: true });
        } catch {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <form onSubmit={onSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
                <h2 className="text-green-400 text-2xl font-bold mb-6">Login</h2>
                {error && <p className="text-red-400 mb-3">{error}</p>}
                <input
                    className="w-full p-2 mb-3 bg-gray-700 text-white rounded"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={onChange}
                    autoComplete="username"
                    required
                />
                <input
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                    required
                />
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded" type="submit">
                    Sign in
                </button>
            </form>
        </div>
    )
}
