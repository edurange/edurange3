
import { useState, useRef, useEffect, useContext } from 'react';
import Student_ChatHistory from './Student_ChatHistory.jsx';
import './Chat_Student.css';
import { StudentRouter_context } from '../Student_router.jsx';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Chat_Student({scenario_type, scenario_id, scenario_name}) {

    const { userData_state, chatData_state, set_chatData_state } = useContext (HomeRouter_context);
    const { socket_ref } = useContext (StudentRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const lastChat_ref = useRef(null);

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData_state]);

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

        const chatMsg = new ChatMessage(
            userData_state?.channel_data?.home_channel, 
            userData_state?.user_alias, 
            scenario_type, 
            messageContent_state.trim(), 
            scenario_id,
            scenario_name
        );

        if (chatMsg.content) {
            const newChat = {
                message_type: 'chat_message',
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
            <Student_ChatHistory chatData_state={chatData_state} lastChat_ref={lastChat_ref} />
        </div>

            <div className='chatStu-input-frame'>
                <form className='chatStu-input-form' onSubmit={handleSubmit}>
                    <div className='chatStu-input-item'>
                        <textarea className='sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                        <button className='sender-button' type="submit">Send</button>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default Chat_Student;