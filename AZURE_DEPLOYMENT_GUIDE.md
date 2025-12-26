# 🚀 Azure Deployment Guide - EatUp Backend

This guide explains how to deploy the EatUp Spring Boot backend to Azure App Service with CI/CD using GitHub Actions.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Expo Mobile   │     │            Azure Cloud               │
│      App        │     │                                      │
│                 │     │  ┌─────────────────────────────────┐ │
│  Development:   │     │  │     App Service                 │ │
│  localhost:8080 │     │  │  eatup-api.azurewebsites.net    │ │
│                 │     │  └───────────────┬─────────────────┘ │
│  Production:    │     │                  │                   │
│  Azure URL  ────┼─────┼──────────────────┘                   │
│                 │     │                  │                   │
└─────────────────┘     │                  ▼                   │
                        │  ┌─────────────────────────────────┐ │
                        │  │  Cosmos DB (MongoDB API)        │ │
                        │  │  eatup-mongo                    │ │
                        │  └─────────────────────────────────┘ │
                        └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      GitHub Actions                          │
│                                                              │
│   push to main ───► Build & Test ───► Deploy to Azure       │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Azure Resources

### 1.1 Create a Resource Group

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Resource groups"** → Click **Create**
3. Fill in:
   - Subscription: Your student subscription
   - Resource group: `rg-eatup`
   - Region: **West Europe** (or closest to you)
4. Click **Review + create** → **Create**

### 1.2 Create App Service Plan

1. Search for **"App Service plans"** → Click **Create**
2. Fill in:
   - Subscription: Your student subscription
   - Resource Group: `rg-eatup`
   - Name: `asp-eatup`
   - Operating System: **Linux**
   - Region: **West Europe**
   - Pricing Tier: **B1 (Basic)** (~$13/month) or **F1 (Free)** for testing
3. Click **Review + create** → **Create**

### 1.3 Create Web App (App Service)

1. Search for **"App Services"** → Click **Create** → **Web App**
2. Fill in:
   - Subscription: Your student subscription
   - Resource Group: `rg-eatup`
   - Name: `eatup-team21-api` (must be globally unique!)
   - Publish: **Code**
   - Runtime stack: **Java 21**
   - Java web server stack: **Java SE (Embedded Web Server)**
   - Operating System: **Linux**
   - Region: **West Europe**
   - App Service Plan: `asp-eatup`
3. Click **Review + create** → **Create**

Your API will be available at: `https://eatup-team21-api.azurewebsites.net`

### 1.4 Create Azure Cosmos DB for MongoDB

1. Search for **"Azure Cosmos DB"** → Click **Create**
2. Select **Azure Cosmos DB for MongoDB** → Click **Create**
3. Fill in:
   - Subscription: Your student subscription
   - Resource Group: `rg-eatup`
   - Account Name: `eatup-team21-mongo`
   - Location: **West Europe**
   - Capacity mode: **Serverless** (pay per request - cheapest!)
4. Click **Review + create** → **Create**

After creation (takes ~5 minutes):
1. Go to your Cosmos DB account
2. Click **Connection strings** in the left menu
3. Copy the **Primary Connection String** - you'll need this!

---

## Step 2: Configure Azure App Service

### 2.1 Set Environment Variables

1. Go to your App Service (`eatup-team21-api`)
2. Click **Configuration** → **Application settings**
3. Click **+ New application setting** for each:

| Name | Value |
|------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATA_MONGODB_URI` | Your Cosmos DB connection string |
| `SPRING_DATA_MONGODB_DATABASE` | `Eat-Up` |
| `SPRING_SECURITY_JWT_SECRET` | A secure random string (see below) |
| `SPRING_SECURITY_JWT_EXPIRATION_MS` | `86400000` |

**Generate a secure JWT secret** (run in terminal):
```bash
openssl rand -base64 64
```
Or use: https://generate-secret.vercel.app/64

4. Click **Save** at the top

### 2.2 Enable WebSockets (for chat feature)

1. Go to **Configuration** → **General settings**
2. Set **Web sockets** to **On**
3. Click **Save**

### 2.3 Enable CORS

1. Go to **CORS** in the left menu
2. Under **Allowed Origins**, add: `*`
3. Click **Save**

---

## Step 3: Set Up GitHub Actions

### 3.1 Create Azure Service Principal

Run these commands in Azure CLI (or Azure Cloud Shell):

```bash
# Login to Azure (skip if using Cloud Shell)
az login

