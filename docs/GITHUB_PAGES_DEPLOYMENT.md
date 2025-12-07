# GitHub Pages Deployment Setup

This document outlines the GitHub Pages deployment configuration for the Wool Witch application.

## Configuration Overview

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Pushes to `main` branch, PRs, and manual workflow dispatch
- **Build Process**: 
  1. Install Node.js dependencies
  2. Create production environment file with Supabase credentials
  3. Build the application using Vite
  4. Deploy to GitHub Pages

### Required GitHub Secrets and Variables

You should have configured these in your GitHub repository settings:

**Variables** (Repository Settings → Secrets and variables → Actions → Variables):
- `VITE_SUPABASE_URL`: Your Supabase project URL

**Secrets** (Repository Settings → Secrets and variables → Actions → Secrets):
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Vite Configuration

The `vite.config.ts` has been configured with:
```typescript
base: process.env.NODE_ENV === 'production' ? '/woolwitch/' : '/'
```

This ensures that in production (GitHub Pages), the app is served from the `/woolwitch/` path, but during local development it uses the root path.

### GitHub Pages Setup

In your GitHub repository settings:
1. Go to **Settings** → **Pages**
2. Under **Source**, select "GitHub Actions"
3. The workflow will automatically deploy on pushes to main

### Deployment URL

Your application will be available at:
```
https://woolwitch.github.io/woolwitch/
```

## Local Development vs Production

- **Local Development**: Uses local Supabase instance (configured in `.env.local`)
- **Production**: Uses your hosted Supabase instance (configured via GitHub Actions)

## Troubleshooting

### Build Failures
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are properly set in GitHub
- Ensure your Supabase project is accessible and the keys are valid

### CORS Issues
Make sure your Supabase project is configured to allow requests from:
```
https://woolwitch.github.io
```

Add this to your Supabase project's authentication settings under "Site URL".

### Asset Loading Issues
If assets don't load properly, verify that the `base` configuration in `vite.config.ts` matches your repository name.

## Manual Deployment

You can manually trigger a deployment by:
1. Going to the **Actions** tab in your repository
2. Selecting the "Deploy to GitHub Pages" workflow
3. Clicking "Run workflow"