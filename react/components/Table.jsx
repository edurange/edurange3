
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/css/tables.css';
import { InstructorDashContext } from './InstructorDash';

function Table({ columnData, rowData, use_crud }) {
    const navigate = useNavigate();
    const { instructorData_state, set_scenarioDetail_state } = useContext(InstructorDashContext);

    function handleDetailClick(scenario_index) {
        const currentMeta = instructorData_state.scenarios[scenario_index];
        set_scenarioDetail_state(currentMeta);
    }

    if (!instructorData_state?.scenarios) {
        return <></>;
    }

    return (
        <div className="table-frame">
            <div className="table-header">
                {columnData.map((column) => (
                    <div key={column.label} className={`table-cell-item ${column.css_class}`}>
                        {column.label}
                    </div>
                ))}
            </div>
            {rowData.map((row, index) => (
                <div key={index} onClick={() => handleDetailClick(index)}>
                    <div className="table-row">
                        {columnData.map((column) => {
                            // Dynamically access row data based on column label
                            const rowDataKey = column.label.toLowerCase();
                            return (
                                <div key={column.label + row.id} className={`table-cell-item ${column.css_class}`}>
                                    {row[rowDataKey]}
                                    {use_crud ? (<>CRUD STUFF HERE</>) : (<></>)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Table;


// import axios from 'axios';
// import React, { useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// import '@assets/css/tables.css';;
// import { InstructorDashContext } from './InstructorDash';

// // This is a generic polymorphic Table component
// // prop arguments use following format (w/o _dummy):

// // the reason for using the style args is bc 
// // different tables need different col width

// const columnData_dummy = [
//     {
//         label: 'ID',
//         css_class: 'col-xsmall',
//     }, 
//     {
//         label: 'Name',
//         css_class: 'col-medium',
//     }, 
//     {
//         label: 'Type',
//         css_class: 'col-large',
//     }, 
// ]

// const rowData_dummy = [
//     {
//         id: 1,
//         name: 'someName',
//         type: 'Getting_Started'
//     },
//     {
//         id: 2,
//         name: 'anotherName',
//         type: 'Ssh_Inception'
//     },
//     {
//         id: 3,
//         name: 'thirdName',
//         type: 'Treasure_Hunt'
//     },

// ]


// function Table({columnData, rowData}) {

//     const navigate = useNavigate();

//     const { instructorData_state, set_scenarioDetail_state } = useContext( InstructorDashContext );
    
//         function handleDetailClick (scenario_index) {
//             const currentMeta = instructorData_state.scenarios[scenario_index];
//             set_scenarioDetail_state(currentMeta);
//         };

//     if (!instructorData_state?.scenarios) {return <></>}

//     return (
//         <div className="table-frame">
//             <div className="table-header">
//                 <div className='table-cell-item table-int' >ID</div>
//                 <div className='table-cell-item col-small'>Name</div>
//                 <div className='table-cell-item col-xlarge'>Type</div>
//             </div>
//             {instructorData_state.scenarios.slice(0).map((scenario, index) => (
//                 <div  key={index} onClick={() => handleDetailClick(index)} >
//                     <div className="table-row">
//                         <div className='table-cell-item table-int'>{scenario.id}</div>
//                         <div className='table-cell-item col-small'>{scenario.name}</div>
//                         <div className='table-cell-item col-xlarge'>{scenario.description}</div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default Table;