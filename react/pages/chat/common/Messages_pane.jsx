import '../ChatApp.css';
import Msg_Bubble from './Msg_Bubble';
// note: if the Messages_pane component needs to be available in contexts other than the one
// it's currently being called from, the way the chatLog_state and lastChat_ref are acquired may need
// updating

function Messages_pane({chatSessionID, chatLog_state, lastChat_ref}) {
    return (
        <div className="er3chat-pane">
            <div className='er3chat-chat-carpet'>
                
                {chatLog_state.map((chat, index) => (
                    <div key={index} ref={index === chatLog_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        <Msg_Bubble message_obj={chat} chatSessionID={chatSessionID}/>
                        {/* <div className='er3chat-message-item'>Session ID: {chatSessionID}</div>
                        <div className='er3chat-message-item'>Sender ID: {chat.userID}</div>
                        <div className='er3chat-message-item'>Sender Alias: {chat.userAlias}</div>
                        <div className='er3chat-message-item'>Sender Groups: {Array.isArray(chat.userGroups) ? chat.userGroups.join(', ') : ''}</div>
                        <div className='er3chat-message-item'>Time Stamp: {new Date(Number(chat.timeStamp)).toLocaleDateString()} {new Date(Number(chat.timeStamp)).toLocaleTimeString()}</div>
                        <div className='er3chat-message-item'>Message: {chat.content}</div> */}
                    </div>
                ))}
            </div>
        </div>
    );

}; export default Messages_pane;