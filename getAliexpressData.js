const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

(async function example() {
  let driver = new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://www.aliexpress.us/item/3256806380043412.html?spm=a2g0o.home.pcJustForYou.321.468a76dbxODmO7&gps-id=pcJustForYou&scm=1007.13562.333647.0&scm_id=1007.13562.333647.0&scm-url=1007.13562.333647.0&pvid=372ea3ee-810a-4e92-9771-38d1c4cdf77b&_t=gps-id:pcJustForYou,scm-url:1007.13562.333647.0,pvid:372ea3ee-810a-4e92-9771-38d1c4cdf77b,tpp_buckets:668%232846%238108%231977&pdp_npi=4%40dis%21USD%2124.55%217.05%21%21%21177.62%2150.97%21%402101c71a17223659835588254ef84b%2112000037691562904%21rec%21US%21%21ABX&utparam-url=scene%3ApcJustForYou%7Cquery_from%3A');
    
    // Esperar a que el contenido esté disponible
    await driver.wait(until.elementLocated(By.css('.title--wrap--UUHae_g h1[data-pl="product-title"]')), 30000);
    await driver.wait(until.elementLocated(By.css('.price--currentPriceText--V8_y_b5')), 30000);
    await driver.wait(until.elementLocated(By.css('#product-description')), 30000);

    // Extraer datos
    const title = await driver.findElement(By.css('.title--wrap--UUHae_g h1[data-pl="product-title"]')).getText();
    const originalPrice = await driver.findElement(By.css('.price--originalText--gxVO5_d')).getText();
    const currentPrice = await driver.findElement(By.css('.price--currentPriceText--V8_y_b5')).getText();
    const description = await driver.findElement(By.css('#product-description')).getAttribute('innerHTML');

    console.log('Product Data:', {
      title,
      originalPrice,
      currentPrice,
      description
    });

  } finally {
    await driver.quit();
  }
})();
