const { createClient } = require('@supabase/supabase-js');

let client = null;

/**
 * Built on first use rather than at import time: a missing env var then
 * surfaces as a logged 500 from the handler that needed it, instead of taking
 * down every function that merely requires this module.
 */
function getSupabase() {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('SUPABASE_URL / SUPABASE_KEY are not configured');
    }
    client = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return client;
}

// Proxy so existing `supabase.storage` / `supabase.auth` call sites keep
// working while the underlying client stays lazily constructed.
const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getSupabase()[prop];
      return typeof value === 'function' ? value.bind(getSupabase()) : value;
    },
  }
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
  getSupabase,
  viewFileContent,
  modifyAndUploadFileContent,
  pingStorage,
};
