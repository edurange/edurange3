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