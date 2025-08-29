
import React from 'react';
import CreateScenario from './CreateScenario';
import '@assets/css/tables.css';
import Placard from '@components/Placard';
import Staff_ScenGrid from './Staff_ScenGrid';

function Staff_Scenarios() {

    return (
        <div className='staff-dash-frame'>

            <div className='staff-dash-column-main'>
                <div className='staff-dash-section'>
                    <Placard placard_text={"Scenarios"} />
                        <CreateScenario />
                    <div className="table-frame">
                        <Staff_ScenGrid />                
                    </div>
                </div>
            </div>

            <div className='staff-dash-column-alt'>
                <p>Create and deploy cybersecurity scenarios for students.</p>
                <p>Available types include web security, network analysis, and system administration exercises.</p>
            </div>

        </div>
    );
};

export default Staff_Scenarios;