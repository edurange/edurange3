import React, {useEffect, useContext} from 'react';
import axios from 'axios';
import { HomeRouter_context } from '../Home_router';

function Logout () {

    const { 
        userData_state, set_userData_state, 
        login_state, 
        set_login_state , set_desiredNavMetas_state

    } = useContext(HomeRouter_context);

    if (!userData_state) {
        return <h1>You are currently logged out.</h1>
    }

    async function sendLogoutRequest() {
        try {
            const response = await axios.post('/logout');
            const responseData = response.data;

            if (responseData.message) {
                set_userData_state();
                set_login_state(false);
                set_desiredNavMetas_state(['/logout','home'])
            sessionStorage.setItem('login', false);
            sessionStorage.setItem('loginExpiry', 0);
            sessionStorage.setItem('userData', '{}');
            sessionStorage.setItem('navStub','logout')
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

    if (login_state) {return (<h1>Logout not successful!</h1>)}
    return (<h1>You are currently logged out.</h1>);
}

export default Logout;
