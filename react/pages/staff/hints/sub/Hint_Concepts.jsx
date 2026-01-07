import React, { useContext } from 'react';
import '../Hints_Main.css';
import { HintConfig_Context } from '../Hints_Controller';

function Hint_Concepts() {

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
        temp_selected,
        updateModelWithNewSettings
    } = useContext(HintConfig_Context);

    return (
        <div className="hints-dashboard-ui">
            <div className="pageHeader">
                <h5>Hint Generation Concepts</h5>
                <div className="expandable-concepts-container">

                    <>
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
                        </>
                </div>
            </div>
        </div>
    );
}; export default Hint_Concepts;