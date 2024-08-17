import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '../../pub/Home_router';
import { AppContext } from '../../../config/AxiosConfig';
import { ChatMessage } from '../../../modules/utils/chat_modules';

function Instr_Hints() {
  const { socket_ref, scenarios_state, users_state, groups_state } = useContext(InstructorRouter_context);
  const { userData_state } = useContext(HomeRouter_context);
  const {
    errorModal_state,
    set_errorModal_state,
    desiredNavMetas_state,
    set_desiredNavMetas_state,
    clipboard_state,
    set_clipboard_state
  } = useContext(AppContext);

  const [hint_state, set_hint_state] = useState('');
  const [selectedScenario_state, set_selectedScenario_state] = useState({
    id: -1,
    name: 'n/a',
    scenario_type: 'n/a'
  });
  const [selectedUser_state, set_selectedUser_state] = useState({
    id: -1,
    name: 'n/a',
    group: 'n/a'
  });
  const [userIDinput, set_userIDinput] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');
  const [isEditPopupVisible, set_isEditPopupVisible] = useState(false);
  const [newHint, set_newHint] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rotateText {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(90deg); }
        50% { transform: rotate(180deg); }
        75% { transform: rotate(270deg); }
        100% { transform: rotate(360deg); }
  }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const rotateAnimation = {
    animation: 'rotateText 3s steps(2, end) infinite',
  };

  const requestHint = async () => {
    set_loading(true);
    set_error('');
    try {
      const reqJSON = {
        scenario_name: selectedScenarioType,
        student_id: userIDinput,
      };

      const response = await axios.post(
        "get_hint",
        reqJSON,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      set_hint_state(response.data.generated_hint);
      console.log(response)

    } catch (error) {
      console.error("Error fetching hint:", error);
      set_error('Failed to fetch hint.');
    } finally {
      set_loading(false);
    }
  };

  const handleEditHint = () => {
    set_newHint(hint_state);
    set_isEditPopupVisible(true);
  };
 
  const filteredUser = users_state.filter((user) => user.id === 3)[0]
  const filteredUserHomeChan = filteredUser?.channel_data?.home_channel

  const handleHintSend = () => {

    if (!hint_state || !selectedScenario_state || !selectedUser_state) {
      console.log('missing arg, aborting')
      return
    }

    const chatMsg = new ChatMessage(
      filteredUserHomeChan, // channel id
      "HintBot", // user alias
      selectedScenario_state.scenario_type, // scenario type
      hint_state.trim(), // 'content'
      selectedScenario_state.id // 'scenario_id' 
    );

    if (chatMsg.content) {
      const newChat = {
        message_type: 'chat_message',
        timestamp: Date.now(),
        data: chatMsg
      };

      if (socket_ref.current && socket_ref.current.readyState === 1) {
        console.log('trying to send socket msg')
        socket_ref.current.send(JSON.stringify(newChat));
      }
    }
  };

  const handleSaveHint = () => {
    set_hint_state(newHint);
    set_isEditPopupVisible(false);
  };

  const handleCancelEdit = () => {
    set_isEditPopupVisible(false);
  };

  return (
    <div style={{ width: '100%', padding: '20px', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '5px',
          zIndex: 1000,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>GENERATING HINT</span>
            <span style={rotateAnimation}>⌛</span>
          </div>
          <span>Please remain on the page...</span>
        </div>
      )}

<div>

<label htmlFor="scenarioSelect">Scenario:</label>
<select
  id="scenarioSelect"
  value={selectedScenario_state ? selectedScenario_state.id : ""}
  onChange={(e) => {
    const selectedId = Number(e.target.value);
    const selectedOption = scenarios_state.find(option => Number(option.id) === selectedId);
    if (selectedOption) {
      set_selectedScenario_state(selectedOption);
    } else {
      console.error('No matching scenario found!');
    }
  }}
  style={{ marginRight: '10px' }}
>
  <option value="">Select Scenario</option>
  {scenarios_state.map((option) => (
    <option key={option.id} value={option.id}>{`${option.name} (${option.scenario_type} id: ${option.id})`}</option>
  ))}
</select>

<label htmlFor="userSelect">User:</label>

<select
  id="userSelect"
  value={selectedUser_state ? selectedUser_state.id : ""}
  onChange={(e) => {
    const selectedId = Number(e.target.value);
    const selectedOption = users_state.find(option => Number(option.id) === selectedId);
    if (selectedOption) {
      set_selectedUser_state(selectedOption);
    } else {
      console.error('No matching user found!');
    }
  }}
  style={{ marginRight: '10px' }}
>
  <option value="">Select User</option>
  {users_state.map((option) => (
    <option key={option.id} value={option.id}>{`${option.username} (group: ${groups_state.find(groupOption => Number(option.membership) === Number(groupOption.id))?.name ?? ""}, id: ${option.id})`}</option>
  )
  )}
</select>

        <button onClick={requestHint}>Request Hint</button>
      </div>

      {error && (
        <div style={{ marginTop: '10px', color: 'red', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <textarea
          rows={10}
          cols={80}
          readOnly
          aria-live="polite"
          style={{
            fontFamily: 'monospace',
            fontSize: '16px',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            padding: '10px',
            border: '2px solid #deb14f',
            borderRadius: '5px',
            borderColor: '#deb14f',
            maxHeight: '100%',
            maxWidth: '100%',
            overflowY: 'auto',
            resize: 'none'
          }}
          value={hint_state}
          placeholder="Hint will appear here"
        />
        <button onClick={handleEditHint} style={{ marginTop: '10px' }}>Edit Hint</button>
        <button onClick={handleHintSend} style={{ marginTop: '10px' }}>Send Hint To Student</button>
      </div>

      {isEditPopupVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgb(7, 0, 17)',
          border: '2px solid #deb14f',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h3 style={{ color: '#deb14f' }}>Edit Hint</h3>
          <textarea
            rows={5}
            cols={60}
            value={newHint}
            onChange={(e) => set_newHint(e.target.value)}
            style={{
              width: '90%',
              marginBottom: '10px',
              marginTop: '5px',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: '#000000',
              border: '1px solid #deb14f',
              color: '#fff'
            }}
          />
          <div>
            <button onClick={handleSaveHint} style={{ marginRight: '10px' }}>Save</button>
            <button onClick={handleCancelEdit}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Instr_Hints;
