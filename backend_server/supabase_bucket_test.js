const { createClient } = require('@supabase/supabase-js');

// Initialize a Supabase client with your Supabase URL and API key
const supabaseUrl = 'https://vtmjuwctzebijssijzhq.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bWp1d2N0emViaWpzc2lqemhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NjcwOTE3MywiZXhwIjoyMDEyMjg1MTczfQ.wb1hHzf0_D5uaqURxof7VhKF53Bz0jxcwt9vvXkRrFY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the name of the file you want to read from your bucket
const fileName = 'genshin/Genshin-802199629.json';

// Define the name of the bucket you want to read from
const bucketName = 'draw-cache';

// async function viewFileContent() {
//   try {
//     const { data, error } = await supabase.storage
//       .from(bucketName)
//       .download(fileName);
//     if (error) {
//         // File not found
//       console.error('Error reading the file:', error);
//     } else {
//       const blob = data;
//       blob.text().then((fileContent) => {
//         console.log(fileContent); // This will display the content of the JSON file as a string.
//       });
//     }
//   } catch (error) {
//     console.error('An err    or occurred:', error);
//   }
// }

async function viewFileContent() {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      // Handle the error (e.g., file not found)
      console.error('Error reading the file:', error);
      return null; // Return null or an empty array as needed
    }

    const blob = data;
    const fileContent = JSON.parse(await blob.text());

    return fileContent;
  } catch (error) {
    console.error('An error occurred:', error);
    return null; // Handle the error by returning null or an empty array
  }
}

async function modifyAndUploadFileContent(fileContent) {
  try {
    // Convert the modified data back to JSON
    const modifiedFileContent = JSON.stringify(fileContent);

    // Create a new Blob with the modified JSON data
    const modifiedBlob = new Blob([modifiedFileContent], {
      type: 'application/json',
    });

    // Upload the modified data back to the bucket
    const { uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, modifiedBlob,{
        upsert: true
      });

    if (uploadError) {
      // Handle the upload error
      console.error('Error uploading the modified file:', uploadError);
    } else {
      console.log('File modified and uploaded successfully.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
async function main() {
  try {
    const x = await viewFileContent(); // Use 'const' to declare the variable
    await modifyAndUploadFileContent(x);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Call the main function
main();
