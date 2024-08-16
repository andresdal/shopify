const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const csvDirectory = './csv_files'; // Directorio donde están los CSVs
const outputDirectory = './unified_csv_files'; // Directorio donde se guardarán los CSVs unificados

// Función para leer y agrupar archivos CSV por tienda
function unifyCSVFiles() {
  fs.readdir(csvDirectory, (err, files) => {
    if (err) throw err;

    // Crear un objeto para agrupar los archivos por tienda
    const shopCSVFiles = {};

    files.forEach(file => {
      if (path.extname(file) === '.csv') {
        // Obtener los primeros 9 caracteres del nombre del archivo como identificador de la tienda
        const shopId = file.substring(0, 9);

        // Agrupar archivos por tienda
        if (!shopCSVFiles[shopId]) {
          shopCSVFiles[shopId] = [];
        }
        shopCSVFiles[shopId].push(path.join(csvDirectory, file));
      }
    });

    // Unificar los CSVs por tienda
    Object.keys(shopCSVFiles).forEach(shopId => {
      const shopFiles = shopCSVFiles[shopId];
      unifyShopCSVFiles(shopId, shopFiles);
    });
  });
}

// Función para unificar los archivos CSV de una tienda
function unifyShopCSVFiles(shopId, csvFiles) {
  const rows = [];

  csvFiles.forEach((file, index) => {
    fs.createReadStream(file)
      .pipe(csvParser())
      .on('data', (data) => {
        rows.push(data);
      })
      .on('end', () => {
        // Guardar el archivo CSV unificado solo después de que se hayan procesado todos los archivos
        if (index === csvFiles.length - 1) {
          const outputFilePath = path.join(outputDirectory, `${shopId}_unified.csv`);
          
          // Asegúrate de que el directorio de salida exista
          if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory);
          }

          // Escribir los datos unificados en un nuevo archivo CSV
          const csvWriterInstance = csvWriter({
            path: outputFilePath,
            header: Object.keys(rows[0]).map(field => ({ id: field, title: field }))
          });

          csvWriterInstance.writeRecords(rows)
            .then(() => {
              console.log(`CSV unificado guardado para la tienda ${shopId}: ${outputFilePath}`);
            })
            .catch(err => console.error('Error escribiendo CSV:', err));
        }
      });
  });
}

module.exports = { unifyCSVFiles };