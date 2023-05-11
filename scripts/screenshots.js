const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const puppeteer = require('puppeteer');
const {examples, aspectRatio, screenshotSizes} = require('../examples');
const OUTPUT_PATH = path.resolve(__dirname, '../public/screenshots/');
const APP_URL = 'http://localhost:3000';

const PAD = 600;
const timeout = 3 * 60 * 1000;
const SIZE = 1200;

const exampleKeys = process.argv.length > 2 ? process.argv.splice(2) : examples.map(({key}) => key);

async function mkdirp(dirPath) {
  await new Promise((resolve, reject) => {
    fs.mkdir(dirPath, {recursive: true}, (err) => (err ? reject(err) : resolve()));
  });
}
(async () => {
  const browser = await puppeteer.launch();
  await mkdirp(OUTPUT_PATH);
  const page = await browser.newPage();
  // await page.goto(APP_URL, {waitUntil: 'networkidle2'});
  // await page.waitForSelector('.bp4-toast-message');
  // await page.click('.bp4-toast-message button.bp4-intent-primary');
  // page.on('pageerror', console.error);

  function getOutFileName(key, sheet, width) {
    return path.resolve(OUTPUT_PATH, `${key}${sheet ? `_${sheet}` : ''}__${width}px.jpg`);
  }

  const width = SIZE;
  const height = Math.floor(SIZE / aspectRatio);
  await page.setViewport({width: width + PAD * 2, height});
  for (const key of exampleKeys) {
    const ex = examples.find((ex) => ex.key === key);
    const query = ex ? ex.query : undefined;
    const sheet = ex ? ex.sheet : undefined;
    const url = `${APP_URL}/${key}${sheet ? `/${sheet}` : ''}/embed${query ? `?${query}` : ''}`;
    process.stdout.write('Making screenshot of ' + url + '\n');
    await page.goto(url, {waitUntil: 'networkidle0', timeout});
    await page.waitForSelector('.bp4-multi-select', {timeout});
    await page.waitForTimeout(3000);
    const fname = getOutFileName(key, sheet, width);
    process.stdout.write('Writing to ' + fname + '\n');
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
    const ex = examples.find((ex) => ex.key === key);
    const sheet = ex ? ex.sheet : undefined;
    const fname = getOutFileName(key, sheet, SIZE);
    for (const size of screenshotSizes) {
      if (size != SIZE) {
        const resized = await sharp(fname).resize(size).toFile(getOutFileName(key, sheet, size));
      }
    }
  }
})();
