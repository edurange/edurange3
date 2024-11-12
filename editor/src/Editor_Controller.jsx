import React, { useState , useEffect} from 'react';
import './base.css';
import axios from 'axios';

function Editor_Controller() {

  useEffect(() => {
    async function getData(){
      const som = await axios.post('/api/get_data', {
        someProp: 'prop1',
        otherProp: 'prop2'
      });
      console.log('sommy', som)
      return som;
    }
    const dataGot = getData();
    console.log('got data: ', dataGot)
}, []);


  return (
    <>
      Editor_Controller loaded...
    </>
  )
}

export default Editor_Controller
