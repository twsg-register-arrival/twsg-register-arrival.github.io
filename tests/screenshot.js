const {
  openBrowser, closeBrowser, screenshot, setViewPort, goto
} = require('taiko');
const assert = require('assert');
const fs = require('fs');

const APP_URL = 'http://web';
const BROWSER_OPTIONS = {
  host: 'localhost', port: 3000, args: ['--hide-scrollbars']
};
const THUMB_FILE = 'thumb.png';

describe('OpenGraph image preview', () => {
  const width = 1200;
  const height = 630;
  const fullPage = false;

  before(async () => {
    await openBrowser(BROWSER_OPTIONS);
    await setViewPort({width, height});
    await goto(APP_URL);
  });

  it('Ensure screenshot is up-to-date', async () => {
    let existingFileData;
    try {
      existingFileData = fs.readFileSync(THUMB_FILE);
    } catch (err) {
      existingFileData = '';
    }

    const existingScreenshot = Buffer.from(existingFileData).toString('base64');
    const newScreenshot = await screenshot({encoding: 'base64', fullPage});

    if (newScreenshot !== existingScreenshot) {
      fs.writeFileSync(THUMB_FILE, Buffer.from(newScreenshot, 'base64'));
      assert.fail(`UI change detected. Wrote new screenshot to ${THUMB_FILE}`);
    }
  });

  after(async () => {
    await closeBrowser();
  });
});
