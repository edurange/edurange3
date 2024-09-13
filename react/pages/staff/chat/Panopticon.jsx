import React, { useContext, useEffect } from 'react';
import '@staff/chat/Chat_Staff.css';
import { StaffRouter_context } from '../Staff_router';
import Chat_Staff from './Chat_Staff';

function Panopticon() {

    const {chatObjs_UL_state} = useContext(StaffRouter_context);

    if (!chatObjs_UL_state) {
        return <>MISSING CHAT LIBRARY.</>;
    }
    return (
        <Chat_Staff is_allSeeing={true}/>
    );
}

export default Panopticon;