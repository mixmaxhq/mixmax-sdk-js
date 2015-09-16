# Mixmax SDK Javascript snippet

This repo is for our Mixmax App SDK Javascript snippet for use by third party apps (including our own emailapps.mixmax.com apps that loads this). See [documentation here](https://docs.google.com/document/d/12EqWZ3CV0aefpgvbBmqH4doZYx7TUsT7nJprRBBwrrs/) for how this is used by third party apps.

## Running locally

Run `npm start` to run the web server locally. Then point local Mixmax apps to use the snippet at path `http://localhost:9000/src/v1/Mixmax.js`.

## File structure

`/src/` - Source directory that is uploaded (unmodified) to the CDN.


## Deployment

Merging into master will automatically deploy this project to production for everyone. There is no staging environment. Content in `/src/*` cannot be modified since it is permacached in the CDN. Only new content can be added. When making a change to the SDK script, you should first create a new version (e.g. `/src/v1.1/Mixmax.js`) and update the SDK documentation with the new snippet.
