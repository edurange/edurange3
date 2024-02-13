import axios from 'axios';
import React, { useEffect, useContext, useState } from 'react';

import '@scenarios/list/ScenarioTable.css'
import { InstructorDashContext } from './InstructorDash';

function Instructor_ScenDetail() {

    const { scenarioDetail_state } = useContext( InstructorDashContext );

    console.log("scen detail state: ",scenarioDetail_state);
    if (!scenarioDetail_state) return (<>Click Scenario on table for details</>)
    
    return (
        <div>
            <div>
                <div>
                    <div>
                    CREATED_AT: {scenarioDetail_state.created_at}
                    </div>
                    <div>
                    DESCRIPTION: {scenarioDetail_state.description}
                    </div>
                    <div>
                    ID: {scenarioDetail_state.id}
                    </div>
                    <div>
                    NAME: {scenarioDetail_state.name}
                    </div>
                    <div>
                    OWNER ID: {scenarioDetail_state.owner_id}
                    </div>
                    <div>
                    STATUS: {scenarioDetail_state.status}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Instructor_ScenDetail;