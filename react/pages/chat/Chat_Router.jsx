import React, { useState, useEffect, useContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Chat_Student from './student/Chat_Student';
import Chat_Instructor from './instructor/Chat_Instructor';

export const ChatRouter_context = React.createContext();

function Chat_Router() {

    const [socket_state, set_socket_state] = useState('');

  
    return (
        <ChatRouter_context.Provider value={{
            socket_state,   set_socket_state,
          }}>
            <Routes>
                <Route path="/" element={<Chat_Student />} />
                <Route path="/instructor" element={<Chat_Instructor />} />
            </Routes>
        </ChatRouter_context.Provider>
    );
};

export default Chat_Router;

