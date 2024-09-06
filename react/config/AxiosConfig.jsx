// SECURITY INFO
// It is very important that the CSRF token value is NOT submitted
// as a cookie, but rather in a request header, body, or footer.
// 
// The reason: Cookies can be submitted automatically on behalf of
// a victim's browser in the case of CSRF attacks. To prevent this,
// edurange3 is set up so that CSRF token value is read from the
// header, and not the cookie (unlike our auth JWT).
//
// If edurange3 were set up to accept the cookie value as the CSRF
// being submitted, a CSRF check would be mostly self-defeating.

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ErrorModal from '../components/ErrorModal';
export const AppContext = React.createContext();

function AxiosConfig({ children }) {

    const [csrfToken_state, set_csrfToken_state] = useState()
    const [errorModal_state, set_errorModal_state] = useState();
    const [desiredNavMetas_state, set_desiredNavMetas_state] = useState(['/', 'home'])
    const [clipboard_state, set_clipboard_state] = useState('');

    const showDetailedErrors = false; // wall of red ; use sparingly.
    // IMPORTANT NOTES
    // - NO trailing slash on the baseURL 
    // - ASSUMES domain, not numeric IP 
    // - Do NOT add port if using domain w/ nginx reverse proxy 
    // - NO leading slash for axios calls. e.g.: 'axios.post('someRoute')'
    axios.defaults.baseURL = '/api'; 
    axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken_state || "";
    axios.defaults.withCredentials = true; // very important
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    useEffect(() => {
        async function getCSRFfromCookie() {
            const name = 'X-XSRF-TOKEN';
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                const cookieReturn = parts.pop().split(';').shift();
                return cookieReturn;
            };
            return null;
        };

        async function setConfig(){
            const csrfToken = getCSRFfromCookie();
            set_csrfToken_state(csrfToken);
            axios.defaults.baseURL = '/api'; 
            axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken || "";
            axios.defaults.withCredentials = true; // very important
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            axios.interceptors.response.use(response => {
                // triggers on 200-series status code
                return response;
            }, error => {
                // triggers on any non-200-series status code
                console.error(error.message, ": ", error.response?.data?.error)
                if (showDetailedErrors) {
                    console.error("Detailed Error:", error);
                }
                set_errorModal_state(error)
                return Promise.reject(error);
            });
        }
        setConfig();
    }, []);

    if (String(axios?.defaults?.baseURL) !== String("/api") || !csrfToken_state) {
        return null
    }
    else {
        return (
        <>
            <AppContext.Provider value={{
            errorModal_state, set_errorModal_state,
            desiredNavMetas_state, set_desiredNavMetas_state,
            clipboard_state, set_clipboard_state
        }}>
            {
            errorModal_state
                && <ErrorModal 
                    message={errorModal_state?.response?.data?.error ?? errorModal_state?.data?.error ?? 'Unknown Error'} 
                    status_code={errorModal_state.response?.status ?? errorModal_state.status ?? 500}/>
            }
            {children}
            </AppContext.Provider>
        </>
    );}
}
export default AxiosConfig;