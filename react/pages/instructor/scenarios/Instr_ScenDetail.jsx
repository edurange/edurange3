
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';

function Instr_ScenDetail() {

    const { scenarioID } = useParams();
    const { scenarios_state, set_scenarios_state } = useContext(InstructorRouter_context);

    console.log(typeof(scenarioID))
    console.log(typeof(scenarios_state?.[0]?.id));

    let thisScenario = scenarios_state
                        .filter(scenario => scenario.id === parseInt(scenarioID))
                        .map((scenario) => scenario);

    thisScenario = thisScenario[0];
                        
    if (!thisScenario) { return <>Group not found.</> } 

    const thisScenarioID = (thisScenario?.id);

    async function handle_deleteGroup_click(groupName) {
        try {
            const response = await axios.post(`/delete_group`, {
                group_name: groupName
            });
            if (response.data.group_name) {
                set_scenarios_state(prevState => prevState.filter(group => group.name !== response.data.group_name));
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    }


    return (
        <div className="table-frame">
            {/* <Placard placard_text={`Group: ${thisScenario.name}`}/> */}
            
            <div>
                Name:  {thisScenario.name}
            </div>
            <div>
                ID:  {thisScenario.id}
            </div>
            <div>
                Group membership:  {thisScenario.membership}
            </div>

        </div>
    );
};

export default Instr_ScenDetail;