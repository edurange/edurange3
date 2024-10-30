import React, { useContext } from 'react';
import '../Hints_Main.css';
import { HintConfig_Context } from '../Hints_Controller';

function Hint_Settings() {

    const {
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
        updateModelWithNewSettings
    } = useContext(HintConfig_Context);

    return (
        <div className="hints-dashboard-ui">
            <div className="pageHeader">
                <h5>Hint Generation Settings</h5>
                <div className="expandable-settings-container">

                        <>
                            <div className="resource-preset-buttons">
                                <button onClick={handleChangeToggleForSpeedSetting} className={`select-speed-setting-button ${isClickedSpeedSetting ? 'clicked' : ''}`}><span style={{ textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>PRIORITIZE SPEED⚡</span>< br />< br />Select this if you want hints to generate as fast as possible but with reduced quality</button>

                                <button onClick={handleChangeToggleForQualitySetting} className={`select-quality-setting-button ${isClickedQualitySetting ? 'clicked' : ''}`}><span style={{ textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>PRIORITIZE QUALITY🏆</span>< br />< br />Select this you want the highest quality of hints and are willing to wait longer. This is the default and recommended setting.</button>
                            </div>

                            <button onClick={toggleExpandAdvancedSettings} className={`advanced-settings-expand-button ${isClickedAdvancedSettings ? 'clicked' : ''}`}>Advanced Settings ⚙️</button>

                            {isExpandedAdvancedSettings && (
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
                                    <div className="slider-container">
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

                                    <div className="gpu_resources_display">
                                        <textarea
                                            value={gpu_resources_selected}
                                            rows={1}
                                            readOnly
                                            aria-live="polite"
                                            className="logs-textarea"
                                            placeholder={gpu_resources_detected == 0 ? 'NO GPU DETECTED' : gpu_resources_detected}
                                        />
                                    </div>
                                    <label htmlFor="temp_resources_display" className="settings-textarea-label">Model temperature: </label>
                                    <textarea
                                        value={temp_selected}
                                        rows={1}
                                        readOnly
                                        aria-live="polite"
                                        className="logs-textarea"
                                        placeholder={"1"}
                                    />
                                    <div className="slider-container">
                                        <input
                                            type="range"
                                            id="tempSliderRange"
                                            min='0.1'
                                            max={1}
                                            step='0.1'
                                            value={temp_selected}
                                            onChange={handleChangeTempSelected}
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
                                    <button onClick={updateModelWithNewSettings} className="save-settings">Save 💾 </button>
                                </div>
                            )}
                        </>
                </div>
            </div>
        </div>
    );
}; export default Hint_Settings;