import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '@pub/Home_router';
import '@assets/css/tables.css';

function Instr_UsersTable() {

    const { set_desiredNavMetas_state } = useContext(HomeRouter_context);
    const { users_state, set_users_state, groups_state, set_groups_state } = useContext(InstructorRouter_context);
    const [selectedUsers_state, set_selectedUsers_state] = useState({});
    const [actionSelection_state, set_actionSelection_state] = useState('');
    const [selectedGroupId_state, set_selectedGroupId_state] = useState('');
    const [buttonIsDisabled_state, set_buttonIsDisabled_state] = useState(true);

    useEffect(() => {
        const isAnyUserSelected = Object.values(selectedUsers_state).some((isSelected) => isSelected);
        const isGroupSelected = actionSelection_state === 'AssignToGroup' ? selectedGroupId_state !== '' : true;
        set_buttonIsDisabled_state(!isAnyUserSelected || !isGroupSelected);
    }, [selectedUsers_state, actionSelection_state, selectedGroupId_state]);

    function handleUserCheckboxChange(event, userId) {
        event.stopPropagation();
        set_selectedUsers_state(prevSelectedUsers => ({
            ...prevSelectedUsers,
            [userId]: !prevSelectedUsers[userId],
        }));
    }


    function handleSelectAllUsers() {
        const newAreAllUsersSelected = !areAllUsersSelected;
        const newSelectedUsers = {};
        users_state.forEach((user) => {
            newSelectedUsers[user.id] = newAreAllUsersSelected;
        });
        set_selectedUsers_state(newSelectedUsers);
    }


    const areAllUsersSelected =
        users_state.length > 0 &&
        Object.keys(selectedUsers_state).length === users_state.length &&
        Object.values(selectedUsers_state).every((value) => value);

    function handleActionChange(event) {
        event.stopPropagation();
        set_actionSelection_state(event.target.value);
    }

    function handleGroupSelectionChange(event) {
        event.stopPropagation();
        set_selectedGroupId_state(event.target.value);
    }

    async function handleUpdateDatabase(event) {
        event.stopPropagation();
        switch (actionSelection_state) {
            case 'DeleteUser':
                await deleteUsers();
                break;
            case 'AssignToGroup':
                await assignToGroup();
                break;
            case 'ClearGroup':
                await clearGroups();
                break;
            default:
                console.log('No action selected');
        }
    }

    async function deleteUsers() {
        const usersToDelete = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);
        try {
            const response = await axios.post('/delete_users', {
                users_to_delete: usersToDelete,
            });
            if (response.data.result === 'success') {
                const remainingUsers = users_state.filter(
                    (user) => !response.data.deleted_users.map(String).includes(String(user.id))
                );
                set_users_state(remainingUsers);
            }
        } catch (error) {
            console.error('Error deleting users:', error);
        }
    }


    async function assignToGroup() {
        const usersToAssignIds = Object.keys(selectedUsers_state)
            .filter((userId) => selectedUsers_state[userId])
            .map((userId) => parseInt(userId, 10));

        try {
            const response = await axios.post('/assign_group_users', {
                group_id: parseInt(selectedGroupId_state, 10),
                users_to_assign: usersToAssignIds.map(id => ({ id })),
            });

            if (response.data.result === 'success') {
                console.log('Users assigned to group:', response.data.assigned_user_ids);

                const updatedUsersState = users_state.map(user => {
                    if (response.data.assigned_user_ids.includes(user.id)) {
                        return { ...user, membership: parseInt(selectedGroupId_state, 10) };
                    }
                    return user;
                });
                set_users_state(updatedUsersState);

                const updatedGroupsState = groups_state.map(group => {
                    if (group.id === parseInt(selectedGroupId_state, 10)) {
                        const currentGroupUserIds = new Set(group.users.map(user => user.id));
                        response.data.assigned_user_ids.forEach(id => currentGroupUserIds.add(id));
                        const updatedUsers = Array.from(currentGroupUserIds).map(id => updatedUsersState.find(user => user.id === id));
                        return { ...group, users: updatedUsers };
                    }
                    return group;
                });
                set_groups_state(updatedGroupsState);
            } else {
                console.error('Error assigning users to group:', response.data.message);
            }
        } catch (error) {
            console.error('Error assigning users to group:', error);
        }
    }

    async function assignToGroup() {
        const usersToAssignIds = Object.keys(selectedUsers_state)
            .filter((userId) => selectedUsers_state[userId])
            .map((userId) => parseInt(userId, 10));

        try {
            const response = await axios.post('/assign_group_users', {
                group_id: parseInt(selectedGroupId_state, 10),
                users_to_assign: usersToAssignIds.map(id => ({ id })),
            });

            if (response.data.result === 'success') {
                console.log('Users assigned to group:', response.data.assigned_user_ids);

                const updatedUsersState = users_state.map(user => {
                    if (response.data.assigned_user_ids.includes(user.id)) {
                        return { ...user, membership: parseInt(selectedGroupId_state, 10) };
                    }
                    return user;
                });
                set_users_state(updatedUsersState);
                const updatedGroupsState = groups_state.map(group => {

                    // make Set obj of user IDs for the current group to prevent duplicates
                    const groupUserIds = new Set(group.users.map(user => user.id));

                    if (group.id === parseInt(selectedGroupId_state, 10)) {
                        // add IDs to new group
                        response.data.assigned_user_ids.forEach(id => groupUserIds.add(id));
                    } else {
                        // del IDs from prev group
                        response.data.assigned_user_ids.forEach(id => groupUserIds.delete(id));
                    }

                    const updatedUsers = Array.from(groupUserIds).map(id => users_state.find(user => user.id === id));

                    return { ...group, users: updatedUsers };
                });
                set_groups_state(updatedGroupsState);


            } else {
                console.error('Error assigning users to group:', response.data.message);
            }
        } catch (error) {
            console.error('Error assigning users to group:', error);
        }
    }


    async function clearGroups() {
        const usersToClear = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);

        try {
            const response = await axios.post('/clear_groups', {
                users_to_clear: usersToClear,
            });

            if (response.data.result === 'success') {
                console.log('Users cleared from groups:', response.data.cleared_user_ids);

                const updatedUsersState = users_state.map(user => {
                    if (response.data.cleared_user_ids.includes(user.id)) {
                        return { ...user, membership: null };
                    }
                    return user;
                });
                set_users_state(updatedUsersState);

                const updatedGroupsState = groups_state.map(group => {
                    const updatedUsers = group.users.filter(userId => !response.data.cleared_user_ids.includes(userId));
                    return { ...group, users: updatedUsers };
                });
                set_groups_state(updatedGroupsState);
            } else {
                console.error('Error clearing users from groups');
            }
        } catch (error) {
            console.error('Error clearing users from groups:', error);
        }
    }


    function getGroupNameById(groupId) {
        const group = groups_state.find((group) => group.id === groupId);
        return group ? group.name : 'none';
    }

    function handle_userDetail_click(event, student) {
        set_desiredNavMetas_state([`/instructor/students/${student.id}`, 'dash']);
    };
    function handle_groupDetail_click(event, student) {
        set_desiredNavMetas_state([`/instructor/groups/${student.membership}`, 'dash']);
    };

    return (
        <>
            <div className="create-frame">
                <div className="create-group-row">
                    <select className="create-dropdown" value={actionSelection_state} onChange={handleActionChange}>
                        <option value="">Select Action</option>
                        <option value="AssignToGroup">Assign to Group</option>
                        <option value="ClearGroup">Clear Group</option>
                        <option value="DeleteUser">Delete User</option>
                    </select>
                    {actionSelection_state === 'AssignToGroup' && (
                        <select className="create-dropdown" value={selectedGroupId_state} onChange={handleGroupSelectionChange}>
                            <option value="">Select Group</option>
                            {groups_state
                                .filter(group => group.name !== 'ALL')
                                .map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                        </select>
                    )}
                    <div className="row-btns">
                        <button
                            onClick={handleUpdateDatabase}
                            className={`row-btn ${buttonIsDisabled_state ? 'btn-disabled' : 'green-btn submit-btn'}`}
                            disabled={buttonIsDisabled_state}
                        >
                            Update Database
                        </button>
                    </div>
                </div>
            </div>
            <div className="table-frame">
                <div className="table-header">
                    <div onClick={handleSelectAllUsers} className="table-cell-item highlightable-cell col-xxsmall">
                        ID
                        <input type="checkbox" checked={areAllUsersSelected} readOnly />
                    </div>
                    <div className="table-header-item col-large">Username</div>
                    <div className="table-header-item col-large">Group</div>
                    <div className="table-cell-item highlightable-cell col-small">Cmds</div>
                    <div className="table-cell-item highlightable-cell col-small">Chats</div>
                </div>
                {users_state.map((user, index) => (
                    <div key={index + 2000} className="table-row">
                        <div className="table-cell-item highlightable-cell col-xxsmall">
                            <div onClick={(event) => handleUserCheckboxChange(event, user.id)}>
                                {user.id}
                                <input
                                    type="checkbox"
                                    checked={selectedUsers_state[user.id] || false}
                                    onChange={(event) => handleUserCheckboxChange(event, user.id)}
                                    onClick={(event) => event.stopPropagation()} // Prevent checkbox click from triggering ID cell click
                                />
                            </div>
                        </div>
                        <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_userDetail_click(event, user)}>{user.username}</div>
                        <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_groupDetail_click(event, user)}>{getGroupNameById(user.membership)}</div>
                        <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>41(<span className='highlighter-orange'>24</span>)</div>
                        <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>10(<span className='highlighter-orange'>4</span>)</div>
                    </div>
                ))}


            </div>
        </>
    );
}

export default Instr_UsersTable;
