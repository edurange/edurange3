// SECURITY WARNING
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
//
// TLDR: If you change how the CSRF token is submitted/accepted, 
//       do NOT make it by way of cookie.

import React, { useEffect } from 'react';
import axios from 'axios';

function AxiosConfig({ children }) {

    let csrfToken = "";

    useEffect(() => {

        function getCSRFfromCookie() {
            const name = 'X-XSRF-TOKEN';
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                const cookieReturn = parts.pop().split(';').shift();
                return cookieReturn;
            };
            return null;
        };

        csrfToken = getCSRFfromCookie();

        if (!csrfToken) { 
            console.error('Axios: CSRF cookie not found');
        }
        if (!axios.defaults) { 
            console.error('Axios: defaults not found');
        }
        
        axios.defaults.baseURL = '/api'; 
        console.log('checking base url: ', axios?.defaults?.baseURL)
        
        if (!axios?.defaults?.baseURL !== "/api") { 
            return
        }
        if (!axios?.defaults?.baseURL !== "/api") { 
            console.error('Axios: axios baseURL should be "/api" but is not');
        }
        // IMPORTANT NOTES
        // - NO trailing slash on the baseURL 
        // - ASSUMES domain, not numeric IP 
        // - Do NOT add port if using domain w/ nginx reverse proxy 
        // - USE leading slash for axios calls throughout react. e.g.: 'axios.post('/someRoute')'

        axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken || "";
        axios.defaults.withCredentials = true; // very important

        const showDetailedErrors = false; // wall of red ; use sparingly.

        axios.interceptors.response.use(response => {
            // triggers on 200-series status code
            return response;
        }, error => {
            // triggers on any non-200-series status code
            console.error(error.message, ":", error.response?.data?.error)
            if (showDetailedErrors) {
                console.error("Detailed Error:", error);
            }
            return Promise.reject(error);
        });
    }, [csrfToken]);

    return children;
}
export default AxiosConfig;
