
import React, { useState, useEffect } from 'react';
import Placard from './Placard';

function Dropdown({
    label,
    optionsArray,
    choice_state,
    choice_stateSetter, // function to update state in the parent component
    validation_setter  // function to update validation state in the parent component
}) {

    const [localChoice, set_localChoice] = useState('ALL')

    // const validateSelection = (value) => {
    //     // selection is 'valid' if a choice has been made
    //     return value != null && value !== "";
    // };

    // useEffect(() => {
    //     // validation_setter(validateSelection(choice_state));
    //     choice_stateSetter(choice_state);
    // }, [localChoice]);

    const handleDropdownChange = (event) => {
        const newValue = event.target.value;
        choice_stateSetter(newValue);
        // validation_setter(validateSelection(newValue));
    };

    return (
        <div className='create-frame'>
            <Placard is_button={false} placard_text={label} textSize={'medium'}/>
            <select
                className='create-dropdown'
                value={choice_state}
                onChange={handleDropdownChange}
            >
                <option value={choice_state} disabled>{choice_state}</option>
                {optionsArray.map((option, index) => (
                    <option key={index} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;