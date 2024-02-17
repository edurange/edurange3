//
// new strategy notes:
//   - will be doing an overhaul to the way messages are stored and rendered;
//   - the instructor will need to be able to retrieve the messages from any given
//      student at any given time; therefore the chat log needs to be readily avail
//   - this can be achieved either by storing the messages into database (this is a good time)
//   - or it can be achieved by just keeping them in memory in nodeJS/express (not ideal)
//   - i think the best balance is to keep using the 'add to log' strategy i've been using
//     for student interface, but then also add a process that will bring up the student's
//     logs (for the instructor).
//   - in addition, i should add a process that will run any time the page is revisited by student user, 
//     if the chat log in state is empty, that will retrieve the student user's chat log.
//     this is intended to be useful for when the student leaves chat or refreshes the page (both disconnect WS)
// 

import { useState, useRef, useEffect } from 'react';
import '../ChatApp.css';
import Messages_pane from '../common/Messages_pane.jsx';
import Instructor_UsersList from './Instructor_UsersList.jsx';
import { ChatMessage } from '../student/Chat_Student.jsx';

// !important! use 'wss:' for production (reqs SSL certs) // DEV_ONLY
const socketURL = "wss://riparian.dev/chatSocket"  

function Chat_Instructor() {

    const chatUsers = []; // array of user objects, w/ their chats

    const testMessage = new ChatMessage(1, "hello students!");
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
            console.log('websocket connected!');
            console.log("doing initial handshake...");
            const newnewChat2 = new ChatMessage(1, messageContent_state);
            const newChat2 = {
                type: 'chatMessage',
                data: newnewChat2
            };
            if (socket.current && socket.current.readyState === 1) {
                socket.current.send(JSON.stringify(newChat2));
            };
            // keep connection alive w/ pings to server
            setInterval(() => {
                if (socket.current.readyState === 1) {
                    console.log('sending keepalive ping...');
                    socket.current.send(JSON.stringify({ping:'ping'}));
                }
            }, pingInterval);
        };
        socket.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("received message from server: ", message);
            
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
            console.log('WebSocket connection closed:', event);
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
            console.log('sending new chat...');
            socket.current.send(JSON.stringify(newChat));
        };
    };
    const handleConnectSubmit = (event) => {
        event.preventDefault();
        console.log("tryConnect")
        trySocket();
    };

    return (
        <div className='er3chat-frame'>
        <div className='er3chat-panes-container-frame'>
            <div className="er3chat-pane">
                <Messages_pane chatSessionID='123' chatLog_state={chatLog_state} lastChat_ref={lastChat_ref}/>
            </div>
            <div className="er3chat-pane">
                <Instructor_UsersList/>
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

export default Chat_Instructor;