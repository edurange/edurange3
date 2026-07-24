import { useState, useRef, useEffect, useContext } from 'react';
import Student_ChatHistory from './Student_ChatHistory.jsx';
import './Chat_Student.css';
import { StudentRouter_context } from '../Student_router.jsx';
import { ChatMessage } from '@modules/utils/chat_modules.jsx';
import { HomeRouter_context } from '../../pub/Home_router.jsx';

function Chat_Student({scenario_type, scenario_id, scenario_name}) {

    const { userData_state, chatData_state } = useContext(HomeRouter_context);
    const { socket_ref } = useContext(StudentRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const lastChat_ref = useRef(null);
    const textareaRef = useRef(null);
    const [socketOpen, set_socketOpen] = useState(false);

    useEffect(() => {
        const checkSocket = () => {
            set_socketOpen(socket_ref.current && socket_ref.current.readyState === 1);
        };
        checkSocket();
        const interval = setInterval(checkSocket, 1000);
        return () => clearInterval(interval);
    }, [socket_ref]);

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData_state]);

    const handleInputChange = (event) => {
        set_messageContent_state(event.target.value);
        const el = event.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage();
    };

    const handleKeyDown = (event) => {
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
            const newChat = { message_type: 'chat_message', data: chatMsg };
            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
                set_messageContent_state('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className='chatStu-frame'>
            <div className="chatStu-historyBox">
                <Student_ChatHistory
                    chatData_state={chatData_state}
                    userData_state={userData_state}
                    lastChat_ref={lastChat_ref}
                />
            </div>
            <div className='chatStu-input-frame'>
                <form className='chatStu-input-form' onSubmit={handleSubmit}>
                    <textarea
                        ref={textareaRef}
                        className='chatStu-sender-text'
                        value={messageContent_state}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={socketOpen ? 'Type your message… (Enter to send, Shift+Enter for newline)' : 'Disconnected…'}
                        disabled={!socketOpen}
                        rows={2}
                    />
                    <button
                        className='chatStu-sender-button'
                        type="submit"
                        disabled={!socketOpen || !messageContent_state.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chat_Student;