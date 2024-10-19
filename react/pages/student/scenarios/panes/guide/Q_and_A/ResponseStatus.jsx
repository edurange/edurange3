

import React, { useContext } from 'react';
import './Q_and_A.css'
import { HomeRouter_context } from '@pub/Home_router';

function ResponseStatus({ question_num, points_possible }) {

    const { responseData_state, set_responseData_state } = useContext (HomeRouter_context);

    if (!responseData_state) {return};

    const current_best_score = responseData_state?.[question_num]?.points_awarded ?? 0

    return (
        <div className='response-status'>
        <div >
            Points Awarded: <span className='highlighter-aqua'> {current_best_score}</span>
        </div>
        {' / '}
        <div>
            Points Possible:  <span className='highlighter-orange'> {points_possible ?? '?'} </span>
        </div>
        </div>
    );
};
export default ResponseStatus;
