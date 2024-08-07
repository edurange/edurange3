import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '../../pub/Home_router';
import { AppContext } from '../../../config/AxiosConfig';

function Instr_Hints() {
  const { scenarios_state } = useContext(InstructorRouter_context);
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
  const [selectedScenario, set_selectedScenario] = useState('');
  const [usernameInput, set_usernameInput] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');
  const [isEditPopupVisible, set_isEditPopupVisible] = useState(false);
  const [newHint, set_newHint] = useState('');

  const scenarioOptions = [
    { value: 'getting_started', label: 'Getting Started' },
    { value: 'elf_infection', label: 'Elf Infection' },
    { value: 'file_wrangler', label: 'File Wrangler' },
    { value: 'metasploitable', label: 'Metasploitable' },
    { value: 'ransomware', label: 'Ransomware' },
    { value: 'ssh_inception', label: 'SSH Inception' },
    { value: 'strace', label: 'Strace' },
    { value: 'treasure_hunt', label: 'Treasure Hunt' },
    { value: 'web_fu', label: 'Web Fu' },
  ];

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
        scenario_name: selectedScenario,
        student_id: usernameInput,
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

    } catch (error) {
      console.error("Error fetching hint:", error);
      set_error('Failed to fetch hint.');
    } finally {
      set_loading(false);
    }
  };

  const handleScenarioChange = (e) => {
    set_selectedScenario(e.target.value);
  };

  const handleUsernameChange = (e) => {
    set_usernameInput(e.target.value);
  };

  const handleEditHint = () => {
    set_newHint(hint_state);
    set_isEditPopupVisible(true);
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
        <label htmlFor="scenarioSelect">Select Scenario:</label>
        <select
          id="scenarioSelect"
          value={selectedScenario}
          onChange={handleScenarioChange}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select Scenario</option>
          {scenarioOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label htmlFor="usernameInput">Student ID:</label>
        <input
          type="text"
          id="usernameInput"
          value={usernameInput}
          onChange={handleUsernameChange}
          placeholder="Enter Student ID"
          style={{ marginRight: '10px' }}
        />

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
      </div>

      {isEditPopupVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgb(50, 50, 50)',
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
