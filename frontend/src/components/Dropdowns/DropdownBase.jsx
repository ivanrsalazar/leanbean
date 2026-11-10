import { useState, useRef, useEffect } from 'react'

export default function DropdownBase({ label, items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div className="dropdown relative" ref={ref}>
      <button
        className="modal-button btn-accent"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <div className="dropdown-content absolute mt-2 w-48 rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl z-50">
          {items.map((item, i) => (
            <button
              key={i}
              className="block w-full px-4 py-2 text-left hover:bg-neutral-800"
              onClick={() => { setOpen(false); item.onClick?.() }}
            >
              {item.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}