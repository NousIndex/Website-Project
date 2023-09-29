export function genshinWishImportAPI(wishData) {
  // Beginner Wish = 100, Permanent Wish = 200, Character Event Wish = 301, Weapon Event Wish = 302
  try {
    let res = wishData.split('authkey=');
    let res2 = res[1].split('&game');
    let authkey = res2[0];
    authkey = encodeURI(authkey);

    if (authkey !== '') {
      // Define the URL of your API endpoint
      const apiUrl = `http://42.60.133.245:7777/api/genshin-draw-import?authkey=${authkey}`;

      // Use the fetch function to make the GET request
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return; // Parse JSON response if needed
        })
        .then((data) => {
          // Handle the data if needed
          console.log('Fetch successful!', data);
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          throw error; // Re-throw the error to propagate it
        })
        .finally(() => {
          console.log('Fetch request completed.');
        });
    }
  } catch (err) {
    console.log(err);
  }
}
