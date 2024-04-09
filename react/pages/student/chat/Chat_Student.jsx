
import { useState, useRef, useEffect, useContext } from 'react';
import Chat_HistoryBox from './Chat_HistoryBox.jsx';
import './Chat_Student.css';
import { HomeRouter_context } from '@pub/Home_router.jsx';

export class ChatMessage {
    constructor(scenario_id, message) {
        this.type = 'chat_message'
        this.scenario_id = scenario_id;
        this.message = message || "I love edurange";
        this.timestamp = Date.now()
    }
}

function Chat_Student({scenario_id}) {
    const { userData_state, socket_ref } = useContext(HomeRouter_context);
    const [messageContent_state, set_messageContent_state] = useState('');
    const [chatLog_state, set_chatLog_state] = useState([]);
    const lastChat_ref = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'chatReceipt') {
                set_chatLog_state((prevChatLog) => [...prevChatLog, message]);
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

    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatLog_state]);

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
        const chatMsg = new ChatMessage(scenario_id, messageContent_state.trim());
        if (chatMsg.message) {
            const newChat = {
                type: 'chatMessage',
                message: chatMsg
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
                <Chat_HistoryBox chatSessionID='someSessionID' chatLog_state={chatLog_state} lastChat_ref={lastChat_ref} />
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