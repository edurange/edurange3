import React from 'react';
import ScenarioTable from '@scenarios/ScenarioTable';
import './Scenarios_home.css'

function Scenarios_home () {
    return ( 
            <div className='scenario-home-outer-frame'>
                <div className='scenario-home-inner-frame'>
                    <div className='newdash-content-placard' >
                        Scenarios
                    </div>
                    < ScenarioTable />
                </div>
            </div>
    );
};
export default Scenarios_home;
