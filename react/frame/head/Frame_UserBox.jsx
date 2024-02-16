import React, { useContext } from 'react';
import { HomeRouter_context } from '@home/Home_router';

export const InstructorRouter_context = React.createContext();

function Frame_UserBox() {

    const {userData_state} = useContext(HomeRouter_context);

    if (!userData_state){
        return (
            <div className='userBox-frame logged-out'>
                You are not logged in
            </div>
        )
    }

return(
    <div className='userBox-frame logged-in'>
        Logged in as&nbsp;
        <div className='userBox-name'> 
            {userData_state.username}
        </div> 
    </div>
    );
};

export default Frame_UserBox;
