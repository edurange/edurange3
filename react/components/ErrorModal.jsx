

import React, { useContext } from 'react';
import './ErrorModal.css';
import Placard from './Placard';
import { AppContext } from '../config/AxiosConfig';

function ErrorModal({ message, status_code }) {
    const {
        errorModal_state, set_errorModal_state,
    } = useContext(AppContext);
    function handle_closeModal() {
        set_errorModal_state(null);
    }
    
    if (!message || !status_code) return

    return (
        <div className='modal-backdrop'>

            <div className='modal-frame'>
            <div className='closeButton-frame'>
                <div className='closeButton-x' onClick={handle_closeModal}>
                    X
                </div>
            </div>
            
                <div className='modal-topBar'>
                    <div className='modal-topBar-main'>

                        <Placard placard_text={"ERROR"} textSize={'larger'} />
                        <Placard placard_text={status_code} textSize={'larger'} />
                    </div>
                    <div className='modal-shortMessage'>
                        <div>
                            {message}
                        </div>
                    </div>

                </div>
                <div className='modal-carpet'>
                    <div className='modal-longMessage'>
                        <p>Try refreshing the page. If the error continues, contact your instructor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ErrorModal;