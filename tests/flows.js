const {
  openBrowser, closeBrowser, goto, reload, openTab,
  intercept, clearIntercept,
  textBox, checkBox, button,
  into, write, click, confirm, accept
} = require('taiko');
const assert = require('assert');
const qs = require('querystring');

const HEADLESS = JSON.parse(process.env.HEADLESS || 'true');

const APP_URL = 'http://localhost:8080';
const BACKEND_ORIGIN = 'https://docs.google.com';
const FORM_ID = '1FAIpQLSdWfWAbay30b8uQsBUHpaNUxOZfVx0W8CsP9AZd2N_1LQcQMg';
const BACKEND_URL = `${BACKEND_ORIGIN}/forms/d/e/${FORM_ID}/formResponse`;

const FIELDS = [
  {
    label: 'Full Name',
    postDataKey: 'entry.267687282',
    testValue: 'John Doe'
  },
  {
    label: 'NRIC/FIN/Passport Number',
    postDataKey: 'entry.516351057',
    testValue: 'S1234567D'
  },
  {
    label: 'Local Contact Number',
    postDataKey: 'entry.1173441773',
    testValue: '87654321'
  }
];

const interceptRequestCheckerHandler = (r) => {
  assert.equal(r.request.url, BACKEND_URL);
  assert.equal(r.request.method, 'POST');

  const postData = qs.parse(r.request.postData);
  for (const field of FIELDS) {
    assert.equal(postData[field.postDataKey], field.testValue);
  }

  r.respond({body: 'OK'});
};

describe('Willing User', () => {
  before(async () => {
    await openBrowser({headless: HEADLESS});
  });

  describe('Register arrival', () => {
    it('Go to app', async () => {
      await goto(APP_URL);
    });

    it('Fill in form fields', async () => {
      for (const field of FIELDS) {
        const valueWithSpacesAround = ' ' + field.testValue + ' ';
        await write(valueWithSpacesAround, into(textBox(field.label)));
      }
    });

    it('See that remember is checked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), true);
    });

    it('See that the forget button is not visible', async () => {
      assert.equal(await button('Forget').text(), '');
    });

    it('Submit', async () => {
      await intercept(BACKEND_ORIGIN, interceptRequestCheckerHandler, 1);
      await click('Submit');
    });
  });

  describe('Register arrival again', () => {
    it('Back to app', async () => {
      await goto(APP_URL, {waitForNavigation: false});
    });

    it('See that fields are remembered', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, field.testValue);
      }
    });

    it('See that remember is still checked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), true);
    });

    it('See that the forget button is visible', async () => {
      assert.ok(await button('Forget').text());
    });

    it('Submit', async () => {
      await intercept(BACKEND_ORIGIN, interceptRequestCheckerHandler, 1);
      await click('Submit');
    });
  });

  describe('Register arrival again, unchecking remember', () => {
    it('Back to app', async () => {
      await goto(APP_URL, {waitForNavigation: false});
    });

    it('See that fields are still remembered', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, field.testValue);
      }
    });

    it('Uncheck remember', async () => {
      assert.equal(await checkBox('Remember').isChecked(), true);
      await checkBox('Remember').uncheck();
    });

    it('See that the forget button is still visible', async () => {
      assert.ok(await button('Forget').text());
    });

    it('Submit', async () => {
      await intercept(BACKEND_ORIGIN, interceptRequestCheckerHandler, 1);
      await click('Submit');
    });
  });

  describe('Check that data has been cleared', () => {
    it('Back to app', async () => {
      await goto(APP_URL, {waitForNavigation: false});
    });

    it('See that fields are blank', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, '');
      }
    });

    it('See that remember is not checked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), false);
    });

    it('See that the forget button is not visible', async () => {
      assert.equal(await button('Forget').text(), '');
    });
  });

  after(async () => {
    await closeBrowser();
  });
});

const interceptRequestFailerHandler = (r) => {
  assert.fail('Submission was not prevented');
  r.respond({body: 'NOT OK'});
};

