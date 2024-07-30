

///////////////////////
////// EduRangeEntry.js is the primary Main Entry script for EduRange3
////// Should be kept as clean as possible
///////////////////////

// Home_router.js is the secondary main entry point Component.

import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import Home_router from '@pub/Home_router'
import AxiosConfig from '@config/AxiosConfig.jsx';
import '@assets/css/base.css' 

const root = ReactDOM.createRoot(document.getElementById("er3_entry"));
root.render (
    // <React.StrictMode> // strict mod is useful for debug, but can cause issues
            <AxiosConfig>
                <BrowserRouter>
                    <Home_router/>
                </BrowserRouter>
             </AxiosConfig>
    // </React.StrictMode>
);