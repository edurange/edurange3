import './ChatApp.css';
import Msg_Bubble from './Msg_Bubble';

function Messages_pane({chatSessionID, chatLog_state, lastChat_ref}) {
    return (
        <div className="er3chat-pane">
            <div className='er3chat-chat-carpet'>
                
                {chatLog_state.map((chat, index) => (
                    <div key={index} ref={index === chatLog_state.length - 1 ? lastChat_ref : null} className="er3chat-message-frame">
                        
                        {/* Msg_Bubble is the individual chat message component */}
                        <Msg_Bubble message_obj={chat} chatSessionID={chatSessionID}/>
                    </div>
                ))}
            </div>
        </div>
    );

}; export default Messages_pane;