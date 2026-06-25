import React, { useContext } from 'react';
import './ErrorModal.css';
import { AppContext } from '../config/AxiosConfig';

function ErrorModal({ message, status_code }) {
    const {
        errorModal_state, set_errorModal_state,
    } = useContext(AppContext);

    function handle_closeModal() {
        set_errorModal_state(null);
    }

    if (!message || !status_code) return null;

    return (
        <div className='modal-backdrop' onClick={handle_closeModal}>
            <div className='modal-frame' onClick={e => e.stopPropagation()}>
                <div className='closeButton-frame' onClick={handle_closeModal}>
                    <div className='closeButton-x'>&times;</div>
                </div>

                <div className='modal-topBar'>
                    <div className='modal-topBar-main'>ERROR</div>
                    <div className='modal-status'>{status_code}</div>
                    <div className='modal-shortMessage'>{message}</div>
                </div>

                <div className='modal-carpet'>
                    <div className='modal-longMessage'>
                        Try refreshing the page. If the error continues, contact your instructor.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorModal;
