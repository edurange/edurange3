import React from 'react';
import './placard.css';

function Placard ({placard_text}) {
    return (
    <div className='placard-frame'>
        <div className='placard-text'>
            {placard_text}
        </div>
    </div>
    );
}

export default Placard;