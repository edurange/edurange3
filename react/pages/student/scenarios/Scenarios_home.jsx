import React from 'react';
import './Scenarios_home.css'
import ScenTable_student from './ScenTable_student';

function Scenarios_home () {
    return ( 
            <div className='scenario-home-outer-frame'>
                <div className='scenario-home-inner-frame'>
                    <div className='newdash-content-placard' >
                        Scenarios
                    </div>
                    < ScenTable_student />
                </div>
            </div>
    );
};
export default Scenarios_home;
