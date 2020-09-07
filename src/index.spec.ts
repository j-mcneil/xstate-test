import puppeteer, { Page, Browser } from 'puppeteer';
import { Machine, send, assign } from 'xstate';
import { createModel } from '@xstate/test';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const lightMachine = Machine({
  id: 'light',
  initial: 'red',
  context:{
    timesRun: 0,
  },
  states: {
    red: {
      on: {
        TURN_GREEN: 'green'
      },
      meta: {
        test: async (page: Page) => {
          await page.waitFor('.traffic-light__light--active:nth-child(1)');
          await page.waitFor('button:not(:disabled)');
        }
      }
    },
    yellow: {
      entry: send('TURN_RED', { delay: 2500 }),
      on: {
        'TURN_RED': 'red'
      },
      meta: {
        test: async (page: Page) => {
          await page.waitFor('.traffic-light__light--active:nth-child(2)');
          await page.waitFor('button:disabled');
        },
      }
    },
    green: {
      entry: [
        assign({
          timesRun: (context: any, event) => context.timesRun + 1
        }),
        send('TURN_YELLOW', { delay: 5000 }),
      ],
      on: {
        'TURN_YELLOW': 'yellow'
      },
      meta: {
        test: async (page: Page) => {
          await page.waitFor('.traffic-light__light--active:nth-child(3)');
          await page.waitFor('button:disabled');
        }
      }
    }
  }
  // todo: finish configuring the machine to model the behavior of the application with test metadata
  // https://xstate.js.org/docs/packages/xstate-test/#quick-start
  // remember the send action creator?  You can use this to send events to the machine from itself
  // https://xstate.js.org/docs/guides/actions.html#send-action
  // hint: pay attention to the second argument of send
});

const lightModel = createModel(lightMachine).withEvents({
  TURN_GREEN: {
    exec: async (page: Page) => {
      await page.click('button');
    }
  },
  TURN_YELLOW: {},
  TURN_RED: {}
});

describe('traffic light', () => {
  let browser: Browser;
  let page: Page;
  const testPlans = lightModel.getSimplePathPlans();

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false
    });
    page = await browser.newPage();
    await page.goto('http://localhost:1234', {waitUntil: 'networkidle2'});
  })


  afterAll(async () => {
    await browser.close();
  })


  testPlans.forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          await path.test(page);
        });
      });
    });
  });

  it('should have full coverage', () => {
    return lightModel.testCoverage();
  });
});