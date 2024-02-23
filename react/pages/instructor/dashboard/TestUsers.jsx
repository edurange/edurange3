import React, { useContext } from 'react';
import Instr_ScenTable from './tables/Instr_ScenTable.jsx';
import Frame_side from '@frame/sidenav/Frame_side';
import CreateScenario from './components/CreateScenario.jsx';
import Instr_GroupTable from './tables/Instr_GroupTable.jsx';
import CreateGroup from './components/CreateGroup.jsx';
import Placard from '@components/Placard'
import Creation_Instructions from './components/Creation_Instructions.jsx';
import { InstructorRouter_context } from '../Instructor_router.jsx';
import './TestUsers.css';

function TestUsers({userList}) {

  if (userList.length < 1) { return <></> }

  return (

    
            <div>
              Test Users:
              {userList.map((user, index) => {
            return (
              <div key={index+567}>
                  <div>Username: {user.username}</div>
                  <div>Password: {user.password}</div>
              </div>
              
            );
          })}
            </div>
  
  );
}

export default TestUsers;
