import React, { useContext } from 'react';
import { HintConfig_Context } from "../Hints_Controller";

function Hint_LoadingOverlay () {

    const { cancelHint } = useContext(HintConfig_Context);

    return (
        <div className="loading-overlay">
            <div>
                <span>GENERATING HINT</span>
            </div>
            <div>
                <span className="hourglass">⌛</span>
            </div>
            <div>
                <span>Please remain on the page...</span>
            </div>
            <div>
                <button onClick={cancelHint} className="cancel-hint-button">CANCEL HINT 🚫 </button>
            </div>
        </div>
    );
} export default Hint_LoadingOverlay;