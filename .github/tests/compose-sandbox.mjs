import { fileURLToPath } from 'node:url';
import sourceConfig from '../../abcls/sandbox/compose-sandbox.mjs';

const suite = process.env.E2E_SUITE || 'default';
const suites = new Set([
  'default',
  'auth',
  'org',
  'user',
  'complaint',
  'checklist',
  'cpd',
  'rbac',
  'message',
  'survey-plan',
  'career',
  'admin-email',
]);

if (!suites.has(suite)) {
  throw new Error(`Unknown E2E suite: ${suite}`);
}

export default {
  ...sourceConfig,
  cwd: fileURLToPath(new URL('../../abcls/', import.meta.url)),
  compose: {
    ...sourceConfig.compose,
    // GitHub's Ubuntu runners already provide the Docker Compose plugin.
    executable: 'docker',
    prefixArgs: ['compose'],
  },
  test: {
    ...sourceConfig.test,
    args: [
      '--config.verifyDepsBeforeRun=false',
      '--dir',
      'e2e',
      'test',
      '--config',
      'playwright.ci.config.ts',
      ...(suite === 'default' ? [] : [`tests/${suite}`]),
    ],
    env: {
      ...sourceConfig.test.env,
      CI: '1',
      NODE_ENV: 'test',
      // The current seeder requires the isolated database and disabled sync.
      DBCONNECT: 'mongodb://mongodb:mongodb@localhost:27017/abcls_e2e?authSource=admin',
      KEYCLOAK_SYNC_ENABLED: 'false',
      SECRET: 'e2e-only-insecure-secret',
      STRIPE_SECRET_KEY: 'sk_test_00000000000000000000000000',
      OIDC_ISSUER: 'http://localhost:8080/realms/starter',
      OIDC_CLIENT_ID: 'app',
      OIDC_CLIENT_SECRET: 'testsecret',
      OIDC_BACKEND_ORIGIN: 'http://localhost:4200',
      OIDC_FRONTEND_REDIRECT_URI: 'http://localhost:4200/callback',
      OIDC_POST_LOGOUT_REDIRECT_URI: 'http://localhost:4200/',
    },
  },
};
