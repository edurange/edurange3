import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '../../pub/Home_router';
import { AppContext } from '../../../config/AxiosConfig';
import { ChatMessage } from '../../../modules/utils/chat_modules';
import './Instr_Hints.css';

const Instr_Hints = () => {

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
  const [student_bash_logs_state, set_student_bash_logs_state] = useState('');
  const [student_chat_logs_state, set_student_chat_logs_state] = useState('');
  const [student_responses_logs_state, set_student_responses_logs_state] = useState('');

  const [selectedScenario_state, set_selectedScenario_state] = useState({
    id: -1,
    name: 'n/a',
    scenario_type: 'n/a'
  });
  const [selectedUser_state, set_selectedUser_state] = useState('');

  const [userIDinput, set_userIDinput] = useState('');
  const [loading, set_loading] = useState(false);
  const [elapsedTime, set_elapsedTime] = useState(0);
  const [error, set_error] = useState('');
  const [isEditing, set_isEditing] = useState(false);
  const [newHint, set_newHint] = useState('');
  const [checkForDisableScenarioContext, set_checked_for_disable_scenario_context] = React.useState(false);
  const [checkForGPUDisable, set_checked_for_gpu_disable] = React.useState(false);
  const [isExpandedLogs, set_isExpandedLogs] = useState(false);
  const [isExpandedSettings, set_isExpandedSettings] = useState(false);
  const [isClickedLogs, set_isClickedLogs] = useState(false);
  const [isClickedSettings, set_isClickedSettings] = useState(false);
  const [experimentalConfirmLock, set_experimentalConfirmLock] = React.useState(() => {
    const localStorageValue = localStorage.getItem('experimentalFeatureLockValue');
    return localStorageValue ? JSON.parse(localStorageValue) : true;
  });

  const [cpu_resources_detected, set_cpu_resources_detected] = useState('');
  const [gpu_resources_detected, set_gpu_resources_detected] = useState('');

  useEffect(() => {
    localStorage.setItem('experimentalFeatureLockValue', JSON.stringify(experimentalConfirmLock));
  }, [experimentalConfirmLock]);


  const getResources = async() => {
    try {
      const reqJSON = { };

      const response = await axios.post(
        "/get_resources",
        reqJSON,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      set_cpu_resources_detected(response.data.cpu_resources_detected)
      set_gpu_resources_detected(response.data.gpu_resources_detected);
      

    } catch (error) {
      console.error("Error fetching resources:", error);
      set_error('Failed to fetch resources.');
    }
  };

  useEffect(() => {
    getResources();
  }, []);


  const [cpu_resources_selected, set_cpu_resources_selected] = useState(Number(cpu_resources_detected));
  const [gpu_resources_selected, set_gpu_resources_selected] = useState(Number(gpu_resources_detected));

  const handleCPUSliderChange = (e) => {
    const newValue = e.target.value;
    set_cpu_resources_selected(newValue);
  };
  

  const reinitializeModelWithNewSettings = async() => {
    try {
      const reqJSON = {
        this_cpu_resources_selected: cpu_resources_selected,
        this_gpu_resources_selected: gpu_resources_selected,
        this_scenario_context_disabled: checkForDisableScenarioContext
      };

      console.log("Sending this data:", reqJSON);

      const response = await axios.post(
        "/init_model",
        reqJSON,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

    } catch (error) {
      console.error("Error reinitalizing model:", error);
      set_error('Failed to reinitialize model with new settings.');
    }
  };


  const toggleExpandLogs = () => {
      set_isExpandedLogs(!isExpandedLogs);
      set_isClickedLogs(!isClickedLogs);
  };

  const toggleExpandSettings = () => {
    set_isExpandedSettings(!isExpandedSettings);
    set_isClickedSettings(!isClickedSettings);
};
  
  
  const handleChangeCheckForDisableScenarioContext = () => {
    set_checked_for_disable_scenario_context(!checkForDisableScenarioContext);
  };

  const handleChangeCheckForGPUDisable = () => {
    set_checked_for_gpu_disable(!checkForGPUDisable);
  };

  const handleChangeCPUResourcesSelected = (e) => {
    set_cpu_resources_selected(e.target.value);
  };

  const handleChangeGPUResourcesSelected = (e) => {
    set_gpu_resources_selected(e.target.value);
  };

  

  const getStudentLogs = async() => {
    set_error('');

    try {
      const reqJSON = {
        student_id: selectedUser_state.id,
      };

      const response = await axios.post(
        "get_student_logs",
        reqJSON,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const student_logs_bash_returned_obj = response.data.bash;
      const student_logs_bash_concatenated_string = student_logs_bash_returned_obj
        .filter(entry => entry.bashEntry !== null)
        .map(entry => `Entry ${entry.index + 1}: [${entry.bashEntry}] `) 
        .join(', ');
      let student_logs_bash_stringified = JSON.stringify(student_logs_bash_concatenated_string);
      set_student_bash_logs_state(student_logs_bash_stringified);

      const student_logs_chat_returned_obj = response.data.chat;
      const student_logs_chat_concatenated_string = student_logs_chat_returned_obj
        .filter(entry => entry.chatEntry !== null)
        .map(entry => `Entry ${entry.index + 1}: [${entry.chatEntry}] `) 
        .join(', ');
      let student_logs_chat_stringified = JSON.stringify(student_logs_chat_concatenated_string);
      set_student_chat_logs_state(student_logs_chat_stringified);

      const student_logs_responses_returned_obj = response.data.responses;
      const student_logs_responses_concatenated_string = student_logs_responses_returned_obj
        .filter(entry => entry.responsesEntry !== null)
        .map(entry => `Entry ${entry.index + 1}: [${entry.responsesEntry}] `) 
        .join(', ');
      let student_logs_responses_stringified = JSON.stringify(student_logs_responses_concatenated_string);
      set_student_responses_logs_state(student_logs_responses_stringified);
      
    } catch (error) {
      console.error("Error fetching hint:", error);
      set_error('Failed to fetch hint.');

    } finally {
      set_loading(false);
    }
  };

  const requestHint = async() => {
    set_loading(true);
    set_error('');

    try {
      const reqJSON = {
        scenario_name: selectedScenario_state.scenario_type.toLowerCase(),
        student_id: selectedUser_state.id,
        enable_scenario_context: checkForDisableScenarioContext,
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

      set_hint_state(response.data.generated_hint)
      
    } catch (error) {
      console.error("Error fetching hint:", error);
      set_error('Failed to fetch hint.');

    } finally {
      set_loading(false);
    }
  };

  const cancelHint = async() => {
    if(loading)
      try {
        const reqJSON = {
          status: "request to cancel hint",
        };

        const response = await axios.post(
            "/cancel_hint",
            reqJSON,
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
      } catch (error) {
        console.error("Error cancelling hint:", error);
        set_error('Failed to cancel hint.');
      } finally {
        set_loading(false);
      }
  };

  const filteredUser = users_state.filter((user) => user.id === 3)[0];
  const filteredUserHomeChan = filteredUser?.channel_data?.home_channel;

  const handleHintSend = () => {

    if (!hint_state || !selectedScenario_state || !selectedUser_state) {
      console.log('missing arg, aborting');
      return
    }

    const chatMsg = new ChatMessage(
      filteredUserHomeChan, // channel id
      "Instructor Hint", // user alias
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
        console.log('trying to send socket msg');
        socket_ref.current.send(JSON.stringify(newChat));
      }
    }
  };


  const handleSaveHint = () => {
    set_hint_state(newHint); 
    set_isEditing(false); 
  };

  const handleHintChange = (e) => {
    set_newHint(e.target.value)
  };

  const handleCancelEdit = () => {
    set_newHint(hint_state); 
    set_isEditing(false); 
  };

  const handleOkExperimentalFeature = () => {
    set_experimentalConfirmLock(false);
    set_experimentalConfirmLockInLocalStorage();
  };

  useEffect(() => {
    if (selectedUser_state != '') {
      getStudentLogs();
    }
  }, [selectedUser_state]); 

  useEffect(() => {
    
    if (!isEditing) {
      set_newHint(hint_state);
    }
  }, [hint_state, isEditing]);



  useEffect(() => {
    let timer;
    
    if (loading) {
      timer = setInterval(() => {
        set_elapsedTime(prevTime => prevTime +1);
      }, 1000);
    }
    else {
      set_elapsedTime(0);
    }
      return () => {
        clearInterval(timer);
      };
  }, [loading]);

  


  const LoadingOverlay = () => (
    <div className="loading-overlay">
      <div>
        <span>GENERATING HINT</span>
        <span className="hourglass">⌛</span>
      </div>
      <div>
        <span>Please remain on the page...</span>
      </div>
        <span className="elapsed-time-counter"> Elapsed time: {elapsedTime} seconds </span>
      <div>
        <button onClick={cancelHint} className="cancel-hint-button">CANCEL HINT 🚫 </button>
      </div>
    </div>
  );

  const ExperimentalFeatureConfirmLockOverlay = () => (
    <div className="experimental-feature-confirm-lock-overlay">
      <div>
        <span>EXPERIMENTAL FEATURE AHEAD: <br></br>
       EXPECT CRASHES, WOULD YOU LIKE TO CONTINUE? </span>
      </div>
      <div>
        <button onClick={handleOkExperimentalFeature} className="ok-button"> 🆗 </button>
      </div>
    </div>
  );


  const HintSection = ({ hintState, onEditHint, onHintSend, isEditing, onSave, onCancel, onChange }) => {
    return (
      <div className="hint-section">
        {isEditing ? (
          <>
            <textarea
              rows={10}
              value={newHint}
              onChange={(e) => set_newHint(e.target.value)}
              className="hint-textarea"
              placeholder="Generate a hint then edit it here"
            />
            <div className="hint-section-buttons">
              <button onClick={onSave} className="below-textbox-button">Save 💾</button>
              <button onClick={onCancel} className="below-textbox-button">Cancel 🚫</button>
            </div>
          </>
        ) : (
          <>
            <textarea
              rows={10}
              value={hintState}
              readOnly 
              aria-live="polite"
              className="hint-textarea"
              placeholder="Hint will appear here"
            />
            <div className="hint-section-buttons">
              <button onClick={onEditHint} className="below-textbox-button">Edit Hint 📝</button>
              <button onClick={onHintSend} className="below-textbox-button">Send Hint To Student 📫 </button>
            </div>
            
          </>
        )}
      </div>
    );
  }

  return (
    
    <div className="hints-dashboard-ui">
      {experimentalConfirmLock && <ExperimentalFeatureConfirmLockOverlay/>}
      {loading && <LoadingOverlay />}
      
      <div className="pageHeader">
        <h1 className="pageTitle">EDUHints💡</h1>
        <h4 className="pageSubtitle">A Machine Learning Powered Dashboard for Instructors</h4>
        
      <div className="dropdowns-container">
        <div className="scenario-select">
          <label htmlFor="scenarioSelectLabel">Group:</label>
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
              }
              }
              style={{ marginRight: '10px' }}
          >

            <option value="">Select Scenario</option>
            {scenarios_state.map((option) => (
            <option key={option.id} value={option.id}>{`${option.name} (${option.scenario_type} id: ${option.id})`}</option>
            ))}
          </select>
        </div>

        <div className="user-select">
          <label htmlFor="userSelectLabel">User:</label>
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
                }
              }
              style={{ marginRight: '10px' }}
            >
            <option value="">Select User</option>
            {users_state.map((option) => (
              <option key={option.id} value={option.id}>{`${option.username} (group: ${groups_state.find(groupOption => Number(option.membership) === Number(groupOption.id))?.name ?? ""}, id: ${option.id})`}</option>
            ))}
            </select>
        </div>
      </div>
      <div className="expandable-logs-container">
        <button onClick={toggleExpandLogs} className={`student-logs-expand-button ${isClickedLogs ? 'clicked' : ''}`}>Student Logs 📟 </button>
        {isExpandedLogs && (
          <div className="expandable-logs-content">
            <label htmlFor="student-bash-logs" className="logs-textarea-label">Bash Logs:</label>
            <textarea
              id="student-bash-logs"
                value={student_bash_logs_state}
                rows={1}
                readOnly 
                aria-live="polite"
                className="logs-textarea"
                placeholder="Student bash logs used for hint generation will appear here"
            />
            <label htmlFor="student-chat-logs" className="logs-textarea-label">Chat Logs:</label>
            <textarea
              id="student-chat-logs"
              value={student_chat_logs_state}
              rows={1}
              readOnly 
              aria-live="polite"
              className="logs-textarea"
              placeholder="Student chat logs used for hint generation will appear here"
            />
            <label htmlFor="student-responses-logs" className="logs-textarea-label">Answer Logs:</label>
            <textarea
              id="student-responses-logs"
              value={student_responses_logs_state}
              rows={1}
              readOnly 
              aria-live="polite"
              className="logs-textarea"
              placeholder="Student answer logs used for hint generation will appear here"
            />
          </div>
        )}
      </div>
      <div className="expandable-settings-container">
        <button onClick={toggleExpandSettings} className={`settings-expand-button ${isClickedSettings ? 'clicked' : ''}`}>Settings ⚙️</button>
        {isExpandedSettings && (
          <div className="expandable-settings-content">
            <label htmlFor="CPU_resource_settings" className="settings-textarea-label">CPU cores:</label>
              <textarea
                value={cpu_resources_selected}
                rows={1}
                readOnly 
                aria-live="polite"
                className="logs-textarea"
                placeholder={cpu_resources_detected}
              />
            <div class="slider-container">
              <input 
                type="range" 
                id="cpuSliderRange" 
                min='0'
                max={cpu_resources_detected} 
                step='1'
                value={cpu_resources_selected}
                onChange={handleCPUSliderChange}
              />
            </div>

            <label htmlFor="GPU_resource_settings" className="settings-textarea-label">GPU resources: </label>

            <div class="gpu_resources_display">
              <textarea
                value={gpu_resources_selected}
                rows={1}
                readOnly 
                aria-live="polite"
                className="logs-textarea"
                placeholder={gpu_resources_detected == 0 ? 'NO GPU DETECTED': gpu_resources_detected}
              />
            </div>
            <div className="disable-gpu-checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={checkForGPUDisable}
                  onChange={handleChangeCheckForGPUDisable}
                /> Disable GPU usage:
              </label>
            </div>
            <div className="disable-scenario-context-checkbox">
              <label>
                <input 
                  type="checkbox"
                  checked={checkForDisableScenarioContext}
                  onChange={handleChangeCheckForDisableScenarioContext}
                /> Disable scenario context: 
              </label>
            </div> 
            <button onClick={reinitializeModelWithNewSettings} className="Save 💾 ">Reinitialize model with settings</button>


          </div>
        )}
      </div>

               
      <button onClick={requestHint} className="request-hint-button">Generate Hint ✨</button>
      </div>
      <HintSection
        hintState={hint_state}
        onEditHint={() => {
          set_newHint(hint_state); 
          set_isEditing(true); 
        }}
        onHintSend={handleHintSend}
        isEditing={isEditing}
        onSave={handleSaveHint}
        onCancel={handleCancelEdit}
        onChange={handleHintChange}
      />
    </div>


  );
}

export default Instr_Hints;
