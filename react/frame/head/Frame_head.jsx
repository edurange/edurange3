"use strict";
import React, { useContext, useState } from 'react';
import { nanoid } from 'nanoid';
import Notifs_button from './Notifs_button';
import '../frame.css';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';
import Frame_UserBox from './Frame_UserBox';
import { navArrays } from '../../modules/nav/navItemsData';

function Frame_head({ navArrayToShow }) {

    
    const {
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        navArraysObj_state
    } = useContext(HomeRouter_context);
    
    navArrayToShow = navArraysObj_state?.top ?? navArrays.logout.home.top
    const someNav = navArrays.top_logout

    function toggle_sideNav_vis() {
        set_sideNav_isVisible_state(!sideNav_isVisible_state); // toggle to opposite
    };
    function toggle_sideNav_size() {
        set_sideNav_isSmall_state(!sideNav_isSmall_state); // toggle to opposite
    };
    function chooseSideIcon() {
        if (sideNav_isVisible_state) {
            return (
                <>
                    <div className='er3-homehead-hamburger-item hamburger-jr hamburger-pill-right'
                    onClick={() => toggle_sideNav_size()}>
                        {(sideNav_isSmall_state) ? edurange_icons.panelOpen_left : edurange_icons.panelClose_left}
                    </div>
                </>
            )
        }
        else return (<></>);
    };

    const panelVisSelector = (sideNav_isVisible_state) ? edurange_icons.menuClose_up : edurange_icons.menuOpen_down;
    const panelSizeSelector = chooseSideIcon();
    const pillOrReg = (sideNav_isVisible_state) ? 'er3-homehead-hamburger-item hamburger-pill-left' : 'er3-homehead-hamburger-item';

    function Hamburger() {

        return (
            <div className='er3-homehead-hamburger-frame'>
                <div
                    className={pillOrReg}
                    onClick={() => toggle_sideNav_vis()}
                > {panelVisSelector} </div>

                {panelSizeSelector}

            </div>

        );
    };
    // return <></>
    return (
        <div className="er3-homehead">

            <div className="er3-homehead-left"><Hamburger /></div>
            {/* <div className='homehead-notifs-section'><Notifs_button /></div> #DEV_FIX */}

            <Frame_UserBox/>

            <div className='er3-homehead-right'>
                <span className="er3-homehead-buttonbar">
                    {navArrayToShow.map((val, key) => {
                        return (
                            <div className='edu3-nav-link' key={nanoid(3)} onClick={() => set_desiredNavMetas_state([val.path, val.navStub])} >
                                <li className='topnav-button-panes' >
                                    <div className='topnav-icon-box' >{val.icon}</div>
                                    <div className='topnav-label-box' >{val.title}</div>
                                </li>
                            </div>
                        );
                    })}
                </span>
            </div>

        </div>
    );
};
export default Frame_head;