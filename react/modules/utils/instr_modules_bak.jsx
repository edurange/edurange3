
import { UserShell, UserGroupShell, ScenarioGroupShell, ScenarioShell } from '@modules/shells/instructorData_shells';

function initializeData(input_groups, input_users, input_group_users, input_scenarios, input_scenario_groups) {

    // table for student groups, keyed by group ID
    // id |     name      | owner_id |   code   | hidden 

    function init_groups(input_groups) {
        const outputArray = [];
        // outputArray.push(new UserGroupShell());
        input_groups.forEach((group) => {
            outputArray.push(new UserGroupShell(group));
        });

        console.log ("Output from initUserGroups: ", outputArray)
        return outputArray;
    }

    // table for students, keyed by student ID
    // id |       username       |
    function init_users(input_users) {
        const tempUserArray = [];
        tempUserArray.push(new UserShell());
        if (input_users) {
            input_users.forEach(user => {
                tempUserArray.push(new UserShell(user));
            });
        };
        return tempUserArray;
    };

    // table for linking user_ids to group_ids
    // groups are dominant over users
    // each user appears only once, but group will appear once per user member

    // SELECT * FROM group_users;
    // id | user_id | group_id 

    function init_group_users(input_group_users) {
        const tempUserArray = [];
        tempUserArray.push(new UserShell());
        if (input_group_users) {
            input_group_users.forEach(user => {
                tempUserArray.push(new GroupUsersShell(user));
            });
        };
        return tempUserArray;
    };
    
    // table for scenarios, keyed by scenario ID
    //  id |  name   |  description  |    subnet    | owner_id | status | attempt |         created_at         
    function init_scenarios(input_scenarios) {
        const tempScenarioArray = [];
        tempScenarioArray.push(new ScenarioShell());
        if (input_scenarios) {
            input_scenarios.forEach(scenario => {
                tempScenarioArray.push(new ScenarioShell(scenario));
            });
        };
        return tempScenarioArray;
        
    };
    
    // establishes link between studentGroup IDs and scenario IDs
    // groups are the dominant partner scenarios are associated with
    // as opposed to groups being associated to scenarios

    // scenario_groups;
    //  id | group_id | scenario_id 
    function init_scenario_groups(input_scenario_groups) {
        const tempScenarioGroupArray = [];
        tempScenarioGroupArray.push(new ScenarioGroupShell());
        if (input_scenario_groups) {
            input_scenario_groups.forEach((scenarioGroup) => {
                tempScenarioGroupArray.push(new ScenarioGroupShell(scenarioGroup));
            });
        };
        return tempScenarioGroupArray;

    };

    const initialized_groups = init_groups(input_groups);
    const initialized_users = init_users(input_users);
    const initialized_group_users = init_group_users(input_group_users);
    const initialized_scenarios = init_scenarios(input_scenarios);
    const initialized_scenario_groups = init_scenario_groups(input_scenario_groups);

    const init_output = {
        users: initialized_users,
        groups: initialized_groups,
        group_users: initialized_group_users,
        scenarios: initialized_scenarios,
        scenario_groups: initialized_scenario_groups
    };
    return init_output;
};


function link_UsersAndGroups (users, user_groups, group_users) {

    // should go through and look at all of the user ids for each group, and each user
    // as well as the group_users to find the link between them.
    
    // populate each user_group with a new array of 'members' property that are the userID

    // in addition, add the ID of the group to each student with the property 'membership' (single int)

}

function link_GroupsAndScenarios (scenarios, user_groups, scenario_groups) {

    // similar to the other link function, this looks at the 3 arrays, then:
    // - populate each user_group with a list of 'members' that are the IDs of the scenarios assigned...
    //   indicated by the scenario_groups (use the id of the scenario and the user_groups supplied by scenario_groups)

    // additionally, add 'membership' property to the scenario, which is the ID of the group indicated by the scenario_groups

}

function assignGroupsToUsers(firstPassObj, originalObj) {
    const users = originalObj[0];
    const userGroupAssignments = originalObj[2];
    const outputObj = { ...firstPassObj };
    for (let user of outputObj.users) {
        user.userGroups_memberOf = [];
    };
    for (let assignment of userGroupAssignments) {
        const userId = assignment.user_id;
        const groupId = assignment.group_id;
        if (outputObj.users[userId]) {
            outputObj.users[userId].userGroups_memberOf.push(groupId);
        } else { console.warn(`User with id ${userId} not found.`); 
        };
    };
    return outputObj;
};

function assignUsersToGroups(firstPassObj, originalObj) {
    const outputObj = { ...firstPassObj };
    const userGroupAssignments = originalObj[2];
    for (let assignment of userGroupAssignments) {
        const userId = assignment.user_id;
        const groupId = assignment.group_id;
        if (outputObj.userGroups[groupId]) {
            if (!outputObj.userGroups[groupId].user_members.includes(userId)) {
                outputObj.userGroups[groupId].user_members.push(userId); 
            }
        } else { console.warn(`Group with id ${groupId} not found.`); 
        };
        
    };
    return outputObj;
}

