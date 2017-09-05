'use strict';

const Assert = require('assert');
const AuthMiddleware = require('../');
const Crypto = require('crypto');
const Hoek = require('hoek');
const Lab = require('lab');
const Shot = require('shot');
const crypto = require('crypto');

const lab = Lab.script();
const {
  describe,
  it
} = lab;

module.exports = {
  lab
};

describe('github webhhok secure middleware', {
  parallel: false
}, () => {
  it('accepts a request with a valid signature', done => {
    const token = Crypto.randomBytes(32).toString('hex');
    const run = createMockRunner({
      secrets: {
        'GH-WEBHOOK-SECRET': token
      }
    });

    const hash = crypto
      .createHmac('sha1', token)
      .update(JSON.stringify({ test: 'test' }))
      .digest('hex');

    return run({
        headers: {
          'X-Hub-Signature': `sha1=${hash}`
        }
      },
      error => {
        Assert.ifError(error);

        return done();
      }
    );
  });

  it('rejects a request with an invalid signature', done => {
    const token = Crypto.randomBytes(32).toString('hex');
    const token2 = Crypto.randomBytes(32).toString('hex');
    const run = createMockRunner({
      secrets: {
        'GH-WEBHOOK-SECRET': token
      }
    });

    const hash = crypto
      .createHmac('sha1', token2)
      .update(JSON.stringify({ test: 'test' }))
      .digest('hex');

    return run({
        headers: {
          'X-Hub-Signature': `sha1=${hash}`
        }
      },
      error => {
        Assert.ok(error);
        Assert.equal(error.statusCode, 401);

        return done();
      }
    );    
  });
});

function createMockRunner(webtaskContext = {}) {
  const middlewareFn = AuthMiddleware();

  return function run(requestOptions, next) {
    const defaultWebtaskContext = {
      headers: requestOptions.headers || {},
    };
    const dispatchFn = (req, res) => {
      req.webtaskContext = Hoek.applyToDefaults(
        defaultWebtaskContext,
        webtaskContext
      );

      req.body = { test: 'test' };
      req.headers = requestOptions.headers || {};

      return middlewareFn(req, res, next);
    };

    const defaultRequestOptions = {
      url: '/'
    };

    return Shot.inject(
      dispatchFn,
      Hoek.applyToDefaults(defaultRequestOptions, requestOptions),
      res => Assert.fail(res, null, 'Unexpected response')
    );
  };
}

if (require.main === module) {
  Lab.report([lab], {
    output: process.stdout,
    progress: 2
  });
}