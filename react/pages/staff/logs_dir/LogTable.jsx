import React, { useContext, useMemo, useState } from 'react';
import '@assets/css/logs-improved.css';
import Placard from '../../../components/Placard';
import { nanoid } from 'nanoid';
import { StaffRouter_context } from '../Staff_router.jsx';
import LogCellModal from './LogCellModal.jsx';

function LogTable({ rowData, use_crud, logType }) {

    const { users_state } = useContext(StaffRouter_context);
    const [modal_state, set_modal_state] = useState(null);

    const userMap = useMemo(() => {
        const m = new Map();
        (users_state ?? []).forEach(u => m.set(Number(u.id), u.username ?? u.id));
        return m;
    }, [users_state]);

    if (!rowData) { return (<></>); }

    const isBash = logType === 'bash';

    function openModal(title, subtitle, content) {
        set_modal_state({ title, subtitle, content });
    }

    function fmtTime(ts) {
        if (!ts) return '';
        const s = String(ts);
        return s.length > 19 ? s.slice(11, 19) : s;
    }

    function fmtCwd(cwd) {
        if (!cwd) return '';
        return cwd.replace(/^\/home\/[^/]+/, '~');
    }

    return (
        <div className='logTable-frame'>
            <Placard placard_text={logType} />

            {modal_state && (
                <LogCellModal
                    title={modal_state.title}
                    subtitle={modal_state.subtitle}
                    content={modal_state.content}
                    onClose={() => set_modal_state(null)}
                />
            )}

            {rowData?.length < 1

                ?
                <div className='log-empty'>No {logType} logs match the current filters.</div>

                :
                <div className='log-rows'>
                    {rowData.map((item) => {
                        const uname = userMap.get(Number(item.user_id)) ?? item.user_id;
                        const inputVal = isBash ? (item.input ?? '') : (item.content ?? '');
                        const outputVal = isBash ? (item.output ?? '') : '';
                        const cwd = isBash ? fmtCwd(item.current_directory) : '';
                        const time = fmtTime(item.timestamp);
                        const hasOutput = Boolean(outputVal && outputVal.trim());

                        return (
                            <div
                                key={nanoid(5)}
                                className={`log-row${hasOutput ? ' log-row-clickable' : ''}`}
                                onClick={hasOutput ? () => openModal(`${uname}`, `${time}  ${cwd}`, outputVal) : undefined}
                            >
                                <span className='log-row-user'>{uname}</span>
                                <span className='log-row-time'>{time}</span>
                                {cwd && <span className='log-row-cwd'>{cwd}</span>}
                                <span className='log-row-input'>{inputVal}</span>
                                {hasOutput && (
                                    <span className='log-row-output-preview'>
                                        {outputVal.slice(0, 80).replace(/\n/g, ' ↵ ')}
                                        {outputVal.length > 80 ? '…' : ''}
                                    </span>
                                )}
                                {hasOutput && (
                                    <div className='log-tooltip'>{outputVal}</div>
                                )}
                            </div>
                        );
                    })}
                </div>}
        </div>
    );
}
export default LogTable;