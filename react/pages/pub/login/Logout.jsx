import React, {useEffect, useContext} from 'react';
import axios from 'axios';
import { HomeRouter_context } from '../Home_router';
import { AppContext } from '../../../config/AxiosConfig';

function Logout () {

    const { 
        userData_state, set_userData_state, 
        login_state, 
        set_login_state

    } = useContext(HomeRouter_context);
    const {
        errorModal_state, set_errorModal_state,
        desiredNavMetas_state, set_desiredNavMetas_state,
        clipboard_state, set_clipboard_state
    } = useContext(AppContext);
    
    async function sendLogoutRequest() {
        if (!userData_state || !login_state) {return}
        try {
            const response = await axios.post('/logout');
            const responseData = response.data;
            
            if (responseData.message) {
                set_userData_state();
                set_login_state(false);
                sessionStorage.setItem('login', false);
                sessionStorage.setItem('loginExpiry', 0);
                sessionStorage.setItem('userData', '{}');
                sessionStorage.setItem('navStub','home')
                set_desiredNavMetas_state(['/','home'])
            }
            else {
                console.log('Logout failure.');
            };
        }
        catch (error) {
            console.error('Error logging out:', error);
        };
    };
    
    useEffect(() => {
        sendLogoutRequest();
        set_desiredNavMetas_state(['/','home'])
    }, []);

    if (login_state) {return (<h1>Logout not successful!</h1>)}
    return (<h1>You are currently logged out.</h1>);
}

export default Logout;