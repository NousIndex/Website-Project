import { API_URL } from '../API_Config.js';

export async function genshinWishImportAPI(wishData, userID) {
  // Beginner Wish = 100, Permanent Wish = 200, Character Event Wish = 301, Weapon Event Wish = 302
  try {
    let res = wishData.split('authkey=');
    let res2 = res[1].split('&game');
    let authkey = res2[0];
    authkey = encodeURI(authkey);
    
    // Define the URL of your API endpoint
    const apiUrl = `${API_URL}api/draw-import?authkey=${authkey}&userID=${userID}&game=genshin`;

    // Use the fetch function to make the GET request
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.message; // Return the message from the response
  } catch (err) {
    console.log(err);
    if (err.message === "HTTP error! Status: 504") {
      return "API Timeout, Please Try Again Later";
    }
    return "Wrong Authentication Key";
  }
}

export async function starrailWishImportAPI(wishData, userID) {
  try {
    let res = wishData.split('authkey=');
    let res2 = res[1].split('&game');
    let authkey = res2[0];
    authkey = encodeURI(authkey);
    
    // Define the URL of your API endpoint
    const apiUrl = `${API_URL}api/draw-import?authkey=${authkey}&userID=${userID}&game=starrail`;

    // Use the fetch function to make the GET request
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.message; // Return the message from the response
  } catch (err) {
    console.log(err);
    if (err.message === "HTTP error! Status: 504") {
      return "API Timeout, Please Try Again Later";
    }
    return "Wrong Authentication Key";
  }
}
export async function wuwaWishImportAPI(wishData, userID) {
  try {
    const authkey = encodeURIComponent(wishData);
    
    // Define the URL of your API endpoint
    const apiUrl = `${API_URL}api/draw-import?authkey=${authkey}&userID=${userID}&game=wuwa`;

    // Use the fetch function to make the GET request
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data.message; // Return the message from the response
  } catch (err) {
    console.log(err);
    return "Wrong Authentication Key";
  }
}

export async function zzzWishImportAPI(wishData, userID) {
  try {
    let res = wishData.split('authkey=');
    let res2 = res[1].split('&game');
    let authkey = res2[0];
    authkey = encodeURI(authkey);
    
    // Define the URL of your API endpoint
    const apiUrl = `${API_URL}api/draw-import?authkey=${authkey}&userID=${userID}&game=zzz`;

    // Use the fetch function to make the GET request
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.message; // Return the message from the response
  } catch (err) {
    console.log(err);
    if (err.message === "HTTP error! Status: 504") {
      return "API Timeout, Please Try Again Later";
    }
    return "Wrong Authentication Key";
  }
}