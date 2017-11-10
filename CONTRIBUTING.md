## Running locally

Run `yarn start` to build the JS and run the web server locally. Then point local Mixmax apps to use
the snippet at path `http://localhost:9000/dist/editor.umd.js`.

## File structure

`/src/` - Source JS that is built to form the current version of the SDK.
`/assets/` - Non-JS assets that are packaged with the current version of the SDK.
`/dist/` - The destination directory for build output and assets. Not checked into Git.

## Deployment

Run [`npm-publish`](https://github.com/mixmaxhq/mixmax-runner/blob/master/scripts/npm-publish)
_with the `--no-publish` flag_.

Travis will respond to the new tag being pushed to the remote by building the
SDK and publishing the new version of the package to npm as well as to the CDN.

CDN releases will be scoped under the directory `/v${VERSION}`. For instance,
if you just released version 1.2.1, the overall UMD bundle will be available at
https://d1xa36cy0xt122.cloudfront.net/v1.2.1/Mixmax.umd.js.
