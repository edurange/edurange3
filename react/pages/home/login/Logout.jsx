import React, {useEffect, useContext} from 'react';
import axios from 'axios';
import { HomeRouter_context } from '../Home_router';

function Logout () {

    const { 
        userData_state, set_userData_state, 
        login_state, 
        set_login_state ,
        set_navName_state,

    } = useContext(HomeRouter_context);

    if (!userData_state) {
        return <h4>You are logged out.</h4>
    }

    async function sendLogoutRequest() {
        try {
            const response = await axios.post('/logout');
            const responseData = response.data;

            if (responseData.message) {
                set_userData_state();
                set_login_state(false);
                set_navName_state('logout')
            sessionStorage.setItem('login', false);
            sessionStorage.setItem('loginExpiry', 0);
            sessionStorage.setItem('userData', '{}');
            sessionStorage.setItem('navName','logout')
            }
            else {
                console.log('Logout failure.');
            };
        }
        catch (error) {
            console.error('Error logging out:', error);
        };
    };

    useEffect(() => {sendLogoutRequest();}, []);

    if (login_state) {return (<h1>You are NOT logged out!</h1>)}
    return (<h1>You have been logged out.</h1>);
}

export default Logout;
