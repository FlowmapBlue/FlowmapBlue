const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { examples, screenshotSizes } = require('../src/examples');
const OUTPUT_PATH = path.resolve(__dirname, '../public/screenshots/');
const APP_URL = 'http://localhost:7000';

const ASPECT_RATIO = 800/600;
const PAD = 500;
const timeout = 3 * 60 * 1000;

const exampleKeys =
  process.argv.length > 2 ? process.argv.splice(2) :
  examples.map(({ key }) => key)

async function mkdirp(dirPath) {
  await new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, err => err ? reject(err) : resolve())
  })
}
(async () => {
  const browser = await puppeteer.launch();
  await mkdirp(OUTPUT_PATH);
  const page = await browser.newPage();
  await page.goto(APP_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.bp3-toast-message');
  await page.click('.bp3-toast-message button.bp3-intent-primary');
  page.on('pageerror', console.error);

  for (const size of screenshotSizes) {
    const width = size;
    const height = Math.floor(size/ASPECT_RATIO);
    await page.setViewport({ width: width + PAD * 2, height, });
    for (const key of exampleKeys) {
      const url = `${APP_URL}/${key}`;
      process.stdout.write('Making screenshot of '+ url + '\n');
      await page.goto(url, { waitUntil: 'networkidle0', timeout });
      await page.waitForSelector('.bp3-multi-select', { timeout });
      const fname = path.resolve(OUTPUT_PATH, `${key}__${width}px.jpg`);
      process.stdout.write('Writing to '+ fname + '\n');
      await page.screenshot({
        path: fname,
        clip: {
          x: PAD,
          y: 0,
          width,
          height,
        },
        type: 'jpeg',
        quality: 90,
        omitBackground: true,
      });
    }
  }
  await browser.close();
})();
