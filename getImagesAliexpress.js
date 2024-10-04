const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');
const { log } = require('console');
const { distinguirURL } = require('./distinguirURL.js');

const downloadFile = async (url, filePath) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        response.data.pipe(fs.createWriteStream(filePath));
        console.log(`File downloaded: ${filePath}`);
    } catch (error) {
        console.error(`Error downloading file ${url}:`, error.message);
    }
};

const downloadMedia = async (url, downloadPath) => {
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    var domain = distinguirURL(url);

    if(domain === "aliexpress") {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
    
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
    
            // Wait for all the thumbnail images to be loaded
            await page.waitForSelector('.slider--img--K0YbWW2 img');
    
            // Scroll through the slider to load all the thumbnails
            const thumbnailCount = await page.$$eval('.slider--img--K0YbWW2 img', imgs => imgs.length);
            for (let i = 0; i < Math.ceil(thumbnailCount / 6); i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
    
            // Obtain all the thumbnail URLs
            const thumbnailUrls = await page.$$eval('.slider--img--K0YbWW2 img', imgs =>
                imgs.map(img => img.src)
            );
    
            let downloadedCount = 0;
            const totalCount = thumbnailUrls.length;
    
            for (const [index, thumbnailUrl] of thumbnailUrls.entries()) {
                try {
                    // Construct the high-resolution image URL from the thumbnail URL
                    var highResUrl = thumbnailUrl.replace(/\.jpg_\d+x\d+\.jpg_\.webp$/, '.jpg');
                    highResUrl = highResUrl.replace(/\.png_\d+x\d+\.png_\.webp$/, '.png');
    
                    const fileExtension = path.extname(highResUrl);
                    const fileName = path.basename(highResUrl);
                    const filePath = path.join(downloadPath, fileName);
    
                    await downloadFile(highResUrl, filePath);
                    downloadedCount++;
                    console.log(`Progress: ${downloadedCount}/${totalCount} files downloaded.\n`);
                } catch (error) {
                    console.error('Error processing an image:', error.message);
                }
            }
    
            console.log(`Download complete. ${downloadedCount} of ${totalCount} files downloaded.`);
        } catch (error) {
            console.error('Error getting media:', error.message);
        } finally {
            await browser.close();
        }
    }
    else if(domain === "amazon") {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
    
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
    
            // Wait for the altImages element to be loaded
            await page.waitForSelector('#altImages');
    
            // Scroll through the slider to load all the thumbnails
            const thumbnailCount = await page.$$eval('#altImages .a-spacing-small.item.imageThumbnail', imgs => imgs.length);
            for (let i = 0; i < Math.ceil(thumbnailCount / 6); i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
    
            // Obtain all the thumbnail URLs
            const thumbnailUrls = await page.$$eval('#altImages .a-spacing-small.item.imageThumbnail img', imgs =>
                imgs.map(img => img.src)
            );
    
            let downloadedCount = 0;
            const totalCount = thumbnailUrls.length;
    
            for (const [index, thumbnailUrl] of thumbnailUrls.entries()) {
                try {
                    // Construct the high-resolution image URL from the thumbnail URL
                    var highResUrl = thumbnailUrl.replace(/(\._.*)(\.jpg|\.png)$/, '$2');
    
                    const fileExtension = path.extname(highResUrl);
                    const fileName = path.basename(highResUrl);
                    const filePath = path.join(downloadPath, fileName);
    
                    await downloadFile(highResUrl, filePath);
                    downloadedCount++;
                    console.log(`Progress: ${downloadedCount}/${totalCount} files downloaded.\n`);
                } catch (error) {
                    console.error('Error processing an image:', error.message);
                }
            }
    
            console.log(`Download complete. ${downloadedCount} of ${totalCount} files downloaded.`);
        } catch (error) {
            console.error('Error getting media:', error.message);
        } finally {
            await browser.close();
        }
    } 
    else {
        console.log("La URL no es de aliexpress ni de Amazon")
    }
};

function deleteImages(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
                fs.unlink(filePath, err => {
                    if (err) {
                        console.error('Error deleting file:', filePath, err);
                    } else {
                        console.log('Deleted file:', filePath);
                    }
                });
            }
        });
    });
}

