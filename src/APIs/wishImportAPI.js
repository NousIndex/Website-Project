export async function genshinWishImportAPI(wishData) {
  // Beginner Wish = 100, Permanent Wish = 200, Character Event Wish = 301, Weapon Event Wish = 302
  try {
    // let res = wishData.split('authkey=');
    // let res2 = res[1].split('&game');
    // let authkey = res2[0];
    // authkey = encodeURI(authkey);

      // Define the URL of your API endpoint 42.60.133.245
      const apiUrl = `http://localhost:7777/api/genshin-draw-import?authkey=${wishData}`;

      // Use the fetch function to make the GET request
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.message; // Return the message from the response

  } catch (err) {
    console.log(err);
    return err;
  }
}
