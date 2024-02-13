import React from 'react';
import { useContext } from 'react';

import { HomeRouterContext } from '@home/Home_router';
import Login from '@home/login/Login';

export const Instructor_context = ({ children }) => {

    const login_session = JSON.parse(sessionStorage.getItem('login'));
    const { login_state } = useContext(HomeRouterContext);
    
    const shouldShow = ((login_session === true) || (login_state === true) )
    
    if ( shouldShow === true ) { return children }
    else { return <Login  />; }
};
