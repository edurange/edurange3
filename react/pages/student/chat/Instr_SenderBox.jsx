
import { useState, useContext } from 'react';
import './Chat_Student.css';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { InstructorRouter_context } from '../../instructor/Instructor_router.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Instr_SenderBox({scenario_type, scenario_id}) {

    const { userData_state } = useContext (HomeRouter_context);
    const { socket_ref, selectedMessage_state, set_selectedMessage_state, users_state, set_users_state } = useContext (InstructorRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const [lastParentUID_state, set_lastParentUID_state] = useState(null);

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
            console.log("Please select a message before replying.")
            return
        }
        
        const chatMsg = new ChatMessage(
            selectedMessage_state.channel_id, 
            "testtesttest",
            lastParentUID_state,
            userData_state?.user_alias, 
            scenario_type, 
            messageContent_state.trim(), 
            scenario_id
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
        set_lastParentUID_state(chatMsg.message_uid);
    
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