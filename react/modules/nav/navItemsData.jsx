
// these are used by some menus to define what their label, icon, and link path should be
// at the bottom, arrays define which items should be displayed in which contexts
// you can simply add some more and use them as you wish

// the navStub is used by Home_router.js and Dashboard_router.js (among others)
// to determine which set of navigation items to show upon navigation
// by inserting the stub into a dict reference in order to point to a given navArray (at bottom)

// the array of nav objects is then passed to Frame_head or Frame_side as a prop.

import edurange_icons from "../ui/edurangeIcons";

// PUBLIC
const home = {
    title: "Home",
    icon: edurange_icons.home,
    path: `/`,
    navStub: 'home'
};
const login = {
    title: "Login",
    icon: edurange_icons.user_check,
    path: `/login`,
    navStub: 'home'
};
const info_home = {
    title: "Info",
    icon: edurange_icons.book,
    path: `/info`,
    navStub: 'home'
};
const docs = {
    title: "Docs",
    icon: edurange_icons.book,
    path: `/info/docs`,
    navStub: 'home'
};
const about = {
    title: "About",
    icon: edurange_icons.book,
    path: `/info/about`,
    navStub: 'home'
};
const contact = {
    title: "Contact",
    icon: edurange_icons.book,
    path: `/info/contact`,
    navStub: 'home'
};
const help = {
    title: "Help",
    icon: edurange_icons.questionmark,
    path: `/info/help`,
    navStub: 'home'
};
const options = {
    title: "Options",
    icon: edurange_icons.gear,
    path: `/options`,
    navStub: 'options'
};
const themes = {
    title: "Themes",
    icon: edurange_icons.palette,
    path: `/options/themes`,
    navStub: 'options'
};
const accessibility = {
    title: "Accessibility",
    icon: edurange_icons.accessibility,
    path: `/options/accessibility`,
    navStub: 'options'
};

// LOGGED-IN-ONLY
const logout = {
    title: "Logout",
    icon: edurange_icons.user_x,
    path: `/logout`,
    navStub: 'home'
};
const account = {
    title: "Account",
    icon: edurange_icons.account,
    path: `/account`,
    navStub: 'dash'
};
const scenarios = {
    title: "Scenarios",
    icon: edurange_icons.chess_knight,
    path: `/scenarios`,
    navStub: 'dash'
};
const notifications = {
    title: "Notifications",
    icon: edurange_icons.bell,
    path: `/notifications`,
    navStub: 'dash'
};

// INSTRUCTOR ONLY
const staff = {
    title: "Dashboard",
    icon: edurange_icons.wizardHat,
    path: `/staff`,
    navStub: 'dash'
};
const studentGroups = {
    title: "Groups",
    icon: edurange_icons.userGroup,
    path: `/staff/groups`,
    navStub: 'dash'
};
const scenarioGroups = {
    title: "Scenario Groups",
    icon: edurange_icons.scenarioGroup,
    path: `/staff/scenarioGroups`,
    navStub: 'dash'
};
const students = {
    title: "Students",
    icon: edurange_icons.user,
    path: `/staff/students`,
    navStub: 'dash'
};
const staff_scenarios = {
    title: "Scenarios",
    icon: edurange_icons.chess_knight,
    path: `/staff/scenarios`,
    navStub: 'dash'
};
const panopticon = {
    title: "Panopticon",
    icon: edurange_icons.tower,
    path: `/staff/panopticon`,
    navStub: 'dash'
};
const logs = {
    title: "Logs",
    icon: edurange_icons.book,
    path: `/staff/logs`,
    navStub: 'dash'
};
const staff_hints = {
    title: "Hints",
    icon: edurange_icons.light_bulb,
    path: `/staff/hints`,
    navStub: 'dash'
};
const student_hint = {
    title: "Hints",
    icon: edurange_icons.light_bulb,
    path: `/hints`,
    navStub: 'guide'
};

const issues = {
    title: "Issues",
    icon: edurange_icons.gitHub,
    path: `https://github.com/edurange/edurange3/issues`,
    navStub: 'dash',
    external: true
};

const feedback = {
    title: "Feedback",
    icon: edurange_icons.form,
    path: `/feedback`,
    navStub: 'dash',
};

const ta_assignments = {
    title: "TAs",
    icon: edurange_icons.ta_assignments,
    path: `/tas`,
    navStub: 'dash',
};

const ta_chat = {
    title: "TA Chat",
    icon: edurange_icons.chatBubble,
    path: `/staff/ta_chat`,
    navStub: 'dash',
};


export const navArrays = {

    logout: {
        home: {
            top: [feedback, login],
            side: [login, issues]
        },
    },

    student: {
        home: {
            top: [feedback, scenarios, logout],
            side: [scenarios, issues, logout]
        },
        dash: {
            top: [feedback, home, scenarios, logout],
            side: [scenarios, issues, logout]
        },
        account: {
            top: [feedback, scenarios, logout],
            side: [scenarios, issues, logout]
        },
        // only exists in the context of a specific scenario
        // e.g. /dashboard/scenarios/5
        guide: {
            top: [feedback, scenarios, logout],
            side: [scenarios, student_hint, issues, logout]
        }
    },

    staff: {
        home: {
            top: [feedback, home, staff, logout],
            side: [staff, issues, logout]
        },
        dash: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, ta_chat, staff_hints, logs, issues]
        },
        account: {
            top: [feedback, staff, logout],
            side: [staff, issues, logout]
        },
        scenarios: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]
        },
        students: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]
        },
        student_groups: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]
        },
        scenario_groups: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]
        },
    },

    admin: {
        home: {
            top: [feedback, home, staff, logout],
            side: [staff, issues, logout]
        },
        dash: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, panopticon, ta_chat, staff_hints, logs, issues]
        },
        account: {
            top: [feedback, staff, logout],
            side: [staff, issues, logout]
        },
        scenarios: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]

        },
        students: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]

        },
        student_groups: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]

        },
        scenario_groups: {
            top: [feedback, staff, logout],
            side: [staff, studentGroups, staff_scenarios, students, issues]

        },
    },
};
