export default function UserDetailsModal({
    open,
    userDetails, setUserDetails,
    heightFeet, setHeightFeet,
    heightInches, setHeightInches,
    includeOptional, setIncludeOptional,
    onSubmit, onClose
}) {
    if (!open) return null

    const onFeet = (ft) => {
        setHeightFeet(ft)
        const total = Number(ft) * 12 + Number(heightInches)
        setUserDetails({ ...userDetails, height: total })
    }
    const onInches = (inch) => {
        setHeightInches(inch)
        const total = Number(heightFeet) * 12 + Number(inch)
        setUserDetails({ ...userDetails, height: total })
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>User Details</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Age:</label>
                        <input type="number" value={userDetails.age} onChange={e => setUserDetails({ ...userDetails, age: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Sex:</label>
                        <select value={userDetails.sex} onChange={e => setUserDetails({ ...userDetails, sex: e.target.value })} required>
                            <option value="">--Select--</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Height:</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" placeholder="ft" value={heightFeet} onChange={e => onFeet(e.target.value)} required />
                            <input type="number" placeholder="in" value={heightInches} onChange={e => onInches(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>
                            <input type="checkbox" checked={includeOptional} onChange={e => setIncludeOptional(e.target.checked)} />
                            Include Waist and Neck Circumference
                        </label>
                    </div>
                    {includeOptional && (
                        <>
                            <div className="form-group">
                                <label>Waist Circumference (in.):</label>
                                <input type="number" value={userDetails.waist} onChange={e => setUserDetails({ ...userDetails, waist: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Neck Circumference (in.):</label>
                                <input type="number" value={userDetails.neck} onChange={e => setUserDetails({ ...userDetails, neck: e.target.value })} />
                            </div>
                        </>
                    )}
                    <div className="modal-button-container">
                        <button type="submit" className="modal-button">Submit</button>
                        <button type="button" className="modal-button cancel-button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}