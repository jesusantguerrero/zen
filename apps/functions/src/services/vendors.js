const puppeteer = require('puppeteer');

const getProduct = async (productName) => {
  const startedAt = new Date();
  const browser = await puppeteer.launch({
    headless: false,
    timeout: 60000,
    waitForInitialPage: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--window-size=1280,720',
    ],
  });
  const page = await browser.newPage();
    try {

    
      await page.setRequestInterception(true);

      page.on('request', (interceptedRequest) => {
        const blockResources = ['script', 'stylesheet', 'image', 'media', 'font'];
        if (blockResources.includes(interceptedRequest.resourceType())) {
          interceptedRequest.abort();
        } else {
          interceptedRequest.continue();
        }
      });

      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
      );

      await page.goto(productName.toLowerCase(), {
        waitUntil: 'domcontentloaded'
      });

      const result = await page.evaluate(() => {
        const mainImage = document.querySelector(".lcp-gallery__hook")
        const name = document.querySelector(".product-intro__head-name")
        const id = document.querySelector(".product-intro__head-sku")
        const price = document.querySelector(".discount .from")
  
        return {
          mainImage: mainImage?.src,
          productName: name?.textContent,
          id: id.textContent?.replace?.('SKU: ', ''),
          price: price?.textContent
        }
      });
      await browser.close();
      return result;
    } catch (e) {
      await browser.close();
      return {}
    }
  
};

export default getProduct;