import React, {useContext} from 'react';
import './SSH_card.css';
import Copy_button from '@components/Copy_button';
import { HomeRouter_context } from '@pub/Home_router';
const zws = `\u200B`;

function SSH_card({ guideContent }) {

    const meta = guideContent.scenario_meta;

    if ((!meta)) { return (<>Scenario not found</>); }; // GUARD

    const { 
        userData_state,
      } = useContext(HomeRouter_context);

    const saniname = userData_state?.username.replace(/-/g, '');
    const SSH_IP = guideContent.SSH_IP;
    const SSH_username = guideContent.credentialsJSON?.[saniname]?.[0]?.username;
    const SSH_password = guideContent.credentialsJSON?.[saniname]?.[0]?.password;
    console.log ('creds?', SSH_username, SSH_password)
    const [SSH_ip, SSH_port_str] = SSH_IP.split(':');

    const sshCommand = `ssh ${SSH_username}@${SSH_ip} -p ${SSH_port_str}`;

    return (
        <section className='sshcard-frame'>

            <div className='sshcard-carpet'>
                <div className='ssh-placard'>SSH Info</div>
                <section className='sshcard-main'>

                    <div className='sshcard-row sshcard-creds'>
                        <div className='sshcard-creds-col sshcard-label-col'>cmd:</div>
                        <div className='sshcard-creds-col sshcard-value-col'>
                            ssh {SSH_username}{zws}@{SSH_ip} -p {SSH_port_str}
                        </div>

                        <div className='sshcard-button-contanew'>
                            <Copy_button thingToCopy={sshCommand}/>
                        </div>
                    </div>

                    <div className='sshcard-row sshcard-creds'>
                        <div className='sshcard-creds-col sshcard-label-col'> pw: </div>
                        <div className='sshcard-creds-col sshcard-value-col sshcard-value-break'> {SSH_password} </div>
                        <div className='sshcard-button-contanew'>
                            <Copy_button thingToCopy={SSH_password}/>
                        </div>
                    </div>

                </section>
            </div>
        </section>
    );
};

export default SSH_card;

