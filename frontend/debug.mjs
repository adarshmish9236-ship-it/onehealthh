import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log("Navigating to http://localhost:4173 ...");
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
  
  console.log("Page loaded. Taking screenshot...");
  await page.screenshot({ path: 'debug.png' });
  
  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'ROOT NOT FOUND');
  console.log("Root content snippet:", rootContent.substring(0, 500));
  
  await browser.close();
})();
