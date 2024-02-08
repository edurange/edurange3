
// import React, { useContext, useState } from 'react';
// import { Route, Routes } from 'react-router-dom';
// import './Dashboard.css';
// import { HomeRouterContext } from '../../home/src/Home_router';
// import { navArrays } from '../../../modules/nav/navItemsData';
// import Dashboard_home from './Dashboard_home';
// import Scenarios_router from '../../scenarios/Scenarios_router';
// import JWT_Test from './components/JWT_test';
// import Logout from '../../home/src/components/logout/Logout';
// import Admin_router from '../admin/src/Admin_router';
// import InstructorDash from '../instructor/src/InstructorDash';
// import Account from '../account/src/Account';
// import DashNotifications from './components/notifications/src/Notifications';
// import SideNav from './sidenav/SideNav';


// const DashRouterContext = React.createContext();

// function Dashboard_router() {

//   const { 
//     login_state, set_login_state,
//     navName_state,
//     userData_state, set_userData_state
//   } = useContext(HomeRouterContext);

//   const fakeNotif= {
//     id: 123,
//     timeStamp: Date.now(),
//     message: "something"
//   }


  
//   const [notifsArray_state, set_notifsArray_state] = useState([fakeNotif]);
  
//   const navLongname = `side_${navName_state}`
//   const navToShow = navArrays[navLongname];
  
//   // these routes extend /dashboard
//   // e.g. scenarios is URL /dashboard/scenarios
//   return (

//     <div className='newdash-frame'>
//       <div className='newdash-frame-carpet'>
//       <DashRouterContext.Provider value={{
//         notifsArray_state, set_notifsArray_state
//       }}>
      
//         <SideNav navToShow={navToShow} smallMode={true} hiddenMode={false} />

//         <div className="newdash-infopane-frame">
//           <div className='newdash-infopane-content'>

//             <Routes>
//               <Route path="/*" element={<Dashboard_home />} />

//             </Routes>

//           </div>
//         </div>
//         </DashRouterContext.Provider>
//       </div>
//     </div>
//   );
// }

// export default Dashboard_router;
