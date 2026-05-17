require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const BUCKET_NAME = 'draw-cache';

async function viewFileContent(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(fileName);

    if (error) {
      console.error('Error reading the file:', error);
      return null;
    }

    return JSON.parse(await data.text());
  } catch (error) {
    console.error('An error occurred:', error);
    return null;
  }
}

async function modifyAndUploadFileContent(fileContent, fileName) {
  try {
    const modifiedBlob = new Blob([JSON.stringify(fileContent)], {
      type: 'application/json',
    });

    const { uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, modifiedBlob, { upsert: true });

    if (uploadError) {
      console.error('Error uploading the modified file:', uploadError);
    } else {
      console.log('File modified and uploaded successfully.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function pingStorage() {
  return supabase.storage.from(BUCKET_NAME).list('', { limit: 1 });
}

module.exports = {
  supabase,
  viewFileContent,
  modifyAndUploadFileContent,
  pingStorage,
};
