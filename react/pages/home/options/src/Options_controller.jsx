import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import './Options.css';
import { navArrays } from '../../../../modules/nav/navItemsData';
import Options_home from './Options_home';
import Options_accessibility from './Options_accessibility';
import Options_themes from './Options_themes';
import SideNav from '../../../dashboard/src/sidenav/SideNav';


function Options_controller() {
  
  // (add state and session restore logic for options here)

  // these routes extend /edurange3/options
  // e.g. accessibility is URL /edurange3/options/accessibility
  return (
    
    <div className='newdash-frame'>
      <div className='newdash-frame-carpet'>

        < SideNav navDataToShow={navArrays.side_dash} />

        <div className="newdash-infopane-frame">
          <div className='newdash-infopane-content'>
            <Routes>
              <Route path="/" element={<Options_home />} />
              <Route path="/accessibility" element={<Options_accessibility />} />
              <Route path="/themes" element={<Options_themes />} />
            </Routes>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Options_controller;
