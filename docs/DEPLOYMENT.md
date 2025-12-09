# Deployment Guide

Complete deployment configuration for the Wool Witch application.

## Overview

The application supports GitHub Pages deployment with Supabase backend integration.

## GitHub Pages Deployment

### Repository Setup

**Required GitHub Secrets** (Settings → Secrets and variables → Actions):
```bash
# Secrets
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_ACCESS_TOKEN=your-supabase-access-token

# Variables  
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
```

### Getting Supabase Access Token

1. Go to <https://supabase.com/dashboard/account/tokens>
2. Click "Generate new token"
3. Name it "GitHub Actions Deploy"
4. Copy the token and add as `SUPABASE_ACCESS_TOKEN` secret

### GitHub Actions Workflow

The deployment workflow (`.github/workflows/deploy.yml`):

1. **Triggers**: Pushes to `main` branch, PRs, manual dispatch
2. **Build Process**:
   - Install Node.js dependencies
   - Create production environment file
   - Build application using Vite
   - Deploy to GitHub Pages
3. **Database Migrations**: Automatically applies pending migrations

### Configuration Files

**Vite Config** (`vite.config.ts`):
```typescript
base: process.env.NODE_ENV === 'production' ? '/woolwitch/' : '/'
```

**GitHub Pages Settings**:
- Go to repository Settings → Pages
- Source: "GitHub Actions"
- URL: `https://woolwitch.github.io/woolwitch/`

### Supabase Configuration

**Site URLs** (Supabase Dashboard → Authentication → Settings):
```bash
Site URL: https://woolwitch.github.io
Additional redirect URLs: https://woolwitch.github.io
```

## Local vs Production Environments

| Environment | Supabase | Authentication | Database |
|-------------|----------|---------------|----------|
| **Local** | Local instance via Docker | Mock Google auth | Local PostgreSQL |
| **Production** | Hosted Supabase | Real Google OAuth | Hosted PostgreSQL |

## Manual Deployment

1. Go to repository Actions tab
2. Select "Deploy to GitHub Pages" workflow  
3. Click "Run workflow"

## Troubleshooting

### Build Failures
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Check Supabase project accessibility

### CORS Issues
- Ensure Supabase allows requests from `https://woolwitch.github.io`
- Add domain to Supabase authentication site URLs

### Asset Loading Issues
- Verify `base` configuration in `vite.config.ts` matches repository name
