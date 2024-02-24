import { useState, useEffect } from 'react';
import './ChatApp.css';
import Chat_Instructor from './Instr_Chat';
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