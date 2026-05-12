import arcjet, { detectBot, shield, slidingWindow } from '@arcjet/node';

const createClient = max =>
  arcjet({
    key: process.env.ARCJET_KEY,

    characteristics: ['userId'],

    rules: [
      shield({
        mode: 'LIVE',
      }),

      detectBot({
        mode: 'LIVE',

        allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
      }),

      slidingWindow({
        mode: 'LIVE',
        max,
        interval: process.env.NODE_ENV === 'production' ? '1m' : '1s',
      }),
    ],
  });

export const arcjetClients = {
  guest: createClient(10),
  requester: createClient(75),
  approver: createClient(75),
  admin: createClient(100),
};
