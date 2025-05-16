import React, { useContext } from 'react';
import CreateScenario from '../scenarios/CreateScenario.jsx';
import CreateGroup from '../groups/CreateGroup.jsx';
import Placard from '@components/Placard'
import TempUsers_table from '../notifications/items/TempUsers_table.jsx';
import Creation_Instructions from '../notifications/items/Creation_Instructions.jsx';
import { StaffRouter_context } from '../Staff_router.jsx';
import './Staff_Dash.css';
import Staff_ScenGrid from '../scenarios/Staff_ScenGrid.jsx';
import Staff_GroupsGrid from '../groups/Staff_GroupsGrid.jsx';
import Staff_UsersGrid from '../users/Staff_UsersGrid.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Staff_Dash() {

    const {
        scenarios_state,
        set_scenarioDetail_state, 
        tempUsers_state } = useContext(StaffRouter_context);

    const { userData_state } = useContext(HomeRouter_context);

    if (!scenarios_state || !userData_state) { return <></> }

    return (
        <div className='staff-dash-frame'>

            <div className='staff-dash-column-main'>

            {userData_state?.is_admin ? (<div className='staff-dash-section'>
                    <Placard 
                        placard_text='STUDENT GROUPS' 
                        navMetas={['/staff/groups', 'dash']} 
                        is_button={true} 
                        textSize={'large'}/>
                    <CreateGroup />
                    <Staff_GroupsGrid />
                </div>) : (<></>)}

                {userData_state?.is_admin ? (<div className='staff-dash-section'>
                    <Placard 
                        placard_text='SCENARIOS' 
                        textSize={'large'}
                        navMetas={['/staff/scenarios', 'dash']} 
                        is_button={true} />
                    <CreateScenario />
                    <Staff_ScenGrid set_scenarioDetail_state={set_scenarioDetail_state} />
                </div>) : (<></>)}

                <div className='staff-dash-section'>
                    <Placard 
                        placard_text='USERS'
                        textSize={'large'} 
                        navMetas={['/staff/students', 'dash']} 
                        is_button={true} />
                    <Staff_UsersGrid set_scenarioDetail_state={set_scenarioDetail_state} />
                </div>    

            </div>

            <div className='staff-dash-column-alt'>
                <TempUsers_table userList={tempUsers_state} />
            </div>

        </div>
    );
}

export default Staff_Dash;
