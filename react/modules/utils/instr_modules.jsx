
// import { UsersShell, UserGroupsShell, ScenarioGroupsShell, ScenariosShell, GroupUsersShell } from '@modules/shells/instructorData_shells';

// under construction 

function assignUserRole(inputData) {
    if (inputData.is_admin) { return 'Administrator' }
    else if (inputData.is_instructor) { return 'Instructor' }
    else { return 'Student' }
};

const formatDate = (inputDate) => {
    const dateToprocess = new Date(inputDate) ?? new Date('Dec 25, -0001');
    const month = String(dateToprocess.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dateToprocess.getDate()).padStart(2, '0');
    const year = String(dateToprocess.getFullYear()).slice(-2); // Get the last 2 characters of the year
    const hours = String(dateToprocess.getHours()).padStart(2, '0');
    const minutes = String(dateToprocess.getMinutes()).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}`;
};

export class UsersShell {
    constructor(input = {}) {
        this.id = input.id ?? 'none';
        this.username = input.username ?? 'none';
        this.role = input.username ? assignUserRole(input) : 'none'; // assigns role if user exists, otherwise 'none'
        this.is_active = input.active || false;
        this.groups_membership = input.membership ?? undefined; // user group membership (single int of group id)
        this.created_at = formatDate (input.created_at) ?? 'none';
    };
};

// id |     name      | owner_id |   code   | hidden 
export class UserGroupsShell {
    constructor(input = {}) {
        this.id = input.id;
        this.name = input.name;
        this.owner_id = input.owner_id;
        this.code = input.code;
        this.hidden = input.hidden || true;

        this.users_members = input.users_members ?? [];
        this.scenarios_members = input.scenarios_members ?? [];
    };
};

//  id |  name   |  description  |    subnet    | owner_id | status | attempt |         created_at         
export class ScenariosShell {
    constructor(input = {}) {
        this.id = input.id;
        this.name = input.name;
        this.description = input.description;
        this.subnet = input.subnet;
        this.owner_id = input.owner_id;
        this.status = input.status;
        this.attempt = input.attempt;
        this.created_at = formatDate(input.created_at);
        this.groups_membership = input.groups_membership; // single Int for group id
    };
};

// table for linking scenario_ids to group_ids
//  id | group_id | scenario_id 
export class ScenarioGroupsShell {
    constructor(input = {}) {
        this.id = input.id;
        this.group_id = input.group_id;
        this.scenario_id = input.scenario_id;
    };
};

// table for linking user_ids to group_ids
// id | user_id | group_id 
export class GroupUsersShell {
    constructor(input = {}) {
        this.id = input.id;
        this.user_id = input.user_id;
        this.group_id = input.group_id;
    };
};

function initializeData(input_groups, input_users, input_group_users, input_scenarios, input_scenario_groups) {

    // table for student groups, keyed by group ID
    // id |     name      | owner_id |   code   | hidden 

    function init_groups(input_groups) {
        const outputArray = [];
        // outputArray.push(new UserGroupsShell());
        input_groups.forEach((group) => {
            outputArray.push(new UserGroupsShell(group));
        });

        console.log ("Output from initUserGroups: ", outputArray)
        return outputArray;
    }

    // table for students, keyed by student ID
    // id |       username       |
    function init_users(input_users) {
        const tempUserArray = [];
        tempUserArray.push(new UsersShell());
        if (input_users) {
            input_users.forEach(user => {
                tempUserArray.push(new UsersShell(user));
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
        tempUserArray.push(new UsersShell());
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
        tempScenarioArray.push(new ScenariosShell());
        if (input_scenarios) {
            input_scenarios.forEach(scenario => {
                tempScenarioArray.push(new ScenariosShell(scenario));
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
        tempScenarioGroupArray.push(new ScenarioGroupsShell());
        if (input_scenario_groups) {
            input_scenario_groups.forEach((scenarioGroup) => {
                tempScenarioGroupArray.push(new ScenarioGroupsShell(scenarioGroup));
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


function link_UsersAndGroups(users, groups, group_users) {
    // Initialize 'members' array for each group
    groups.forEach(group => {
        group.members = [];
    });

    // Initialize 'membership' for each user
    users.forEach(user => {
        user.membership = null;
    });

    // Populate 'members' in groups and 'membership' in users
    group_users.forEach(group_user => {
        const group = groups.find(group => group.id === group_user.group_id);
        const user = users.find(user => user.id === group_user.user_id);

        if (group && user) {
            group.members.push(user.id);
            user.membership = group.id;
        }
    });
}

function link_GroupsAndScenarios(scenarios, groups, scenario_groups) {
    // Initialize 'scenarios' array for each group
    groups.forEach(group => {
        group.scenarios = [];
    });

    // Initialize 'membership' for each scenario
    scenarios.forEach(scenario => {
        scenario.membership = null;
    });

    // Populate 'scenarios' in groups and 'membership' in scenarios
    scenario_groups.forEach(scenario_group => {
        const group = groups.find(group => group.id === scenario_group.group_id);
        const scenario = scenarios.find(scenario => scenario.id === scenario_group.scenario_id);

        if (group && scenario) {
            group.scenarios.push(scenario.id);
            scenario.membership = group.id;
        }
    });
}


export function buildInstructorData(inputObj) {

    const users_arr = inputObj[0];
    const userGroups_arr = inputObj[1];
    const userGroupUsers_arr = inputObj[2];
    const scenarios_arr = inputObj[3];
    const scenarioStudentGroups_arr = inputObj[4];
    
    const initData = initializeData(userGroups_arr, users_arr, userGroupUsers_arr, scenarios_arr, scenarioStudentGroups_arr);

    link_UsersAndGroups(initData.users, initData.groups, initData.group_users);
    link_GroupsAndScenarios(initData.scenarios, initData.groups, initData.scenario_groups);

    console.log ('NEW DATA OUTPUT: ', initData)

    return initData;
};
















// import { UsersShell, UserGroupsShell, ScenarioGroupsShell, ScenariosShell } from '@modules/shells/instructorData_shells';

// function makeFirstPass(inputObj) {
//     function processUsers(inputData) {
//         return inputData.map(user => new UsersShell(user));
//     }

//     function processUserGroups(inputData) {
//         return inputData.map(group => new UserGroupsShell(group));
//     }

//     function processScenarios(inputData) {
//         return inputData.map(scenario => new ScenariosShell(scenario));
//     }

//     function processScenarioGroups(inputData) {
//         return inputData.map(scenarioGroup => new ScenarioGroupsShell(scenarioGroup));
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
