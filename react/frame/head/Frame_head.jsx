"use strict";
import React, { useContext, useState } from 'react';
import { nanoid } from 'nanoid';
import Notifs_button from './Notifs_button';
import '../frame.css';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@home/Home_router';
import { useNavigate } from 'react-router-dom';
import Frame_UserBox from './Frame_UserBox';


function Frame_head({ navArr_toShow }) {

    const navigate = useNavigate()
    if (!navArr_toShow) return <></>
    const {
        updateNav,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state, navName_state
    } = useContext(HomeRouter_context);

    if (!navName_state) return <></>

    // In Frame_head component
    const [isJwtTestModalOpen, setIsJwtTestModalOpen] = useState(false);

    function handle_jwtTest_click() {
        setIsJwtTestModalOpen(true);
    }


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
        if (navName_state === "home" || navName_state === "logout") { return <></> };
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

    function handle_jwtTest_click() {
        updateNav('/jwt_test', navName_state)
    }

    return (
        <div className="er3-homehead">

            <div className="er3-homehead-left"><Hamburger /></div>
            <div className='homehead-notifs-section'><Notifs_button /></div>
            {/* <div className='homehead-test-section'>
                <div
                    className='homehead-test-frame topnav-button-panes'
                    onClick={handle_jwtTest_click}
                >
                    JWT_TEST
                </div>
            </div> */}
            <Frame_UserBox/>

            <div className='er3-homehead-right'>
                <span className="er3-homehead-buttonbar">
                    {navArr_toShow.map((val, key) => {
                        return (
                            <div className='edu3-nav-link' key={nanoid(3)} onClick={() => updateNav(val.path, val.navStub)} >
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