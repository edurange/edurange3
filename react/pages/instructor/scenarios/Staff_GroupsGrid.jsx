
import React, { useContext } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import Copy_button_flex from '@components/Copy_button_flex';
import './Staff_TableGrid.css'; 


function Staff_GroupsGrid() {
    const {
        groups_state, set_groups_state
    } = useContext(InstructorRouter_context);

    async function handle_deleteGroup_click(event, groupName) {
        event.stopPropagation();

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

    function handleDetailClick(event, group) {
        event.stopPropagation();
        set_desiredNavMetas_state([`/instructor/groups/${group.id}`, 'dash']);
    };

    return (
        <div className="table-groupsgrid">
            <div className="table-tablegrid-header">
                <div className="tablegrid-header-item">ID</div>
                <div className="tablegrid-header-item">Group Name</div>
                <div className="tablegrid-header-item">Code</div>
                <div className="tablegrid-header-item">User Count</div>
                <div className="tablegrid-header-item">C_PANEL</div>
            </div>
            {groups_state.length > 0 ? (
                groups_state
                    .filter(group => group.name !== 'ALL')
                    .map((group, index) => (
                        <div key={index + 432} className="table-tablegrid-row" onClick={(event) => handleDetailClick(event, group)}>
                            <div className="tablegrid-item">{group.id}</div>
                            <div className="tablegrid-item">{group.name}</div>
                            <div className="tablegrid-item gap-small nopad">
                                <Copy_button_flex textLabel={group.code} thingToCopy={group.code} />
                            </div>
                            <div className="tablegrid-item table-userlist">{group.users?.length ?? 0}</div>
                            <div className="tablegrid-item">
                                <button className='tablegrid-btn red-btn' onClick={(event) => handle_deleteGroup_click(event, group.name)}>DELETE</button>
                            </div>
                        </div>
                    ))
            ) : (
                <></>
            )}
        </div>
    );
};

export default Staff_GroupsGrid;


// import axios from 'axios';
// import React, { useContext } from 'react';
// import { InstructorRouter_context } from '../Instructor_router';
// import { HomeRouter_context } from '@pub/Home_router';
// import edurange_icons from '../../../modules/ui/edurangeIcons';
// import { AppContext } from '../../../config/AxiosConfig';
// import Copy_button_flex from '@components/Copy_button_flex';

// import './Staff_TableGrid.css';

// function Staff_GroupsGrid() {

//     const {
//         groups_state, set_groups_state,
//         scenarios_state, set_scenarios_state
//     } = useContext(InstructorRouter_context);
//     const {
//         desiredNavMetas_state, set_desiredNavMetas_state,
//     } = useContext(AppContext);

//     if (!groups_state) { return <></> }

//     const getGroupNameById = (groupId) => {
//         const group = groups_state.find(group => group.id === groupId);
//         return group ? group.name : 'none';
//     };
  
//     async function handle_deleteGroup_click(event, groupName) {
//         event.stopPropagation();

//         try {
//             const response = await axios.post(`/delete_group`, {
//                 group_name: groupName
//             });
//             if (response.data.group_name) {
//                 set_groups_state(prevState => prevState.filter(group => group.name !== response.data.group_name));
//             }
//         } catch (error) {
//             console.error('Error deleting group:', error);
//         }
//     }
//     function handleDetailClick (event, group) {
//         event.stopPropagation();
//         set_desiredNavMetas_state([`/instructor/groups/${group.id}`, 'dash']);
//     };

//     if (!groups_state) { return <></> } 

//     return (
// <div className="table-groupsgrid">
//     <div className="table-tablegrid-header">
//         <div className="tablegrid-header-item">ID</div>
//         <div className="tablegrid-header-item">Scenario Name</div>
//         <div className="tablegrid-header-item">Type</div>
//         <div className="tablegrid-header-item">St.Group</div>
//         <div className="tablegrid-header-item">Status</div>
//         <div className="tablegrid-header-item">C_PANEL</div>
//     </div>
//     {scenarios_state.map((scenario, index) => (
//         <div key={index} className="table-tablegrid-row" onClick={(event) => handleDetailClick(event, scenario)}>
//             <div className="tablegrid-item">{scenario.id}</div>
//             <div className="tablegrid-item">{scenario.name}</div>
//             <div className="tablegrid-item">{scenario.scenario_type}</div>
//             <div className="tablegrid-item">{getGroupNameById(scenario.membership)}</div>
//             <div className="tablegrid-item">{statusSwitch[scenario.status]}</div>
//             <div className="tablegrid-item">
//                 <button
//                     className='tablegrid-btn green-btn'
//                     onClick={(event) => handleStartClick(event, scenario)}
//                     title="Start Scenario" 
//                 >
//                     {edurange_icons.playSign}
//                 </button>
//                 <button
//                     className='tablegrid-btn grey-btn'
//                     onClick={(event) => handleStopClick(event, scenario)}
//                     title="Stop Scenario" 
//                 >
//                     {edurange_icons.stopSign}
//                 </button>
//                 <button
//                     className='tablegrid-btn red-btn'
//                     onClick={(event) => handleDestroyClick(event, scenario)}
//                     title="Destroy Scenario" 
//                 >
//                     {edurange_icons.trash}
//                 </button>
//             </div>
//         </div>
//     ))}
// </div>

//     );

// };
// export default Staff_GroupsGrid;


// function Instr_GroupsTable() {

//     return (
//         <div className="table-frame">

//             <div className="table-header">
//                 <div className='table-header-item col-xxsmall' >ID</div>
//                 <div className='table-header-item col-xlarge'>Group Name</div>
//                 <div className='table-header-item col-medium'>Code</div>
//                 <div className='table-header-item col-medium'>UserCt</div>
//                 <div className='table-header-item control-panel'>CONTROL PANEL</div>
//             </div>
//             {
//                 groups_state.length > 0 ? (
//                     groups_state
//                     .filter(group => group.name !== 'ALL')
//                     .map((group, index) => (
//                         <div key={index + 432} onClick={(event) => handleDetailClick(event, group)}>
//                             <div className="table-row">
//                                 <div className='table-cell-item highlightable-cell col-xxsmall'>{group.id}</div>
//                                 <div className='table-cell-item highlightable-cell col-xlarge'>{group.name}</div>
//                                 <div className='table-cell-item highlightable-cell col-medium gap-small nopad'><Copy_button_flex textLabel={group.code} thingToCopy={group.code}/></div>
//                                 <div className='table-cell-item col-medium table-userlist'>{group.users?.length ?? 0}</div>
//                                 <div className='table-cell-item highlightable-cell control-panel'>
//                                     <button className='row-btns red-btn' onClick={(event) => handle_deleteGroup_click(event, group.name)}>DELETE</button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))
//                 ) : (<></>)
//             }

//         </div>
//     );
// };

// export default Instr_GroupsTable;