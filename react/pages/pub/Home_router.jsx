import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { navArrays } from '@modules/nav/navItemsData';
import Home from './Home';
import Login from './login/Login';
import Register from './login/Register';
import InfoRouter from './info/Info_router';
import SessionKeeper from './SessionKeeper';
import Logout from './login/Logout';
import Instructor_router from '../instructor/Instructor_router';
import { Instructor_context } from '../../modules/context/Instructor_context';
import { Student_context } from '../../modules/context/Student_context';
import Student_router from '../student/Student_router';
import Options_controller from './options/Options_controller';
import Frame_head from '../../frame/head/Frame_head';
import Frame_foot from '../../frame/foot/Frame_foot';
import Account from '../student/account/Account';
import './Home.css';

export const HomeRouter_context = React.createContext();

// note: this only impacts UI render. To change actual jwt expiry, 
// look in py_flask/utils/auth_utils.py > er3_login().
const loginExpiry = ((1000 * 60 * 60) * 11.5); // 11.5 hrs in milliseconds

function Home_router() {

  const [navArraysObj_state, set_navArraysObj_state] = useState(navArrays.logout.home);
  const [clipboard_state, set_clipboard_state] = useState('');
  const [sideNav_isVisible_state, set_sideNav_isVisible_state] = useState(true);
  const [sideNav_isSmall_state, set_sideNav_isSmall_state] = useState(false);
  const [userData_state, set_userData_state] = useState();
  const [chatData_state, set_chatData_state] = useState([]);
  const [desiredNavMetas_state, set_desiredNavMetas_state] = useState(['/', 'home'])
  const [login_state, set_login_state] = useState(false);
  const [chatSocket_state, set_chatSocket_state] = useState();

  const navigate = useNavigate();


  function begin_nav(navMetas) {

    const desiredNavPath = navMetas[0];
    const desiredNavStub = navMetas[1];

    if (!desiredNavPath || !desiredNavStub) {
      console.error('Missing navMeta arg');
      return;
    }

    const roleToUse = userData_state?.role ?? 'logout';

    if (!(desiredNavStub in navArrays[roleToUse])) {
      console.error('navStub not found in role navItemData as key');
      return;
    }

    const new_navObj = navArrays?.[roleToUse]?.[desiredNavStub];
    set_navArraysObj_state(new_navObj);

    const newExpiry = (Date.now() + loginExpiry);
    sessionStorage.setItem('loginExpiry', JSON.stringify(newExpiry));
    sessionStorage.setItem('navMetas', JSON.stringify(navMetas));

    navigate(desiredNavPath);
  };
  useEffect(() => {begin_nav(desiredNavMetas_state);}, [desiredNavMetas_state]); 

  return (
    <div id='edurange-appframe'>

      <HomeRouter_context.Provider value={{
        userData_state, set_userData_state,
        login_state, set_login_state,
        loginExpiry,
        sideNav_isVisible_state, set_sideNav_isVisible_state,
        sideNav_isSmall_state, set_sideNav_isSmall_state,
        clipboard_state, set_clipboard_state,
        navArraysObj_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        chatSocket_state, set_chatSocket_state,
        chatData_state, set_chatData_state
      }}>
        <SessionKeeper/>
        <Frame_head />

        <div id='edurange-content'>
          <div className='universal-outer'>
            <div className='universal-mid'>
              <div className='universal-inner'>

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/options/*" element={<Options_controller />} />
                  <Route path="/info/*" element={<InfoRouter />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/scenarios/*" element={
                    <Student_context>
                      <Student_router />
                    </Student_context>
                  } />
                  <Route path="/instructor/*" element={
                    <Instructor_context>
                      <Instructor_router />
                    </Instructor_context>
                    }>
                  </Route>
                </Routes>

              </div>
            </div>
          </div>
        </div>

        <Frame_foot />

      </HomeRouter_context.Provider>
    </div>
  );
};

export default Home_router;
