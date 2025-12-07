# Wool Witch GitHub Pages Deployment Tasks

## Prerequisites Complete ✅

- [x] Repository exists in woolwitch organization
- [x] React app built with Vite + TypeScript
- [x] Supabase configuration in place
- [x] Development environment working

## Phase 1: Basic GitHub Pages Deployment

### Task 1: Repository Setup

- [x] Enable GitHub Pages in repository settings
  - Go to `Settings → Pages`
  - Set Source to "Deploy from a branch"
  - Select branch: `main`, folder: `/ (root)`
- [x] Add GitHub repository secrets
  - Go to `Settings → Secrets and variables → Actions`
  - Add `VITE_SUPABASE_URL` (use development value for now)
  - Add `VITE_SUPABASE_ANON_KEY` (use development value for now)

### Task 2: GitHub Actions Workflow

- [ ] Create `.github/workflows/` directory
- [ ] Create `.github/workflows/deploy.yml` with deployment configuration
- [ ] Test workflow by pushing to main branch

### Task 3: Application Configuration

- [ ] Verify `vite.config.ts` is correctly configured for GitHub Pages
- [ ] Create `public/404.html` for SPA routing support
- [ ] Test build process locally with `npm run build`

### Task 4: Environment Handling

- [ ] Verify Supabase client configuration handles environment variables
- [ ] Test that build fails gracefully if environment variables are missing
- [ ] Ensure no hardcoded localhost URLs in the code

## Phase 2: Testing & Validation

### Task 5: Local Testing

- [ ] Run `npm run build` locally
- [ ] Run `npm run preview` to test built application
- [ ] Verify all routes work correctly
- [ ] Test cart functionality
- [ ] Test authentication flow (if applicable)

### Task 6: Deployment Testing

- [ ] Push changes to main branch
- [ ] Monitor GitHub Actions workflow execution
- [ ] Visit deployed site at `https://woolwitch.github.io`
- [ ] Test core functionality on deployed site
- [ ] Check browser console for errors

### Task 7: Issue Resolution

- [ ] Fix any CORS issues with Supabase
- [ ] Resolve any missing asset/image problems
- [ ] Address any routing issues
- [ ] Verify responsive design on mobile

## Phase 3: Production Readiness (Optional for Now)

### Task 8: Hosted Supabase Project

- [ ] Create new Supabase project for hosting
- [ ] Set up database schema and data
- [ ] Upload product images to Supabase Storage
- [ ] Update GitHub secrets with hosted Supabase credentials
- [ ] Test with hosted backend

### Task 9: Performance Optimization

- [ ] Review bundle size with `npm run build`
- [ ] Optimize images and assets
- [ ] Add basic SEO meta tags
- [ ] Test page load performance

### Task 10: Monitoring Setup

- [ ] Set up GitHub Actions notifications for failed builds
- [ ] Document deployment process
- [ ] Create rollback procedures

## Future Enhancements (Phase 4)

### Task 11: Custom Domain (When Ready)

- [ ] Purchase woolwitch.co.uk domain
- [ ] Configure DNS settings
- [ ] Set up custom domain in GitHub Pages
- [ ] Enable HTTPS enforcement

### Task 12: Advanced Features

- [ ] Add Google Analytics or alternative
- [ ] Implement PWA features
- [ ] Add structured data for SEO
- [ ] Set up automated backups

## Quick Start Checklist

For immediate deployment, focus on these essential tasks:

1. **Enable GitHub Pages** (Task 1)
2. **Create deployment workflow** (Task 2)
3. **Test locally** (Task 5)
4. **Deploy and verify** (Task 6)

## Current Status

- [ ] **Phase 1**: Basic deployment setup
- [ ] **Phase 2**: Testing and validation
- [ ] **Phase 3**: Production readiness
- [ ] **Phase 4**: Future enhancements

## Notes

### Environment Variables Needed

For development deployment:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Known Limitations

- Using localhost Supabase URL (won't work for real users)
- No custom domain yet
- Basic deployment pipeline (no staging environment)

### Success Criteria

- [ ] Site loads at https://woolwitch.github.io
- [ ] No console errors in browser
- [ ] Product catalog displays correctly
- [ ] Navigation works between pages
- [ ] Cart functionality works (with localStorage)

## Help & Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Supabase Documentation](https://supabase.com/docs)
