
import { useState, useRef, useEffect, useContext } from 'react';
import Chat_HistoryBox from './Chat_HistoryBox.jsx';
import './Chat_Student.css';
import { StudentRouter_context } from '../Student_router.jsx';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Chat_Student({scenario_id}) {
    const { userData_state } = useContext (HomeRouter_context);
    const { socket_ref } = useContext (StudentRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const [chatHistory_state, set_chatHistory_state] = useState([]);
    const lastChat_ref = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            console.log ('got a message! ', message)
            if (message.type === 'chat_message_receipt') {
                set_chatHistory_state((prevChatLog) => [...prevChatLog, message]);
            } else if (message.type === 'chatError') {
                console.error('Chat error:', message);
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

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory_state]);

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = () => {

        const chatMsg = new ChatMessage(userData_state?.channel_data?.home_channel, userData_state?.user_alias, scenario_id, messageContent_state.trim());

        if (chatMsg.message) {
            const newChat = {
                type: 'chat_message',
                timestamp: Date.now(),
                data: chatMsg
            };
            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
                set_messageContent_state('');
            }
        }
    };

    return (
        <div className='chatStu-frame'>
            
            <div className="chatStu-historyBox">
                <Chat_HistoryBox chatSessionID='someSessionID' chatHistory_state={chatHistory_state} lastChat_ref={lastChat_ref} />
            </div>

            <div className='chatStu-input-frame'>
                <form className='chatStu-input-frame' onSubmit={handleSubmit}>
                    <div className='chatStu-input-item sender-frame'>
                        <textarea className='sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                        <button className='sender-button connect-button' type="submit">Send</button>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default Chat_Student;