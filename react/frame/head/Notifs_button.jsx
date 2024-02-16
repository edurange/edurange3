"use strict";
import React, { useContext } from 'react';
import './Notifs_button.css';
import { HomeRouter_context } from '@home/Home_router';
import edurange_icons from '@modules/ui/edurangeIcons';

function Notifs_button() {

    const notifsArray = ['dsf', "sdfds"];
    const { updateNav } = useContext(HomeRouter_context);
    const buttonToUse = () => {
        if (notifsArray.length < 1) {return (
            <div className='homehead-notifs-button-frame' onClick={()=>updateNav('/notifications', 'dash')}>
                <div className='homehead-notifs-icon'>{edurange_icons.bell}</div>
            </div>
        );}
        else {return (
            <div className='homehead-notifs-button-frame new-notifs' onClick={()=>updateNav('/notifications', 'dash')}>
                <div className='homehead-notifs-icon'>{edurange_icons.bell_ringing}</div>
            </div>
        );};
    };
    return (<>{buttonToUse()}</>);
};
export default Notifs_button;