import { useEffect } from 'react'

export default function useTheme() {
    useEffect(() => {
        const k = 'leanbean_theme'
        const saved = localStorage.getItem(k)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const mode = saved || (prefersDark ? 'dark' : 'dark') // force dark as default
        document.documentElement.classList.toggle('dark', mode === 'dark')
        localStorage.setItem(k, mode)
    }, [])
}