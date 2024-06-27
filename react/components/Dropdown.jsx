
import React, { useState, useEffect } from 'react';

function Dropdown({
    label,
    optionsArray,
    default_value,
    choice_stateSetter, // function to update state in the parent component
    validation_setter  // function to update validation state in the parent component
}) {

    const [choice_state, set_choice_state] = useState(default_value);

    const validateSelection = (value) => {
        // selection is 'valid' if a choice has been made
        return value != null && value !== "";
    };

    useEffect(() => {
        validation_setter(validateSelection(choice_state));
        choice_stateSetter(choice_state);
    }, []);

    const handleDropdownChange = (event) => {
        const newValue = event.target.value;
        set_choice_state(newValue);
        choice_stateSetter(newValue); 
        validation_setter(validateSelection(newValue));
    };

    return (
        <div className='create-frame'>
            <select
                className='create-dropdown'
                value={choice_state}
                onChange={handleDropdownChange}
            >
                <option value="" disabled>{label}</option>
                {optionsArray.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;