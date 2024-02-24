
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { InstructorRouter_context } from '../Instructor_router';
import '@assets/css/tables.css';

function Instr_StudentsTable() {
    const { users_state, set_users_state, groups_state, set_groups_state } = useContext(InstructorRouter_context);

    const [selectedUsers, setSelectedUsers] = useState({});
    const [actionSelection, setActionSelection] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        const isAnyUserSelected = Object.values(selectedUsers).some((isSelected) => isSelected);
        const isGroupSelected = actionSelection === 'AssignToGroup' ? selectedGroupId !== '' : true;
        setIsButtonDisabled(!isAnyUserSelected || !isGroupSelected);
    }, [selectedUsers, actionSelection, selectedGroupId]);

    function handleUserCheckboxChange(userId) {
        setSelectedUsers((prevSelectedUsers) => ({
            ...prevSelectedUsers,
            [userId]: !prevSelectedUsers[userId],
        }));
    }

    function handleSelectAllUsers(event) {
        const newSelectedUsers = {};
        users_state.forEach((user) => {
            newSelectedUsers[user.id] = event.target.checked;
        });
        setSelectedUsers(newSelectedUsers);
    }

    const areAllUsersSelected =
        users_state.length > 0 &&
        Object.keys(selectedUsers).length === users_state.length &&
        Object.values(selectedUsers).every((value) => value);

    function handleActionChange(event) {
        setActionSelection(event.target.value);
    }

    function handleGroupSelectionChange(event) {
        setSelectedGroupId(event.target.value);
    }

    async function handleUpdateDatabase() {
        switch (actionSelection) {
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
        const usersToDelete = Object.keys(selectedUsers).filter((userId) => selectedUsers[userId]);
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
        const usersToAssign = Object.keys(selectedUsers)
            .filter((userId) => selectedUsers[userId])
            .map((userId) => ({ id: parseInt(userId, 10) }));
    
        try {
            const response = await axios.post('/assign_group_users', {
                group_id: parseInt(selectedGroupId, 10),
                users_to_assign: usersToAssign,
            });
    
            if (response.data.result === 'success') {
                console.log('Users assigned to group:', response.data.assigned_user_ids);
    
                const updatedUsersState = users_state.map(user => {
                    if (response.data.assigned_user_ids.includes(user.id)) {
                        return { ...user, membership: parseInt(selectedGroupId, 10) };
                    }
                    return user;
                });
                set_users_state(updatedUsersState);
    
                const updatedGroupsState = groups_state.map(group => {
                    if (group.id === parseInt(selectedGroupId, 10)) {

                        const updatedUserIds = new Set([...group.users, ...response.data.assigned_user_ids]);
                        return { ...group, users: Array.from(updatedUserIds) };
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
        const usersToAssignIds = Object.keys(selectedUsers)
            .filter((userId) => selectedUsers[userId])
            .map((userId) => parseInt(userId, 10));
    
        try {
            const response = await axios.post('/assign_group_users', {
                group_id: parseInt(selectedGroupId, 10),
                users_to_assign: usersToAssignIds.map(id => ({ id })),
            });
    
            if (response.data.result === 'success') {
                console.log('Users assigned to group:', response.data.assigned_user_ids);
    
                const updatedUsersState = users_state.map(user => {
                    if (response.data.assigned_user_ids.includes(user.id)) {
                        return { ...user, membership: parseInt(selectedGroupId, 10) };
                    }
                    return user;
                });
                set_users_state(updatedUsersState);
    
                const updatedGroupsState = groups_state.map(group => {
                    if (group.id === parseInt(selectedGroupId, 10)) {
                        const assignedUserObjects = updatedUsersState.filter(user => response.data.assigned_user_ids.includes(user.id));
                        const updatedUsers = [...group.users, ...assignedUserObjects];
                        return { ...group, users: updatedUsers };
                    } else {
                        const updatedUsers = group.users.filter(user => !response.data.assigned_user_ids.includes(user.id));
                        return { ...group, users: updatedUsers };
                    }
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
        const usersToClear = Object.keys(selectedUsers).filter((userId) => selectedUsers[userId]);
    
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

    return (
        <>
            <div className="create-frame">
                <div className="create-group-row">
                    <select className="create-dropdown" value={actionSelection} onChange={handleActionChange}>
                        <option value="">Select Action</option>
                        <option value="AssignToGroup">Assign to Group</option>
                        <option value="ClearGroup">Clear Group</option>
                        <option value="DeleteUser">Delete User</option>
                    </select>
                    {actionSelection === 'AssignToGroup' && (
                        <select className="create-dropdown" value={selectedGroupId} onChange={handleGroupSelectionChange}>
                            <option value="">Select Group</option>
                            {groups_state.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="row-btns">
                        <button
                            onClick={handleUpdateDatabase}
                            className={`row-btn ${isButtonDisabled ? 'btn-disabled' : 'green-btn submit-btn'}`}
                            disabled={isButtonDisabled}
                        >
                            Update Database
                        </button>
                    </div>
                </div>
            </div>
            <div className="table-frame">
                <div className="table-header">
                    <input type="checkbox" checked={areAllUsersSelected} onChange={handleSelectAllUsers} />
                    <div className="table-cell-item col-xxsmall">ID</div>
                    <div className="table-cell-item col-large">Username</div>
                    <div className="table-cell-item col-large">Group</div>
                </div>
                {users_state.map((user, index) => (
                    <div key={index + 2000} className="table-row">
                        <input
                            type="checkbox"
                            checked={!!selectedUsers[user.id]}
                            onChange={() => handleUserCheckboxChange(user.id)}
                        />
                        <div className="table-cell-item col-xxsmall">{user.id}</div>
                        <div className="table-cell-item col-large">{user.username}</div>
                        <div className="table-cell-item col-large">{getGroupNameById(user.membership)}</div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Instr_StudentsTable;