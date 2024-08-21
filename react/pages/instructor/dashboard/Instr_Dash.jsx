import React, { useContext } from 'react';
import Instr_ScenTable from '../scenarios/Instr_ScenTable.jsx';
import CreateScenario from '../scenarios/CreateScenario.jsx';
import Instr_GroupsTable from '../groups/Instr_GroupsTable.jsx';
import CreateGroup from '../groups/CreateGroup.jsx';
import Placard from '@components/Placard'
import TempUsers_table from '../notifications/items/TempUsers_table.jsx';
import Creation_Instructions from '../notifications/items/Creation_Instructions.jsx';
import { InstructorRouter_context } from '../Instructor_router.jsx';
import './Instr_Dash.css';
import Instr_UsersTable from '../users/Instr_UsersTable.jsx';
import Staff_ScenGrid from '../scenarios/Staff_ScenGrid.jsx';
import Staff_GroupsGrid from '../scenarios/Staff_GroupsGrid.jsx';
import Staff_UsersGrid from '../users/Staff_UsersGrid.jsx';

function Instr_Dash() {

    const {
        scenarios_state,
        set_scenarioDetail_state, 
        tempUsers_state } = useContext(InstructorRouter_context);

    if (!scenarios_state) { return <></> }

    return (
        <div className='instructor-dash-frame'>

            <div className='instructor-dash-column-main'>

                <div className='instructor-dash-section'>
                    <Placard 
                        placard_text='STUDENT GROUPS' 
                        navMetas={['/instructor/groups', 'dash']} 
                        is_button={true} 
                        textSize={'large'}/>
                    <CreateGroup />
                    <Staff_GroupsGrid />
                </div>

                <div className='instructor-dash-section'>
                    <Placard 
                        placard_text='SCENARIOS' 
                        textSize={'large'}
                        navMetas={['/instructor/scenarios', 'dash']} 
                        is_button={true} />
                    <CreateScenario />
                    <Staff_ScenGrid set_scenarioDetail_state={set_scenarioDetail_state} />
                </div>

                <div className='instructor-dash-section'>
                    <Placard 
                        placard_text='USERS'
                        textSize={'large'} 
                        navMetas={['/instructor/students', 'dash']} 
                        is_button={true} />
                    <Staff_UsersGrid set_scenarioDetail_state={set_scenarioDetail_state} />
                </div>    

            </div>

            <div className='instructor-dash-column-alt'>
                <TempUsers_table userList={tempUsers_state} />
                <Creation_Instructions />
            </div>

        </div>
    );
}

export default Instr_Dash;
