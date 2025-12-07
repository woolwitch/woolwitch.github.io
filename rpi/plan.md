# Simplified GitHub Pages Deployment Plan for Wool Witch

## Overview

This plan outlines a simplified deployment of Wool Witch to GitHub Pages:

- **Hosting**: `main` branch → woolwitch.github.io
- **Backend**: Use existing development Supabase configuration
- **Domain**: No custom domain setup initially
- **Environment**: Single environment using dev settings

## Repository Information

- **GitHub Organization**: woolwitch
- **Repository**: woolwitch
- **Target URL**: https://woolwitch.github.io
- **Supabase**: Use current local/development configuration

## Step 1: GitHub Pages Configuration

### 1.1 Enable GitHub Pages

1. Go to repository `Settings → Pages`
2. Set Source to "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/ (root)`

### 1.2 Environment Variables

Since we're using development Supabase settings, we need to set up GitHub repository secrets for the existing local development configuration.

**Repository Secrets** (`Settings → Secrets and variables → Actions`):

```txt
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

> **Note**: These are the local development values from package.json. For a real deployment, you'd want to create a hosted Supabase project and use those credentials instead.

## Step 2: GitHub Actions Workflow

### 2.1 Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
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

      - name: Build application
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
        if: github.ref == 'refs/heads/main'
```

## Step 3: Vite Configuration Updates

### 3.1 Update `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // GitHub Pages will serve from root
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
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

## Step 4: Application Updates

### 4.1 Update Environment Loading

The current Supabase configuration in `src/lib/supabase.ts` should work as-is, but verify it handles missing environment variables gracefully:

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables. 
     URL: ${supabaseUrl ? "Set" : "Missing"}
     Key: ${supabaseAnonKey ? "Set" : "Missing"}`
  );
}
```

### 4.2 Update Base URL References

Ensure all internal links use relative paths:

```typescript
// Instead of absolute paths, use relative
// Good: "/shop" or "./assets/image.png"
// Avoid: "http://localhost:3000/shop"
```

## Step 5: Deployment Process

### 5.1 Simple Deployment

```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# Workflow automatically:
# 1. Builds the application
# 2. Deploys to woolwitch.github.io
# 3. Uses development Supabase configuration
```

### 5.2 Testing

After deployment:

1. Visit `https://woolwitch.github.io`
2. Test core functionality:
   - Browse products
   - Add items to cart
   - Authentication flow
   - Admin features (if applicable)

## Step 6: Monitoring

### 6.1 GitHub Actions

- Monitor workflow runs in repository "Actions" tab
- Check build logs for errors
- Verify successful deployment

### 6.2 Basic Performance

```bash
# Test build locally
npm run build
npm run preview

# Check bundle size
ls -la dist/assets/
```

## Current Limitations

### Backend Limitations

Since we're using local development Supabase settings:

- **Database**: Points to localhost (won't work in production)
- **Authentication**: May have CORS issues
- **Storage**: Product images may not load

### Recommended Next Steps

1. **Create hosted Supabase project**
2. **Upload product images to Supabase Storage**
3. **Update environment variables** to use hosted project
4. **Set up custom domain** (optional)

## Cost

- **GitHub Pages**: Free for public repositories
- **Development Supabase**: Currently free tier (localhost)
- **Total**: $0/month

## Security

- ✅ HTTPS enforced by GitHub Pages
- ✅ Environment variables secured via GitHub Secrets
- ⚠️ Using development database (not suitable for real users)

## Future Enhancements

1. **Production Supabase**: Create hosted project for real backend
2. **Custom Domain**: Add woolwitch.co.uk when ready
3. **Environment Separation**: Dev/staging/production environments
4. **Performance**: Add caching and optimization
5. **Analytics**: Add usage tracking

This simplified approach gets Wool Witch online quickly while maintaining the ability to enhance the deployment pipeline later.
