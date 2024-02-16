import React, { useContext } from 'react';
import axios from 'axios';
import { HomeRouter_context } from '@home/Home_router';
import edurange_icons from '@modules/ui/edurangeIcons';
import './Login.css'

function Login() {

    const {
        set_userData_state, set_login_state,
        loginExpiry, updateNav
    } = useContext(HomeRouter_context);

    async function sendLoginRequest(username_input, password_input) {
        try {
            const response = await axios.post('/login',
                {
                    username: username_input,
                    password: password_input
                }
            );
            const userData = response.data;

            if (userData) {
                console.log("Login success!");
                set_userData_state(userData);
                set_login_state(true);
                const newExpiry = Date.now() + loginExpiry;
                sessionStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('navName', `dash`);
                sessionStorage.setItem('login', true);
                sessionStorage.setItem('loginExpiry', newExpiry);
                if ((userData?.role === 'instructor') || (userData?.role === 'admin')) {
                    updateNav('/instructor/', `dash_instructor`);
                }
                else { 
                    updateNav('/scenarios/', `dash`); }
            } else {
                const errData = response.data.error;
                console.log(errData);
                console.log('Login failure.');
            };
        } catch (error) {
            console.error('Error:', error);
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
        updateNav('/register', `logged_out`);
    };

    return (
        <div className='registration-container'>

            <h2 className='registration-placard'>
                <div className='registration-placard-text'>
                    Enter your credentials
                </div>
            </h2>

            <form className='registration-submit-frame' onSubmit={handleSubmit}>
                <div className='registration-submit-row'>

                    <div className='registration-submit-row-left'>
                        <div className='registration-submit-item'>
                            <label className='registration-prompt-text' htmlFor='username'>Username:</label>
                            <input className='registration-input-text' type='text' id='username' name='username' />
                        </div>

                        <div className='registration-submit-item'>
                            <label className='registration-prompt-text' htmlFor='password'>Password:</label>
                            <input className='registration-input-text' type='password' id='password' name='password' />
                        </div>
                    </div>

                    <div className='registration-submit-row-right'>
                        <button className='registration-button' type='submit'>
                            {edurange_icons.user_check}
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
