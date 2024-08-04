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
  const [selectedResources, set_selectedResources] = useState('');
  const [usernameInput, set_usernameInput] = useState(''); 
  

  const scenarioOptions = [
    { value: 'elf_infection', label: 'Elf_Infection' },
    { value: 'file_wrangler', label: 'File_Wrangler' },
    { value: 'metasploitable', label: 'Metasploitable' },
    { value: 'ransomware', label: 'Ransomware' },
    { value: 'ssh_inception', label: 'Ssh_Inception' },
    { value: 'strace', label: 'Strace' },
    { value: 'treasure_hunt', label: 'Treasure_Hunt' },
    { value: 'web_fu', label: 'Web_Fu' },
  ];

  const resourceOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const requestHint = async () => {
    try {
      const reqJSON = {
        scenario_name: selectedScenario,
        student_id: usernameInput,
      };


      console.log("Request JSON:", reqJSON);
      const response = await axios.post(
        "get_hint",
        reqJSON,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('Hint response:', response);
      set_hint_state(response.data.generated_hint);

    } catch (error) {
      console.error("Error fetching hint:", error);
    }
  };

  const handleScenarioChange = (e) => {
    set_selectedScenario(e.target.value);
  };

  const handleUsernameChange = (e) => {
    set_usernameInput(e.target.value); 
  };


  return (
    <div style={{ width: '200%', height: '200vh', padding: '20px' }}>
      <div>

        <label htmlFor="scenarioSelect">Select Scenario:</label>
        <select
          id="scenarioSelect"
          value={selectedScenario}
          onChange={handleScenarioChange}
          style={{
            marginRight: '10px'
          }}
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
          placeholder="Enter StudentID"
          style={{
            marginRight: '10px'
          }}
        />

        <button onClick={requestHint}>Request Hint</button>
      </div>
      <div style={{ marginTop: '10px' }}>
        <textarea
          rows={10}
          cols={80}
          readOnly
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
      </div>
    </div>
  );
}

export default Instr_Hints;
