import React, {useContext} from 'react';
import { nanoid } from 'nanoid';
import '../frame.css';
import { navArrays } from '@modules/nav/navItemsData';
import { HomeRouter_context } from '@pub/Home_router';

function Frame_side() {

  const {
    sideNav_isVisible_state,
    sideNav_isSmall_state, 
    navArraysObj_state,
    set_desiredNavMetas_state
  } = useContext(HomeRouter_context);

  const navArrayToShow = navArraysObj_state?.side ?? navArrays.logout.home.side;

  if (!sideNav_isVisible_state) {return <></>}
  if (!navArrayToShow) {return <></>}
  return (
        <div className='newdash-sidebar-frame'>

          {navArrayToShow.map((val, key) => {
            return (
              <div className='newdash-sidebar-row' key={nanoid(3)} onClick={() => set_desiredNavMetas_state([val.path, val.navStub])} >
                <div className='newdash-sidebar-item'>
                  <div className='newdash-sidebar-icon'>{val.icon}</div>

                  {(sideNav_isSmall_state) ? <></> : (
                    <div className='newdash-sidebar-title'>
                      {(sideNav_isSmall_state) ? <></> : val.title}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
  );
};
export default Frame_side;
