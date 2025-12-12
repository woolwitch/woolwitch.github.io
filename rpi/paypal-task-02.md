# PayPal Task 02: Environment Configuration

## Objective

Configure production environment variables and deployment settings for PayPal integration.

## Prerequisites

- Production PayPal Client ID from Task 01
- Access to production deployment environment
- Understanding of current environment configuration system

## Steps

### 1. Production Environment Variables

- [ ] Set `VITE_PAYPAL_CLIENT_ID_PRODUCTION` in production environment
- [ ] Set `VITE_APP_ENV=production` in production deployment
- [ ] Verify existing sandbox credentials remain in development/staging
- [ ] Ensure production variables are securely stored (not in version control)

### 2. Update Deployment Pipeline

- [ ] Add PayPal production environment variables to deployment configuration
- [ ] Verify environment variable loading in production build process
- [ ] Test that production PayPal configuration loads correctly
- [ ] Confirm sandbox variables still work in non-production environments

### 3. Environment Configuration Validation

- [ ] Review `src/lib/paypalConfig.ts` for environment-based configuration
- [ ] Test environment variable precedence (production vs sandbox)
- [ ] Verify PayPal SDK loads with correct client ID based on environment
- [ ] Confirm no hardcoded sandbox credentials in production code

### 4. Domain Configuration

- [ ] Configure production domain in PayPal application settings
- [ ] Update return URLs and cancel URLs for production environment
- [ ] Verify CORS settings if applicable
- [ ] Test domain allowlist configuration

## Expected Outputs

- ✅ Production environment variables configured
- ✅ PayPal SDK loads with production credentials in live environment
- ✅ Deployment pipeline includes PayPal environment variables
- ✅ Domain configuration updated in PayPal dashboard

## Testing

- [ ] Verify PayPal client ID switches correctly based on environment
- [ ] Test that sandbox credentials still work in development
- [ ] Confirm production variables are not accessible in development builds
- [ ] Validate environment-specific configuration loading

## Next Steps

Proceed to Task 03: Production Deployment Changes to implement deployment-specific modifications.

## Notes

- Keep production credentials separate from development/staging
- Test environment switching thoroughly before production deployment
- Ensure no sensitive credentials are exposed in client-side code
- Document environment variable requirements for future deployments

## Estimated Time

1 day