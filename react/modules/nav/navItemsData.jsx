
// these are used by some menus to define what their label, icon, and link path should be
// at the bottom, arrays define which items should be displayed in which contexts
// you can simply add some more and use them as you wish

// the navStub is used by Home_router.js and Dashboard_router.js (among others)
// to determine which set of navigation items to show upon navigation
// by inserting the stub into a dict reference in order to point to a given navArray (at bottom)

// the array of nav objects is then passed to HomeHead.js or DashSideNav.js as a prop.

import edurange_icons from "../ui/edurangeIcons";

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
const logout = {
    title: "Logout",
    icon: edurange_icons.user_x,
    path: `/scenarios/logout`,
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
const admin = {
    title: "Admin",
    icon: edurange_icons.admin,
    path: `/admin`,
    navStub: 'dash_admin'
};
const instructor = {
    title: "Instructor",
    icon: edurange_icons.instructor,
    path: `/instructor`,
    navStub: 'dash_instructor'
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
const instructor_userGroups = {
    title: "Student Groups",
    icon: edurange_icons.userGroup,
    path: `/instructor/userGroups`,
    navStub: 'dash_instructor'
};
const instructor_scenarioGroups = {
    title: "Scenario Groups",
    icon: edurange_icons.scenarioGroup,
    path: `/instructor/scenarioGroups`,
    navStub: 'dash_instructor'
};
const instructor_users = {
    title: "Students",
    icon: edurange_icons.user,
    path: `/instructor/users`,
    navStub: 'dash_instructor'
};
const jwt_test = {
    title: "jwt_test",
    icon: edurange_icons.key,
    path: `/jwt_test`,
    navStub: 'dash'
};

export const navArrays = {

//logged_out
    side_logout:            [ jwt_test, home, docs, options, login, logout ],
    top_logout:             [ jwt_test, home, docs, options, login, logout ],

//home  
    side_home:              [ home, scenarios, docs, options, account, logout , help, login ],
    top_home:               [ jwt_test, scenarios, home, options, account, logout, login ],

//options
    side_options:           [ accessibility, themes, home ],
    top_options:            [ jwt_test, scenarios, home, options, account, logout, login ],

//scenarios
    side_dash:              [ home, scenarios, instructor, options, account, logout ],
    top_dash:               [ jwt_test, scenarios, home, options, account, logout, login ],

//guide
    side_guide:              [ home, scenarios, options, account, logout ],
    top_guide:               [ jwt_test, scenarios, home, options, account, logout, login ],

//admin-dashboard
    side_dash_admin:        [ home, instructor, options, account, logout ],
    top_dash_admin:         [ jwt_test, instructor, home, options, account, logout, login ],

//instructor-dashboard
    side_dash_instructor:   [ home, instructor, options, account, logout ],
    top_dash_instructor:    [ jwt_test, instructor, home, options, account, logout, login ],
//instructor-dashboard
    side_scenarios_instructor:   [ home, students, groups, scenarios ],
    top_scenarios_instructor:    [ jwt_test, home, options, account, logout, login ],

};