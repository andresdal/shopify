const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

// Ruta a tu archivo .crx
const extensionPath = path.resolve(__dirname, './extensions/alisave.crx');

// ID de la extensión (reemplaza con el ID de tu extensión)
const extensionId = 'ppfoibjbcchcfifclhebkhnigneiceje'; 

// Configuración de Chrome con la extensión
const options = new chrome.Options();
options.addExtensions(extensionPath);

(async function example() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        // Abre una página de prueba para asegurarte de que el navegador está cargado
        await driver.get('https://www.aliexpress.us/item/3256806380043412.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id:pcJustForYou,scm-url:1007.13562.333647.0,pvid:372ea3ee-810a-4e92-9771-38d1c4cdf77b,tpp_buckets:668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A');

        // Espera a que se instale la extensión
        await driver.sleep(5000);

        // abre una nueva pestaña y entra a una url
        await driver.executeScript("window.open('https://www.aliexpress.us/item/3256806380043412.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id:pcJustForYou,scm-url:1007.13562.333647.0,pvid:372ea3ee-810a-4e92-9771-38d1c4cdf77b,tpp_buckets:668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A', '_blank');");

        // Espera a que se cargue la extensión
        await driver.sleep(10000);

        // Click en "All"
        let element = await driver.findElement(By.css('.b200794__2ByTX'));

        // Desplazar hasta el elemento
        await driver.executeScript("arguments[0].scrollIntoView(true);", element);

        // Ejecutar clic con JavaScript
        await driver.executeScript("arguments[0].click();", element);
        
    } finally {
        // Cierra el navegador
        //await driver.quit();
    }
})();