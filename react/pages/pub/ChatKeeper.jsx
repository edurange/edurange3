
import { useState, useRef, useEffect, useContext } from 'react';
import '@student/chat/Chat_Student.css';
import { HomeRouter_context } from '@pub/Home_router.jsx';
import Chat_HistoryBox from '@student/chat/Chat_HistoryBox';

export class ChatMessage {
    constructor(scenario_id, message, user_alias) {
        this.type = 'chat_message';
        this.scenario_id = scenario_id ?? 123; //DEV_FIX
        this.message = message ?? "I love edurange";
        this.timestamp = Date.now();
        this.user_alias = user_alias ?? 'missing';
    }
}

function ChatKeeper() {
    
    const { userData_state, socket_ref } = useContext(HomeRouter_context);
    const lastChat_ref = useRef(null);

    console.log('chatkeeper here!')

    const updateChatHistory = (userId, message) => {
        set_chatHistory_state(prevHistory => ({
          ...prevHistory,
          [userId]: [...(prevHistory[userId] || []), message],
        }));
      };
      

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('received message: ', message)
            if (message.type === 'chat_cc') {

                updateChatHistory(message?.message?.user_id, message)

            } else if (message.type === 'chatError') {
                console.error('Chat error:', message.data);
            }
        };

        if (socket_ref.current) {
            socket_ref.current.addEventListener('message', handleMessage);
        }

        return () => {
            if (socket_ref.current) {
                socket_ref.current.removeEventListener('message', handleMessage);
            }
        };
    }, [socket_ref]);

    return;
}

export default ChatKeeper;