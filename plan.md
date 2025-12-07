# GitHub Pages Deployment Plan for Wool Witch

## Overview

This plan outlines how to deploy Wool Witch to GitHub Pages with:

- **Production**: `main` branch → www.woolwitch.co.uk
- **Development**: Non-`main` branches → dev.woolwitch.co.uk
- **Backend**: Separate Supabase projects for environment isolation

## Prerequisites

### Domain Setup

1. **Purchase domains** (if not already owned):

   - `woolwitch.co.uk` (primary domain)
   - DNS provider (recommend Cloudflare for free SSL and performance)

2. **Supabase Projects**:
   - Production organization is org002 with `project001` project
   - Development organization is org001 with `project001` project

## Step 1: Repository Configuration

### 1.1 Enable GitHub Pages

```bash
# In repository settings
Settings → Pages → Source: "GitHub Actions"
```

### 1.2 Create Environment Variables

Set up repository secrets and environments:

**Environments to create:**

- `production` (for main branch)
- `development` (for non-main branches)

**Repository Secrets** (`Settings → Secrets and variables → Actions`):

**Production Secrets:**

```txt
PROD_SUPABASE_URL=https://your-prod-project.supabase.co
PROD_SUPABASE_ANON_KEY=your-prod-anon-key
PROD_CUSTOM_DOMAIN=www.woolwitch.co.uk
```

**Development Secrets:**

```txt
DEV_SUPABASE_URL=https://your-dev-project.supabase.co
DEV_SUPABASE_ANON_KEY=your-dev-anon-key
DEV_CUSTOM_DOMAIN=dev.woolwitch.co.uk
```

## Step 2: GitHub Actions Workflow

