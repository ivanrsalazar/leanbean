import DropdownBase from './DropdownBase'

export default function LogDropdown({ onLogMeal, onLogWeight, onLogWorkout }) {
    return (
        <DropdownBase
            label="Log"
            items={[
                { text: 'Meal', onClick: onLogMeal },
                { text: 'Weight', onClick: onLogWeight },
                { text: 'Workout', onClick: onLogWorkout },
            ]}
        />
    )
}