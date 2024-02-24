import React, { useContext } from 'react';

import './TempUsers_table.css';

function TempUsers_table({userList}) {

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

export default TempUsers_table;
