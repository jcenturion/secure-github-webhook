# Secure Github Webhook Middleware

## Usage

To use the Secure Github Webhook middleware requires secret in the `GH-WEBHOOK-SECRET` [secret](https://webtask.io/docs/issue_parameters) that GitHub will use to generate a [signature](https://developer.github.com/webhooks/securing/).

1. Set the `wt-node-dependencies` metadata property to the stringified JSON of an object having `@webtask/middleware-compiler` and `secure-github-webhook` properties whose values are the latest version of the [@webtask/middleware-compiler](../middleware-compiler) module and this module, respectively.

    ```json
    {"@webtask/middleware-compiler":"1.1.0","secure-github-webhook":"1.0.0"}
    ```

2. Set the `wt-compiler` metadata property on your webtask to `@webtask/middleware-compiler`.

3. Set (or add to) the `wt-middleware` metadata property of your webtask to contain a comma-separated list containing `secure-github-webhook`.

4. Set the `GH-WEBHOOK-SECRET` secret to a shared secret.

5. Configure the webtask as a [GitHub webhook](https://developer.github.com/webhooks/creating/) using the same secret.