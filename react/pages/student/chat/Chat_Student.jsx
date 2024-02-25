import { useState, useRef, useEffect, useContext } from 'react';
import Messages_pane from './Messages_pane.jsx';
import './ChatApp.css';
import { HomeRouter_context } from '@pub/Home_router.jsx';

// !important! use 'wss:' for production (reqs SSL certs) // DEV_ONLY

const socketURL = "dev.local/chat"  // routed through nginx reverse proxy to port 5008

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
    const pingInterval = 12000;

    useEffect(() => {
        trySocket();
    }, []); 
    useEffect(() => {
        if (lastChat_ref.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatLog_state]);

    async function trySocket(){
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
                if (socket.current.readyState === 1) {
                    socket.current.send(JSON.stringify({ping:'ping'}));
                }
            }, pingInterval);
        };
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
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
        <div className='er3chat-frame'>
        <div className='er3chat-panes-container-frame'>
            <div className="er3chat-pane">
                <Messages_pane chatSessionID='someSessionID' chatLog_state={chatLog_state} lastChat_ref={lastChat_ref}/>
            </div>
        </div>
        <div className='er3chat-input-frame'>
            <form className='er3chat-input-frame' onSubmit={handleSubmit}>
                <div className='er3chat-input-item'>ID: someID</div>
                <div className='er3chat-input-item'>Alias: someAlias</div>
                <div className='er3chat-input-item sender-frame'>
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
