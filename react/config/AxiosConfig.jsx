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

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ErrorModal from '../components/ErrorModal';

export const AppContext = React.createContext();

function AxiosConfig({ children }) {
    const [csrfToken_state, set_csrfToken_state] = useState();
    const [errorModal_state, set_errorModal_state] = useState(null);
    const [desiredNavMetas_state, set_desiredNavMetas_state] = useState(['/', 'home']);
    const [clipboard_state, set_clipboard_state] = useState('');

    const showDetailedErrors = true; // Set to false in production

    useEffect(() => {
        async function getCSRFfromCookie() {
            const name = 'X-XSRF-TOKEN';
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop().split(';').shift();
            }
            return null;
        }

        const setConfig = async () => {
            try {
                const csrfToken = await getCSRFfromCookie();
                set_csrfToken_state(csrfToken);

                axios.defaults.baseURL = '/api';
                axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken || "";
                axios.defaults.withCredentials = true;
                axios.defaults.headers.post['Content-Type'] = 'application/json';

                axios.interceptors.response.use(
                    response => response,
                    error => {
                        const errorObject = {
                            message: error.response?.data?.message || error.message,
                            status_code: error.response?.status,
                            stack: showDetailedErrors ? error.stack : undefined,
                            details: showDetailedErrors ? error.response?.data : undefined
                        };
                        set_errorModal_state(errorObject);
                        console.error("API Error:", errorObject);
                        return Promise.reject(error);
                    }
                );
            } catch (error) {
                console.error("Config Error:", error);
                set_errorModal_state({
                    message: "Failed to set up API configuration",
                    status_code: 500,
                    stack: showDetailedErrors ? error.stack : undefined
                });
            }
        };

        setConfig();
    }, []);

    if (axios?.defaults?.baseURL !== "/api" || !csrfToken_state) {
        return null;
    }

    return (
        <AppContext.Provider value={{
            errorModal_state, set_errorModal_state,
            desiredNavMetas_state, set_desiredNavMetas_state,
            clipboard_state, set_clipboard_state
        }}>
            {errorModal_state && <ErrorModal error={errorModal_state} />}
            {children}
        </AppContext.Provider>
    );
}

export default AxiosConfig;
