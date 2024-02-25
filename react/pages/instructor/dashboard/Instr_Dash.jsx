import React, { useContext } from 'react';
import Instr_ScenTable from '../scenarios/Instr_ScenTable.jsx';
import CreateScenario from '../scenarios/CreateScenario.jsx';
import Instr_GroupTable from '../groups/Instr_GroupTable.jsx';
import CreateGroup from '../groups/CreateGroup.jsx';
import Placard from '@components/Placard'
import TempUsers_table from '../notifications/items/TempUsers_table.jsx';
import Creation_Instructions from '../notifications/items/Creation_Instructions.jsx';
import Instr_StudentsTable from '../users/Instr_StudentsTable.jsx';
import { InstructorRouter_context } from '../Instructor_router.jsx';
import './Instr_Dash.css';

function Instr_Dash() {

    const {
        scenarios_state,
        set_scenarioDetail_state, tempUsers_state } = useContext(InstructorRouter_context);

    if (!scenarios_state) { return <></> }

    return (
        <div className='instructor-dash-frame'>

            <div className='instructor-dash-column-main'>

                <div className='instructor-dash-section'>
                    <Placard placard_text='STUDENT GROUPS' navMetas={['/instructor/groups', 'dash']} is_button={true} />
                    <CreateGroup />
                    <Instr_GroupTable />
                </div>

                <div className='instructor-dash-section'>
                    <Placard placard_text='SCENARIOS' navMetas={['/instructor/scenarios', 'dash']} is_button={true} />
                    <CreateScenario />
                    <Instr_ScenTable set_scenarioDetail_state={set_scenarioDetail_state} />
                </div>

                <div className='instructor-dash-section'>
                    <Placard placard_text='STUDENTS' navMetas={['/instructor/students', 'dash']} is_button={true} />
                    <Instr_StudentsTable set_scenarioDetail_state={set_scenarioDetail_state} />
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
