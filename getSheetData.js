const { google } = require('googleapis');
const path = require('path');

const spreadsheetId = '1DyZqxjidx-XXASj3ykhg44ZNOIXnpgCvcHJ9eIE4qV0';

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const range = 'Shopify Automation!A:J';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Filtrar filas donde el status (E) = TRUE y todos los campos desde C a L están completos
    const filteredRows = rows.slice(1).filter(row => {
      if(row[9] === 'TRUE') return false;

      for (let i = 1; i <= 8; i++) {
        if (row[i] === '') {
          return false;
        }
      }
      return true;
    });

    // console.log('Filtered Rows:', filteredRows);

    return filteredRows;
  } catch (error) {
    console.error('Error reading sheet data:', error);
  }
}

async function writeToSheet(rowIndex, colIndex, value) {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const booleanValue = value === 'TRUE' ? true : (value === 'FALSE' ? false : value);

  const range = `Shopify Automation!${String.fromCharCode(64 + colIndex)}${rowIndex}`;
  const request = {
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values: [[booleanValue]],
    },
  };

  try {
    await sheets.spreadsheets.values.update(request);
    console.log(`Successfully wrote ${value} to ${range}`);
  } catch (error) {
    console.error('Error writing to sheet:', error);
  }
}

module.exports = { readSheet, writeToSheet };