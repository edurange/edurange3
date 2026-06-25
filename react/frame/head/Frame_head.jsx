"use strict";
import React, { useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import Notifs_button from './Notifs_button';
import '../frame.css';
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouter_context } from '@pub/Home_router';
import Frame_UserBox from './Frame_UserBox';
import { navArrays } from '../../modules/nav/navItemsData';
import { AppContext } from '../../config/AxiosConfig';

function Frame_head() {

    const [theme, setTheme] = useState(() => localStorage.getItem('edurange-theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('edurange-theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }

    const {
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        navArraysObj_state
    } = useContext(HomeRouter_context);
    const {
        desiredNavMetas_state, set_desiredNavMetas_state,
    } = useContext(AppContext);
    
    const navArrayToShow = navArraysObj_state?.top ?? navArrays.logout.home.top

    function toggle_sideNav_vis() {
        set_sideNav_isVisible_state(!sideNav_isVisible_state);
    };
    const panelVisSelector = (sideNav_isVisible_state) ? edurange_icons.menuClose_up : edurange_icons.menuOpen_down;
    const pillOrReg = (sideNav_isVisible_state) ? 'er3-homehead-hamburger-item hamburger-pill-left' : 'er3-homehead-hamburger-item';

    function Hamburger() {
        return (
            <div className='er3-homehead-hamburger-frame'>
                <div
                    className={pillOrReg}
                    onClick={() => toggle_sideNav_vis()}
                > {panelVisSelector} </div>
            </div>
        );
    };
    return (
        <div className="er3-homehead">

            <div className="er3-homehead-left"><Hamburger /></div>

            <Frame_UserBox />

            <div className='theme-toggle-wrapper'>
                <button className='theme-toggle-btn' onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {theme === 'dark' ? edurange_icons.sun : edurange_icons.moon}
                </button>
            </div>

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