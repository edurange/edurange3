import React from 'react';
import '@assets/css/tables.css';
import Placard from '../../../components/Placard';
import { nanoid } from 'nanoid';

function LogTable({ rowData, use_crud, logType }) {

    if (!rowData) { return (<></>) }

    return (
        <div className='logTable-frame'>
            <Placard placard_text={logType} />

            {/* start conditional render */}
            {rowData?.length < 1

                ?
                <div className='grid-empty-frame'>
                    <div className='grid-empty-carpet'>
                        THERE ARE NO LOGS FOR THIS TYPE && FILTER
                    </div>
                </div>

                :
                <div className='logGrid-frame'>
                    <div className="grid-container">
                        <div className="grid-header">Time Stamp</div>
                        <div className="grid-header">Log Type</div>
                        <div className="grid-header">Log ID</div>
                        <div className="grid-header">User ID</div>
                        <div className="grid-header">Scenario Type</div>
                        <div className="grid-header">Archive ID</div>
                        <div className="grid-header">Content</div>

                        {rowData.map((item, index) => (
                            <React.Fragment key={nanoid(5)}>
                                <div className="grid-item">{item.timestamp}</div>
                                <div className="grid-item">{logType}</div>
                                <div className="grid-item">{item.id}</div>
                                <div className="grid-item">{item.user_id}</div>
                                <div className="grid-item">{item.scenario_type}</div>
                                <div className="grid-item">{item.archive_id}</div>
                                <div className="grid-item content-box">
                                    <div className='content-box'>
                                        {item.content}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>}
                {/* end conditional render */}
        </div>

    );
}
export default LogTable;