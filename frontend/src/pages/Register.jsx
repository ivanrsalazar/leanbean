import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

export default function Register() {
    const nav = useNavigate()
    const [form, setForm] = useState({ username: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [ok, setOk] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError(''); setOk('')
        try {
            await api.post('/auth/register/', form)
            setOk('Account created. You can log in now.')
            setTimeout(() => nav('/login'), 700)
        } catch {
            setError('Could not register. Try another username/email.')
        }
    }

    return (
        <div className="mx-auto max-w-md card">
            <h1 className="mb-6 text-2xl font-bold">Create account</h1>
            <form onSubmit={submit} className="grid gap-4">
                <input className="input" placeholder="Username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} />
                <input className="input" placeholder="Email" type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="input" placeholder="Password" type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {ok && <p className="text-emerald-400 text-sm">{ok}</p>}
                <button className="btn-accent" type="submit">Sign up</button>
            </form>
            <p className="mt-4 text-sm text-neutral-400">
                Have an account? <Link className="text-accent underline" to="/login">Log in</Link>
            </p>
        </div>
    )
}
