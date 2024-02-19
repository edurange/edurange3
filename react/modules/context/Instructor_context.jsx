import React from 'react';
import { useContext } from 'react';

import { HomeRouter_context } from '@pub/Home_router';
import Login from '@pub/login/Login';

export const Instructor_context = ({ children }) => {

    const login_session = JSON.parse(sessionStorage.getItem('login'));
    const { login_state } = useContext(HomeRouter_context);
    
    const shouldShow = ((login_session === true) || (login_state === true) )
    
    if ( shouldShow === true ) { return children }
    else { return <Login  />; }
};
