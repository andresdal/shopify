const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function getProductImages(url) {
    try {
        // Hacer una solicitud HTTP a la página del producto
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Seleccionar imágenes dentro del contenedor deseado
        const imageElements = $('.slider--img--K0YbWW2 img');
        
        // Obtener URLs de las imágenes
        const imageUrls = [];
        imageElements.each((index, element) => {
            const imgSrc = $(element).attr('src');
            if (imgSrc) {
                imageUrls.push(imgSrc);
            }
        });

        // Descargar las imágenes
        for (const imgUrl of imageUrls) {
            try {
                const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
                const fileName = path.basename(new URL(imgUrl).pathname);
                fs.writeFileSync(fileName, response.data);
                console.log(`Imagen descargada: ${fileName}`);
            } catch (error) {
                console.error(`Error al descargar la imagen ${imgUrl}:`, error.message);
            }
        }

    } catch (error) {
        console.error(`Error al obtener las imágenes:`, error.message);
    }
}

// URL del producto de AliExpress
const productUrl = 'https://www.aliexpress.us/item/1005006566358164.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id%3ApcJustForYou%2Cscm-url%3A1007.13562.333647.0%2Cpvid%3A372ea3ee-810a-4e92-9771-38d1c4cdf77b%2Ctpp_buckets%3A668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A&gatewayAdapt=4itemAdapt';
getProductImages(productUrl);
