import React, { useState, useContext, useEffect, useRef } from 'react';
import { HintConfig_Context } from '../Hints_Controller';
import { ChatMessage } from '@modules/utils/chat_modules';
import { StaffRouter_context } from '../../Staff_router';

function Hint_Textbox({set_hintTabEnabled_state}) {

    const [currentHint_state, set_currentHint_state] = useState('');
    const { users_state, socket_ref } = useContext(StaffRouter_context);

    const {
        hint_state, set_hint_state,
        selectedScenario_state,
        isEditing_state, set_isEditing_state,
        selectedHintUser_state,
        requestHint,

    } = useContext(HintConfig_Context);

    function handleSendClick() {

        if (!hint_state || !selectedScenario_state || !selectedHintUser_state) {
            console.log('missing arg, aborting');
            return
        }

        const filteredUser = users_state.filter((user) => user.id === selectedHintUser_state.id )[0];
        const filteredUserHomeChan = filteredUser?.channel_data?.home_channel;

        const eduhint_content = "EDUHint: " + hint_state?.trim()

        const chatMsg = new ChatMessage(
            filteredUserHomeChan, // channel id
            "EDUHint", // user alias
            selectedScenario_state.scenario_type, // scenario type
            eduhint_content, // 'content'
            selectedScenario_state.id, // 'scenario_id' 
            selectedScenario_state?.name, // scenario unique name
        );

        if (chatMsg.content) {

            const newChat = {
                message_type: 'chat_message',
                timestamp: Date.now(),
                data: chatMsg
            };

            if (socket_ref.current && socket_ref.current.readyState === 1) {
                socket_ref.current.send(JSON.stringify(newChat));
            }
            set_hintTabEnabled_state(false)
        }
    };

    function handleSaveHint() {
        set_hint_state(currentHint_state);
        set_isEditing_state(false);
    };
    function handleEditClick() {
        set_currentHint_state(hint_state);
        set_isEditing_state(true);
    };
    function handleCancelEdit() {
        set_currentHint_state(hint_state);
        set_isEditing_state(false);
    };

    return (
        <div className="hint-section">
            {isEditing_state ? (
                <>
                    <textarea
                        rows={5}
                        value={currentHint_state}
                        onChange={(event) => set_currentHint_state(event.target.value)}
                        className="hint-textarea"
                        placeholder="Generate a hint then edit it here"
                    />
                    <div className="hint-section-buttons">
                        <button onClick={handleSaveHint} className="below-textbox-save-button">Save 💾</button>
                        <button onClick={handleCancelEdit} className="below-textbox-cancel-button">Cancel 🚫</button>
                    </div>
                </>
            ) : (
                <>
                    <textarea
                        rows={5}
                        value={hint_state}
                        readOnly
                        aria-live="polite"
                        className="hint-textarea"
                        placeholder="Hint will appear here"
                    />
                    <div className="hint-section-buttons">
                        <button onClick={requestHint} className="request-hint-button">Generate Hint ✨</button>
                        <button onClick={handleEditClick} className="below-textbox-edit-button">Edit Hint 📝</button>
                        <button onClick={handleSendClick} className="below-textbox-send-button">Send Hint To Student 📫 </button>
                    </div>

                </>
            )}
        </div>
    );
};
export default Hint_Textbox;