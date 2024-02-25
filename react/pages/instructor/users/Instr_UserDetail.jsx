
import React, { useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


import '@assets/css/tables.css';
import { InstructorRouter_context } from '../Instructor_router';
import Placard from '../../../components/Placard';

function Instr_UserDetail() {

    const { userID } = useParams();
    const { scenarios_state, users_state } = useContext(InstructorRouter_context);

    console.log(users_state)
    let thisUser = users_state
                        .filter(user => user.id === parseInt(userID))
                        .map((user) => user);

    console.log(thisUser)
    thisUser = thisUser[0];
                        
    if (!thisUser) { return <>User not found.</> } 

    const thisScenarioID = (thisUser?.id);


    return (
        <div className="table-frame">
            
            <div>
                Name:  {thisUser.name}
            </div>
            <div>
                ID:  {thisUser.id}
            </div>

        </div>
    );
};

export default Instr_UserDetail;