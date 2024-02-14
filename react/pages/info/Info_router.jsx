
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Contact from './Contact';
import HelpPage from './HelpPage';
import InfoHome from './Info_home';
import About from './About';
import Documents from './Documents';
import FAQ from './FAQ';

function InfoRouter (    ) {


// these routes extend /info
// e.g. about is URL /info/about
    return (
        <div className='edu3-dashpanes-outer-wrap'>
                <div className='dash-sidebar-pane'>
                    This is the InfoHome 'wrapper' rendering successfully.
                </div>
                    <div className="edu3-dashpanes-container">
                    <div className='edu3-dashpane'>
                        <Routes>
                            <Route path="/*" element={<InfoHome />} />
                            <Route path="/help" element={<HelpPage />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/docs" element={<Documents />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/FAQ" element={<FAQ />} />
                        </Routes>
                    </div>            
                </div>
        </div>
    );
}

export default InfoRouter;
