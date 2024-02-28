
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';
import Table from '../../../components/Table';

function Instr_GroupDetail() {

    const { groupID } = useParams();
    const { groups_state, set_groups_state, users_state, scenarios_state } = useContext(InstructorRouter_context);

    let thisGroup = groups_state
        .filter(group => group.id === parseInt(groupID))
        .map((group) => group);

    thisGroup = thisGroup[0];
    console.log (thisGroup)
    if (!thisGroup) { return <>Group not found.</> }

    const thisGroupID = (thisGroup?.id);

    async function handle_deleteGroup_click(groupName) {
        try {
            const response = await axios.post(`/delete_group`, {
                group_name: groupName
            });
            if (response.data.group_name) {
                set_groups_state(prevState => prevState.filter(group => group.name !== response.data.group_name));
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    }

    // 
    const scen_colData = [
        {label: 'id',
        css_class: 'col-xsmall'},
        {
            label: 'name',
            css_class: 'col-large'
        },
        {
            label: 'description',
            css_class: 'col-large'
        },
    ]
    
    const scen_rowData = scenarios_state
        .filter((scenario) => scenario.membership === thisGroupID)
        ?? [];

    const users_colData = [
        {
            label: 'id',
            css_class: 'col-xsmall'
        },
        {
            label: 'username',
            css_class: 'col-large'
        },
    ]
    const users_rowData = users_state
        .filter((user) => user.membership === thisGroupID)
        ?? [];
    
    return (
        <div className="table-frame">
            <Placard placard_text={`Group: ${thisGroup.name}`}/>

            <div>
                Name:  {thisGroup.name}
            </div>
            <div>
                ID:  {thisGroup.id}
            </div>
            <div>
                Student Members: <Table columnData={users_colData} rowData={users_rowData}/>
            </div>
            <div>
                Scenarios: <Table columnData={scen_colData} rowData={scen_rowData}/>
            </div>

        </div>
    );
};

export default Instr_GroupDetail;