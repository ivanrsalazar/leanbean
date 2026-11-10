import React, { useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import "./ModalStyles.css";

export default function CreateWorkoutModal({ open, onClose, onWorkoutCreated }) {
    const [workoutName, setWorkoutName] = useState("");
    const [activities, setActivities] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const addActivity = () => {
        setActivities((prev) => [...prev, { name: "", type: "Lifting", setsData: [{ weight: "", reps: "" }] }]);
    };

    const removeActivity = (idx) => {
        setActivities((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateActivity = (idx, field, value) => {
        setActivities((prev) =>
            prev.map((act, i) => (i === idx ? { ...act, [field]: value } : act))
        );
    };

    const updateSet = (actIdx, setIdx, field, value) => {
        setActivities((prev) =>
            prev.map((act, i) =>
                i === actIdx
                    ? {
                        ...act,
                        setsData: act.setsData.map((set, si) =>
                            si === setIdx ? { ...set, [field]: value } : set
                        ),
                    }
                    : act
            )
        );
    };

    const addSet = (actIdx) => {
        setActivities((prev) =>
            prev.map((act, i) =>
                i === actIdx ? { ...act, setsData: [...act.setsData, { weight: "", reps: "" }] } : act
            )
        );
    };

    const removeSet = (actIdx, setIdx) => {
        setActivities((prev) =>
            prev.map((act, i) =>
                i === actIdx
                    ? { ...act, setsData: act.setsData.filter((_, si) => si !== setIdx) }
                    : act
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!workoutName.trim()) {
            setError("Workout name is required");
            return;
        }
        if (!activities.length) {
            setError("Add at least one activity");
            return;
        }

        try {
            setSaving(true);
            await axiosInstance.post("/workouts/", {
                name: workoutName,
                activities,
            });
            if (onWorkoutCreated) onWorkoutCreated();
            onClose();
        } catch {
            setError("Failed to create workout");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create Workout</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Workout Name</label>
                        <input
                            type="text"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            required
                        />
                    </div>

                    {activities.map((row, idx) => (
                        <div key={idx} className="activity-block">
                            <div className="form-group">
                                <label>Activity Name</label>
                                <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) => updateActivity(idx, "name", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={row.type}
                                    onChange={(e) => updateActivity(idx, "type", e.target.value)}
                                >
                                    <option value="Lifting">Lifting</option>
                                    <option value="Cardio">Cardio</option>
                                </select>
                            </div>

                            {row.type === "Lifting" && (
                                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <label>Unit</label>
                                        <input value="reps" readOnly style={{ width: 80 }} />
                                    </div>

                                    <div>
                                        <label>Sets</label>
                                        {(row.setsData || []).map((set, sIdx) => (
                                            <div
                                                key={sIdx}
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    alignItems: "center",
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <div>
                                                    <label>Weight</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 135"
                                                        value={set.weight}
                                                        onChange={(e) => updateSet(idx, sIdx, "weight", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label>Reps</label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g., 10"
                                                        value={set.reps}
                                                        onChange={(e) => updateSet(idx, sIdx, "reps", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {(row.setsData?.length ?? 0) > 1 && (
                                                    <button
                                                        type="button"
                                                        className="remove-ingredient-button"
                                                        onClick={() => removeSet(idx, sIdx)}
                                                    >
                                                        X
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="modal-button add-row-button"
                                            onClick={() => addSet(idx)}
                                        >
                                            Add Set
                                        </button>
                                    </div>
                                </div>
                            )}

                            {row.type === "Cardio" && (
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 30"
                                        value={row.duration || ""}
                                        onChange={(e) => updateActivity(idx, "duration", e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="modal-button-container">
                                <button
                                    type="button"
                                    className="remove-ingredient-button"
                                    onClick={() => removeActivity(idx)}
                                >
                                    Remove Activity
                                </button>
                            </div>
                        </div>
                    ))}

                    {error && <p className="message" style={{ color: "salmon" }}>{error}</p>}

                    <div className="modal-button-container">
                        <button
                            type="button"
                            className="modal-button add-row-button"
                            onClick={addActivity}
                        >
                            Add Activity
                        </button>
                    </div>

                    <div className="modal-button-container">
                        <button type="submit" className="modal-button" disabled={saving}>
                            {saving ? "Saving..." : "Save Workout"}
                        </button>
                        <button type="button" className="modal-button cancel" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
