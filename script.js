const { downloadMedia, deleteImages, downloadReviewImages } = require('./getImagesAliexpress.js');
const { getMetaTagContent } = require('./getAliexpressTitle.js');
const { generateProductData, generateProductReviews } = require('./getChatGPTDesc.js');
const { uploadImagesFromFolder, createProduct, logToFile } = require('./createProduct.js');
const { readSheet, writeToSheet } = require('./getSheetData.js');
const fs = require('fs');
const { unifyCSVFiles } = require('./unificar_csv.js');

async function main() {

    // Delete all files in csv_files folder
    fs.readdirSync('./csv_files').forEach(file => {
        fs.unlinkSync(`./csv_files/${file}`);
    });

    fs.readdirSync('./unified_csv_files').forEach(file => {
        fs.unlinkSync(`./unified_csv_files/${file}`);
    });

    const folderPath = './temp_product_media';

    const filteredRows = await readSheet();

    if(!filteredRows || filteredRows.length === 0) {
        console.log('No hay productos nuevos para subir.');
        return;
    }

    for (const row of filteredRows) {
        console.log("Creando producto nro", row[0]);

        try {
            // Descargar medios y esperar a que termine
            await downloadMedia(row[1], folderPath);
            
            // Obtener contenido del meta tag y esperar a que termine
            const description = await getMetaTagContent(row[1]);
            
            // Generar datos del producto
            const producto_json = await generateProductData(row[2], description, row[7], row[8]); // precio y precio de comparación

            // Subir imágenes y luego crear el producto
            const imageUrls = await uploadImagesFromFolder(folderPath, row[5], row[6]); // dominio y el token de Shopify
            //console.log("imageUrls: ", imageUrls);

            let [product_title, product_handle] = await createProduct(imageUrls, producto_json, row[5], row[6]); // dominio y el token de Shopify

            // Obtener imagenes de resenias
            if (!fs.existsSync("./temp_review_imgs")) {
                fs.mkdirSync("./temp_review_imgs", { recursive: true });
              }
            await downloadReviewImages(row[1], "./temp_review_imgs");

            // Subir imagenes de resenias
            let review_images = await uploadImagesFromFolder("./temp_review_imgs", row[5], row[6]);

            // Generar reseñas del producto
            await generateProductReviews(product_handle, row[2], row[3], product_title, review_images, row[5]);

            await writeToSheet(parseInt(row[0]) + 1, 10, 'TRUE');

        } catch (error) {
            // Registrar errores
            logToFile(`Error en el script: ${error}`);
        }

        // Eliminar imágenes después de crear el producto
        deleteImages(folderPath);
        deleteImages("./temp_review_imgs");
    }
    unifyCSVFiles();
}

main()
