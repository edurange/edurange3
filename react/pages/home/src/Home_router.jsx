import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';


import './Home.css';
import { navArrays } from '../../../modules/nav/navItemsData';
import { LoggedIn_context } from '../../../modules/context/LoggedIn_context';
import Home from './Home';
import Login from './components/login/Login';
import Register from './components/login/Register';
import Logout from './components/login/Register';
import Options_controller from '../options/src/Options_controller';
import InfoRouter from '../info/src/Info_router';
import HomeHead from './components/frame/head/HomeHead';
import SessionKeeper from './SessionKeeper';
import Dashboard_router from '../../dashboard/src/Dashboard_router';
import HomeFoot from './components/frame/foot/HomeFoot';


export const HomeRouterContext = React.createContext();

const loginExpiry = (1000 * 60 * 60 * 1); // 1 hr in miliseconds

function Home_router() {
  
  ////HOOKS//////////////////////////////////////
  const [navName_state, set_navName_state] = useState('logout');
  const [clipboard_state, set_clipboard_state] = useState('');
  const [sideNav_isVisible_state, set_sideNav_isVisible_state] = useState(true);
  const [sideNav_isSmall_state, set_sideNav_isSmall_state] = useState(false);
  const [userData_state, set_userData_state] = useState({});
  const [login_state, set_login_state] = useState(false);
  const navigate = useNavigate();
  ///////////////////////////////////////////////

  function updateNav (newURL, newNavName) {
    console.log('updating nav...');
    set_navName_state(newNavName);
    const newExpiry = (Date.now() + loginExpiry);
    sessionStorage.setItem ('navName', JSON.stringify(newNavName));
    sessionStorage.setItem ('loginExpiry', JSON.stringify(newExpiry));
    navigate(newURL);
  };

  const navToShow = navArrays[`top_${navName_state}`];

  // these routes extend the base URL of /edurange3/
  // e.g. dashboard is URL /edurange3/dashboard
  return (
    <div id='edurange-appframe'>

      <HomeRouterContext.Provider value={{
        userData_state, set_userData_state,
        login_state,    set_login_state,
        navName_state,  set_navName_state,
        updateNav, loginExpiry,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        clipboard_state, set_clipboard_state
      }}>

        <SessionKeeper/>

        <HomeHead navToShow={navToShow} />

        <div id='edurange-content'>
          <div className='universal-content-outer'>
            <div className='universal-content-mid'>
              <div className='universal-content-inner'>

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/options/*" element={<Options_controller/>} />
                  <Route path="/info/*" element={<InfoRouter />} />
                  <Route path="/dashboard/*" element={
                    <LoggedIn_context>
                      <Dashboard_router />
                    </LoggedIn_context>
                  } />
                </Routes>

              </div>
            </div>
          </div>
        </div>

        <HomeFoot />

      </HomeRouterContext.Provider>
    </div>
  );
};

export default Home_router;
