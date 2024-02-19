import React, { useContext, useState } from 'react';
import { InstructorRouter_context } from '../../Instructor_router';
import './Instr_Dash.css';

function Instr_ScenDetail() {

    const { scenarioDetail_state } = useContext(InstructorRouter_context);

    if (!scenarioDetail_state) return (<>Click Scenario on table for details</>)

    return (
        <>
        SCENARIO DETAILS:
        <div className='detail-frame'>
            <div>CREATED_AT: {scenarioDetail_state.created_at}</div>
            <div>DESCRIPTION: {scenarioDetail_state.description}</div>
            <div>ID: {scenarioDetail_state.id}</div>
            <div>NAME: {scenarioDetail_state.name}</div>
            <div>OWNER_ID: {scenarioDetail_state.owner_id}</div>
            <div>STATUS: {scenarioDetail_state.status}</div>
        </div>
        </>
    );
};
export default Instr_ScenDetail;