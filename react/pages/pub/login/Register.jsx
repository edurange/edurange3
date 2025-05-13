
import React, { useContext } from 'react';
import axios from 'axios';
import edurange_icons from '@modules/ui/edurangeIcons';
import './Login.css';
import { HomeRouter_context } from '../Home_router';
import { AppContext } from '../../../config/AxiosConfig';

function Register() {

    const {
        desiredNavMetas_state, set_desiredNavMetas_state,
    } = useContext(AppContext);

    async function sendRegistrationRequest(username_input, password_input, confirm_password_input, code_input) {
        try {
            const response = await axios.post('/register',
                {
                    username: username_input,
                    password: password_input,
                    confirm_password: confirm_password_input,
                    code: code_input,
                }
            );
            const reg_response = response.data;

            if (reg_response) {
                set_desiredNavMetas_state(['/login', 'home']);
            } else {
                console.log('Registration failure.');
            };
        } catch (error) {
            console.error('Error:', error);
        };
    };

    const handleSubmit = event => {
        event.preventDefault();
        const username_input = event.target.elements.username.value;
        const password_input = event.target.elements.password.value;
        const confirm_password_input = event.target.elements.confirm_password.value;
        const code_input = event.target.elements.code.value;
        sendRegistrationRequest(username_input, password_input, confirm_password_input, code_input);
    };

    const handleLoginNav_click = event => {
        event.preventDefault();
        set_desiredNavMetas_state(['/login', `home`]);
    };

    return (
        <div className='login-container'>

            <h2 className='login-placard'>
                <div className='login-placard-text'>
                    Enter new account info
                </div>
            </h2>

            <form className='login-submit-frame' onSubmit={handleSubmit}>
                <div className='login-submit-row'>

                    <div className='login-submit-row-left'>
                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='username'>Username:</label>
                            <input className='login-input-text' type='text' id='username' name='username' autoComplete='off' />
                        </div>

                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='password'>Password:</label>
                            <input className='login-input-text' type='password' id='password' name='password' autoComplete='new-password' />
                        </div>
                    
                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='confirm_password'>Confirm PW:</label>
                            <input className='login-input-text' type='password' id='confirm_password' name='confirm_password' autoComplete='new-password' />
                        </div>

                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='code'>Group Code:</label>
                            <input className='login-input-text' type='text' id='code' name='code' autoComplete='off' />
                        </div>
                    </div>

                    <div className='login-submit-row-right'>
                        <button className='login-button' type='submit'>
                            <div className='login-button-content'>
                                {edurange_icons.user_check}
                                <span className='login-button-text'>SUBMIT</span>
                            </div>
                        </button>
                    </div>

                </div>
            </form>

            <div className='reg-redirect-clicker' onClick={handleLoginNav_click}>
                Already have an acct?  Login here!
            </div>
        </div>
    );
};
export default Register;