

import React, { useContext } from 'react';
import './Q_and_A.css'
import { HomeRouter_context } from '@pub/Home_router';

function ResponseStatus({ points_possible, points_awarded }) {
    
    return (
        <div className='response-status'>
        <div >
            Points Awarded: <span className='highlighter-aqua'> {points_awarded}</span>
        </div>
        {' / '}
        <div>
            Points Possible:  <span className='highlighter-orange'> {points_possible ?? '?'} </span>
        </div>
        </div>
    );
};
export default ResponseStatus;
