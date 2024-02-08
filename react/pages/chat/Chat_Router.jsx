import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Chat_Student from './student/Chat_Student';
import Chat_Instructor from './instructor/Chat_Instructor';



export const ChatRouterContext = React.createContext();
const chatSession_lifespan = (1000 * 60 * 60 * 6); // 6 hr in miliseconds;

function Chat_Router() {

    const testUser = new ChatUser(undefined, true); // 2nd arg true = instructor
    const testSession = new ChatSession();
    const [user_state, set_user_state] = useState(testUser)
    const [chatSession_state, set_chatSession_state] = useState(testSession);
    const [socket_state, set_socket_state] = useState('');

    if (!chatSession_state){
        console.log('no current chat session in state, checking localStorage...')
        const tempSess = restoreChatSession();
        if (tempSess){
            console.log('chat session found in localStorage. restoring to state...')
            set_chatSession_state(tempSess);
        }
        else {
            console.log('chat session not found in localStorage. requesting socket server check for session...')

            if (true) {
                'socket server found current session, restoring and adding to state and localStorage'
            }
            else {
                'no session found on server; creating NEW socket session and handshaking w/ server'
            }
        }
    } else {'chat session found in state; continuing...'};
  
    return (
        <ChatRouterContext.Provider value={{
            socket_state,   set_socket_state,
            user_state,     set_user_state,
            chatSession_state, set_chatSession_state
          }}>
            <Routes>
                <Route path="/" element={<Chat_Student />} />
                <Route path="/instructor" element={<Chat_Instructor />} />
            </Routes>
        </ChatRouterContext.Provider>
    );
};

export default Chat_Router;

