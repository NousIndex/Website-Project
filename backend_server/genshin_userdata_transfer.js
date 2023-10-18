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
const userID = '800634126';
let dataArray = [];

async function getData() {
  try {
    const sheetsApi = await sheets.spreadsheets.values.get({
      auth: await auth.getClient(),
      spreadsheetId,
      range,
    });

    const values = sheetsApi.data.values;

    if (values.length) {
      // Iterate through rows and push each row into the dataArray
      values.forEach((row) => {
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

        const dataObject = {
          Genshin_UID: userID, // Assuming the first column contains Genshin_UID
          DrawID: row[0], // Assuming the second column contains DrawID
          DrawTime: dateTime, // You can customize how you set the DrawTime
          DrawType: row[2], // Assuming the third column contains DrawType
          Item_Name: row[3], // Assuming the fourth column contains Item_Name
          Rarity: row[4].slice(0, -1), // Assuming the fifth column contains Rarity
        };
        dataArray.push(dataObject);
      });
      dataArray = dataArray;
      console.log(dataArray.reverse());

      try {
        // Insert the array of data into the Genshin_Draw table
        const result = await prisma.Genshin_Draw.createMany({
          data: dataArray,
        });

        console.log('Data inserted successfully:', result);
      } catch (error) {
        console.error('Error inserting data:', error);
      } finally {
        // Close the Prisma client
        await prisma.$disconnect();
      }
    } else {
      console.log('No data found.');
    }
  } catch (err) {
    console.error('The API returned an error:', err);
  }
}

getData();
