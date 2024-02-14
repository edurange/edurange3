import React, {useContext} from 'react';

import './Scenarios_home.css'

import ScenarioTable from './list/ScenarioTable';
import { HomeRouter_context } from '@home/Home_router';

function Scenarios_home () {
    
    const { userData_state } = useContext( HomeRouter_context ); 
    
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
