const { downloadMedia, deleteImages } = require('./getImagesAliexpress.js');
const { getMetaTagContent } = require('./getAliexpressTitle.js');
const { generateProductData } = require('./getChatGPTDesc.js');
const { uploadImagesFromFolder, createProduct, logToFile } = require('./createProduct.js');
const { readSheet, writeToSheet } = require('./getSheetData.js');

async function main() {
    const folderPath = './temp_product_media';

    const filteredRows = await readSheet();

    if(!filteredRows || filteredRows.length === 0) {
        console.log('No hay productos nuevos para subir.');
        return;
    }

    for (const row of filteredRows) {
        console.log("row:", row);

        try {
            // Descargar medios y esperar a que termine
            await downloadMedia(row[1], folderPath);
            
            // Obtener contenido del meta tag y esperar a que termine
            const description = await getMetaTagContent(row[1]);
            
            // Generar datos del producto
            const producto_json = await generateProductData(row[2], description, row[7], row[8]); // precio y precio de comparación

            // Subir imágenes y luego crear el producto
            const imageUrls = await uploadImagesFromFolder(folderPath, row[5], row[6]); // dominio y el token de Shopify
            console.log("imageUrls: ", imageUrls);

            await createProduct(imageUrls, producto_json, row[5], row[6]); // dominio y el token de Shopify

            await writeToSheet(parseInt(row[0]) + 1, 10, 'TRUE');

        } catch (error) {
            // Registrar errores
            logToFile(`Error en el script: ${error}`);
        }

        // Eliminar imágenes después de crear el producto
        deleteImages(folderPath);

        break;
    }
}

main()
