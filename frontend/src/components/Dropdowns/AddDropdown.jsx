import DropdownBase from './DropdownBase'

export default function AddDropdown({ onAddIngredient, onAddActivity }) {
    return (
        <DropdownBase
            label="Add"
            items={[
                { text: 'Ingredient', onClick: onAddIngredient },
                { text: 'Activity', onClick: onAddActivity },
            ]}
        />
    )
}