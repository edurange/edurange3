import React from 'react';
import './TempUsers_table.css';
import Copy_button_small from '@components/Copy_button_small';
import Copy_button_flex from '@components/Copy_button_flex';

const testTesters = [
    {
        username: 'bob',
        password: 'bobIsCool',
    },
    {
        username: 'sally',
        password: 'sallyIsCool',
    },
    {
        username: 'alice',
        password: 'aliceIsCool',
    },
    {
        username: 'neko',
        password: 'nekoIsCool',
    },
]

function TempUsers_table({ userList }) {

    // userList = testTesters

    if (userList.length < 1) { return <></> }

    return (
        <div className='tempusers-frame'>
            Test Users:
            <div className='tempusers-rowheads'>
                <div>Username</div>
                <div>Password</div>
            </div>
            {userList.map((user, index) => {
                return (
                    <div key={index + 567} className='tempusers-item'>
                        <Copy_button_small thingToCopy={JSON.stringify({ username: user.username, password: user.password })} />
                        <div className='tempusers-creds-frame'>
                            <div>{user.username}</div>
                            <div>{user.password}</div>
                        </div>
                    </div>
                );
            })}
            <div className='copyflex-fix'>

            <Copy_button_flex thingToCopy={userList.map((user) => {
                return [user.username, user.password]
            })} textLabel={'Copy All'} />
            </div>
        </div>
    );
}
export default TempUsers_table;