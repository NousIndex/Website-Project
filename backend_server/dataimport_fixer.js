const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sheets = google.sheets('v4');
const fs = require('fs');

// Load your credentials JSON file
const credentials = require('./key.json');

// Initialize the Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// The ID of your Google Sheets document
const spreadsheetId = '1p7wZL3dbhBXUSKo8dnTF0fH3qU0b3i7syimR7PrXUQg';

// The range of cells you want to retrieve (e.g., 'Sheet1!A1:B2')
const range = 'Transfer!A1:E';

// Define the maximum number of concurrent database connections
const maxConnections = 5; // You can adjust this value as needed

// Create a queue to control the number of concurrent requests
const queue = [];
let activeConnections = 0;

async function updateDrawTime(drawID, newDrawTime) {
  try {
    const updatedDraw = await prisma.genshin_Draw.update({
      where: {
        DrawID: drawID,
      },
      data: {
        DrawTime: newDrawTime,
      },
    });

    console.log(`Updated DrawID ${drawID} with new DrawTime: ${newDrawTime}`);
    return updatedDraw;
  } catch (error) {
    console.error(`Error updating DrawID ${drawID}:`, error);
    throw error;
  }
}

async function processRow(row) {
  try {
    // Split the date and time string into its components, and AM/PM
    const [datePart, timePart, ampm] = row[1].split(' ');

    // Split the date components into year, month, and day
    const [year, month, day] = datePart.split('-').map(Number);

    // Split the time components into hours, minutes, seconds
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Adjust hours for AM/PM
    let adjustedHours = hours;
    if (ampm === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      adjustedHours = 0;
    }

    // Create the Date object
    const dateTime = new Date(
      `20${year}`,
      month - 1,
      day,
      adjustedHours,
      minutes,
      seconds
    );

    await updateDrawTime(row[0], dateTime);
  } catch (error) {
    console.error('Error processing row:', error);
  } finally {
    // Release the database connection
    activeConnections--;
    processQueue();
  }
}

function processQueue() {
  while (queue.length > 0 && activeConnections < maxConnections) {
    const row = queue.shift();
    activeConnections++;
    processRow(row);
  }
}

async function getData() {
  try {
    const sheetsApi = await sheets.spreadsheets.values.get({
      auth: await auth.getClient(),
      spreadsheetId,
      range,
    });

    const values = sheetsApi.data.values;

    if (values.length) {
      // Add rows to the queue for processing
      values.forEach((row) => {
        queue.push(row);
      });

      // Start processing the queue
      processQueue();
    } else {
      console.log('No data found.');
    }
  } catch (err) {
    console.error('The API returned an error:', err);
  }
}

getData();
