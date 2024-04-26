
import { useState, useContext } from 'react';
import './Chat_Student.css';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { InstructorRouter_context } from '../../instructor/Instructor_router.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Instr_SenderBox() {

    const { userData_state } = useContext (HomeRouter_context);
    const { socket_ref, selectedMessage_state, set_selectedMessage_state, users_state, set_users_state } = useContext (InstructorRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
    };

    function handleSubmit (event) {
        event.preventDefault();
        sendMessage();
    };

    function handleKeyPress (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (!selectedMessage_state) {
            return
        }
        
        const chatMsg = new ChatMessage(
            selectedMessage_state?.channel, 
            userData_state?.user_alias, 
            selectedMessage_state?.scenario_type, 
            messageContent_state.trim()
        );
        if (chatMsg.content) {
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
        const response_target_user_id = selectedMessage_state?.sender;
        const new_timestamp = Date.now();
        const updated_users_state = users_state.map(user => {
            if (user.id === response_target_user_id) {
                return { ...user, recent_reply: new_timestamp };
            }
            return user;
        });
        set_users_state(updated_users_state);
    };

    return (
            <div className='chatInstr-input-frame'>
                <form className='chatInstr-input-frame' onSubmit={handleSubmit}>
                    <div className='chatInstr-input-item sender-frame'>
                        <textarea className='sender-text' value={messageContent_state} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="Enter your message"></textarea>
                        <button className='sender-button connect-button' type="submit">Send</button>
                    </div>
                </form>
            </div>
    );
}

export default Instr_SenderBox;