
import { UserShell, UserGroupShell, ScenarioGroupShell, ScenarioShell } from '@modules/shells/instructorData_shells';

function makeFirstPass(inputObj) {
    function processUsers(inputData) {
        const inputUserArray = inputData[0];
        const tempUserArray = [];
        tempUserArray.push(new UserShell());
        if (inputUserArray) {
            inputUserArray.forEach(user => {
                const currentUser = new UserShell(user)
                tempUserArray.push(currentUser);
            });
        };
        return tempUserArray;
    };

    function processUserGroups(inputData) {
        const outputArray = [];
        outputArray.push(new UserGroupShell());
        inputData.forEach((group) => {
            const tempGroup = new UserGroupShell(group);
            outputArray.push(new UserGroupShell(group));
        });
        return outputArray;
    }

    function processScenarios(inputData) {
        const inputScenarioArray = inputData[3];
        const tempScenarioArray = [];
        tempScenarioArray.push(new ScenarioShell());
        if (inputScenarioArray) {
            inputScenarioArray.forEach(scenario => {
                const currentScenario = new ScenarioShell(scenario)
                tempScenarioArray.push(currentScenario);
            });
        };
        return tempScenarioArray;

    };
    function processScenarioGroups(inputData) {
        const inputScenarioGroupArray = inputData[4];
        const tempScenarioGroupArray = [];
        tempScenarioGroupArray.push(new ScenarioGroupShell());
        if (inputScenarioGroupArray) {
            inputScenarioGroupArray.forEach((scenarioGroup) => {
                const currentScenarioGroup = new ScenarioGroupShell(scenarioGroup)
                tempScenarioGroupArray.push(currentScenarioGroup);
            });
        };
        return tempScenarioGroupArray;

    };
    const processedUsers = processUsers(inputObj);
    const processedUserGroups = processUserGroups(inputObj[1]);
    const processedScenarios = processScenarios(inputObj);
    const processedScenarioGroups = processScenarioGroups(inputObj);
    const firstPassOutput = {
        users: processedUsers,
        userGroups: processedUserGroups,
        scenarios: processedScenarios,
        scenarioGroups: processedScenarioGroups
    };
    return firstPassOutput;
};

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
        } else { console.warn(`ScenarioGroup with id ${scenarioGroupId} not found.`); 
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
    if (inputObj) {
        const firstPassOutput = makeFirstPass(inputObj);
        const secondPassOutput = makeSecondPass(firstPassOutput, inputObj);
        return secondPassOutput;
    }
};