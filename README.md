# twsg-register-arrival.github.io
A simple wrapper around a Google Form that caches form data in local storage to ease repetitive form-filling.

## Develop
- Install: `npm install`
- Run:
  - With webpack dev server: `npm start` (port 8080)
  - With docker-compose: `npm run start:docker` (port 5000)
- Test:
  - All: `npm test`
  - Flows: `npm run test:flows`
    (pass env `HEADLESS=false` to observe)
  - Screenshot: `npm run test:screenshot`
- Lint: `npm run lint`
- Build: `npm run build`
  (pass env `ENV=staging` to use staging values in [`configMap.json`](configMap.json))

## Publish
Note that[`thumb.png`](src/thumb.png) is a screenshot used as the
[OpenGraph preview image](https://developers.facebook.com/docs/sharing/webmasters/#basic):
![Screenshot](src/thumb.png)

This is automatically updated if changes are detected when running the screenshot test.
A [browserless](https://github.com/browserless/chrome) container is used to ensure consistency in generation of screenshots.
