import axios from 'axios';
import React, { useState, useContext } from 'react';
import { StaffRouter_context } from '../Staff_router';
import '../dashboard/Staff_Dash.css';
import '@assets/css/tables.css';


function CreateGroup() {
    const [groupName_state, set_groupName_state] = useState('');
    const [testUsersBool_state, set_testUsersBool_state] = useState(false);
    const [testUserCt_state, set_testUserCt_state] = useState(1);
    const {
        set_groups_state,
        set_tempUsers_state
    } = useContext(StaffRouter_context);
    const [buttonDisabled_state, set_buttonDisabled_state] = useState(true);

    const handle_newGroup_name_change = (event) => {
        set_groupName_state(event.target.value);
        set_buttonDisabled_state(!event.target.value);
    };

    const handle_testUsersBool_toggle = (event) => {
        set_testUsersBool_state(event.target.checked);
        set_buttonDisabled_state(!groupName_state || (event.target.checked && !testUserCt_state));
    };

    const handle_testUserCt_change = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 0 && value <= 100) {
            set_testUserCt_state(value);
            set_buttonDisabled_state(!groupName_state || !testUsersBool_state || !value);
        }
    };
    const handle_createGroup_submit = async (event) => {
        event.preventDefault();
        if (!groupName_state) { return; }
        if (groupName_state?.length < 3 || groupName_state?.length > 25) {
            alert('Group name length must be between 3 and 25');
            return;
        }

        try {
            const response = await axios.post('/create_group', {
                group_name: groupName_state,
                should_generate: testUsersBool_state,
                new_user_count: testUserCt_state
            });

            if (response.data.result === "success") {
                const newGroup = response.data.group_obj;

                set_groups_state(prevState => {
                    const groupExists = prevState.some(group => group.id === newGroup.id);
                    if (groupExists) {
                        return prevState.map(group => group.id === newGroup.id ? newGroup : group);
                    } else {
                        return [...prevState, newGroup];
                    }
                });

                if (response.data.new_users) {
                    set_tempUsers_state(response.data.new_users);
                }

                set_groupName_state('');
                set_buttonDisabled_state(true);
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div className='create-frame'>
            CREATE GROUP
            <form className='create-group-row' onSubmit={handle_createGroup_submit}>
                <input
                    type="text"
                    className="create-group-input"
                    placeholder="Enter unique group name"
                    value={groupName_state}
                    onChange={handle_newGroup_name_change}
                />

                <div className='gen-test-users-frame'>
                    <div className='box-and-text-container'>
                        <div className='gen-test-users-text'>
                            GENERATE USERS?
                        </div>
                        <br />
                        <input
                            className='test-user-checkbox'
                            type="checkbox"
                            checked={testUsersBool_state}
                            onChange={handle_testUsersBool_toggle}
                        />
                    </div>
                    {testUsersBool_state && (
                        <div>
                            <input
                                type="number"
                                value={testUserCt_state}
                                onChange={handle_testUserCt_change}
                                min="1"
                                max="100"
                            />
                        </div>
                    )}
                </div>

                <div className='row-btns'>
                    <button type="submit" className={`${buttonDisabled_state ? 'btn-disabled' : 'green-btn submit-btn row-btn'}`} disabled={buttonDisabled_state}>
                        CREATE
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateGroup;
