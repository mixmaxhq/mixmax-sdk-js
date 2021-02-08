## Running locally

1. Run `npm start` to build the JS and run the web server locally

2. Load https://sdk-local.mixmax.com/examples/embeddedcalendar/index.html. You should see the embedded calendar loading.

Note that _locally_ means your local mixmax-sdk-js server, but embedded calendars and sequence pickers
will point to their production domains. Mixmax internal note: edit
[source](https://github.com/mixmaxhq/mixmax-sdk-js/blob/master/src/utils/Environment.js) to point to
local domains instead.

## File structure

`/src/` - Source JS that is built to form the current version of the SDK.
`/assets/` - Non-JS assets that are packaged with the current version of the SDK.
`/dist/` - The destination directory for build output and assets. Not checked into Git.


### Compatibility targets

Our goal is to be compatible with the last two major versions of Chrome, Safari, Firefox,
IE, and Edge across a sampling of operating systems. We may also explicitly support specific
other configurations upon customer request.

Note that certain targets may be disabled pending browser support; see [here](https://github.com/mixmaxhq/mixmax-sdk-js/projects/1).

## Deployment (for Mixmax engineers)

1. Run `npm version <next version string>`
2. Update CHANGELOG.md and commit
3. Run `git push --follow-tags`
4. Run `npm publish`
5. Run `npm run upload`

CDN releases will be scoped under the directory `/v${VERSION}`. For instance,
if you just released version 2.0.6, the overall UMD bundle will be available at
https://sdk.mixmax.com/v2.0.0/widgets.umd.min.js.

After you release a new version of the SDK, please update the following locations in the product
that reference a particular version of the SDK so that users will know to install the newer
version:

* The "Share your link" flyout in meeting types, which shares code for calendar embeeding
* Developer documention page https://developer.mixmax.com/docs/introduction-widget-sdk

^ We should automate this in the future, perhaps by fetching the latest, acceptable SDK version
from an API.