# Get your subscription ID
az account show --query id -o tsv

# Create service principal (replace {subscription-id} with your actual ID)
az ad sp create-for-rbac --name "github-actions-eatup" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-eatup \
  --sdk-auth
```

This outputs JSON like:
```json
{
  "clientId": "xxxx-xxxx-xxxx-xxxx",
  "clientSecret": "xxxx",
  "subscriptionId": "xxxx-xxxx-xxxx-xxxx",
  "tenantId": "xxxx-xxxx-xxxx-xxxx",
  ...
}
```
**Copy this entire JSON output!**

### 3.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The entire JSON from step 3.1 |
| `AZURE_WEBAPP_NAME` | `eatup-team21-api` (your web app name) |

### 3.3 Create GitHub Environment (Optional but Recommended)

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. Optional: Add required reviewers for extra safety

---

## Step 4: Deploy!

### Automatic Deployment
Simply push to `main` branch:
```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

The workflow will:
1. Build your Spring Boot app
2. Run tests
3. Deploy to Azure

### Manual Deployment
1. Go to **Actions** tab in GitHub
2. Select **Deploy Backend to Azure**
3. Click **Run workflow**

### Check Deployment Status
- GitHub: **Actions** tab shows build/deploy progress
- Azure: **App Service** → **Deployment Center** shows deployment history

---

## Step 5: Update Your Expo App

Update your `.env` file for production:

```bash
# For local development
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_ANDROID_API_URL=http://10.0.2.2:8080

# For production (uncomment when building for release)
# EXPO_PUBLIC_API_URL=https://eatup-team21-api.azurewebsites.net
# EXPO_PUBLIC_ANDROID_API_URL=https://eatup-team21-api.azurewebsites.net
```

---

## Troubleshooting

### View Logs
**In Azure Portal:**
- App Service → **Log stream** (real-time)
- App Service → **Logs** → **App Service logs** (enable first)

**Using Azure CLI:**
```bash
az webapp log tail --name eatup-team21-api --resource-group rg-eatup
```

### Common Issues

| Problem | Solution |
|---------|----------|
| App won't start | Check **Log stream** for errors. Verify environment variables are set. |
| MongoDB connection fails | Check connection string. Make sure to use the full string including password. |
| CORS errors | Enable CORS in App Service and add your origins. |
| WebSocket doesn't connect | Enable Web sockets in General settings. Use `wss://` (not `ws://`). |
| 502 Bad Gateway | App is still starting. Wait 1-2 minutes. Check logs if persists. |

### Useful Commands
```bash
# Restart the app
az webapp restart -n eatup-team21-api -g rg-eatup

# Check app status
az webapp show -n eatup-team21-api -g rg-eatup --query state

# View app settings
az webapp config appsettings list -n eatup-team21-api -g rg-eatup
```

---

## Cost Estimate (Student Credits)

| Resource | Tier | Cost |
|----------|------|------|
| App Service | B1 Basic | ~$13/month |
| Cosmos DB | Serverless | ~$0-10/month (usage-based) |
| **Total** | | **~$13-23/month** |

With $100 Azure for Students credit, you're covered for ~4+ months! 💰

---

## Quick Reference

| What | Value |
|------|-------|
| API URL | `https://eatup-team21-api.azurewebsites.net` |
| WebSocket URL | `wss://eatup-team21-api.azurewebsites.net/ws` |
| Resource Group | `rg-eatup` |
| Deploys on | Push to `main` branch |

Good luck! 🚀
