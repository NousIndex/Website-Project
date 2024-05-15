require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');

console.log(process.env.SUPABASE_URL);
// Initialize a Supabase client with your Supabase URL and API key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
console.log(supabase);

// Define the name of the bucket you want to read from
const bucketName = 'draw-cache';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: '1', // Ensure this is a string, not a variable
    strict: true,
    deprecationErrors: true,
  },
  ssl: true,
  tlsAllowInvalidCertificates: true, // Set to false in production
  tlsAllowInvalidHostnames: true, // Optional, set to true only for testing
});

async function viewFileContent(fileName) {
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

async function modifyAndUploadFileContent(fileContent, fileName) {
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
      .upload(fileName, modifiedBlob, {
        upsert: true,
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

module.exports = async (req, res) => {
  // console.log('Starting Genshin Draw API');
  console.log(process.env.SUPABASE_URL);
};
