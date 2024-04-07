import { useState, useEffect } from 'react';
import Chat_Instructor from './Chat_Instructor';
import Instr_UsersList from './Instr_UsersList';

function Chat_set() {


    return (
        <div >
        <Chat_Instructor/>
        <Instr_UsersList/>
    </div>
    );
};

export default Chat_set;