### 2.1 Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, dev, staging]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Set environment variables
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
            echo "VITE_SUPABASE_URL=${{ secrets.PROD_SUPABASE_URL }}" >> $GITHUB_ENV
            echo "VITE_SUPABASE_ANON_KEY=${{ secrets.PROD_SUPABASE_ANON_KEY }}" >> $GITHUB_ENV
            echo "CUSTOM_DOMAIN=${{ secrets.PROD_CUSTOM_DOMAIN }}" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=development" >> $GITHUB_ENV
            echo "VITE_SUPABASE_URL=${{ secrets.DEV_SUPABASE_URL }}" >> $GITHUB_ENV
            echo "VITE_SUPABASE_ANON_KEY=${{ secrets.DEV_SUPABASE_ANON_KEY }}" >> $GITHUB_ENV
            echo "CUSTOM_DOMAIN=${{ secrets.DEV_CUSTOM_DOMAIN }}" >> $GITHUB_ENV
          fi

      - name: Build application
        run: |
          npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Create CNAME file
        run: |
          echo "${{ env.CUSTOM_DOMAIN }}" > dist/CNAME

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'
```

### 2.2 Branch-Specific Deployment Strategy

**Main Branch** (`main`):

- Deploys to production GitHub Pages
- Uses production Supabase project
- Sets CNAME to `www.woolwitch.co.uk`

**Development Branches** (`dev`, `feature/*`):

- Deploys to separate GitHub Pages repository or branch
- Uses development Supabase project
- Sets CNAME to `dev.woolwitch.co.uk`

## Step 3: Vite Configuration Updates

### 3.1 Update `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure root-relative paths for GitHub Pages
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false, // Disable for production
  },
});
```

### 3.2 Handle SPA Routing

Create `public/404.html` for client-side routing:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Wool Witch</title>
    <script>
      // Redirect to index.html for SPA routing
      window.location.href = "/";
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>
```

## Step 4: Domain Configuration

### 4.1 DNS Setup for Production (www.woolwitch.co.uk)

**A Records** (point to GitHub Pages IPs):

```txt
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME Record**:

```txt
www.woolwitch.co.uk → datagriff.github.io
```

### 4.2 DNS Setup for Development (dev.woolwitch.co.uk)

**CNAME Record**:

```txt
dev.woolwitch.co.uk → datagriff.github.io
```

### 4.3 GitHub Repository Settings

1. Go to `Settings → Pages`
2. Set custom domain to `www.woolwitch.co.uk`
3. Enable "Enforce HTTPS"

## Step 5: Supabase Project Setup

### 5.1 Production Supabase Project

```bash
# Create new organization: "Wool Witch Production"
# Create project: "woolwitch-prod"
# Configure allowed origins: https://www.woolwitch.co.uk
```

### 5.2 Development Supabase Project

```bash
# Create new organization: "Wool Witch Development"
# Create project: "woolwitch-dev"
# Configure allowed origins: https://dev.woolwitch.co.uk
```

### 5.3 Database Migration

```bash
# Export from local development
supabase db dump --schema woolwitch > production_schema.sql

# Import to production
# (Use Supabase Dashboard SQL editor or CLI)

# Repeat for development environment
```

## Step 6: Environment Variable Management

### 6.1 Update Environment Loading

Modify any environment loading to handle build-time injection:

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables. 
     Environment: ${import.meta.env.MODE}
     URL: ${supabaseUrl ? "Set" : "Missing"}
     Key: ${supabaseAnonKey ? "Set" : "Missing"}`
  );
}
```

### 6.2 Environment Detection

Add environment detection for debugging:

```typescript
// src/lib/config.ts
export const config = {
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  version: import.meta.env.VITE_APP_VERSION || "dev",
};
```

## Step 7: Deployment Process

### 7.1 Production Deployment

```bash
# Push to main branch
git checkout main
git push origin main

# Workflow automatically:
# 1. Builds with production environment
# 2. Deploys to www.woolwitch.co.uk
# 3. Uses production Supabase project
```

### 7.2 Development Deployment

```bash
# Push to dev branch
git checkout dev
git push origin dev

# Workflow automatically:
# 1. Builds with development environment
# 2. Deploys to dev.woolwitch.co.uk
# 3. Uses development Supabase project
```

## Step 8: Monitoring and Maintenance

### 8.1 GitHub Actions Monitoring

- Monitor workflow runs in "Actions" tab
- Set up notifications for failed deployments
- Review build logs for performance optimization

### 8.2 Performance Monitoring

```bash
# Add to build process
npm run build -- --mode production
npm run preview # Test locally before deploy
```

### 8.3 SSL Certificate Management

- GitHub Pages automatically manages SSL via Let's Encrypt
- Monitor certificate renewal in repository settings

## Step 9: Backup and Recovery

### 9.1 Database Backups

```bash
# Automated backups via Supabase (included in plans)
# Manual backup process:
supabase db dump --schema woolwitch > backup-$(date +%Y%m%d).sql
```

### 9.2 Static Asset Backups

- Source code in Git repository
- Built assets in GitHub Pages deployment history
- Product images in Supabase Storage (separate backups)

## Cost Breakdown

### GitHub Pages

- **Cost**: Free for public repositories
- **Limits**: 100GB bandwidth/month, 1GB storage

### Supabase

- **Production**: Free tier (500MB database, 50MB storage)
- **Development**: Free tier (separate project)
- **Upgrade path**: $25/month for Pro tier when needed

### Domain Costs

- **woolwitch.co.uk**: ~£10/year
- **DNS**: Free with Cloudflare

### Total Monthly Cost: ~£0-2 (domain only)

## Security Considerations

### 8.1 Environment Separation

- ✅ Different Supabase projects prevent data cross-contamination
- ✅ Separate domains isolate cookies and sessions
- ✅ GitHub repository secrets protect API keys

### 8.2 Content Security

- ✅ HTTPS enforced by GitHub Pages
- ✅ Supabase handles database security via RLS
- ✅ Client-side environment variables are safely public (anon keys)

## Rollback Strategy

### 8.1 Application Rollback

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or rollback via GitHub UI
# Deployments → Previous deployment → Re-deploy
```

### 8.2 Database Rollback

```bash
# Use Supabase backup restoration
# Or manual SQL restoration from dump files
```

## Future Enhancements

### Phase 2 Improvements

1. **CDN Optimization**: Implement additional caching strategies
2. **Analytics**: Add Google Analytics or privacy-focused alternatives
3. **Performance**: Implement code splitting and lazy loading
4. **SEO**: Add meta tags and structured data
5. **PWA**: Convert to Progressive Web App

### Scaling Considerations

- **Traffic Growth**: Monitor GitHub Pages bandwidth limits
- **Database Growth**: Monitor Supabase usage and upgrade when needed
- **Feature Expansion**: Consider Vercel migration for advanced features

## Implementation Timeline

### Week 1: Infrastructure Setup

- [ ] Create Supabase projects
- [ ] Configure DNS records
- [ ] Set up GitHub Actions workflow

### Week 2: Deployment Pipeline

- [ ] Test deployment pipeline
- [ ] Configure environment variables
- [ ] Implement monitoring

### Week 3: Go Live

- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Document operational procedures

## Success Metrics

### Technical Metrics

- ✅ Build time < 2 minutes
- ✅ Page load time < 3 seconds
- ✅ 99.9% uptime
- ✅ Zero deployment failures

### Business Metrics

- ✅ Professional domain presence
- ✅ Secure e-commerce functionality
- ✅ Mobile-responsive experience
- ✅ SEO-friendly structure

This plan provides a comprehensive, cost-effective deployment strategy that leverages GitHub Pages' strengths while maintaining professional standards for the Wool Witch e-commerce platform.
