import React, { useContext, useState } from 'react';
import axios from 'axios';
import { HomeRouter_context } from '@pub/Home_router';
import edurange_icons from '@modules/ui/edurangeIcons';
import './Login.css'
import { genAlias } from '@modules/utils/chat_modules';
import { AppContext } from '../../../config/AxiosConfig';

function Login() {
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const {
        set_userData_state, set_login_state,
        loginExpiry
    } = useContext(HomeRouter_context);
    const {
        set_errorModal_state,
        set_desiredNavMetas_state,
    } = useContext(AppContext);

    async function sendLoginRequest(username_input, password_input) {
        setErrorMsg('');
        setSubmitting(true);
        try {
            const response = await axios.post('login', {
                username: username_input,
                password: password_input
            });
            const userData = response.data;

            if (userData) {
                const newAlias = genAlias();
                userData.user_alias = newAlias;
                set_userData_state(userData);
                set_login_state(true);

                sessionStorage.setItem('userData', JSON.stringify(userData));
                sessionStorage.setItem('login', true);
                sessionStorage.setItem('loginExpiry', Date.now() + loginExpiry);
                if ((userData?.role === 'staff') || (userData?.role === 'admin')) {
                    set_desiredNavMetas_state(['/staff', 'dash']);
                } else {
                    set_desiredNavMetas_state(['/scenarios', 'dash']);
                }
            } else {
                setErrorMsg(response.data?.error || 'Login failed');
            }
        } catch (error) {
            const errData = error.response?.data?.error;
            if (errData && typeof errData === 'string' && errData.length < 100) {
                setErrorMsg(errData);
            } else {
                set_errorModal_state(error.response || error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = event => {
        event.preventDefault();
        const { username, password } = event.target.elements;
        sendLoginRequest(username.value, password.value);
    };

    return (
        <div className='login-outer'>
            <div className='login-card'>
                <div className='login-brand'>
                    <span className='login-brand-green'>edu</span>
                    <span className='login-brand-orange'>Range</span>
                </div>
                <h2 className='login-heading'>Sign in</h2>

                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='login-field'>
                        <label className='login-label' htmlFor='username'>Username</label>
                        <input
                            className='login-input'
                            type='text'
                            id='username'
                            name='username'
                            autoComplete='username'
                            autoFocus
                            disabled={submitting}
                        />
                    </div>

                    <div className='login-field'>
                        <label className='login-label' htmlFor='password'>Password</label>
                        <input
                            className='login-input'
                            type='password'
                            id='password'
                            name='password'
                            autoComplete='current-password'
                            disabled={submitting}
                        />
                    </div>

                    {errorMsg && (
                        <div className='login-error'>
                            {errorMsg}
                        </div>
                    )}

                    <button className='login-submit' type='submit' disabled={submitting}>
                        {submitting ? (
                            <>Verifying&hellip;</>
                        ) : (
                            <>{edurange_icons.user_check} Sign in</>
                        )}
                    </button>
                </form>

                <div className='login-register-link' role='button' tabIndex={0}
                    onClick={() => set_desiredNavMetas_state(['/register', 'home'])}
                    onKeyDown={e => e.key === 'Enter' && set_desiredNavMetas_state(['/register', 'home'])}>
                    No account? Register here
                </div>
            </div>
        </div>
    );
};

export default Login;
