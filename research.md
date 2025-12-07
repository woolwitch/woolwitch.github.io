# Hosting Research for Wool Witch

## Project Architecture Analysis

### Application Overview
Wool Witch is a modern React e-commerce application for handmade crochet goods with the following key characteristics:

**Frontend Stack:**
- React 18 + TypeScript
- Vite build system
- Tailwind CSS for styling
- Single Page Application (SPA) with state-based routing
- Client-side only rendering

**Backend & Data:**
- Supabase as backend-as-a-service
- PostgreSQL database with custom schema (`woolwitch`)
- Row Level Security (RLS) for data protection
- Supabase Auth for user authentication
- Supabase Storage for product images
- Real-time capabilities (though not currently utilized)

**Key Dependencies:**
- `@supabase/supabase-js` - Database and auth client
- `react` + `react-dom` - Core framework
- `lucide-react` - Icon library
- No server-side dependencies or Node.js runtime required

### Current Build Configuration
- **Build Tool**: Vite with React plugin
- **Output**: Static assets (HTML, CSS, JS)
- **Bundle Strategy**: Client-side only, no SSR/SSG
- **Environment Variables**: Runtime configuration via `import.meta.env`

## Hosting Options Analysis

### 1. GitHub Pages (Recommended for this project)

**Pros:**
- ✅ **Free hosting** for public repositories
- ✅ **Perfect fit** for static React SPAs
- ✅ **Built-in CI/CD** via GitHub Actions
- ✅ **Custom domain support** (www.woolwitch.co.uk)
- ✅ **Branch-based deployments** (dev.woolwitch.co.uk)
- ✅ **Global CDN** via GitHub's infrastructure
- ✅ **HTTPS by default** with Let's Encrypt
- ✅ **No server maintenance** required

**Cons:**
- ⚠️ **Public repositories only** for free tier
- ⚠️ **No server-side logic** (not needed for this project)
- ⚠️ **File size limits** (1GB per repository, 100MB per file)
- ⚠️ **Bandwidth limits** (100GB per month)

**Technical Requirements:**
- Build outputs static files ✅
- Supports SPA routing with fallback ✅
- Environment variable injection ✅
- Custom domain DNS configuration ✅

### 2. Vercel

**Pros:**
- ✅ Excellent React/Vite support
- ✅ Automatic deployments from Git
- ✅ Custom domains and SSL
- ✅ Branch previews
- ✅ Global edge network
- ✅ Zero configuration deployment

**Cons:**
- 💰 **Paid for commercial use** ($20/month Pro plan)
- 🔒 **Bandwidth limits** on free tier (100GB)
- 🔒 **Build time limits** (6000 minutes/month free)

### 3. Netlify

**Pros:**
- ✅ Great static site hosting
- ✅ Form handling capabilities
- ✅ Branch deploys
- ✅ Custom domains
- ✅ Generous free tier

**Cons:**
- 🔒 **Build time limits** (300 minutes/month free)
- 🔒 **Bandwidth limits** (100GB/month free)
- 💰 **Commercial usage costs**

### 4. Amazon S3 + CloudFront

**Pros:**
- ✅ Highly scalable
- ✅ Global CDN with CloudFront
- ✅ Pay-as-you-use pricing
- ✅ Enterprise-grade reliability

**Cons:**
- 💰 **Complex pricing model**
- 🔧 **Manual configuration required**
- 🔧 **No built-in CI/CD**
- 💰 **Ongoing costs** even for low traffic

### 5. GitHub Codespaces + Container Hosting

**Pros:**
- ✅ Full control over environment
- ✅ Can run Supabase locally

**Cons:**
- 💰 **Expensive** for production hosting
- 🔧 **Overkill** for static site
- 🔧 **Server maintenance** required

## Recommendation Analysis

### Why GitHub Pages is Optimal

1. **Cost Effectiveness**: Completely free for public repositories, making it ideal for a small business/portfolio site

2. **Technical Alignment**: 
   - Perfect match for Vite + React SPAs
   - No server-side requirements
   - Static asset hosting with CDN

3. **Deployment Strategy Alignment**:
   - Main branch → www.woolwitch.co.uk (production)
   - Feature branches → dev.woolwitch.co.uk (staging)
   - Automatic deployments via GitHub Actions

4. **Supabase Compatibility**:
   - Client-side Supabase connection works perfectly
   - Environment variables can be injected at build time
   - Different Supabase projects for prod/dev isolation

5. **Business Requirements**:
   - Custom domain support for branding
   - SSL certificates included
   - Professional appearance
   - Scalable for e-commerce traffic

### Environment Strategy

**Production (www.woolwitch.co.uk)**:
- Main branch deploys
- Production Supabase project
- Optimized builds with analytics

**Development (dev.woolwitch.co.uk)**:
- Non-main branch deploys
- Separate Supabase project/org
- Debug builds with development tools

## Security Considerations

1. **Supabase Keys**: Anon keys are safe to expose in client-side builds
2. **Environment Separation**: Different projects eliminate data cross-contamination
3. **RLS Policies**: Database security handled by Supabase
4. **HTTPS**: Automatic SSL via GitHub Pages
5. **Domain Isolation**: Separate domains prevent cookie/session leakage

## Scaling Considerations

**Current Limits (GitHub Pages)**:
- 100GB bandwidth/month
- 1GB repository size
- 100MB max file size

**For E-commerce Growth**:
- Traffic: 100GB supports ~1M page views/month
- Storage: Product images via Supabase Storage (not GitHub)
- Performance: Global CDN ensures fast loading

**Migration Path**: If limits exceeded, easy migration to Vercel/Netlify with same deployment pipeline.

## Alternative Considerations

If GitHub Pages limitations become problematic:

1. **Hybrid Approach**: Static hosting + separate API deployment
2. **Vercel Pro**: $20/month for commercial use
3. **AWS S3 + CloudFormation**: Infrastructure as Code
4. **Self-hosted**: VPS with Nginx (more maintenance overhead)

## Conclusion

GitHub Pages is the optimal hosting solution for Wool Witch because:

- ✅ **Zero cost** for hosting and deployment
- ✅ **Perfect technical fit** for React SPA + Supabase
- ✅ **Built-in CI/CD** with GitHub Actions
- ✅ **Professional domain setup** capability
- ✅ **Environment isolation** via branch deployments
- ✅ **Minimal maintenance** overhead
- ✅ **Scalable** for expected e-commerce traffic

The combination of GitHub Pages for static hosting and Supabase for backend services provides a modern, cost-effective, and maintainable architecture for the Wool Witch e-commerce platform.
