
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { InstructorRouter_context } from '../Staff_router';
import '../chat/Chat_Staff.css';
import Chat_Staff from '../chat/Chat_Staff';

function Staff_UserDetail() {

    const { userID } = useParams();
    const { 
        users_state,
        chatObjs_UL_state,
        channelAccess_state
    } = useContext(InstructorRouter_context);

    const thisUser = users_state.filter(user => user.id === parseInt(userID))?.[0]
                        
    if (!thisUser || !channelAccess_state || !chatObjs_UL_state) { return <>Required data not found.</> } 
    
    const user_channels = channelAccess_state[thisUser.id]
    if (!user_channels) { return <>user_channels not found.</> } 

    return (
        <>
            <Chat_Staff selectedUser_obj={thisUser}/>
        </>
    );
};

export default Staff_UserDetail;