
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

const issues = {
    title: "Issues",
    icon: edurange_icons.gitHub,
    path: `https://github.com/edurange/edurange3/issues`,
    navStub: 'dash',
    external: true
};

const feedback = {
    title: "Feedback",
    icon: edurange_icons.comments,
    path: `/feedback`,
    navStub: 'dash',
}

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
const instructor = {
    title: "Dashboard",
    icon: edurange_icons.wizardHat,
    path: `/instructor`,
    navStub: 'dash'
};
const studentGroups = {
    title: "Groups",
    icon: edurange_icons.userGroup,
    path: `/instructor/groups`,
    navStub: 'dash'
};
const scenarioGroups = {
    title: "Scenario Groups",
    icon: edurange_icons.scenarioGroup,
    path: `/instructor/scenarioGroups`,
    navStub: 'dash'
};
const students = {
    title: "Students",
    icon: edurange_icons.user,
    path: `/instructor/students`,
    navStub: 'dash'
};
const instr_scenarios = {
    title: "Scenarios",
    icon: edurange_icons.chess_knight,
    path: `/instructor/scenarios`,
    navStub: 'dash'
};
const panopticon = {
    title: "Panopticon",
    icon: edurange_icons.tower,
    path: `/instructor/panopticon`,
    navStub: 'dash'
};
const logs = {
    title: "Logs",
    icon: edurange_icons.book,
    path: `/instructor/logs`,
    navStub: 'dash'
};
const instr_hints = {
    title: "Hints",
    icon: edurange_icons.light_bulb,
    path: `/instructor/hints`,
    navStub: 'dash'
};

export const navArrays = {

    logout: {
        home: {
            top: [login],
            side: [login, feedback, issues]
        },
    },

    student: {
        home: {
            top: [scenarios, logout],
            side: [scenarios, feedback, issues, logout]
        },
        dash: {
            top: [home, scenarios, logout],
            side: [scenarios, feedback, issues, logout]
        },
        account: {
            top: [scenarios, logout],
            side: [scenarios, feedback, issues, logout]
        },

    },

    instructor: {
        home: {
            top: [home, instructor, logout],
            side: [instructor, feedback, issues, logout]
        },
        dash: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, panopticon, instr_hints, logs, feedback, issues]
        },
        account: {
            top: [instructor, logout],
            side: [instructor, feedback, issues, logout]
        },
        scenarios: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]
        },
        students: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]
        },
        student_groups: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]
        },
        scenario_groups: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]
        },
    },

    admin: {
        home: {
            top: [home, instructor, logout],
            side: [instructor, feedback, issues, logout]
        },
        dash: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, panopticon, instr_hints, logs, feedback, issues]
        },
        account: {
            top: [instructor, logout],
            side: [instructor, feedback, issues, logout]
        },
        scenarios: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]

        },
        students: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]

        },
        student_groups: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]

        },
        scenario_groups: {
            top: [instructor, logout],
            side: [instructor, studentGroups, instr_scenarios, students, feedback, issues]

        },
    },
};

