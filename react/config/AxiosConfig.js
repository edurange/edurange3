
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

import axios from 'axios';

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
const csrfToken = getCSRFfromCookie();
if (!csrfToken) { console.log('Axios: CSRF cookie not found'); } // DEV_ONLY

// baseURL / request notes:
// - NO trailing slash on the baseURL
// - ASSUMES domain, not numeric IP
// - Do NOT add port if using domain w/ nginx reverse proxy
// - USE leading slash for axios calls a la 'axios.post('/someRoute')'
axios.defaults.baseURL = '/api';  
axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken || ""; // provide empty for login
axios.defaults.withCredentials = true; // very important

const showDetailedErrors = false; // Set to false in production

// Global response interceptor
axios.interceptors.response.use(response => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
}, error => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    console.error("Axios Error:", error.response ? error.response.data : error.message);

    if (showDetailedErrors) {
        console.error("Detailed Error:", error);
    }

    return Promise.reject(error);
});
// allows er3_entry.jsx to wrap itself in AxiosConfig.js
function AxiosConfig ({children}) {return children;}
export default AxiosConfig;


