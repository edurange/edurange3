import axios from 'axios';
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '@scenarios/list/ScenarioTable.css'
import { InstructorDashContext } from './InstructorDash';

function Instructor_GroupTable() {

    const { instructorData_state } = useContext(InstructorDashContext);

    if (!instructorData_state?.userGroups) {
        return <></>
    }
    // async function fetchScenarioList() {
    //     try {
    //         const response = await axios.post("/api/scenario_interface",{METHOD: 'LIST'});
    //         console.log(response);
    //         if (response.data.scenarios_list) {
    //             set_scenariosList_state(response.data.scenarios_list);
    //         };
    //     }
    //     catch (error) {console.log('get_scenarios_list error:', error);};
    // };
    // useEffect(() => {fetchScenarioList();}, []);

    
    return (
        <div className="newdash-datatable-frame">

            <div className="newdash-datatable-header">
                <div className='table-cell-item table-active' >ID</div>
                <div className='table-cell-item table-scenario-name'>Name</div>
                <div className='table-cell-item table-scenario-name'>Code</div>
                <div className='table-cell-item table-scenario-name'>Status</div>
            </div>
            {instructorData_state.userGroups.slice(0).map((group, index) => (
                <div  key={index} onClick={() => handleInspectClick(index)} >
                    <div className="table-row">
                        <div className='table-cell-item table-active'>{group.id}</div>
                        <div className='table-cell-item table-group-name'>{group.name}</div>
                        <div className='table-cell-item table-group-name'>{group.code}</div>
                        <div className='table-cell-item table-group-name'>{group.status}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Instructor_GroupTable;