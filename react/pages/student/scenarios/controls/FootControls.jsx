


import React, { useContext } from 'react';
import './FootControls.css';
import Copy_button_small from '@components/Copy_button_small';
import { HomeRouter_context } from '@pub/Home_router';

const zws = `\u200B`;


function FootControls({ guideContent, updatePane, paneSide }) {

    const { userData_state } = useContext(HomeRouter_context);
    const meta = guideContent.scenario_meta;

    if ((!meta)) { return (<>Scenario not found</>); }
    const tempName = userData_state.username.replace(/-/g, '')
    const creds = guideContent.credentialsJSON[tempName]
    const SSH_IP = guideContent.SSH_IP
    const SSH_username = creds[0].username;
    const SSH_password = creds[0].password;
    const [SSH_ip, SSH_port_str] = SSH_IP.split(':');
    const sshCommand = `ssh ${SSH_username}@${SSH_ip} -p ${SSH_port_str}`;

    if (!userData_state?.role) { return <>You must log in to continue.</> }

    const left_controls = (
        <>
            <div className='footcontrol-frame'>

                <div
                    className='footcontrol-item footcontrol-info-button'
                    onClick={() => updatePane("info")}>
                    Info
                </div>

                <div
                    className='footcontrol-item footcontrol-web-ssh-button'
                    onClick={() => updatePane("ssh")}>
                    web-SSH
                </div>

                <div className='footcontrol-item footcontrol-chat-button'
                    onClick={() => updatePane("chat")}>
                    Chat
                </div>

                <section className='footcontrol-item footcontrol-sshinfo-frame'>

                    <div className='footcontrol-ssh-label-frame'>
                        <div className='footcontrol-ssh-label-text'>
                            SSH
                        </div>
                    </div>

                    <section className='footcontrol-ssh-creds-frame'>

                        <section className='footcontrol-ssh-sublabel-frame'>
                            <div className='footcontrol-ssh-sublabel-item'>
                                cmd:
                            </div>
                            <div className='footcontrol-ssh-sublabel-item'>
                                pw:
                            </div>
                        </section>

                        <section className='footcontrol-ssh-creds-values-frame'>
                            <div className='footcontrol-ssh-creds-values-row'>
                                <div className='footcontrol-ssh-creds-values-text'>
                                    ssh {SSH_username}{zws}@{SSH_ip} -p {SSH_port_str}
                                </div>
                            </div>
                            <div className='footcontrol-ssh-creds-values-row'>
                                <div className='footcontrol-ssh-creds-values-text'>
                                    {SSH_password}
                                </div>
                            </div>
                        </section >

                    </section>

                    <div className='footcontrol-ssh-copy-section'>
                        <div className='footcontrol-ssh-buttons-column'>
                            {<Copy_button_small thingToCopy={sshCommand} />}
                            {<Copy_button_small thingToCopy={SSH_password} />}
                        </div>
                        <div className='footcontrol-ssh-copy-label'>
                            COPY
                        </div>
                    </div>


                </section>

            </div>
        </>
    );

    const right_controls = (
        <>
            <div className='footcontrol-frame'>

                <div
                    className='footcontrol-item footcontrol-info-button'
                    onClick={() => updatePane("guide")}>
                    Guide
                </div>

                <div
                    className='footcontrol-item footcontrol-web-ssh-button'
                    onClick={() => updatePane("ssh")}>
                    WebSSH
                </div>

                <div className='footcontrol-item footcontrol-chat-button'>
                    Chat
                </div>

                <div className='footcontrol-item footcontrol-ssh-text'>
                    <div> Scenario Progress:  </div>
                    <div> Points: 123 / Max: 456 </div>
                </div>

            </div>
        </>
    );

    let controlsToUse;

    if (paneSide === 'left') { controlsToUse = left_controls; }
    else if (paneSide === 'right') { controlsToUse = right_controls; }
    else { controlsToUse = (<></>); };

    return controlsToUse;
};
export default FootControls;