describe('Reluctant User', () => {
  const omittedField = FIELDS[1];

  before(async () => {
    await openBrowser({headless: HEADLESS});
    await intercept(BACKEND_ORIGIN, interceptRequestFailerHandler);
  });

  describe('Try to register arrival without filling in field', () => {
    it('Go to app', async () => {
      await goto(APP_URL);
    });

    it('Fill in form fields except for one', async () => {
      for (const field of FIELDS) {
        if (field === omittedField) continue;
        const valueWithSpacesAround = ' ' + field.testValue + ' ';
        await write(valueWithSpacesAround, into(textBox(field.label)));
      }
    });

    it('Try to submit', async () => {
      await click('Submit');
    });
  });

  describe('Try to bypass validation using whitespace', () => {
    it('Fill omitted field with whitespace', async () => {
      await write(' ', into(textBox(omittedField.label)));
    });

    it('Try to submit again', async () => {
      await click('Submit');
    });
  });

  describe('Give up and register arrival properly', () => {
    it('Fill omitted field properly', async () => {
      await write(omittedField.testValue, into(textBox(omittedField.label)));
    });

    it('Uncheck remember', async () => {
      await checkBox('Remember').uncheck();
    });

    it('Submit', async () => {
      await clearIntercept();
      await intercept(BACKEND_ORIGIN, interceptRequestCheckerHandler, 1);
      await click('Submit');
    });
  });

  describe('Check that data was not remembered', () => {
    it('Back to app', async () => {
      await goto(APP_URL, {waitForNavigation: false});
    });

    it('See that fields are blank', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, '');
      }
    });

    it('See that remember is not checked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), false);
    });
  });

  after(async () => {
    await closeBrowser();
  });
});

describe('Paranoid User', () => {
  before(async () => {
    await openBrowser({headless: HEADLESS});
  });

  describe('Register arrival', () => {
    it('Go to app', async () => {
      await goto(APP_URL);
    });

    it('Fill in form fields', async () => {
      for (const field of FIELDS) {
        const valueWithSpacesAround = ' ' + field.testValue + ' ';
        await write(valueWithSpacesAround, into(textBox(field.label)));
      }
    });

    it('Submit', async () => {
      await intercept(BACKEND_ORIGIN, interceptRequestCheckerHandler, 1);
      await click('Submit');
    });
  });

  describe('Forget remembered data', () => {
    it('Back to app', async () => {
      await goto(APP_URL, {waitForNavigation: false});
    });

    it('See that fields are remembered', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, field.testValue);
      }
    });

    it('See that remember is checked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), true);
    });

    it('Click the forget button', async () => {
      assert.ok(await button('Forget').text());
      confirm('Remove your information from this device?',
          async () => await accept());
      await click('Forget');
    });
  });

  describe('Check that data has been cleared', () => {
    it('See that fields are blank', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, '');
      }
    });

    it('See that remember has been unchecked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), false);
    });

    it('See that the forget button is no longer visible', async () => {
      assert.equal(await button('Forget').text(), '');
    });
  });

  describe('Check that data has really been cleared', () => {
    it('Reload page', async () => {
      await reload();
    });

    it('See that fields are still blank', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, '');
      }
    });

    it('See that remember remains unchecked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), false);
    });

    it('See that the forget button is still not visible', async () => {
      assert.equal(await button('Forget').text(), '');
    });
  });

  describe('Check that data has really, really been cleared', () => {
    it('Go to app in new tab', async () => {
      await openTab();
      await goto(APP_URL);
    });

    it('See that fields are still blank', async () => {
      for (const field of FIELDS) {
        const rememberedValue = await textBox(field.label).value();
        assert.equal(rememberedValue, '');
      }
    });

    it('See that remember remains unchecked', async () => {
      assert.equal(await checkBox('Remember').isChecked(), false);
    });

    it('See that the forget button is still not visible', async () => {
      assert.equal(await button('Forget').text(), '');
    });
  });

  after(async () => {
    await closeBrowser();
  });
});
