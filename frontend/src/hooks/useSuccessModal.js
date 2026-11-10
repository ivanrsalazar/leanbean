import { useState, useCallback } from 'react'

export default function useSuccessModal() {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const show = useCallback((msg) => { setMessage(msg); setOpen(true) }, [])
    const hide = useCallback(() => { setOpen(false); setMessage('') }, [])
    return { open, message, show, hide }
}