// app.json stays the source of truth for local dev (served at "/"). CI sets
// EXPO_ROUTER_BASE_URL when exporting the static site for GitHub Pages, which
// is served under a "/<repo>" subpath — see .github/workflows/deploy-web.yml.
const config = require('./app.json');

const baseUrl = process.env.EXPO_ROUTER_BASE_URL;
if (baseUrl) {
  config.expo.experiments = { ...config.expo.experiments, baseUrl };
}

module.exports = config;
