import React, { useContext } from 'react';
import './Notifs_button.css';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '../../pages/pub/Home_router';

function Notifs_button() {

    const notifsArray = ['dsf', "sdfds"];
    const { set_desiredNavMetas_state } = useContext(HomeRouter_context);
    const buttonToUse = () => {
        if (notifsArray.length < 1) {return (
            <div className='homehead-notifs-button-frame' onClick={()=>set_desiredNavMetas_state(['/notifications', 'dash'])}>
                <div className='homehead-notifs-icon'>{edurange_icons.bell}</div>
            </div>
        );}
        else {return (
            <div className='homehead-notifs-button-frame new-notifs' onClick={()=>set_desiredNavMetas_state(['/notifications', 'dash'])}>
                <div className='homehead-notifs-icon'>{edurange_icons.bell_ringing}</div>
            </div>
        );};
    };
    return (<>{buttonToUse()}</>);
};
export default Notifs_button;