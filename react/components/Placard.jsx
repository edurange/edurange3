import React, { useContext } from 'react';
import './placard.css';
import { HomeRouter_context } from '../pages/pub/Home_router';
import { AppContext } from '../config/AxiosConfig';

function Placard({ placard_text, textSize, navMetas, is_button }) {
    const {
        errorModal_state, set_errorModal_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        clipboard_state, set_clipboard_state
    } = useContext(AppContext);

    function handleNavClick() {
        set_desiredNavMetas_state(navMetas ?? ['/', 'home'])
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