import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './JWT_test.css';

function JWT_Test() {

    const [testResponse, set_testResponse] = useState({
        username: "bub",
        user_id: null,
        user_role: "none",
        message: "Go away"
    });

    async function beginTest() {
        try {
            const response = await axios.get("/get_identity");
            console.log(response)
            if (response.data.user_id) {
                set_testResponse(response.data);
            };
        }
        catch (error) {console.log('jwt_test error:', error);};
    };

    useEffect(() => {beginTest();}, []);

    return (
        <div className='jwt-test-frame'>

        THIS IS THE JWT_Test!
        
        <div>
            <h1>{testResponse.message}, {testResponse.username}!</h1>
        </div>
        <div>
            <h1>Your ID is {testResponse.user_id}</h1>
        </div>
        <div>
            <h1>Your role is {testResponse.user_role}</h1>
        </div>
        </div>
    );
};
export default JWT_Test;