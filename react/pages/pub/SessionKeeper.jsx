
import React, {useContext, useEffect} from 'react';
import Login from './login/Login';
import { HomeRouter_context } from "./Home_router";
import { AppContext } from '../../config/AxiosConfig';

function SessionKeeper () {

    const { 
        set_login_state,
        set_userData_state,
      } = useContext(HomeRouter_context);
      const {
        errorModal_state, set_errorModal_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        clipboard_state, set_clipboard_state
    } = useContext(AppContext);
    
    function restoreSession () {
        console.log('Restoring session...');
        
        const expiryString = sessionStorage?.getItem('loginExpiry');
        
        if (!expiryString)  { return <Login/>; };
    
        const expiry = JSON.parse(expiryString);
        
        if (expiry < Date.now()) { return <Login/>; };
        
        const userDataString = sessionStorage?.getItem('userData');
        const navMetasString = sessionStorage?.getItem('navMetas');
        const login_str = sessionStorage?.getItem('login');

        if ((!userDataString) || (!navMetasString)) { return <Login/>; };
        
        const userData = JSON.parse(userDataString);
        const navMetas = JSON.parse(navMetasString);
        const login = JSON.parse(login_str);

        set_desiredNavMetas_state(navMetas);
        set_userData_state(userData);
        set_login_state(login ?? false);
      };
      useEffect(() => {restoreSession();}, []);
  };
  export default SessionKeeper;