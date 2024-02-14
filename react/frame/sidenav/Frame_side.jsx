import React, {useContext} from 'react';
import { nanoid } from 'nanoid';
import './Frame_side.css';
import { navArrays } from '@modules/nav/navItemsData';
import { HomeRouter_context } from '@home/Home_router';

function Frame_side({navToShow}) {

  const {
    sideNav_isVisible_state, updateNav,
    sideNav_isSmall_state
  } = useContext(HomeRouter_context);

  // navToShow = (navToShow) ? navToShow : navArrays.side_logout; 
  const myNav =  navArrays.side_scenarios_instructor

  if (!sideNav_isVisible_state) {return <></>}
    
  return (
        <div className='newdash-sidebar-frame'>

          {myNav.map((val, key) => {
            return (
              <div className='newdash-sidebar-row' key={nanoid(3)} onClick={() => updateNav(val.path, val.navStub)} >
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
