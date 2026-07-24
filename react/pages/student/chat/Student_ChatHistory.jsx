import React, { useRef, useState, useEffect, useCallback } from 'react';
import Msg_Bubble from './Msg_Bubble';
import { normalizeTimestamp } from '@modules/utils/timestamp_utils.jsx';

function Student_ChatHistory({ chatData_state, userData_state, lastChat_ref }) {

    const scrollRef = useRef(null);
    const [atBottom, set_atBottom] = useState(true);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        set_atBottom(distFromBottom < 50);
    }, []);

    const jumpToBottom = useCallback(() => {
        if (lastChat_ref?.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        } else if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lastChat_ref]);

    useEffect(() => {
        if (atBottom && lastChat_ref?.current) {
            lastChat_ref.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatData_state, atBottom, lastChat_ref]);

    if (!chatData_state || chatData_state.length === 0) {
        return (
            <div className='chat-history-frame'>
                <div className='chat-empty'>
                    No messages yet. Send the first one below.
                </div>
            </div>
        );
    }

    const sortedArr = [...chatData_state].sort(
        (a, b) => normalizeTimestamp(a?.timestamp) - normalizeTimestamp(b?.timestamp)
    );

    return (
        <div className='chat-history-frame'>
            <div
                className='chat-history-carpet'
                ref={scrollRef}
                onScroll={handleScroll}
            >
                {sortedArr.map((chat, index) => {
                    const isLast = index === sortedArr.length - 1;
                    return (
                        <div
                            key={index}
                            ref={isLast ? lastChat_ref : null}
                        >
                            <Msg_Bubble
                                user_id={userData_state?.id}
                                message_obj={chat}
                                is_outgoing={chat?.user_id === userData_state?.id}
                                user_role={userData_state?.role}
                            />
                        </div>
                    );
                })}
            </div>
            {!atBottom && (
                <button className='chat-jump-btn' onClick={jumpToBottom}>
                    ↓ Latest
                </button>
            )}
        </div>
    );
}

export default Student_ChatHistory;