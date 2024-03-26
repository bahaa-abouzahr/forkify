// contains functions that we reuse

import { TIMEOUT_SEC } from './config.js'

const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
  };

 
export const AJAX = async function(url, uploadData = undefined)   {
  try {
    const fetchPro = uploadData ? // if upload exists it will have the following value
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData), // converting to JSON
    })
    : fetch(url) // else will have this value
  
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();
  
    if(!res.ok) throw new Error(`${data.message} ${res.status}`) // if res not ok
  
    return data;
    
  } catch (err) {
    throw err; // thrown to model.js to be handled there 
  }

};
/*
export const getJSON = async function(url) {
    try {
        const fetchPro = fetch(url)
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();
    
        if(!res.ok) throw new Error(`${data.message} ${res.status}`) // if res not ok

        return data;

    } catch (err) {
    }
};

export const sendJSON = async function(url, uploadData) {
    try {
        const fetchPro = fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData), // converting to JSON
        });

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();
    
        if(!res.ok) throw new Error(`${data.message} ${res.status}`) // if res not ok

        return data;

    } catch (err) {
        throw err; // thrown to model.js to be handled there
    }
};
*/