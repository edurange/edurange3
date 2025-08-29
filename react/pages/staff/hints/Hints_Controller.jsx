
import axios from 'axios';
import React, { useEffect, useState } from 'react';
export const HintConfig_Context = React.createContext();

// The purpose of Hints_Controller component is to be a hub
// and context provider for all of the pieces of state 
// relevant to hints, as well as their setters.

// This gives access to the hint config and setters in places
// other than just the "Hint Generator" component
// which is currently Hints_Main.jsx

function Hints_Controller({ children }) {

    const [cpu_resources_detected, set_cpu_resources_detected] = useState('');
    const [gpu_resources_detected, set_gpu_resources_detected] = useState('');
    const [selectedHintUser_state, set_selectedHintUser_state] = useState(null);

    // State for overlay lock
    const [experimentalConfirmLock, set_experimentalConfirmLock] = useState({});

    // States for hints
    const [hint_state, set_hint_state] = useState('');

    // States for student logs
    const [student_bash_logs_state, set_student_bash_logs_state] = useState('');
    const [student_chat_logs_state, set_student_chat_logs_state] = useState('');
    const [student_responses_logs_state, set_student_responses_logs_state] = useState('');

    // States for selecting from scenario / student dropdowns 
    const [selectedScenario_state, set_selectedScenario_state] = useState({
        id: -1,
        name: 'n/a',
        scenario_type: 'n/a'
    });

    // Editing, isLoading_state and error states
    const [isEditing_state, set_isEditing_state] = useState(false);
    const [isLoading_state, set_isLoading_state] = useState(false);

    // States for dropdown click / expand
    const [isClickedLogs, set_isClickedLogs] = useState(false);
    const [isClickedSettings, set_isClickedSettings] = useState(false);
    const [isClickedAdvancedSettings, set_isClickedAdvancedSettings] = useState(false);

    const [isExpandedLogs, set_isExpandedLogs] = useState(false);
    const [isExpandedSettings, set_isExpandedSettings] = useState(false);
    const [isExpandedAdvancedSettings, set_isExpandedAdvancedSettings] = useState(false);

    // States for generation specifications
    const [checkForDisableScenarioContext, set_checked_for_disable_scenario_context] = React.useState(false);
    const [checkForGPUDisable, set_checked_for_gpu_disable] = React.useState(false);

    // States for generation presets
    const [isClickedSpeedSetting, set_isClickedSpeedSetting] = useState(false);
    const [isClickedQualitySetting, set_isClickedQualitySetting] = useState(false);

    const [cpu_resources_selected, set_cpu_resources_selected] = useState(Number(cpu_resources_detected));
    const [gpu_resources_selected, set_gpu_resources_selected] = useState(Number(gpu_resources_detected));
    const [temp_selected, set_temp_selected] = useState(0.3);

    async function getResources() {
        try {
            const reqJSON = {};
            const response = await axios.post(
                "/get_resources",
                reqJSON
            );
            set_cpu_resources_detected(response.data.cpu_resources_detected)
            set_gpu_resources_detected(response.data.gpu_resources_detected);
        } catch (error) {
            console.error("Error fetching resources:", error);
            // set_error('Failed to fetch resources.');
        }
    };

    function handleCPUSliderChange(event) {
        const newValue = event.target.value;
        set_cpu_resources_selected(newValue);
    };

    // Logic for updating model
    async function updateModelWithNewSettings() {
        try {
            const reqJSON = {
                this_cpu_resources_selected: cpu_resources_selected,
                this_gpu_resources_selected: gpu_resources_selected
            };
            const response = await axios.post(
                "/update_model",
                reqJSON
            );

        } catch (error) {
            console.error("Error updating model:", error);
            // set_error('Failed to update  model with new settings.');
        }
    };

    // pane visibility toggles
    function toggleExpandLogs() {
        set_isExpandedLogs(!isExpandedLogs);
        set_isClickedLogs(!isClickedLogs);
    };
    function toggleExpandSettings() {
        set_isExpandedSettings(!isExpandedSettings);
        set_isClickedSettings(!isClickedSettings);
    };
    function toggleExpandAdvancedSettings() {
        getResources();
        set_isExpandedAdvancedSettings(!isExpandedAdvancedSettings);
        set_isClickedAdvancedSettings(!isClickedAdvancedSettings);
    };

    function handleChangeCheckForDisableScenarioContext() {
        set_checked_for_disable_scenario_context(!checkForDisableScenarioContext);
    };

    function handleChangeCheckForGPUDisable() {
        // handleChangeToggleDeselectForAllPresetSettings()
        set_checked_for_gpu_disable(!checkForGPUDisable);
    };

    function handleChangeToggleForSpeedSetting() {
        getResources();
        set_isClickedQualitySetting(false);
        set_isClickedSpeedSetting(!isClickedSpeedSetting);
        set_checked_for_disable_scenario_context(true);
        set_cpu_resources_selected(cpu_resources_detected);
        set_checked_for_gpu_disable(false);
    };

    function handleChangeToggleForQualitySetting() {
        getResources();
        set_isClickedSpeedSetting(false);
        set_isClickedQualitySetting(!isClickedQualitySetting);
        set_checked_for_disable_scenario_context(false);
        set_cpu_resources_selected(cpu_resources_detected);
        set_checked_for_gpu_disable(false);
    };

    function handleChangeCPUResourcesSelected(event) {
        set_cpu_resources_selected(event.target.value);
    };
    function handleChangeGPUResourcesSelected(event) {
        set_gpu_resources_selected(event.target.value);
    };
    function handleOkExperimentalFeature() {
        set_experimentalConfirmLock(false);
    };

    function handleChangeTempSelected (event) {
        set_temp_selected(event.target.value);
    };

    async function getStudentLogs() {

        try {
            const reqJSON = {student_id: selectedHintUser_state?.id ?? 0};

            const response = await axios.post(
                "get_student_logs",
                reqJSON
            );

            // Check for error response (standardized format)
            if (!response.data.success || response.data.error) {
                console.error('Student logs error:', response.data.error);
                set_student_bash_logs_state('Error loading bash logs');
                set_student_chat_logs_state('Error loading chat logs');
                set_student_responses_logs_state('Error loading response logs');
                return;
            }

            // Extract data from standardized response
            const logsData = response.data.data || response.data;
            const student_logs_bash_returned_obj = logsData.bash;
            const student_logs_bash_concatenated_string = student_logs_bash_returned_obj
                .filter(entry => entry.bashEntry !== null)
                .map(entry => `Entry ${entry.index + 1}: [${entry.bashEntry}] `)
                .join(', ');
            let student_logs_bash_stringified = JSON.stringify(student_logs_bash_concatenated_string);
            set_student_bash_logs_state(student_logs_bash_stringified);

            const student_logs_chat_returned_obj = logsData.chat;
            const student_logs_chat_concatenated_string = student_logs_chat_returned_obj
                .filter(entry => entry.chatEntry !== null)
                .map(entry => `Entry ${entry.index + 1}: [${entry.chatEntry}] `)
                .join(', ');
            let student_logs_chat_stringified = JSON.stringify(student_logs_chat_concatenated_string);
            set_student_chat_logs_state(student_logs_chat_stringified);

            const student_logs_responses_returned_obj = logsData.responses;
            const student_logs_responses_concatenated_string = student_logs_responses_returned_obj
                .filter(entry => entry.responsesEntry !== null)
                .map(entry => `Entry ${entry.index + 1}: [${entry.responsesEntry}] `)
                .join(', ');
            let student_logs_responses_stringified = JSON.stringify(student_logs_responses_concatenated_string);
            set_student_responses_logs_state(student_logs_responses_stringified);

        } catch (error) {
            console.error("Error fetching hint:", error);
            // set_error('Failed to fetch hint.');

        } finally {
            set_isLoading_state(false);
        }
    };

    async function requestHint() {
        set_isLoading_state(true);

        try {
            const reqJSON = {
                host: 'localHost',
                port: '6379',
                db: '1',
                task: "generate_hint",
                scenario_name: selectedScenario_state.scenario_type.toLowerCase(),
                disable_scenario_context: checkForDisableScenarioContext,
                temperature: temp_selected
            };

            console.log("EDUHint Request Object: ", reqJSON)

            const response = await axios.post(
                "/query_slm",
                reqJSON
            );

            // Handle standardized API response
            if (response.data.success && response.data.data && response.data.data.generated_hint) {
                set_hint_state(response.data.data.generated_hint);
                console.log("EDUHint Response Object", response);
            } else if (!response.data.success && response.data.error) {
                set_hint_state(`Error: ${response.data.error}`);
            } else {
                set_hint_state('Error: No hint received from server');
            }

        } catch (error) {
            console.error("Error fetching hint:", error);
            
            // Handle specific error cases
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;
                if (errorData && errorData.error) {
                    set_hint_state(`Error: ${errorData.error} - ${errorData.message || 'Unknown error'}`);
                } else {
                    set_hint_state(`Server error: ${error.response.status} ${error.response.statusText}`);
                }
            } else if (error.request) {
                // Network error
                set_hint_state('Network error: Unable to connect to the server');
            } else {
                // Other error
                set_hint_state(`Error: ${error.message}`);
            }

        } finally {
            set_isLoading_state(false);
        }
    };

    async function cancelHint() {
        if (isLoading_state)
            try {
                const reqJSON = {
                    status: "request to cancel hint",
                };

                const response = await axios.post(
                    "/cancel_hint",
                    reqJSON
                );
            } catch (error) {
                console.error("Error cancelling hint:", error);
                // set_error('Failed to cancel hint.');
            } finally {
                set_isLoading_state(false);
            }
    };
    return (
        <HintConfig_Context.Provider value={{
            checkForDisableScenarioContext,
            checkForGPUDisable,
            cpu_resources_detected, 
            cpu_resources_selected,
            gpu_resources_detected, 
            gpu_resources_selected,
            handleChangeToggleForSpeedSetting,
            handleCPUSliderChange,
            handleChangeCheckForDisableScenarioContext,
            handleChangeCheckForGPUDisable,
            handleChangeTempSelected,
            handleChangeToggleForQualitySetting,
            isClickedAdvancedSettings, 
            isExpandedAdvancedSettings, 
            isClickedSpeedSetting,
            isClickedQualitySetting,
            temp_selected,
            toggleExpandAdvancedSettings,
            updateModelWithNewSettings,
            getStudentLogs,

            experimentalConfirmLock,
            isLoading_state,
            isClickedLogs,
            isClickedSettings,
            isExpandedLogs,
            isExpandedSettings,
            toggleExpandLogs, toggleExpandSettings,
            requestHint,
            cancelHint,
            handleOkExperimentalFeature,
            selectedScenario_state, set_selectedScenario_state, 
            selectedHintUser_state, set_selectedHintUser_state,

            isEditing_state, set_isEditing_state,
            hint_state, set_hint_state,
        }}>
            {children}
        </HintConfig_Context.Provider>
    );
}
export default Hints_Controller;