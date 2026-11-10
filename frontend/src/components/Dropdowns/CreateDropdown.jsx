import DropdownBase from './DropdownBase'

export default function CreateDropdown({ onCreateRecipe, onCreateWorkout }) {
    return (
        <DropdownBase
            label="Create"
            items={[
                { text: 'Recipe', onClick: onCreateRecipe },
                { text: 'Workout', onClick: onCreateWorkout },
            ]}
        />
    )
}