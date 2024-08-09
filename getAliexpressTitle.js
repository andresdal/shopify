const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function getMetaTagContent() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();
    try {
        // Navegar a la página deseada
        await driver.get('https://www.aliexpress.us/item/3256806380043412.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id:pcJustForYou,scm-url:1007.13562.333647.0,pvid:372ea3ee-810a-4e92-9771-38d1c4cdf77b,tpp_buckets:668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A');

        // Esperar que el elemento meta sea visible
        let metaTag = await driver.findElement(By.css('meta[property="og:title"]'));

        // Obtener el atributo content del meta tag
        let content = await metaTag.getAttribute('content');

        // Imprimir el contenido
        console.log('Meta tag content:', content);
    } finally {
        await driver.quit();
    }
})();
