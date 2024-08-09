const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const axios = require('axios');

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

    const browser = await puppeteer.launch();
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
                const highResUrl = thumbnailUrl.replace(/\.jpg_\d+x\d+\.jpg_\.webp$/, '.jpg_.webp');

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
};

// Example usage
const url = 'https://www.aliexpress.us/item/3256806380043412.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id:pcJustForYou,scm-url:1007.13562.333647.0,pvid:372ea3ee-810a-4e92-9771-38d1c4cdf77b,tpp_buckets:668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A';
const downloadPath = 'temp_product_media';
downloadMedia(url, downloadPath);