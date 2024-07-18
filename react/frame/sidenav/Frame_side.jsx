import React, { useContext } from 'react';
import { nanoid } from 'nanoid';
import { Link } from 'react-router-dom';
import '../frame.css';
import { navArrays } from '@modules/nav/navItemsData';
import { HomeRouter_context } from '@pub/Home_router';
import edurange_icons from '../../modules/ui/edurangeIcons';
import { AppContext } from '../../config/AxiosConfig';

function Frame_side() {
    const {
        sideNav_isVisible_state,
        sideNav_isSmall_state,
        navArraysObj_state,
    } = useContext(HomeRouter_context);

    const {
        desiredNavMetas_state, set_desiredNavMetas_state,
    } = useContext(AppContext);

    const navArrayToShow = navArraysObj_state?.side ?? navArrays.logout.home.side;

    if (!sideNav_isVisible_state) { return <></> }
    if (!navArrayToShow) { return <></> }

    return (
        <div className='newdash-sidebar-frame'>
            {navArrayToShow.map((val, key) => {

                

                return val.external ? (
                    <a key={key} href={val.path} target="_blank" rel="noopener noreferrer" className='newdash-sidebar-row'>
                        <div className='newdash-sidebar-item'>
                            <div className='newdash-sidebar-icon'>{val.icon}</div>
                            {sideNav_isSmall_state ? null : (
                                <div className='newdash-sidebar-title'>{val.title}</div>
                            )}
                        </div>
                    </a>
                ) : (
                    <Link key={nanoid(3)} to={val.extension ? '/dashboard/scenarios/1' + val.path : val.path} className='newdash-sidebar-row' onClick={() => set_desiredNavMetas_state([val.path, val.navStub])}>
                        <div className='newdash-sidebar-item'>
                            <div className='newdash-sidebar-icon'>{val.icon}</div>
                            {sideNav_isSmall_state ? null : (
                                <div className='newdash-sidebar-title'>{val.title}</div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export default Frame_side;