function assignScenariosToGroups(newObject, inputObj) {
    const scenarioGroupAssignments = inputObj[4];
    const outputObj = { ...newObject };
    for (let assignment of scenarioGroupAssignments) {
        const studentGroupId = assignment.student_group_id;
        const scenarioGroupId = assignment.scenario_group_id;
        if (outputObj.userGroups[studentGroupId]) {
            outputObj.userGroups[studentGroupId].scenarios_memberOf.push(scenarioGroupId);
        } else { console.warn(`UserGroup with id ${studentGroupId} not found.`); 
        }
        if (outputObj.scenarioGroups[scenarioGroupId]) {
            outputObj.scenarioGroups[scenarioGroupId].studentGroup_members.push(studentGroupId)
        } else { console.warn(`ScenarioGroups with id ${scenarioGroupId} not found.`); 
        };
    };
    return outputObj;
};

function makeSecondPass(firstPassObj, originalObj) {
    const groupsAssignedToUsersObj = assignGroupsToUsers(firstPassObj, originalObj);
    const usersAssignedtoGroupsObj = assignUsersToGroups(groupsAssignedToUsersObj, originalObj);
    const scenariosAssignedToGroups = assignScenariosToGroups(usersAssignedtoGroupsObj, originalObj);
    return scenariosAssignedToGroups;
};

export function buildInstructorData(inputObj) {

    const users_arr = inputObj[0];
    const userGroups_arr = inputObj[1];
    const userGroupUsers_arr = inputObj[2];
    const scenarios_arr = inputObj[3];
    const scenarioStudentGroups_arr = inputObj[4];

    const {users, userGroups, scenarios, scenarioGroups} = initializeData(userGroups_arr, users_arr, userGroupUsers_arr, scenarios_arr, scenarioStudentGroups_arr)
    
    console.log ('NEW DATA OUTPUT: ', users, userGroups, scenarios, scenarioGroups)
    
    // if (inputObj) {
    //     console.log('buildInstData pre-first inputObj: ', inputObj)
    //     const firstPassOutput = makeFirstPass(inputObj);
    //     const secondPassOutput = makeSecondPass(firstPassOutput, inputObj);
    //     return secondPassOutput;
    // }
};
















// import { UserShell, UserGroupShell, ScenarioGroupShell, ScenarioShell } from '@modules/shells/instructorData_shells';

// function makeFirstPass(inputObj) {
//     function processUsers(inputData) {
//         return inputData.map(user => new UserShell(user));
//     }

//     function processUserGroups(inputData) {
//         return inputData.map(group => new UserGroupShell(group));
//     }

//     function processScenarios(inputData) {
//         return inputData.map(scenario => new ScenarioShell(scenario));
//     }

//     function processScenarioGroups(inputData) {
//         return inputData.map(scenarioGroup => new ScenarioGroupShell(scenarioGroup));
//     }

//     return {
//         users: processUsers(inputObj[0]),
//         userGroups: processUserGroups(inputObj[1]),
//         scenarios: processScenarios(inputObj[3]),
//         scenarioGroups: processScenarioGroups(inputObj[4])
//     };
// }

// function assignGroupsToUsers(firstPassObj, originalObj) {
//     const userGroupAssignments = originalObj[2];
//     const userMap = new Map(firstPassObj.users.map(user => [user.id, user]));

//     userGroupAssignments.forEach(assignment => {
//         const user = userMap.get(assignment.user_id);
//         if (user) {
//             user.userGroups_memberOf.push(assignment.group_id);
//         } else {
//             console.warn(`User with id ${assignment.user_id} not found.`);
//         }
//     });

//     return firstPassObj;
// }

// function assignUsersToGroups(firstPassObj, originalObj) {
//     const userGroupAssignments = originalObj[2];
//     const groupMap = new Map(firstPassObj.userGroups.map(group => [group.id, group]));

//     userGroupAssignments.forEach(assignment => {
//         const group = groupMap.get(assignment.group_id);
//         if (group) {
//             if (!group.user_members.includes(assignment.user_id)) {
//                 group.user_members.push(assignment.user_id);
//             }
//         } else {
//             console.warn(`Group with id ${assignment.group_id} not found.`);
//         }
//     });

//     return firstPassObj;
// }

// function assignScenariosToGroups(firstPassObj, originalObj) {
//     const scenarioGroupAssignments = originalObj[4];
//     const groupMap = new Map(firstPassObj.userGroups.map(group => [group.id, group]));
//     const scenarioGroupMap = new Map(firstPassObj.scenarioGroups.map(scenarioGroup => [scenarioGroup.id, scenarioGroup]));

//     scenarioGroupAssignments.forEach(assignment => {
//         const group = groupMap.get(assignment.student_group_id);
//         const scenarioGroup = scenarioGroupMap.get(assignment.scenario_group_id);

//         if (group) {
//             group.scenarios_memberOf.push(assignment.scenario_group_id);
//         } else {
//             console.warn(`UserGroup with id ${assignment.student_group_id} not found.`);
//         }

//         if (scenarioGroup) {
//             scenarioGroup.studentGroup_members.push(assignment.student_group_id);
//         } else {
//             console.warn(`ScenarioGroups with id ${assignment.scenario_group_id} not found.`);
//         }
//     });

//     return firstPassObj;
// }

// function makeSecondPass(firstPassObj, originalObj) {
//     return assignScenariosToGroups(
//         assignUsersToGroups(
//             assignGroupsToUsers(firstPassObj, originalObj),
//             originalObj
//         ),
//         originalObj
//     );
// }

// export function buildInstructorData(inputObj) {
//     if (inputObj) {
//         return makeSecondPass(makeFirstPass(inputObj), inputObj);
//     }
// }
