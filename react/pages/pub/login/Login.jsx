import React, { useContext } from 'react';
import axios from 'axios';
import { HomeRouter_context } from '@pub/Home_router';
import edurange_icons from '@modules/ui/edurangeIcons';
import './Login.css'
import { genAlias } from '@modules/utils/chat_modules';

function Login() {

    const {
        set_userData_state, set_login_state, set_chatData_state, chatData_state,
        loginExpiry, set_desiredNavMetas_state,
    } = useContext(HomeRouter_context);

    async function sendLoginRequest(username_input, password_input) {
        try {
            const response = await axios.post('login',
                {
                    username: username_input,
                    password: password_input
                }
            );
            const userData = response.data;

            if (userData) {
                const newAlias = genAlias();
                userData.user_alias = newAlias;
                set_userData_state(userData);
                set_login_state(true);

                // for student history
                const hist_response = await axios.get('/get_chat_history');
                const chat_history = hist_response?.data?.chat_history
                const newExpiry = Date.now() + loginExpiry;
                sessionStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('login', true);
                sessionStorage.setItem('loginExpiry', newExpiry);
                if ((userData?.role === 'instructor') || (userData?.role === 'admin')) {
                    set_desiredNavMetas_state(['/instructor', 'dash']);
                }
                else {
                    set_chatData_state(chat_history);
                    set_desiredNavMetas_state(['/scenarios', 'dash']);
                }
            } else {
                const errData = response.data.error;
                
            };
        } catch (error) {
            console.log('Login failure.');
        };
    };

    const handleSubmit = event => {
        event.preventDefault();
        const usernameInput = event.target.elements.username.value;
        const passwordInput = event.target.elements.password.value;
        sendLoginRequest(usernameInput, passwordInput);
    };
    const handleRegNav_click = event => {
        event.preventDefault();
        set_desiredNavMetas_state(['/register', `home`]);
    };

    return (
        <div className='login-container'>

            <h2 className='login-placard'>
                <div className='login-placard-text'>
                    Enter your credentials
                </div>
            </h2>

            <form className='login-submit-frame' onSubmit={handleSubmit}>
                <div className='login-submit-row'>

                    <div className='login-submit-row-left'>
                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='username'>Username:</label>
                            <input className='login-input-text' type='text' id='username' name='username' />
                        </div>

                        <div className='login-submit-item'>
                            <label className='login-prompt-text' htmlFor='password'>Password:</label>
                            <input className='login-input-text' type='password' id='password' name='password' />
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

            <div className='reg-redirect-clicker' onClick={handleRegNav_click}>
                No account? Register here!
            </div>

        </div>
    );
};

export default Login;
