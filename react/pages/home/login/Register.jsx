import React, { useContext } from 'react';

import axios from 'axios';
import './Login.css'
import edurange_icons from '@modules/ui/edurangeIcons';
import { HomeRouterContext } from '../Home_router';
// import Login from './Login';
// import { sendLoginRequest } from './Login';

function Register() {

    const {
        set_userData_state, set_login_state,
        updateNav, loginExpiry
    } = useContext(HomeRouterContext);

    async function sendRegistrationRequest(username_input, password_input, confirm_password_input, code_input) {

        console.log('invoke sendRegistrationRequest()');

        try {
            const response = await axios.post('/api/register',
                {
                    username: username_input,
                    password: password_input,
                    confirm_password: confirm_password_input,
                    code: code_input,
                }
            );
            console.log(response)
            const reg_response = response.data;
            const userData = response.data;

            if (reg_response) {
                console.log("Registration Success!");
                console.log("reg_response: ", reg_response);

                // set_userData_state(userData);
                // set_login_state(true);
                // const newExpiry = Date.now() + loginExpiry;
                // sessionStorage.setItem('userData', JSON.stringify(userData));
                // sessionStorage.setItem('navName', `dash`);
                // sessionStorage.setItem('login', true);
                // sessionStorage.setItem('loginExpiry', newExpiry);
                updateNav('/edurange3/login/', 'home');


            } else {
                const errData = response.data.error;
                console.log(errData);
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
        updateNav('/login', `logged_out`);
    };

    return (
        <div className='registration-container'>

            <h2 className='registration-placard'>
                <div className='registration-placard-text'>
                    Enter new account info
                </div>
            </h2>

            <form className='registration-submit-frame' onSubmit={handleSubmit}>
                

                <div className='registration-submit-stack'>
                    <div className='registration-submit-item'>
                        <label className='registration-prompt-text' htmlFor='username'>Username:</label>
                        <input className='registration-input-text' type='text' id='username' name='username' />
                    </div>

                    <div className='registration-submit-item'>
                        <label className='registration-prompt-text' htmlFor='password'>Password:</label>
                        <input className='registration-input-text' type='password' id='password' name='password' />
                    </div>
                
                    <div className='registration-submit-item'>
                        <label className='registration-prompt-text' htmlFor='confirm_password'>Confirm Password:</label>
                        <input className='registration-input-text' type='password' id='confirm_password' name='confirm_password' />
                    </div>

                    <div className='registration-submit-item'>
                        <label className='registration-prompt-text' htmlFor='code'>Code:</label>
                        <input className='registration-input-text' type='text' id='code' name='code' />
                    </div>
                    <div className='registration-button-frame'>
                        <div type='submit' className='registration-submit-clicker'>
                            SUBMIT
                            <button className='registration-button' type='submit'>
                                {edurange_icons.user_check}
                            </button>
                        </div>
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
