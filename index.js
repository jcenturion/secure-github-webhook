'use strict';
const crypto  = require('crypto');
const bodyParser = require('body-parser');

const AUTH_SECRET_NAME = 'GH-WEBHOOK-SECRET';

module.exports = createGhSecureWebhookMiddleware;

function createGhSecureWebhookMiddleware() {
  return function middleware(req, res, next) {
    bodyParser.json()(req, res, function () {
      const ctx = req.webtaskContext;
      
      //ensure that the context uses the parsed body
      ctx.body = req.body;
      
      if (ctx.secrets && ctx.secrets[AUTH_SECRET_NAME]) {
        const hash = crypto
                      .createHmac('sha1', ctx.secrets[AUTH_SECRET_NAME])
                      .update(JSON.stringify(req.body))
                      .digest('hex');

        const signature = ctx.headers['x-hub-signature'];

        if (signature === `sha1=${hash}`) {
          return next();
        }

        const error = new Error('Invalid signature');
        error.statusCode = 401;

        return next(error);
      }

      return next();
    });
  };
}
