import React, { useContext } from 'react';
import '../Hints_Main.css';
import { HintConfig_Context } from '../Hints_Controller';

function Hint_Settings() {

    const {
        checkForDisableScenarioContext,
        checkForGPUDisable,
        gpu_resources_detected, 
        gpu_resources_selected,
        handleChangeToggleForSpeedSetting,
        handleCPUSliderChange,
        handleChangeCheckForDisableScenarioContext,
        handleChangeCheckForGPUDisable,
        handleChangeTempSelected,
        handleChangeToggleForQualitySetting,
        temp_selected,
        updateModelWithNewSettings
    } = useContext(HintConfig_Context);

    return (
        <div className="hints-dashboard-ui">
            <div className="pageHeader">
                <div className="expandable-settings-container">

                    <>
            
                

                        <div className="slider-container">
                            <label htmlFor="modelTempSlider">Model temperature: {temp_selected}</label>
                            <input
                                type="range"
                                id="modelTempSlider"
                                min='0'
                                max={1.0}
                                step='0.1'
                                value={temp_selected}
                                onChange={handleChangeTempSelected}
                            /> 
                        </div>

                        <button onClick={updateModelWithNewSettings} className="save-settings">Save 💾 </button>

                        
                    </>
                </div>
            </div>
        </div>
    );
}; export default Hint_Settings;