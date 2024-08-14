const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function getMetaTagContent(url) {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

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

module.exports = { getMetaTagContent };
