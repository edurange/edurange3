import React, {useContext} from 'react';
import './placard.css';
import { HomeRouter_context } from '../pages/pub/Home_router';

function Placard ({placard_text, navMetas}) {
    const {
        sideNav_isVisible_state,
        sideNav_isSmall_state, 
        navArraysObj_state,
        set_desiredNavMetas_state
      } = useContext(HomeRouter_context);

    function handleNavClick() {
        set_desiredNavMetas_state(navMetas)
    }

    return (
    <div onClick={handleNavClick} className='placard-frame'>
        <div className='placard-text'>
            {placard_text}
        </div>
    </div>
    );
}

export default Placard;