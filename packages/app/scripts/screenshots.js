const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const puppeteer = require('puppeteer');
const { examples, aspectRatio, screenshotSizes } = require('../src/examples');
const OUTPUT_PATH = path.resolve(__dirname, '../public/screenshots/');
const APP_URL = 'http://localhost:7000';

const PAD = 600;
const timeout = 3 * 60 * 1000;
const SIZE = 1200;

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

  const width = SIZE;
  const height = Math.floor(SIZE/aspectRatio);
  await page.setViewport({ width: width + PAD * 2, height, });
  for (const key of exampleKeys) {
    const ex = examples.find(ex => ex.key === key)
    const query = ex ? ex.query : undefined
    const url = `${APP_URL}/${key}/embed${query ? `?${query}` : ''}`;
    process.stdout.write('Making screenshot of '+ url + '\n');
    await page.goto(url, { waitUntil: 'networkidle0', timeout });
    await page.waitForSelector('.bp3-multi-select', { timeout });
    await page.waitFor(3000);
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
      quality: 100,
      omitBackground: true,
    });
  }
  await browser.close();



  for (const key of exampleKeys) {
    const fname = path.resolve(OUTPUT_PATH, `${key}__${SIZE}px.jpg`);
    for (const size of screenshotSizes) {
      if (size != SIZE) {
        const resized = await sharp(fname)
          .resize(size)
          .toFile(path.resolve(OUTPUT_PATH, `${key}__${size}px.jpg`));
      }
    }
  }

})();
