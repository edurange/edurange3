import React, { useState, useContext, useEffect, useRef } from 'react';
import { HintConfig_Context } from '../Hints_Controller';
import { ChatMessage } from '@modules/utils/chat_modules';
import { StaffRouter_context } from '../../Staff_router';

function Hint_Textbox({ set_hintTabEnabled_state, isHintGenerating, setIsHintGenerating }) {
  const [currentHint_state, set_currentHint_state] = useState("");
  const { users_state, socket_ref } = useContext(StaffRouter_context);
  const [hasGeneratedHint, setHasGeneratedHint] = useState(false);

  const {
    hint_state,
    set_hint_state,
    selectedScenario_state,
    isEditing_state,
    set_isEditing_state,
    selectedHintUser_state,
    requestHint,
  } = useContext(HintConfig_Context);


  const lastHintRef = useRef(hint_state);

  useEffect(() => {

    if (isHintGenerating && hint_state !== lastHintRef.current) {
      setIsHintGenerating(false);
      lastHintRef.current = hint_state;
    }
  }, [hint_state, isHintGenerating, setIsHintGenerating]);

  async function handleGenerateHintClick() {
    lastHintRef.current = hint_state;

    setIsHintGenerating(true);
    try {
      await requestHint();
      setHasGeneratedHint(true);
    } finally {
      setIsHintGenerating(false);
    }
  }

  function handleSendClick() {
    if (!hint_state || !selectedScenario_state || !selectedHintUser_state) {
      console.log("missing arg, aborting");
      return;
    }

    const filteredUser = users_state.filter(
      (user) => user.id === selectedHintUser_state.id
    )[0];

    const filteredUserHomeChan = filteredUser?.channel_data?.home_channel;

    const eduhint_content = "EDUHint: " + hint_state?.trim();

    const chatMsg = new ChatMessage(
      filteredUserHomeChan,                 
      "EDUHint",                            
      selectedScenario_state.scenario_type, 
      eduhint_content,                      
      selectedScenario_state.id,            
      selectedScenario_state?.name          
    );

    if (chatMsg.content) {
      const newChat = {
        message_type: "chat_message",
        timestamp: Date.now(),
        data: chatMsg,
      };

      if (socket_ref.current && socket_ref.current.readyState === 1) {
        socket_ref.current.send(JSON.stringify(newChat));
      }

      setIsHintGenerating(false); 
      set_hintTabEnabled_state(false);
    }
  }

  function handleSaveHint() {
    set_hint_state(currentHint_state);
    set_isEditing_state(false);
  }

  function handleEditClick() {
    set_currentHint_state(hint_state);
    set_isEditing_state(true);
  }

  function handleCancelEdit() {
    set_currentHint_state(hint_state);
    set_isEditing_state(false);
  }

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
            <button onClick={handleSaveHint} className="below-textbox-save-button">
              Save 💾
            </button>
            <button onClick={handleCancelEdit} className="below-textbox-cancel-button">
              Cancel 🚫
            </button>
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
            placeholder={isHintGenerating ? "" : "EDUHint will appear here"}
          />
          <div className="hint-section-buttons">

            <button
                onClick={handleGenerateHintClick}
                className={`request-hint-button ${isHintGenerating ? "is-generating" : ""}`}
                disabled={isHintGenerating}
              >
                {isHintGenerating
                  ? "Generating… ⏳"
                  : (hasGeneratedHint ? "Regenerate EDUHint 🔁" : "Generate EDUHint 🤖")}
            </button>

            <button onClick={handleEditClick} className="below-textbox-edit-button">
              Edit EDUHint 📝
            </button>

            <button onClick={handleSendClick} className="below-textbox-send-button">
              Send EDUHint To Student 📫
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Hint_Textbox;