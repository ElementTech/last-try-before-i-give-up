import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });

  console.log('Navigating to localhost:5173...');
  try {
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for Three.js scene to render...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'current_render.png', fullPage: false });

    console.log('✓ Screenshot saved to current_render.png');
  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();
