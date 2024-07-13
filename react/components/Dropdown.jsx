
import React, { useState, useEffect } from 'react';
import Placard from './Placard';

function Dropdown({
    label,
    optionsArray,
    choice_state,
    choice_stateSetter, // function to update state in the parent component
}) {
    
    const handleDropdownChange = (event) => {
        const newValue = event.target.value;
        choice_stateSetter(newValue);
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