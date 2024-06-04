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

// import { useState, useRef, useEffect } from 'react';
// import '../../student/chat/Chat_Student.css';
// import Chat_HistoryBox from '@student/chat/Chat_HistoryBox.jsx';
// import Instructor_UsersList from './Instr_UsersList.jsx';
// import { ChatMessage } from '@modules/utils/chat_modules.jsx';

// // !important! use 'wss:' for production (reqs SSL certs) // DEV_ONLY
// const proto = (window.location.protocol == "https") ? "wss" : "ws";
// const socketURL = `${proto}://${window.location.host}/chat`;

// function Chat_Instructor() {

//     const { chatData_state, set_chatData_state } = useContext(HomeRouter_context);

//     const [messageContent_state, set_messageContent_state] = useState('');
//     useEffect(() => {
//         if (lastChat_ref.current) {
//             lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [chatData_state]);

//     const lastChat_ref = useRef(null);
//     const socket = useRef(null);
//     const pingInterval = 12000;

//     useEffect(() => {
//         trySocket();
//     }, []); 

//     async function trySocket(){
//         socket.current = new WebSocket(socketURL);
//         socket.current.onopen = () => {
//             const newnewChat2 = new ChatMessage(1, messageContent_state);
//             const newChat2 = {
//                 type: 'instructor_message',
//                 data: newnewChat2
//             };
//             if (socket.current && socket.current.readyState === 1) {
//                 socket.current.send(JSON.stringify(newChat2));
//             };
//             // keep connection alive w/ pings to server
//             setInterval(() => {
//                 if (socket.current.readyState === 1) {
//                     socket.current.send(JSON.stringify({ping:'ping'}));
//                 }
//             }, pingInterval);
//         };
//         socket.current.onmessage = (event) => {
//             const message = JSON.parse(event.data);
            
//             if (message.message_type === 'newChatMessage') {
//                 set_chatData_state((prevChatLog) => [...prevChatLog, message.data]);
//             } else if (message.message_type === 'chatError') {
//                 console.error('Chat error:', message.data);
//             };
//         };

//         socket.current.onerror = (event) => {
//             console.error('WebSocket error:', event);
//         };

//         socket.current.onclose = (event) => {
//             socket.current = new WebSocket(socketURL);
//         };
//         return () => {
//             if (socket.current) {
//                 socket.current.close();
//             };
//         };
//     };
//     const handleInputChange = (event, setState) => {
//         setState(event.target.value);
//     };

//     const handleSubmit = (event) => {
//         event.preventDefault();
//         const chatMsg = new ChatMessage(1, messageContent_state);
//         const newChat = {
//             type: 'chatMessage',
//             data: chatMsg
//         };
//         if (socket.current && socket.current.readyState === 1) {
//             socket.current.send(JSON.stringify(newChat));
//         };
//     };
//     const handleConnectSubmit = (event) => {
//         event.preventDefault();
//         trySocket();
//     };

//     return (
//         <div className='chatStu-frame'>
//         <div className='chatStu-panes-container-frame'>
//             <div className="chatStu-pane">
//                 <Instructor_UsersList/>
//                 <Chat_HistoryBox lastChat_ref={lastChat_ref}/>
//             </div>
//             <div className="chatStu-pane">
//             </div>
//         </div>
//         <div className='chatInstr-input-frame'>
//             <form className='chatInstr-input-frame' onSubmit={handleSubmit}>
//                 <div className='chatStu-input-item sender-frame'>
//                     <textarea className='sender-text' value={messageContent_state} onChange={(e) => handleInputChange(e, set_messageContent_state)} placeholder="Enter your message"></textarea>
//                     <button className='sender-button connect-button' type="submit">Send</button>
//                 </div>
//             </form>
//             <div onClick={handleConnectSubmit}>
//                 <button className='sender-button connect-button' type="submit">Connect</button>
//             </div>
//         </div>
//     </div>
//     );
// };

// export default Chat_Instructor;
