# ABCLS pipelines

Manually dispatched GitHub Actions workflows for `land-surveyors/abcls`:

| Workflow | Purpose |
| --- | --- |
| [Build and push images](.github/workflows/build-images.yaml) | Build and publish container images. |
| [Deploy webapp chart](.github/workflows/deploy-webapp.yaml) | Deploy or render the webapp Helm chart. |
| [Test API](.github/workflows/test-api.yaml) | Run API Vitest tests, optionally filtered by test-file path. |
| [Test client](.github/workflows/test-client.yaml) | Run Angular/Karma tests once in headless Chrome. |
| [Test E2E](.github/workflows/test-e2e.yaml) | Run Playwright against a local Compose sandbox. |

## Running tests

Configure the `ABCLS_DEPLOY_KEY` repository secret with the same read-only SSH
deploy key used by the build/deploy workflows. This is the only secret required
by the test workflows.

Open **Actions → Test API / Test client / Test E2E → Run workflow**, or use `gh`:

```sh
# All API tests from the source repository's default branch.
gh workflow run test-api.yaml -R land-surveyors/abcls-pipelines

# A subset of API test files, with coverage, from a specific source ref.
gh workflow run test-api.yaml -R land-surveyors/abcls-pipelines \
  -f ref=main -f filter=admin-email -f coverage=true

# Client unit tests with coverage.
gh workflow run test-client.yaml -R land-surveyors/abcls-pipelines \
  -f ref=main -f coverage=true

# The default Playwright suite, or a single module suite.
gh workflow run test-e2e.yaml -R land-surveyors/abcls-pipelines -f suite=default
gh workflow run test-e2e.yaml -R land-surveyors/abcls-pipelines -f ref=main -f suite=rbac
gh workflow run test-e2e.yaml -R land-surveyors/abcls-pipelines -f suite=admin-email
```

Every test workflow accepts an optional `ref`: a branch, tag, or commit SHA in
`land-surveyors/abcls`. Leave it empty to test that repository's default branch.
The GitHub UI's workflow branch selector (or `gh --ref`) selects the
**pipelines** revision; the `ref` input selects the **ABCLS source** revision.
The resolved source ref and SHA appear in the run summary.

Node.js and pnpm versions come from the selected source ref's `.tool-versions`.
Dependencies use frozen lockfiles with install scripts disabled, matching
ABCLS's existing CI conventions. API and client coverage are opt-in through the
`coverage` boolean input (default `false`). The API `filter` is a single Vitest
test-file path substring, such as `oidc` or `test-vitest/admin-email-delivery`.

### Playwright suites

The `suite` choices are `default`, `auth`, `org`, `user`, `complaint`, `checklist`,
`cpd`, `rbac`, `message`, `survey-plan`, `career`, and `admin-email`.

`default` runs the source repository's normal suite, including its enabled flat
specs. Admin-email is opt-in via `suite=admin-email`; that run also builds the API
worker and installs Chromium at the fixture's expected path. Quarantined legacy
tests are excluded by the source Playwright configuration.

The E2E workflow uses ABCLS's Compose services, readiness checks, log capture,
timeouts, and cleanup. Pipeline-local configuration selects the module suite,
uses the `abcls_e2e` database, disables Keycloak user sync, and aligns the browser
proxy with the API's OIDC/DPoP origin. The source environment examples are copied
into the fresh CI checkout before testing.

### Results

- **API:** JUnit report and optional HTML coverage in `api-test-reports`.
- **Client:** Karma output in the job log; optional HTML coverage in
  `client-test-coverage`.
- **E2E:** HTML/JUnit reports, failure evidence, and screenshots in
  `e2e-test-reports-<suite>`; Compose logs in `e2e-service-logs-<suite>`.

Report uploads run even when tests fail. Test-report artifacts are retained for
seven days. Compose cleanup includes volumes and orphaned containers.
