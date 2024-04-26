
import { useState, useRef, useEffect, useContext } from 'react';
import './Chat_Student.css';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';
import { InstructorRouter_context } from '../../instructor/Instructor_router.jsx';

function Chat_SenderBox({user_to_message}) {
    const { userData_state } = useContext (HomeRouter_context);
    const { socket_ref } = useContext (InstructorRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const lastChat_ref = useRef(null);

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

        // DEV_FIX need real scenario id not 113
        const chatMsg = new ChatMessage(userData_state?.channel_data?.home_channel, userData_state?.user_alias, 113, messageContent_state.trim()); // DEV_FIX user_to_message?.id should be user_to_message?.channel

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
            <div className='chatStu-input-frame'>
                <form className='chatStu-input-frame' onSubmit={handleSubmit}>
                    <div className='chatStu-input-item sender-frame'>
                        <textarea className='sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                        <button className='sender-button connect-button' type="submit">Send</button>
                    </div>
                </form>
            </div>
    );
}

export default Chat_SenderBox;