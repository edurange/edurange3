import React, { useContext, useEffect, useRef } from 'react';
import './Hints_Main.css';
import Hint_Textbox from './sub/Hint_Textbox';
import { HintConfig_Context } from './Hints_Controller';
import Hint_Settings from './sub/Hint_Settings';
import Hint_LogsContainer from './sub/Hint_LogsContainer';
import Hint_Dropdowns from './sub/Hint_Dropdowns';
import Hint_LoadingOverlay from './sub/Hint_LoadingOverlay';
import Hint_ExperimentalOverlay from './sub/Hint_ExperimentalOverlay';

function Hints_Main() {

    const {
        experimentalConfirmLock,
        isLoading_state,
        isClickedLogs,
        isClickedSettings,
        isExpandedLogs,
        isExpandedSettings,
        toggleExpandLogs, toggleExpandSettings,
        requestHint,
        getStudentLogs,
        selectedHintUser_state,
    } = useContext(HintConfig_Context);

    useEffect(() => {
        localStorage.setItem('experimentalFeatureLockValue', JSON.stringify(experimentalConfirmLock));
    }, [experimentalConfirmLock]);


    useEffect(() => {
        if (selectedHintUser_state != '') {
            getStudentLogs();
        }
    }, [selectedHintUser_state]);

    return (

        <div className="hints-dashboard-ui">
            {experimentalConfirmLock && <Hint_ExperimentalOverlay />}
            {isLoading_state && <Hint_LoadingOverlay />}

            <div className="pageHeader">

                <h1 className="pageTitle">EDUHints💡</h1>

                <Hint_Dropdowns/>

                <div className="expandable-logs-container">
                    <button onClick={toggleExpandLogs} className={`student-logs-expand-button ${isClickedLogs ? 'clicked' : ''}`}>Student Logs 📟 </button>
                    {isExpandedLogs && <Hint_LogsContainer />}
                </div>

                <div className="expandable-settings-container">
                    <button onClick={toggleExpandSettings} className={`settings-expand-button ${isClickedSettings ? 'clicked' : ''}`}>Settings ⚙️</button>
                    {isExpandedSettings && <Hint_Settings />}
                </div>
                
            </div>

            <Hint_Textbox />

        </div>
    );
}
export default Hints_Main;