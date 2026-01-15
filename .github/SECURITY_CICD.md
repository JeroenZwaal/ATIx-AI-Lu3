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

### Azure OIDC (Federated Credentials)

The deploy workflows use `azure/login@v2` with **OIDC** (no client secret). Because the deploy jobs are tied to a GitHub **Environment** (`dev` / `acc` / `prd`), Azure must be configured with matching **Federated credentials**.

If you see an error like:

`AADSTS700213: No matching federated identity record found for presented assertion subject 'repo:<owner>/<repo>:environment:prd'`

Add federated credentials in Azure:

- Azure Portal → Microsoft Entra ID → **App registrations** → your app (the one matching `AZURE_CLIENT_ID`)
- **Federated credentials** → **Add credential**
- Choose **GitHub Actions deploying Azure resources**
- Set:
	- Organization: `<owner>`
	- Repository: `<repo>`
	- Entity type: **Environment**
	- Environment: `dev` (repeat for `acc` and `prd`)

Notes:
- The repo/owner/environment values must match **exactly** (including casing).
- The audience is typically `api://AzureADTokenExchange` and the issuer is `https://token.actions.githubusercontent.com` (the wizard sets this correctly).
- Make sure the service principal has RBAC permissions on the subscription/resource group (e.g., Contributor), otherwise login can succeed but deploy will fail later.

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
