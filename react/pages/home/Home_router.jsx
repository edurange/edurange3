import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';


import './Home.css';
import { navArrays } from '@modules/nav/navItemsData';
import { LoggedIn_context } from '@modules/context/LoggedIn_context';
import Home from './Home';
import Login from './login/Login';
import Register from './login/Register';
import Options_controller from '../options/Options_controller';
import InfoRouter from '../info/Info_router';
import SessionKeeper from './SessionKeeper';
import HomeFoot from '@frame/foot/Frame_foot';
import Scenarios_router from '@scenarios/Scenarios_router';
import Frame_head from '@frame/head/Frame_head';
import Logout from './login/Logout';
import Account from '@account/Account';
import Instructor_router from '../instructor/Instructor_router';

export const HomeRouter_context = React.createContext();

const loginExpiry = (1000 * 60 * 60 * 1); // 1 hr in milliseconds

function Home_router() {

  const [navName_state, set_navName_state] = useState('logout');
  const [clipboard_state, set_clipboard_state] = useState('');
  const [sideNav_isVisible_state, set_sideNav_isVisible_state] = useState(true);
  const [sideNav_isSmall_state, set_sideNav_isSmall_state] = useState(false);
  const [userData_state, set_userData_state] = useState();
  const [login_state, set_login_state] = useState(false);
  const navigate = useNavigate();

  function updateNav(newURL, newNavName) {
    if (!newURL) {
      console.log('ERROR: MISSING UPDATENAV URL');
      return;
    }
    const navNameToUse = newNavName ?? navName_state;
    // console.log('updating nav...');
    set_navName_state(navNameToUse);
    const newExpiry = (Date.now() + loginExpiry);
    sessionStorage.setItem('navName', JSON.stringify(navNameToUse));
    sessionStorage.setItem('loginExpiry', JSON.stringify(newExpiry));
    navigate(newURL);
  };

  if (!navName_state) {return <></>}
  
  const navArr_toShow = navArrays[`top_${navName_state}`];

  return (
    <div id='edurange-appframe'>

      <HomeRouter_context.Provider value={{
        userData_state, set_userData_state,
        login_state, set_login_state,
        navName_state, set_navName_state,
        updateNav, loginExpiry,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        clipboard_state, set_clipboard_state
      }}>

        <SessionKeeper />

        <Frame_head navArr_toShow={navArr_toShow} />

        <div id='edurange-content'>
          <div className='universal-content-outer'>
            <div className='universal-content-mid'>
              <div className='universal-content-inner'>

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/options/*" element={<Options_controller />} />
                  <Route path="/info/*" element={<InfoRouter />} />
                  <Route path="/scenarios/*" element={
                    <LoggedIn_context>
                      <Scenarios_router />
                    </LoggedIn_context>
                  } />
                  <Route path="/account" element={<Account />} />
                  <Route path="/instructor/*" element={<Instructor_router />} />
                </Routes>

              </div>
            </div>
          </div>
        </div>

        <HomeFoot />

      </HomeRouter_context.Provider>
    </div>
  );
};

export default Home_router;
