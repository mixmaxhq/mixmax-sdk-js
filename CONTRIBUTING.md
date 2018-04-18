## Running locally

Run `yarn start` to build the JS and run the web server locally. Also make sure you have
[our web proxy](https://github.com/mixmaxhq/mixmax-runner/) running. Then point local Mixmax apps to use
the snippet at path `https://sdk-local.mixmax.com/dist/editor.umd.js`.

Note that locally means your local mixmax-sdk-js server, but embedded calendars and sequence pickers
will point to their production domains.  Developers can edit
[source](https://github.com/mixmaxhq/mixmax-sdk-js/blob/master/src/utils/Environment.js) to point to
the local domains instead.

## File structure

`/src/` - Source JS that is built to form the current version of the SDK.
`/assets/` - Non-JS assets that are packaged with the current version of the SDK.
`/dist/` - The destination directory for build output and assets. Not checked into Git.

## Testing

You can run end-to-end integration tests for the SDK by running `yarn test`.

By default, this will attempt to run the tests over a proxy to [Sauce Labs](https://saucelabs.com/)
(tests will run there, but you'll still see logs in your terminal), so that we can test against a
full suite of browser and operating system versions. To do this, you will need to define a file
called `sauce-creds.json` at the root level of the project with the structure

```json
{
  "user": "valid Sauce Labs user",
  "key": "Sauce Labs API key"
}
```

`"user"` is the email with which you log into Sauce Labs, and once you've logged in, `"key"` is
the "Access Key" shown [here](https://saucelabs.com/beta/user-settings). Mixmax engineers can log
into Sauce Labs using the credentials in 1Password. It is fine to use the existing key; please do
not regenerate it without [updating Travis](https://travis-ci.org/mixmaxhq/mixmax-sdk-js/settings).

If a test fails in Sauce Labs, you may be able to reproduce it using a
[manual test](https://saucelabs.com/beta/manual).

If you do not have access to Sauce Labs, or if you want to run fewer tests more quickly, you
can run the tests locally by setting `runLocally = true` at the top of
[the test configuration](https://github.com/mixmaxhq/mixmax-sdk-js/blob/master/wdio.conf.js).
Make sure to update `capabilities` below that to only contain browser and operating system
versions that match what you have installed on your machine, and also note the warning about
specifying `'macOS'`.

### Compatibility targets

Our goal is to be compatible with the last two major versions of Chrome, Safari, Firefox,
IE, and Edge across a sampling of operating systems. We may also explicitly support specific
other configurations upon customer request. The full list of targets is listed under
`capabilities` in [the test configuration](https://github.com/mixmaxhq/mixmax-sdk-js/blob/master/wdio.conf.js).

Note that certain targets may be disabled pending browser support; see [here](https://github.com/mixmaxhq/mixmax-sdk-js/projects/1).

## Deployment (for Mixmax engineers)

Run [`npm-publish`](https://github.com/mixmaxhq/mixmax-runner/blob/master/scripts/npm-publish)
_with the `--no-publish` flag_.

Travis will respond to the new tag being pushed to the remote by building the
SDK and publishing the new version of the package to npm as well as to the CDN.

CDN releases will be scoped under the directory `/v${VERSION}`. For instance,
if you just released version 1.2.1, the overall UMD bundle will be available at
https://sdk.mixmax.com/v1.2.1/Mixmax.umd.js.

After you release a new version of the SDK, please update the following locations in the product
that reference a particular version of the SDK so that users will know to install the newer
version:

* The "Share your link" flyout in meeting types, which shares code for calendar embeeding

^ We should automate this in the future, perhaps by fetching the latest, acceptable SDK version
from an API.
