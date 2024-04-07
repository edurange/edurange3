import { useState, useRef, useEffect, useContext } from 'react';
import Chat_HistoryBox from './Chat_HistoryBox.jsx';
import './Chat_Student.css';
import { HomeRouter_context } from '@pub/Home_router.jsx';

// !important! use 'wss:' for production (reqs SSL certs) // DEV_ONLY

const proto = (window.location.protocol == "https:") ? "wss" : "ws";
const socketURL = `${proto}://${window.location.host}/chat`;

export class ChatMessage {
    constructor(scenarioID, content) {
        this.scenarioID = scenarioID;
        this.content = content || "I love edurange";
    }
}

function Chat_Student() {

    // const {
    //     chatSession_state, set_chatSession_state
    //   } = useContext(ChatRouter_context);
    const {
        userData_state
    } = useContext(HomeRouter_context);

    const testMessage = new ChatMessage(1, "hello eduRange!");
    const [messageContent_state, set_messageContent_state] = useState('');
    const [chatLog_state, set_chatLog_state] = useState([]);
    const lastChat_ref = useRef(null);
    const socket = useRef(null);
    const pingInterval = 5000;

    useEffect(() => {
        trySocket();
    }, []);
    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatLog_state]);

    async function trySocket() {
        socket.current = new WebSocket(socketURL);
        socket.current.onopen = () => {
            const handshake_msg = {
                type: 'chatMessage',
                data: testMessage
            };
            if (socket.current && socket.current.readyState === 1) {
                socket.current.send(JSON.stringify(handshake_msg));
            };
            setInterval(() => {
                console.log(socket.current.readyState);
                console.log(socket.current.readyState === 1);
                if (socket.current.readyState === 1) {
                    console.log('trying to ping');
                    socket.current.send(JSON.stringify({ ping: 'ping' }));
                }
            }, pingInterval);
        };
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            if (message.type === 'newChatMessage') {
                set_chatLog_state((prevChatLog) => [...prevChatLog, message.data]);
            } else if (message.type === 'chatError') {
                console.error('Chat error:', message.data);
            };
        };

        socket.current.onerror = (event) => {
            console.error('WebSocket error:', event);
        };

        socket.current.onclose = (event) => {
            socket.current = new WebSocket(socketURL);
        };
        return () => {
            if (socket.current) {
                socket.current.close();
            };
        };
    };
    const handleInputChange = (event, setState) => {
        setState(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const chatMsg = new ChatMessage(1, messageContent_state);
        const newChat = {
            type: 'chatMessage',
            data: chatMsg
        };
        if (socket.current && socket.current.readyState === 1) {
            socket.current.send(JSON.stringify(newChat));
        };
    };
    const handleConnectSubmit = (event) => {
        event.preventDefault();
        trySocket();
    };

    return (
        <div className='chatStu-frame'>
            <div className="chatStu-historyBox">
                <Chat_HistoryBox chatSessionID='someSessionID' chatLog_state={chatLog_state} lastChat_ref={lastChat_ref} />
            </div>
            <div className='chatStu-input-frame'>
                <form className='chatStu-input-frame' onSubmit={handleSubmit}>
                    <div className='chatStu-input-item'>ID: someID</div>
                    <div className='chatStu-input-item'>Alias: someAlias</div>
                    <div className='chatStu-input-item sender-frame'>
                        <textarea className='sender-text' value={messageContent_state} onChange={(e) => handleInputChange(e, set_messageContent_state)} placeholder="Enter your message"></textarea>
                        <button className='sender-button connect-button' type="submit">Send</button>
                    </div>
                </form>
                <div onClick={handleConnectSubmit}>
                    <button className='sender-button connect-button' type="submit">Connect</button>
                </div>
            </div>
        </div>
    );
};

export default Chat_Student;
