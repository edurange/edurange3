

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
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum obcaecati laboriosam ipsa cumque consectetur, iste unde fugiat dolor velit sunt iure ipsam, asperiores molestias repellat rerum dolore voluptatum, numquam eligendi. Provident repellat dicta optio esse placeat, ipsum modi sint voluptatem nostrum veniam nobis dolor qui, officia perferendis repellendus aliquam sapiente repudiandae, culpa deserunt sunt aperiam. Neque, deleniti provident? Vitae ullam quas veritatis esse rem veniam hic odit fugit labore expedita, repudiandae sit iure minima voluptas, ad inventore a in fugiat odio iusto. Delectus ratione aspernatur dicta amet fuga, explicabo incidunt perferendis aut soluta veniam repudiandae itaque, neque similique, cum quae.
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ErrorModal;

