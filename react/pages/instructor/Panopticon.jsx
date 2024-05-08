
import { useState, useRef, useEffect, useContext } from 'react';
import '@student/chat/Chat_Student.css';
import { HomeRouter_context } from '@pub/Home_router.jsx';
import { InstructorRouter_context } from './Instructor_router';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import Instr_Chat_HistoryBox from '../student/chat/Instr_Chat_HistoryBox';

function Panopticon() {
    const {
        userData_state, set_chatData_state, chatData_state, } = useContext(HomeRouter_context);

    const { socket_ref,  lastChat_ref } = useContext(InstructorRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');

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

        const chatMsg = new ChatMessage(userData_state?.channel, userData_state?.user_alias, 112, messageContent_state.trim());
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
                <Instr_Chat_HistoryBox chatData_state={chatData_state} lastChat_ref={lastChat_ref} />
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

export default Panopticon;