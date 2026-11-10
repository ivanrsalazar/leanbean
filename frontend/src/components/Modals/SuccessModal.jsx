export default function SuccessModal({ open, message, onClose }) {
    if (!open) return null
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Success</h2>
                <p>{message}</p>
                <div className="modal-button-container">
                    <button className="modal-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}