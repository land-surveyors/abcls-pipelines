// The workflow copies this file into abcls/e2e, next to playwright.config.ts.
import sourceConfig from './playwright.config';

const servers = Array.isArray(sourceConfig.webServer)
  ? sourceConfig.webServer
  : sourceConfig.webServer
    ? [sourceConfig.webServer]
    : [];

export default {
  ...sourceConfig,
  webServer: servers.map((server) => ({
    ...server,
    reuseExistingServer: false,
    env: {
      ...server.env,
      // The runner calls :3000 directly, but browser requests must use the
      // Angular proxy at :4200 to match the API's OIDC/DPoP backend origin.
      ...(server.command.includes('../client') ? { API_BASE_URL: '/api' } : {}),
    },
  })),
};