const downloadReviewImages = async (url, downloadPath) => {
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    var domain = distinguirURL(url);

    if(domain === "aliexpress") {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
    
        try {
            await page.goto(url, { waitUntil: 'networkidle2' });
    
            // Wait for the "Pic review" button and click it
            try {
                await page.waitForSelector('.filter--filterItem--WGNBYnm', { timeout: 10000 });
            } catch (error) {
                console.error('No "Pic review" button found:', error.message);
                return;
            }
    
            await page.evaluate(() => {
                const elements = document.querySelectorAll('.filter--filterItem--WGNBYnm');
                for (let element of elements) {
                    if (element.textContent.includes('Pic review')) {
                        element.click();
                        break;
                    }
                }
            });
    
            // Wait for review images to appear
            await page.waitForSelector('.list--box--L2Vw5GB');
    
            // Obtén todas las reseñas
            const reviewImages = await page.$$eval('.list--box--L2Vw5GB .list--itemWrap--TMqSVfA', reviews => {
                return reviews.map(review => {
                // Busca la imagen dentro de la reseña
                const imageElement = review.querySelector('.list--itemThumbnail--EJwQBGo img');
                return imageElement ? imageElement.src : null; // Si existe la imagen, devuelve la URL
                }).filter(Boolean); // Elimina valores nulos
            });
    
            // console.log('Primeras imágenes de cada reseña:', reviewImages);
    
            let downloadedCount = 0;
            const totalCount = reviewImages.length;
    
            // Download each image
            for (let imgUrl of reviewImages) {
                try {
                    // Adjust the image URL to high resolution
                    const highResUrl = imgUrl.replace(/\.jpg_\d+x\d+\.jpg_\.webp$/, '.jpg').replace(/\.png_\d+x\d+\.png_\.webp$/, '.png');
                    const fileName = path.basename(highResUrl);
                    const filePath = path.join(downloadPath, fileName);
    
                    await downloadFile(highResUrl, filePath);
                    downloadedCount++;
                    console.log(`Progress: ${downloadedCount}/${totalCount} files downloaded.\n`);
                } catch (error) {
                    console.error('Error processing an image:', error.message);
                }
            }
    
            console.log(`Download complete. ${downloadedCount} of ${totalCount} files downloaded.`);
        } catch (error) {
            console.error('Error getting media:', error.message);
        } finally {
            await browser.close();
        }
    }
    else if(domain === "amazon") {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url);

        // Wait for the element with the specified ID to be visible
        try{
            await page.waitForSelector('._Y3Itb_cr-carousel-heading_1JAfE');
        }
        catch (error) {
            console.error('Not found review images:', error.message);
            return;
        }

        // Extract image URLs and reviewer IDs
        const images = await page.$$eval('._Y3Itb_cr-carousel-heading_1JAfE + .a-row.a-carousel-controls.a-carousel-row.a-carousel-has-buttons.a-carousel-overlay-buttons .a-carousel-row-inner .a-carousel-col.a-carousel-center .a-carousel-viewport .a-carousel .a-carousel-card ._Y3Itb_media-thumbnail-container_2MRZY', items => {
            console.log(items);
            const uniqueReviewers = new Set();
            return items
                .map(item => {
                    const url = item.getAttribute('data-url');
                    const reviewId = item.getAttribute('data-reviewid');
                    return { url, reviewId };
                })
                .filter(item => {
                    if (!uniqueReviewers.has(item.reviewId)) {
                        uniqueReviewers.add(item.reviewId);
                        return true;
                    }
                    return false;
                })
                .map(item => item.url);
        });

        // If there are no reviews, return early
        if (images.length === 0) {
            console.log('No reviews found.');
            await browser.close();
            return;
        }

        // Download the images
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            const imagePath = path.join(downloadPath, `review_image_${i + 1}.jpg`);
            await downloadFile(imageUrl, imagePath);
            console.log(`Downloaded image ${i + 1}: ${imageUrl}`);
        }

        await browser.close();

    }
    else {
        console.log("La URL no es de aliexpress ni de Amazon")
    }
    
};

module.exports = { downloadMedia, deleteImages, downloadReviewImages};