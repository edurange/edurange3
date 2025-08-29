
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import './Staff_ScenDetail.css';

import { StaffRouter_context } from '../Staff_router';
import { statusSwitch } from './Staff_ScenGrid';

function Staff_ScenDetail() {

    const { scenarioID } = useParams();
    const { scenarios_state, set_scenarios_state, groups_state } = useContext(StaffRouter_context);

    // Check if required state arrays exist
    if (!scenarios_state || !groups_state) { 
        return <>Loading scenario details...</>; 
    }

    const thisScenario = scenarios_state.filter(scenario => scenario.id === parseInt(scenarioID))?.[0]
                        
    if (!thisScenario) { return <>Scenario not found.</> } 

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

    function getOwnerGroup(){
        if (!groups_state || !Array.isArray(groups_state)) return false;
        const matchingGroup = groups_state.filter((group) => thisScenario.membership === group.id)?.[0]
        return matchingGroup ?? false;
    }

    const membershipGroup = Array.isArray(groups_state) ? 
        groups_state.filter((group) => thisScenario.membership === group.id)?.[0] ?? false : false

    return (
        <div className="table-frame">
            
            <div>
                Scenario Name:  {thisScenario.name}
            </div>
            <div>
                Scenario ID:  {thisScenario.id}
            </div>
            <div>
                Scenario Type:  {thisScenario.description}
            </div>
            <div>
                <span> Scenario Status:  {statusSwitch[thisScenario.status]} </span>
            </div>
            <div>
                <br></br>
            </div>
            <div>
                Scenario Belongs to Group:
                <div>
                    Group Name: {membershipGroup?.name}
                </div>
                <div>
                    Group ID: {membershipGroup?.id}
                </div>
                <div>
                    Group Users Ct: {membershipGroup?.users?.length}
                </div>
            </div>

        </div>
    );
};

export default Staff_ScenDetail;