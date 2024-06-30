import React, { useContext } from 'react';
import './placard.css';
import { HomeRouter_context } from '../pages/pub/Home_router';

function Placard({ placard_text, textSize, navMetas, is_button }) {
    const {
        set_desiredNavMetas_state
    } = useContext(HomeRouter_context);

    function handleNavClick() {
        set_desiredNavMetas_state(navMetas)
    }

    return (
        <div onClick={is_button ? handleNavClick : null} className={is_button ? 'placard-frame' : 'placard-frame-static'}>
            <div className='placard-text' style={{fontSize : textSize}}>
                {placard_text}
            </div>
        </div>
    );
}

export default Placard;