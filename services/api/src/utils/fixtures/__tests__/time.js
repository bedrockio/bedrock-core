const { round } = require('lodash');
const { convertRelativeTime } = require('../time');

describe('convertRelativeTime', () => {
  let d;

  it('should convert years', async () => {
    d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    assertDateEqual(convertRelativeTime('+1y'), d);

    d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    assertDateEqual(convertRelativeTime('-1y'), d);
  });

  it('should convert months', async () => {
    d = new Date();
    d.setMonth(d.getMonth() + 1);
    assertDateEqual(convertRelativeTime('+1m'), d);

    d = new Date();
    d.setMonth(d.getMonth() - 1);
    assertDateEqual(convertRelativeTime('-1m'), d);
  });

  it('should convert weeks', async () => {
    d = new Date();
    d.setDate(d.getDate() + 7);
    assertDateEqual(convertRelativeTime('+1w'), d);

    d = new Date();
    d.setDate(d.getDate() - 7);
    assertDateEqual(convertRelativeTime('-1w'), d);
  });

  it('should convert days', async () => {
    d = new Date();
    d.setDate(d.getDate() + 1);
    assertDateEqual(convertRelativeTime('+1d'), d);

    d = new Date();
    d.setDate(d.getDate() - 1);
    assertDateEqual(convertRelativeTime('-1d'), d);
  });

  it('should convert hours', async () => {
    d = new Date();
    d.setHours(d.getHours() + 1);
    assertDateEqual(convertRelativeTime('+1h'), d);

    d = new Date();
    d.setHours(d.getHours() - 1);
    assertDateEqual(convertRelativeTime('-1h'), d);
  });

  it('should convert minutes', async () => {
    d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    assertDateEqual(convertRelativeTime('+1min'), d);

    d = new Date();
    d.setMinutes(d.getMinutes() - 1);
    assertDateEqual(convertRelativeTime('-1min'), d);
  });

  it('should convert seconds', async () => {
    d = new Date();
    d.setSeconds(d.getSeconds() + 1);
    assertDateEqual(convertRelativeTime('+1s'), d);

    d = new Date();
    d.setSeconds(d.getSeconds() - 1);
    assertDateEqual(convertRelativeTime('-1s'), d);
  });

  it('should convert multiple', async () => {
    d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    d.setMonth(d.getMonth() + 6);
    d.setDate(d.getDate() + 15);

    assertDateEqual(convertRelativeTime('5y6m15d'), d);
  });

  it('should convert multiple with direction shift', async () => {
    d = new Date();
    d.setFullYear(d.getFullYear() + 5);
    d.setMonth(d.getMonth() - 6);

    assertDateEqual(convertRelativeTime('+5y-6m'), d);
  });

  it('should preserve direction', async () => {
    d = new Date();
    d.setFullYear(d.getFullYear() - 5);
    d.setMonth(d.getMonth() - 6);

    assertDateEqual(convertRelativeTime('-5y6m'), d);
  });

  it('should infer minutes from hours', async () => {
    d = new Date();
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);

    assertDateEqual(convertRelativeTime('5h30m'), d);
  });
});

function assertDateEqual(d1, d2) {
  expect(round(d1.getTime(), -2)).toEqual(round(d2.getTime(), -2));
}
