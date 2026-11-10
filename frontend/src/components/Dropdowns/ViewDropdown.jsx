import DropdownBase from './DropdownBase'

export default function ViewDropdown({ onViewTodayMeals, onViewWorkoutLogs }) {
    return (
        <DropdownBase
            label="View"
            items={[
                { text: "Today's Meals", onClick: onViewTodayMeals },
                { text: "Today's Workouts", onClick: onViewWorkoutLogs },
            ]}
        />
    )
}