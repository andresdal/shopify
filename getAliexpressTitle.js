const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { distinguirURL } = require('./distinguirURL.js');
const puppeteer = require('puppeteer');

async function getMetaTagContent(url) {
    // Obtener el dominio de la URL
    var domain = distinguirURL(url);

    if(domain === "aliexpress") {
        let options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--log-level=3');

        let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        try {
            // Navegar a la página deseada
            await driver.get(url);

            // Esperar que el elemento meta sea visible
            let metaTag = await driver.findElement(By.css('meta[property="og:title"]'));

            // Obtener el atributo content del meta tag
            let content = await metaTag.getAttribute('content');

            // Imprimir el contenido
            console.log('Meta tag content:', content);
            return content;
        } finally {
            await driver.quit();
        }
    } 
    else if(domain === "amazon"){
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.goto(url);

            // Esperar que el elemento productTitle sea visible
            await page.waitForSelector('#productTitle');

            // Obtener el título del producto
            const title = await page.$eval('#productTitle', element => element.textContent.trim());

            // Esperar que el elemento feature-bullets sea visible
            await page.waitForSelector('#feature-bullets');

            // Obtener la lista de elementos a-list-item
            const bulletPoints = await page.$$eval('#feature-bullets .a-unordered-list.a-vertical.a-spacing-mini .a-list-item', items => 
                items.map(item => item.textContent.trim()).join(' ')
            );

            // Concatenar el título y los puntos de la lista con un salto de línea
            const result = `${title}\n${bulletPoints}`;

            // Imprimir el contenido concatenado
            console.log('Result:', result);
            await browser.close();
            return result;
        } catch (error) {
            console.error('Error:', error);
        }
    }
    else {
        console.log("La URL no es de aliexpress ni de Amazon");
    }

    
}

module.exports = { getMetaTagContent };