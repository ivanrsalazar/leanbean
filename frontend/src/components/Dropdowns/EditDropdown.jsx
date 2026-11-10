import DropdownBase from './DropdownBase'

export default function EditDropdown({
    onEditRecipe,
    onEditUserDetails,
    onEditBaseWorkout,
}) {
    return (
        <DropdownBase
            label="Edit"
            items={[
                { text: 'Recipe', onClick: onEditRecipe },
                { text: 'User Details', onClick: onEditUserDetails },
                { text: 'Edit Base Workout', onClick: onEditBaseWorkout },
            ]}
        />
    )
}