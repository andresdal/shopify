const { google } = require('googleapis');
const path = require('path');

async function readSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '1DyZqxjidx-XXASj3ykhg44ZNOIXnpgCvcHJ9eIE4qV0';
  const range = 'Shopify Automation!C:L'; // Rango de columnas C a L

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
    const filteredRows = rows.filter(row => {
      // Verificar si el status en la columna E (índice 2) es TRUE
      if (row[2] !== 'TRUE') return false;

      // Verificar si todas las columnas desde C a L están completas
      for (let i = 0; i < 9; i++) { // 9 columnas desde C a L
        if (!row[i] || row[i].trim() === '') {
          return false;
        }
      }

      return true;
    });

    console.log('Filtered Rows:', filteredRows);

    return filteredRows;
  } catch (error) {
    console.error('Error reading sheet data:', error);
  }
}

module.exports = { readSheet };

