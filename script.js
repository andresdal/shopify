const { downloadMedia, deleteImages } = require('./getImagesAliexpress.js');
const { getMetaTagContent } = require('./getAliexpressTitle.js');
const { generateProductData } = require('./getChatGPTDesc.js');
const { uploadImagesFromFolder, createProduct, logToFile } = require('./createProduct.js');
const { readSheet } = require('./getSheetData.js');

async function main() {
    const folderPath = './temp_product_media';

    const filteredRows = await readSheet();
    //console.log("filteredRows:" + filteredRows);

    for (const row of filteredRows) {
        console.log("row:", row);

        try {
            // Descargar medios y esperar a que termine
            await downloadMedia(row[1], folderPath);
            
            // Obtener contenido del meta tag y esperar a que termine
            const description = await getMetaTagContent(row[1]);
            
            // Generar datos del producto
            // row[6], row[7], row[8], row[9] por ejemplo, no se cual row es por ahora
            const producto_json = await generateProductData(row[3], description, row[8], row[9]); // precio y precio de comparación

            // Subir imágenes y luego crear el producto
            const imageUrls = await uploadImagesFromFolder(folderPath, row[6], row[7]); // row[6] y row[7] son el dominio y el token de Shopify
            console.log("imageUrls: ", imageUrls);
            await createProduct(imageUrls, producto_json, row[6], row[7]); // row[6] y row[7] son el dominio y el token de Shopify

        } catch (error) {
            // Registrar errores
            logToFile(`Error en el script: ${error}`);
        }

        // Eliminar imágenes después de crear el producto
        deleteImages(folderPath);
        
        // Terminar el bucle después de la primera iteración para pruebas
        break;
    }
}

main()
