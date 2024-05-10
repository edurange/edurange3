
import React from "react";

import {
    FaHouseChimney,
    FaAddressCard,
    FaFileLines,
    FaChessKnight,
    FaDisplay,
    FaCircleUser,
    FaUserXmark,
    FaUserCheck,
    FaGear,
    FaBell,
    FaBook,
    FaUniversalAccess,
    FaCircleQuestion,
    FaBars,
    FaTerminal,
    FaEye,
    FaPeopleGroup,
    FaChess,
    FaPerson,
    FaKey,
    FaPalette,
    FaGraduationCap,
    FaWandMagicSparkles,
    FaChevronUp,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaRegCopy,
    FaCheck,
    FaHatWizard,
    FaTrashCan ,
    FaTowerObservation
} from "react-icons/fa6";

import { 
    HiMiniBarsArrowDown,
    HiMiniBarsArrowUp 
} from "react-icons/hi2";

import { 
    LuPanelLeftOpen,
    LuPanelLeftClose 
} from "react-icons/lu";

import { 
    MdNotifications, 
    MdNotificationsActive,
  } from "react-icons/md";

import { 
    FaStopCircle,
    FaPlayCircle 
 } from "react-icons/fa";

 const edurange_icons = {
    accessibility : <FaUniversalAccess/>,
    bell : <MdNotifications/>,
    bell_ringing : <MdNotificationsActive/>,
    gear : <FaGear/>,
    home : <FaHouseChimney />,
    file : <FaFileLines />,
    book : <FaBook/>,
    id_card : <FaAddressCard />,
    chess_knight : <FaChessKnight />,
    account : <FaCircleUser />,
    user_x : <FaUserXmark />,
    user_check : <FaUserCheck />,
    computer_monitor : <FaDisplay />,
    questionmark : <FaCircleQuestion/>,
    hamburger: <FaBars/>,
    terminal_prompt: <FaTerminal/>,
    eye: <FaEye/>,
    userGroup: <FaPeopleGroup/>,
    scenarioGroup: <FaChess/>,
    user: <FaPerson/>,
    key: <FaKey/>,
    palette: <FaPalette/>,
    instructor: <FaGraduationCap/>,
    admin: <FaWandMagicSparkles/>,
    chevron_up: <FaChevronUp />,
    chevron_down: <FaChevronDown />,
    chevron_left: <FaChevronLeft />,
    chevron_right: <FaChevronRight />,
    clipboard_copy: <FaRegCopy/>,
    checkmark: <FaCheck/>,
    menuOpen_down: <HiMiniBarsArrowDown/>,
    menuClose_up: <HiMiniBarsArrowUp/>,
    panelOpen_left: <LuPanelLeftOpen/>,
    panelClose_left: <LuPanelLeftClose/>,
    wizardHat: <FaHatWizard/>,
    stopSign: <FaStopCircle/>,
    playSign: <FaPlayCircle />,
    trash: <FaTrashCan/>,
    tower: <FaTowerObservation/>
}
export default edurange_icons

// import Icon Object references from the react-icon "font-awesome 6" library
// (import and use the variables from this file, rather than importing icons directly.  
// if you need more icons, import/add them from here!  https://react-icons.github.io/react-icons/