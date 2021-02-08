## Running locally

1. Add the following entry to your `/etc/hosts/` file (Mixmax internal note: this is already added by `mixmax-runner`):
```
127.0.0.1 sdk-local.mixmax.com
```

2. Run `npm start` to build the JS and run the web server locally

3. Load https://sdk-local.mixmax.com/examples/embeddedcalendar/index.html. You should see the embedded calendar loading.

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
