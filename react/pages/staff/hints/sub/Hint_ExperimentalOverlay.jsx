import React, { useContext } from 'react';
import { HintConfig_Context } from "../Hints_Controller";

function Hint_ExperimentalOverlay() {

    const { handleOkExperimentalFeature } = useContext(HintConfig_Context);

    return (
        <div className="experimental-feature-confirm-lock-overlay">
            <div>
                <span>EXPERIMENTAL FEATURE AHEAD: <br></br>
                    EXPECT CRASHES, WOULD YOU LIKE TO CONTINUE? </span>
            </div>
            <div>
                <button onClick={handleOkExperimentalFeature} className="ok-button"> 🆗 </button>
            </div>
        </div>
    )

} export default Hint_ExperimentalOverlay;