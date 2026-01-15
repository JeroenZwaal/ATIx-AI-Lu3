# Secure CI/CD (rubric 15p)

This repo uses GitHub Actions with enforced security gates:

- **SAST**: CodeQL (fails the workflow on **error-level** findings)
- **SCA**: Trivy filesystem scan + `npm audit` (fails on HIGH/CRITICAL vulns, misconfig, or secrets)
- **SBOM**: CycloneDX SBOM is generated and scanned for CVEs (fails on HIGH/CRITICAL)

## Required GitHub setup (Secrets & Environments)

To keep secrets centrally managed and support easy switching between **dev / acc / prd**, configure **GitHub Environments**:

Create environments:
- `dev`
- `acc`
- `prd`

### Environment secrets

Set these secrets **per environment** (Organization secrets are even better if available):

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (only required for the frontend Static Web App deploy)

### Environment variables

Optionally set these variables per environment:

Backend deploy workflow:
- `AZURE_WEBAPP_NAME` (default: `avanskeuzekompasbackend`)
- `AZURE_WEBAPP_PACKAGE_PATH` (default: `./backend`)
- `NODE_VERSION` (default: `24.x`)

Recommender deploy workflow:
- `AZURE_WEBAPP_NAME` (default: `avanskeuzekompasrecommender`)
- `AZURE_WEBAPP_PACKAGE_PATH` (default: `./api-recommender`)
- `PYTHON_VERSION` (default: `3.11`)


## Demonstrating the gates (fail-examples)

In the **Security (SCA/SAST/SBOM)** workflow you can trigger an intentional failure:

- Run the workflow manually (Actions → Security (SCA/SAST/SBOM))
- Set input `demo_fail` = `true`

This creates a temporary vulnerable npm project and runs `npm audit --audit-level=high`, which should fail and demonstrates that the gate blocks the pipeline.

## Note on local .env files

Local `.env` files must never be committed. Use:
- `backend/.env.example` as a template
- GitHub Environment secrets/vars (for CI/CD)
- Azure App Service application settings (for runtime secrets)
