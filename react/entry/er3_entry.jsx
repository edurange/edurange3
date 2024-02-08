

///////////////////////
////// EduRangeEntry.js is the primary Main Entry script for EduRange-React
////// Acts more or less as an App.js would in normal React contexts
////// Should be kept as clean as possible
///////////////////////

// Home_router.js is the secondary main entry point Component.

import React from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import '../assets/css/unified/pucs.css' 
import Home_tester from '../pages/home/src/Home_tester';
import Home_router from '../pages/home/src/Home_router'
import AxiosConfig from '../config/AxiosConfig';
// Importing pucs.css here adds pucs.css to full project's bundle.
// That means there's no need to import it separately into your components.

const root = ReactDOM.createRoot(document.getElementById("er3_entry"));
root.render (
    // <React.StrictMode> // strict mod is useful for debug, but can cause issues
            <AxiosConfig>
                <BrowserRouter>
                  console.log("lets go")
                    <Home_router/>
                </BrowserRouter>
             </AxiosConfig>
    // </React.StrictMode>
);