import React, { useContext } from 'react';
import { HomeRouter_context } from '@pub/Home_router';
export const StaffRouter_context = React.createContext();

function Frame_UserBox() {

    const {userData_state} = useContext(HomeRouter_context);
    if (!userData_state) {
        return (
            <div className='userBox-frame logged-out'>
                Logged Out
            </div>)
    }
    return (
        <div className='userBox-frame logged-in'>
            Logged in as&nbsp;
            <div className='userBox-name'>
                {userData_state.username}
            </div>
        </div>
    );
};
export default Frame_UserBox;
