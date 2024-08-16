
import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { InstructorRouter_context } from '../Instructor_router';
import { HomeRouter_context } from '@pub/Home_router';
import '@assets/css/tables.css';
import { AppContext } from '../../../config/AxiosConfig';
import '../../../components/ListController.css';

function Instr_UsersTable() {

    const {
        desiredNavMetas_state, set_desiredNavMetas_state
    } = useContext(AppContext);
    const { 
        users_state, set_users_state, 
        groups_state, set_groups_state, 
        chatObjs_UL_state, channelAccess_state,
        logs_state
    } = useContext(InstructorRouter_context);

    const {
        userData_state
    } = useContext(HomeRouter_context);

    const [selectedUsers_state, set_selectedUsers_state] = useState({});
    const [actionSelection_state, set_actionSelection_state] = useState('');
    const [selectedGroupId_state, set_selectedGroupId_state] = useState('');
    const [buttonIsDisabled_state, set_buttonIsDisabled_state] = useState(true);

    const [sortingEnabled_state, set_sortingEnabled_state] = useState(true);

    // options:
    //  - new_responses
    //  - total_responses
    //  - new_cmds
    //  - total_cmds
    //  - new_msgs
    //  - total_msgs

    const cmd_logs = logs_state?.bash;
    const response_logs = logs_state?.responses;

    const [sortingType_state, set_sortingType_state] = useState('new_chats');

    console.log('UserTable logs_state: ',logs_state)

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
    
    async function clearGroups() {
        const usersToClear = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);

        try {
            const response = await axios.post('/clear_groups', {
                users_to_clear: usersToClear,
            });

            if (response.data.result === 'success') {
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
    }

    function handle_groupDetail_click(event, student) {
        set_desiredNavMetas_state([`/instructor/groups/${student.membership}`, 'dash']);
    }

    function compileMessages_byUser(user_id) {
        const userAllowed_chanID_intArr = channelAccess_state[user_id] ?? [];
        const userAllowed_messageObjs_arr = userAllowed_chanID_intArr.flatMap((allowed_channel_id) => {
            const filtered_messageObjs_arr = chatObjs_UL_state
                .filter((chat_obj) => chat_obj.channel_id === allowed_channel_id)
                .filter((chat_obj) => chat_obj.user_id !== userData_state.id);
            return filtered_messageObjs_arr;
        });
        return userAllowed_messageObjs_arr;
    }

    function compileCommands_byUser(user_id) {
        const user_cmdObjs_arr = cmd_logs
            .filter((cmd_obj) => cmd_obj.user_id === user_id);
        return user_cmdObjs_arr;
    };

    function sortUsers(users) {
        return users.slice().sort((a, b) => {
            const messagesA = compileMessages_byUser(a.id);
            const messagesB = compileMessages_byUser(b.id);

            const totalMessagesA = messagesA.length;
            const totalMessagesB = messagesB.length;

            const newMessagesA = messagesA.filter((msg) => {
                const dateString = msg.timestamp;
                const dateObject = new Date(dateString);
                const msg_timestamp_int = dateObject.getTime();

                return a.recent_reply < msg_timestamp_int && msg.user_id !== userData_state.id;
            }).length;

            const newMessagesB = messagesB.filter((msg) => {
                const dateString = msg.timestamp;
                const dateObject = new Date(dateString);
                const msg_timestamp_int = dateObject.getTime();

                return b.recent_reply < msg_timestamp_int && msg.user_id !== userData_state.id;
            }).length;

            if (sortingType_state === 'new') {
                return newMessagesB - newMessagesA;
            } else if (sortingType_state === 'total') {
                return totalMessagesB - totalMessagesA;
            }
            return 0;
        });
    }

    const sortedUsers = sortingEnabled_state ? sortUsers(users_state) : users_state;

    console.log('logs for userstable: ', logs_state)

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

            <div className="sorting-row">
                <div className="sort-checkbox">
                    <input
                        type="checkbox"
                        checked={sortingEnabled_state}
                        onChange={(event) => set_sortingEnabled_state(event.target.checked)}
                    />
                    <label>Enable Sorting</label>
                </div>
                <select value={sortingType_state} onChange={(event) => set_sortingType_state(event.target.value)}>
                    <option value="new">new msgs</option>
                    <option value="total">total msgs</option>
                    <option value="new">new cmds</option>
                    <option value="total">total cmds</option>
                    <option value="new">new responses</option>
                    <option value="total">total responses</option>
                </select>
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
                {sortedUsers.map((user, index) => {
                    const allowedMessages = compileMessages_byUser(user.id);
                    const allowedCmds = compileCommands_byUser(user.id);
                    const totalMessages = allowedMessages?.length ?? 0;
                    const newMessagesCount = (allowedMessages
                        .filter((msg) => {
                            const dateString = msg.timestamp;
                            const dateObject = new Date(dateString);
                            const msg_timestamp_int = dateObject.getTime();
                            
                            const recentReplyDate_int = user.recent_reply;
                        
                            return recentReplyDate_int < msg_timestamp_int;
                        })
                        .filter((msg) => msg.user_id !== userData_state.id)
                        .length) ?? 0;

                    const newBashCount = (allowedCmds
                        .filter((cmd) => {
                            const dateString = cmd.timestamp;
                            const dateObject = new Date(dateString);
                            const cmd_timestamp_int = dateObject.getTime();
                            
                            const cmdRestInt = user.recent_reply;
                        
                            return cmdRestInt < cmd_timestamp_int;
                        })
                        .filter((cmd) => cmd.user_id !== userData_state.id)
                        .length) ?? 0;

                    return (
                        <div key={index + 2000} className="table-row">
                            <div className="table-cell-item highlightable-cell col-xxsmall">
                                <div onClick={(event) => handleUserCheckboxChange(event, user.id)}>
                                    {user.id}
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers_state[user.id] || false}
                                        onChange={(event) => handleUserCheckboxChange(event, user.id)}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                </div>
                            </div>
                            <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_userDetail_click(event, user)}>{user.username}</div>
                            <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_groupDetail_click(event, user)}>{getGroupNameById(user.membership)}</div>
                            <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>
                                {allowedCmds?.length}(
                                    <span className='highlighter-orange'>
                                        {newBashCount}
                                    </span>
                                )
                            </div>
                            <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>
                                {totalMessages}(<span className='highlighter-orange'>{newMessagesCount}</span>)
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default Instr_UsersTable;


// import axios from 'axios';
// import React, { useContext, useState, useEffect } from 'react';
// import { InstructorRouter_context } from '../Instructor_router';
// import { HomeRouter_context } from '@pub/Home_router';
// import '@assets/css/tables.css';
// import { AppContext } from '../../../config/AxiosConfig';
// import '../../../components/ListController.css';

// function Instr_UsersTable() {

//     const {
//         desiredNavMetas_state, set_desiredNavMetas_state
//     } = useContext(AppContext);
//     const { 
//         users_state, set_users_state, 
//         groups_state, set_groups_state, 
//         chatObjs_UL_state, channelAccess_state
//     } = useContext(InstructorRouter_context);

//     const {
//         userData_state
//     } = useContext(HomeRouter_context);

//     const [selectedUsers_state, set_selectedUsers_state] = useState({});
//     const [actionSelection_state, set_actionSelection_state] = useState('');
//     const [selectedGroupId_state, set_selectedGroupId_state] = useState('');
//     const [buttonIsDisabled_state, set_buttonIsDisabled_state] = useState(true);

//     const [sortingEnabled_state, set_sortingEnabled_state] = useState(true);
//     const [sortingType_state, set_sortingType_state] = useState('new_chats')

//     useEffect(() => {
//         const isAnyUserSelected = Object.values(selectedUsers_state).some((isSelected) => isSelected);
//         const isGroupSelected = actionSelection_state === 'AssignToGroup' ? selectedGroupId_state !== '' : true;
//         set_buttonIsDisabled_state(!isAnyUserSelected || !isGroupSelected);
//     }, [selectedUsers_state, actionSelection_state, selectedGroupId_state]);

//     function handleUserCheckboxChange(event, userId) {
//         event.stopPropagation();
//         set_selectedUsers_state(prevSelectedUsers => ({
//             ...prevSelectedUsers,
//             [userId]: !prevSelectedUsers[userId],
//         }));
//     }


//     function handleSelectAllUsers() {
//         const newAreAllUsersSelected = !areAllUsersSelected;
//         const newSelectedUsers = {};
//         users_state.forEach((user) => {
//             newSelectedUsers[user.id] = newAreAllUsersSelected;
//         });
//         set_selectedUsers_state(newSelectedUsers);
//     }


//     const areAllUsersSelected =
//         users_state.length > 0 &&
//         Object.keys(selectedUsers_state).length === users_state.length &&
//         Object.values(selectedUsers_state).every((value) => value);

//     function handleActionChange(event) {
//         event.stopPropagation();
//         set_actionSelection_state(event.target.value);
//     }

//     function handleGroupSelectionChange(event) {
//         event.stopPropagation();
//         set_selectedGroupId_state(event.target.value);
//     }

//     async function handleUpdateDatabase(event) {
//         event.stopPropagation();
//         switch (actionSelection_state) {
//             case 'DeleteUser':
//                 await deleteUsers();
//                 break;
//             case 'AssignToGroup':
//                 await assignToGroup();
//                 break;
//             case 'ClearGroup':
//                 await clearGroups();
//                 break;
//             default:
//         }
//     }

//     async function deleteUsers() {
//         const usersToDelete = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);
//         try {
//             const response = await axios.post('/delete_users', {
//                 users_to_delete: usersToDelete,
//             });
//             if (response.data.result === 'success') {
//                 const remainingUsers = users_state.filter(
//                     (user) => !response.data.deleted_users.map(String).includes(String(user.id))
//                 );
//                 set_users_state(remainingUsers);
//             }
//         } catch (error) {
//             console.error('Error deleting users:', error);
//         }
//     }

//     async function assignToGroup() {
//         const usersToAssignIds = Object.keys(selectedUsers_state)
//             .filter((userId) => selectedUsers_state[userId])
//             .map((userId) => parseInt(userId, 10));

//         try {
//             const response = await axios.post('/assign_group_users', {
//                 group_id: parseInt(selectedGroupId_state, 10),
//                 users_to_assign: usersToAssignIds.map(id => ({ id })),
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.assigned_user_ids.includes(user.id)) {
//                         return { ...user, membership: parseInt(selectedGroupId_state, 10) };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);

//                 const updatedGroupsState = groups_state.map(group => {
//                     if (group.id === parseInt(selectedGroupId_state, 10)) {
//                         const currentGroupUserIds = new Set(group.users.map(user => user.id));
//                         response.data.assigned_user_ids.forEach(id => currentGroupUserIds.add(id));
//                         const updatedUsers = Array.from(currentGroupUserIds).map(id => updatedUsersState.find(user => user.id === id));
//                         return { ...group, users: updatedUsers };
//                     }
//                     return group;
//                 });
//                 set_groups_state(updatedGroupsState);
//             } else {
//                 console.error('Error assigning users to group:', response.data.message);
//             }
//         } catch (error) {
//             console.error('Error assigning users to group:', error);
//         }
//     }
    
//     async function assignToGroup() {
//         const usersToAssignIds = Object.keys(selectedUsers_state)
//             .filter((userId) => selectedUsers_state[userId])
//             .map((userId) => parseInt(userId, 10));

//         try {
//             const response = await axios.post('/assign_group_users', {
//                 group_id: parseInt(selectedGroupId_state, 10),
//                 users_to_assign: usersToAssignIds.map(id => ({ id })),
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.assigned_user_ids.includes(user.id)) {
//                         return { ...user, membership: parseInt(selectedGroupId_state, 10) };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);
//                 const updatedGroupsState = groups_state.map(group => {

//                     const groupUserIds = new Set(group.users.map(user => user.id));

//                     if (group.id === parseInt(selectedGroupId_state, 10)) {
//                         response.data.assigned_user_ids.forEach(id => groupUserIds.add(id));
//                     } else {
//                         response.data.assigned_user_ids.forEach(id => groupUserIds.delete(id));
//                     }

//                     const updatedUsers = Array.from(groupUserIds).map(id => users_state.find(user => user.id === id));

//                     return { ...group, users: updatedUsers };
//                 });
//                 set_groups_state(updatedGroupsState);


//             } else {
//                 console.error('Error assigning users to group:', response.data.message);
//             }
//         } catch (error) {
//             console.error('Error assigning users to group:', error);
//         }
//     }


//     async function clearGroups() {
//         const usersToClear = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);

//         try {
//             const response = await axios.post('/clear_groups', {
//                 users_to_clear: usersToClear,
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.cleared_user_ids.includes(user.id)) {
//                         return { ...user, membership: null };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);

//                 const updatedGroupsState = groups_state.map(group => {
//                     const updatedUsers = group.users.filter(userId => !response.data.cleared_user_ids.includes(userId));
//                     return { ...group, users: updatedUsers };
//                 });
//                 set_groups_state(updatedGroupsState);
//             } else {
//                 console.error('Error clearing users from groups');
//             }
//         } catch (error) {
//             console.error('Error clearing users from groups:', error);
//         }
//     }
//     function getGroupNameById(groupId) {
//         const group = groups_state.find((group) => group.id === groupId);
//         return group ? group.name : 'none';
//     }
//     function handle_userDetail_click(event, student) {
//         set_desiredNavMetas_state([`/instructor/students/${student.id}`, 'dash']);
//     };
//     function handle_groupDetail_click(event, student) {
//         set_desiredNavMetas_state([`/instructor/groups/${student.membership}`, 'dash']);
//     };

//     if (!chatObjs_UL_state || !channelAccess_state || !userData_state) {return}

//     function compileMessages_byUser(user_id) {

//         const userAllowed_chanID_intArr = channelAccess_state[user_id] ?? [];
//         const userAllowed_messageObjs_arr = userAllowed_chanID_intArr.flatMap((allowed_channel_id) => {
//             const filtered_messageObjs_arr = chatObjs_UL_state
//                 .filter(( chat_obj ) => chat_obj.channel_id === allowed_channel_id)
//                 .filter(( chat_obj ) => chat_obj.user_id !== userData_state.id)
//             console.log ('FMO_ARR: ', filtered_messageObjs_arr)
//             return filtered_messageObjs_arr
//         });
        
//         return userAllowed_messageObjs_arr;
//     }
    

//     return (
//         <>
//             <div className="create-frame">
//                 <div className="create-group-row">
//                     <select className="create-dropdown" value={actionSelection_state} onChange={handleActionChange}>
//                         <option value="">Select Action</option>
//                         <option value="AssignToGroup">Assign to Group</option>
//                         <option value="ClearGroup">Clear Group</option>
//                         <option value="DeleteUser">Delete User</option>
//                     </select>
//                     {actionSelection_state === 'AssignToGroup' && (
//                         <select className="create-dropdown" value={selectedGroupId_state} onChange={handleGroupSelectionChange}>
//                             <option value="">Select Group</option>
//                             {groups_state
//                                 .filter(group => group.name !== 'ALL')
//                                 .map((group) => (
//                                     <option key={group.id} value={group.id}>
//                                         {group.name}
//                                     </option>
//                                 ))}
//                         </select>
//                     )}
//                     <div className="row-btns">
//                         <button
//                             onClick={handleUpdateDatabase}
//                             className={`row-btn ${buttonIsDisabled_state ? 'btn-disabled' : 'green-btn submit-btn'}`}
//                             disabled={buttonIsDisabled_state}
//                             >
//                             Update Database
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* <div> Sort Students </div> */}
//             <div className='sorting-row'>

//                 <div className="sort-checkbox">
//                     <input 
//                         type="checkbox" 
//                         checked={sortingEnabled_state} 
//                         onChange={(event) => set_sortingEnabled_state(event.target.checked)} 
//                         />
//                     <label>Enable Sorting</label>
//                 </div>
//                 <select value={sortingType_state} onChange={(event) => set_sortingType_state(event.target.value)}>
//                         <option value="new">new msgs</option>
//                         <option value="total">total msgs</option>
//                 </select>
//             </div>

//             <div className="table-frame">
//                 <div className="table-header">
//                     <div onClick={handleSelectAllUsers} className="table-cell-item highlightable-cell col-xxsmall">
//                         ID
//                         <input type="checkbox" checked={areAllUsersSelected} readOnly />
//                     </div>
//                     <div className="table-header-item col-large">Username</div>
//                     <div className="table-header-item col-large">Group</div>
//                     <div className="table-cell-item highlightable-cell col-small">Cmds</div>
//                     <div className="table-cell-item highlightable-cell col-small">Chats</div>
//                 </div>
//                 {users_state.map((user, index) => {
//                     const allowedMessages = compileMessages_byUser(user.id)
//                     const totalMessages = allowedMessages?.length ?? 0;
//                     const newMessagesCount = (allowedMessages
//                         .filter(msg => {

//                             const dateString = msg.timestamp;
//                             const dateObject = new Date(dateString);
//                             const msg_timestamp_int = dateObject.getTime();
                            
//                             const recentReplyDate_int = user.recent_reply;
                        
//                             return recentReplyDate_int < msg_timestamp_int;
//                         })
//                         .filter((msg) => msg.user_id !== userData_state.id)
//                         .length) ?? 0;

//                     return (
//                         <div key={index + 2000} className="table-row">
//                             <div className="table-cell-item highlightable-cell col-xxsmall">
//                                 <div onClick={(event) => handleUserCheckboxChange(event, user.id)}>
//                                     {user.id}
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedUsers_state[user.id] || false}
//                                         onChange={(event) => handleUserCheckboxChange(event, user.id)}
//                                         onClick={(event) => event.stopPropagation()}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_userDetail_click(event, user)}>{user.username}</div>
//                             <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_groupDetail_click(event, user)}>{getGroupNameById(user.membership)}</div>
//                             <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>N/A(<span className='highlighter-orange'>N/A</span>)</div>
//                             <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>
//                                 {totalMessages}(<span className='highlighter-orange'>{newMessagesCount}</span>)
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </>
//     );
// }

// export default Instr_UsersTable;

// import axios from 'axios';
// import React, { useContext, useState, useEffect } from 'react';
// import { InstructorRouter_context } from '../Instructor_router';
// import { HomeRouter_context } from '@pub/Home_router';
// import '@assets/css/tables.css';
// import { AppContext } from '../../../config/AxiosConfig';

// function Instr_UsersTable() {

//     const {
//         desiredNavMetas_state, set_desiredNavMetas_state
//     } = useContext(AppContext);
//     const { 
//         users_state, set_users_state, 
//         groups_state, set_groups_state, 
//         chatObjs_UL_state, channelAccess_state
//     } = useContext(InstructorRouter_context);

//     const {
//         userData_state
//     } = useContext(HomeRouter_context);

//     const [selectedUsers_state, set_selectedUsers_state] = useState({});
//     const [actionSelection_state, set_actionSelection_state] = useState('');
//     const [selectedGroupId_state, set_selectedGroupId_state] = useState('');
//     const [buttonIsDisabled_state, set_buttonIsDisabled_state] = useState(true);

//     const [sortingEnabled_state, set_sortingEnabled_state] = useState(true);
//     const [sortingType_state, set_sortingType_state] = useState('new_chats')

//     useEffect(() => {
//         const isAnyUserSelected = Object.values(selectedUsers_state).some((isSelected) => isSelected);
//         const isGroupSelected = actionSelection_state === 'AssignToGroup' ? selectedGroupId_state !== '' : true;
//         set_buttonIsDisabled_state(!isAnyUserSelected || !isGroupSelected);
//     }, [selectedUsers_state, actionSelection_state, selectedGroupId_state]);

//     function handleUserCheckboxChange(event, userId) {
//         event.stopPropagation();
//         set_selectedUsers_state(prevSelectedUsers => ({
//             ...prevSelectedUsers,
//             [userId]: !prevSelectedUsers[userId],
//         }));
//     }


//     function handleSelectAllUsers() {
//         const newAreAllUsersSelected = !areAllUsersSelected;
//         const newSelectedUsers = {};
//         users_state.forEach((user) => {
//             newSelectedUsers[user.id] = newAreAllUsersSelected;
//         });
//         set_selectedUsers_state(newSelectedUsers);
//     }


//     const areAllUsersSelected =
//         users_state.length > 0 &&
//         Object.keys(selectedUsers_state).length === users_state.length &&
//         Object.values(selectedUsers_state).every((value) => value);

//     function handleActionChange(event) {
//         event.stopPropagation();
//         set_actionSelection_state(event.target.value);
//     }

//     function handleGroupSelectionChange(event) {
//         event.stopPropagation();
//         set_selectedGroupId_state(event.target.value);
//     }

//     async function handleUpdateDatabase(event) {
//         event.stopPropagation();
//         switch (actionSelection_state) {
//             case 'DeleteUser':
//                 await deleteUsers();
//                 break;
//             case 'AssignToGroup':
//                 await assignToGroup();
//                 break;
//             case 'ClearGroup':
//                 await clearGroups();
//                 break;
//             default:
//         }
//     }

//     async function deleteUsers() {
//         const usersToDelete = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);
//         try {
//             const response = await axios.post('/delete_users', {
//                 users_to_delete: usersToDelete,
//             });
//             if (response.data.result === 'success') {
//                 const remainingUsers = users_state.filter(
//                     (user) => !response.data.deleted_users.map(String).includes(String(user.id))
//                 );
//                 set_users_state(remainingUsers);
//             }
//         } catch (error) {
//             console.error('Error deleting users:', error);
//         }
//     }

//     async function assignToGroup() {
//         const usersToAssignIds = Object.keys(selectedUsers_state)
//             .filter((userId) => selectedUsers_state[userId])
//             .map((userId) => parseInt(userId, 10));

//         try {
//             const response = await axios.post('/assign_group_users', {
//                 group_id: parseInt(selectedGroupId_state, 10),
//                 users_to_assign: usersToAssignIds.map(id => ({ id })),
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.assigned_user_ids.includes(user.id)) {
//                         return { ...user, membership: parseInt(selectedGroupId_state, 10) };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);

//                 const updatedGroupsState = groups_state.map(group => {
//                     if (group.id === parseInt(selectedGroupId_state, 10)) {
//                         const currentGroupUserIds = new Set(group.users.map(user => user.id));
//                         response.data.assigned_user_ids.forEach(id => currentGroupUserIds.add(id));
//                         const updatedUsers = Array.from(currentGroupUserIds).map(id => updatedUsersState.find(user => user.id === id));
//                         return { ...group, users: updatedUsers };
//                     }
//                     return group;
//                 });
//                 set_groups_state(updatedGroupsState);
//             } else {
//                 console.error('Error assigning users to group:', response.data.message);
//             }
//         } catch (error) {
//             console.error('Error assigning users to group:', error);
//         }
//     }
    
//     async function assignToGroup() {
//         const usersToAssignIds = Object.keys(selectedUsers_state)
//             .filter((userId) => selectedUsers_state[userId])
//             .map((userId) => parseInt(userId, 10));

//         try {
//             const response = await axios.post('/assign_group_users', {
//                 group_id: parseInt(selectedGroupId_state, 10),
//                 users_to_assign: usersToAssignIds.map(id => ({ id })),
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.assigned_user_ids.includes(user.id)) {
//                         return { ...user, membership: parseInt(selectedGroupId_state, 10) };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);
//                 const updatedGroupsState = groups_state.map(group => {

//                     const groupUserIds = new Set(group.users.map(user => user.id));

//                     if (group.id === parseInt(selectedGroupId_state, 10)) {
//                         response.data.assigned_user_ids.forEach(id => groupUserIds.add(id));
//                     } else {
//                         response.data.assigned_user_ids.forEach(id => groupUserIds.delete(id));
//                     }

//                     const updatedUsers = Array.from(groupUserIds).map(id => users_state.find(user => user.id === id));

//                     return { ...group, users: updatedUsers };
//                 });
//                 set_groups_state(updatedGroupsState);


//             } else {
//                 console.error('Error assigning users to group:', response.data.message);
//             }
//         } catch (error) {
//             console.error('Error assigning users to group:', error);
//         }
//     }


//     async function clearGroups() {
//         const usersToClear = Object.keys(selectedUsers_state).filter((userId) => selectedUsers_state[userId]);

//         try {
//             const response = await axios.post('/clear_groups', {
//                 users_to_clear: usersToClear,
//             });

//             if (response.data.result === 'success') {
//                 const updatedUsersState = users_state.map(user => {
//                     if (response.data.cleared_user_ids.includes(user.id)) {
//                         return { ...user, membership: null };
//                     }
//                     return user;
//                 });
//                 set_users_state(updatedUsersState);

//                 const updatedGroupsState = groups_state.map(group => {
//                     const updatedUsers = group.users.filter(userId => !response.data.cleared_user_ids.includes(userId));
//                     return { ...group, users: updatedUsers };
//                 });
//                 set_groups_state(updatedGroupsState);
//             } else {
//                 console.error('Error clearing users from groups');
//             }
//         } catch (error) {
//             console.error('Error clearing users from groups:', error);
//         }
//     }
//     function getGroupNameById(groupId) {
//         const group = groups_state.find((group) => group.id === groupId);
//         return group ? group.name : 'none';
//     }
//     function handle_userDetail_click(event, student) {
//         set_desiredNavMetas_state([`/instructor/students/${student.id}`, 'dash']);
//     };
//     function handle_groupDetail_click(event, student) {
//         set_desiredNavMetas_state([`/instructor/groups/${student.membership}`, 'dash']);
//     };

//     if (!chatObjs_UL_state || !channelAccess_state || !userData_state) {return}

//     function compileMessages_byUser(user_id) {

//         const userAllowed_chanID_intArr = channelAccess_state[user_id] ?? [];
//         const userAllowed_messageObjs_arr = userAllowed_chanID_intArr.flatMap((allowed_channel_id) => {
//             const filtered_messageObjs_arr = chatObjs_UL_state
//                 .filter(( chat_obj ) => chat_obj.channel_id === allowed_channel_id)
//                 .filter(( chat_obj ) => chat_obj.user_id !== userData_state.id)
//             console.log ('FMO_ARR: ', filtered_messageObjs_arr)
//             return filtered_messageObjs_arr
//         });
        
//         return userAllowed_messageObjs_arr;
//     }
    

//     return (
//         <>
//             <div className="create-frame">
//                 <div className="create-group-row">
//                     <select className="create-dropdown" value={actionSelection_state} onChange={handleActionChange}>
//                         <option value="">Select Action</option>
//                         <option value="AssignToGroup">Assign to Group</option>
//                         <option value="ClearGroup">Clear Group</option>
//                         <option value="DeleteUser">Delete User</option>
//                     </select>
//                     {actionSelection_state === 'AssignToGroup' && (
//                         <select className="create-dropdown" value={selectedGroupId_state} onChange={handleGroupSelectionChange}>
//                             <option value="">Select Group</option>
//                             {groups_state
//                                 .filter(group => group.name !== 'ALL')
//                                 .map((group) => (
//                                     <option key={group.id} value={group.id}>
//                                         {group.name}
//                                     </option>
//                                 ))}
//                         </select>
//                     )}
//                     <div className="row-btns">
//                         <button
//                             onClick={handleUpdateDatabase}
//                             className={`row-btn ${buttonIsDisabled_state ? 'btn-disabled' : 'green-btn submit-btn'}`}
//                             disabled={buttonIsDisabled_state}
//                             >
//                             Update Database
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div> Sort Students </div>
//             <div> Add checkbox here, onselect update sortingEnabled_state</div>

//             <div className="table-frame">
//                 <div className="table-header">
//                     <div onClick={handleSelectAllUsers} className="table-cell-item highlightable-cell col-xxsmall">
//                         ID
//                         <input type="checkbox" checked={areAllUsersSelected} readOnly />
//                     </div>
//                     <div className="table-header-item col-large">Username</div>
//                     <div className="table-header-item col-large">Group</div>
//                     <div className="table-cell-item highlightable-cell col-small">Cmds</div>
//                     <div className="table-cell-item highlightable-cell col-small">Chats</div>
//                 </div>
//                 {users_state.map((user, index) => {
//                     const allowedMessages = compileMessages_byUser(user.id)
//                     const totalMessages = allowedMessages?.length ?? 0;
//                     const newMessagesCount = (allowedMessages
//                         .filter(msg => {

//                             const dateString = msg.timestamp;
//                             const dateObject = new Date(dateString);
//                             const msg_timestamp_int = dateObject.getTime();
                            
//                             const recentReplyDate_int = user.recent_reply;
                        
//                             return recentReplyDate_int < msg_timestamp_int;
//                         })
//                         .filter((msg) => msg.user_id !== userData_state.id)
//                         .length) ?? 0;

//                     return (
//                         <div key={index + 2000} className="table-row">
//                             <div className="table-cell-item highlightable-cell col-xxsmall">
//                                 <div onClick={(event) => handleUserCheckboxChange(event, user.id)}>
//                                     {user.id}
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedUsers_state[user.id] || false}
//                                         onChange={(event) => handleUserCheckboxChange(event, user.id)}
//                                         onClick={(event) => event.stopPropagation()}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_userDetail_click(event, user)}>{user.username}</div>
//                             <div className="table-cell-item highlightable-cell col-large" onClick={(event) => handle_groupDetail_click(event, user)}>{getGroupNameById(user.membership)}</div>
//                             <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>N/A(<span className='highlighter-orange'>N/A</span>)</div>
//                             <div className="table-cell-item highlightable-cell col-small" onClick={(event) => handle_userDetail_click(event, user)}>
//                                 {totalMessages}(<span className='highlighter-orange'>{newMessagesCount}</span>)
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </>
//     );
// }

// export default Instr_UsersTable;