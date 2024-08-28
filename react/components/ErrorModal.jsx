import React, { useContext } from 'react';
import './ErrorModal.css';
import Placard from './Placard';
import { AppContext } from '../config/AxiosConfig';

function ErrorModal({ error }) {
    const {
        errorModal_state, set_errorModal_state,
    } = useContext(AppContext);

    function handle_closeModal() {
        set_errorModal_state(null);
    }
    
    if (!error) return null;

    const { message, status_code, stack } = error;

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
                        <Placard placard_text={status_code || 'Unknown'} textSize={'larger'} />
                    </div>
                    <div className='modal-shortMessage'>
                        <div>
                            {message || 'An unexpected error occurred.'}
                        </div>
                    </div>
                </div>
                
                <div className='modal-carpet'>
                    <div className='modal-longMessage'>
                        <h3>Error Details:</h3>
                        <p><strong>Message:</strong> {message || 'An unexpected error occurred.'}</p>
                        <p><strong>Status Code:</strong> {status_code || 'Unknown'}</p>
                        {stack && (
                            <div>
                                <strong>Stack Trace:</strong>
                                <pre>{stack}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorModal;
