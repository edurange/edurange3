import React, { useState, useContext } from 'react';
import { InstructorRouter_context } from '../Instructor_router';

function EditUsers() {
    const { users_state, groups_state } = useContext(InstructorRouter_context);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [actionSelection, setActionSelection] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');

    const handleUserCheckboxChange = (userId) => {
        setSelectedUsers((prevSelectedUsers) => ({
            ...prevSelectedUsers,
            [userId]: !prevSelectedUsers[userId],
        }));
    };

    const handleSelectAllUsers = (event) => {
        const newSelectedUsers = {};
        users_state.forEach((user) => {
            newSelectedUsers[user.id] = event.target.checked;
        });
        setSelectedUsers(newSelectedUsers);
    };

    const areAllUsersSelected = users_state.length > 0 && Object.keys(selectedUsers).length === users_state.length && Object.values(selectedUsers).every((value) => value);

    const handleActionChange = (event) => {
        setActionSelection(event.target.value);
    };

    const handleGroupChange = (event) => {
        setSelectedGroup(event.target.value);
    };

    const handleUpdateDatabase = async () => {
        console.log('Updating database...');
    };

    return (
        <div>
            <div>
                <input type="checkbox" checked={areAllUsersSelected} onChange={handleSelectAllUsers} />
                Select All
            </div>
            {users_state.map((user) => (
                <div key={user.id}>
                    <input type="checkbox" checked={!!selectedUsers[user.id]} onChange={() => handleUserCheckboxChange(user.id)} />
                    {user.username}
                </div>
            ))}
            <select value={actionSelection} onChange={handleActionChange}>
                <option value="">Select Action</option>
                <option value="AssignToGroup">Assign to Group</option>
                <option value="ClearGroup">Clear Group</option>
                <option value="DeleteUser">Delete User</option>
            </select>
            {actionSelection === 'AssignToGroup' && (
                <select value={selectedGroup} onChange={handleGroupChange}>
                    <option value="">Select Group</option>
                    {groups_state.map((group) => (
                        <option key={group.id} value={group.name}>
                            {group.name}
                        </option>
                    ))}
                </select>
            )}
            <button onClick={handleUpdateDatabase}>Update Database</button>
        </div>
    );
}
export default EditUsers;