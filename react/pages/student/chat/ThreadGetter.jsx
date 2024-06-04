
import React, { useState } from "react";
import './Msg_Bubble.css';
import axios from "axios";

function ThreadGetter({ thread_uid }) {

    const [threadArr_state, set_threadArr_state] = useState(null);

    function handleGetClick(event, thread_uid) {
        event.stopPropagation();
        axios.post('/get_thread', { thread_uid: thread_uid })
            .then(response => set_threadArr_state(response.data))
            .catch(error => console.error('Error fetching thread:', error));
    }

    console.log(thread_uid)
    if (!thread_uid || !/^[a-zA-Z0-9]{12}$/.test(thread_uid)) {
        console.log('received invalid thread_uid of: ', thread_uid)
        return (
            <div className="thread-badUID">
                Invalid Thread UID
            </div>
        );
    }
    
    return (
        <div className="thread-test-frame">
            <div className="thread-test-carpet">
                <div className="thread-test-textbox">
                    <div className="thread-test-text-header">
                        Test Message Thread
                    </div>
                    <div className="thread-test-text-item">
                        {threadArr_state && threadArr_state.length > 0 ? threadArr_state.map(
                            (message, index) => (
                                <div key={index}>
                                    <div> message_index: {index}</div>
                                    <div> message_uid: {message.message_uid}</div>
                                    <div> parent_uid: {message.parent_uid}</div>
                                    <div> thread_uid: {message.thread_uid}</div>
                                    <div> message: {message.content}</div>
                                    <br></br>
                                    
                                </div>
                            )
                        ) : (
                            <div onClick={(event) => handleGetClick(event, thread_uid)}>
                                "Click to get thread"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ThreadGetter;