# Security Guidelines for Wool Witch

This document outlines security best practices and compliance measures implemented in the Wool Witch application.

## Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Payment Processing Security](#payment-processing-security)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Environment Configuration](#environment-configuration)
- [Sensitive Data Handling](#sensitive-data-handling)
- [Security Checklist](#security-checklist)

## Authentication & Authorization

### User Authentication
- **Email/Password**: Managed through Supabase Auth with secure password hashing
- **Google OAuth**: Production uses real OAuth, development uses mock authentication (localhost only)
- **Session Management**: JWT tokens managed by Supabase with secure httpOnly cookies

### Role-Based Access Control (RBAC)
- Admin privileges checked via `user_roles` table, NOT from JWT claims
- Row Level Security (RLS) policies enforce data access at database level
- Admin-only operations protected by both client-side and database-level checks

**Security Notes:**
- Mock authentication is ONLY enabled when both conditions are met:
  1. `import.meta.env.DEV === true` (development mode)
  2. Supabase URL contains 'localhost' or '127.0.0.1'
- Production deployments must set `VITE_APP_ENV=production` to disable mock auth

## Payment Processing Security

### PCI Compliance
- **No Card Data Storage**: Card details never touch our servers
- **Stripe Elements**: Card input handled by Stripe's PCI-compliant iframe
- **PayPal Integration**: Payments processed entirely through PayPal's secure checkout

### Payment Data
- **Stored Data**: Only payment intent IDs, last 4 digits, and card brand
- **NOT Stored**: Full card numbers, CVV codes, Stripe client secrets
- **Encryption**: Payment metadata stored as JSONB in PostgreSQL with encryption at rest

### Payment Validation
```typescript
// Amount validation (£0.01 - £1,000,000)
if (amount <= 0 || amount > 100000000) {
  throw new Error('Invalid payment amount');
}

// Email format validation - robust regex preventing consecutive dots, 
// leading/trailing special characters, and invalid domain formats
const emailRegex = /^[A-Za-z0-9]([A-Za-z0-9._%-]*[A-Za-z0-9])?@[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/;
if (!emailRegex.test(customer_email)) {
  throw new Error('Invalid email address');
}
```

## Data Protection

### Row Level Security (RLS)
All tables have RLS enabled with granular policies:

**Products Table:**
- Public: Read access for all users
- Admin Only: Create, update, delete operations

**Orders Table:**
- Users: Read their own orders only
- Admin: Read/write all orders
- Anonymous: Create orders during checkout (user_id = null)

**Payments Table:**
- Access controlled via orders table relationship
- Payment details visible only to order owner or admin

### Sensitive Data Storage
**DO NOT STORE:**
- Stripe client secrets (temporary, not persisted)
- Full credit card numbers
- CVV codes
- Raw passwords (hashed by Supabase Auth)

**SAFE TO STORE:**
- Payment intent IDs
- Last 4 digits of cards
- Card brand (Visa, Mastercard, etc.)
- PayPal transaction IDs
- Encrypted payment metadata

## API Security

### CORS Configuration
**Development:**
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];
```

**Production:**
Set `ALLOWED_ORIGINS` environment variable:
```bash
ALLOWED_ORIGINS=https://woolwitch.com,https://www.woolwitch.com
```

### Rate Limiting
- Implemented at Supabase Edge Function level
- Protects against brute force and DDoS attacks
- Configure via Supabase project settings

### Input Validation
All user inputs are validated:
- Email format validation
- Payment amount bounds checking
- Required field validation
- SQL injection protection via parameterized queries

## Environment Configuration

### Environment Variables

**Public Variables (prefix: VITE_):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (safe to expose)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_PAYPAL_CLIENT_ID_*` - PayPal client IDs
- `VITE_APP_ENV` - Application environment

**Private Variables (server-side only):**
- `STRIPE_SECRET_KEY` - Stripe secret key (NEVER expose to client)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin scripts only)

### .gitignore Configuration
Ensure these patterns are in `.gitignore`:
```
.env
.env.local
.env.*.local
*.log
```

## Sensitive Data Handling

### Console Logging
**Development Only:**
```typescript
if (import.meta.env.DEV) {
  console.error('Error details:', error);
}
```

**Production:**
- No sensitive data logged to console
- Generic error messages shown to users
- Detailed errors logged server-side only

### Error Messages
**Bad (exposes internals):**
```typescript
throw new Error(`Database error: ${error.message} in table ${table}`);
```

**Good (user-friendly, secure):**
```typescript
throw new Error('Failed to process your request. Please try again.');
// Log details server-side only
```

### Image Upload Security
- Maximum file size: 50KB (enforced at storage bucket level)
- Allowed types: JPEG, PNG, WebP, GIF
- Images compressed before upload
- Virus scanning via Supabase Storage policies

## Security Checklist

### Pre-Deployment Security Review
- [ ] All environment variables properly set for production
- [ ] Mock authentication disabled in production build
- [ ] CORS origins restricted to production domains
- [ ] Console logging disabled for sensitive operations
- [ ] Error messages sanitized (no internal details exposed)
- [ ] RLS policies tested and verified
- [ ] Admin endpoints protected
- [ ] Payment processing tested in production mode
- [ ] SSL/TLS certificate valid and up-to-date
- [ ] Dependencies scanned for vulnerabilities (`npm audit`)

### Regular Security Maintenance
- [ ] Review and rotate API keys quarterly
- [ ] Monitor Supabase audit logs for suspicious activity
- [ ] Update dependencies monthly
- [ ] Review RLS policies after schema changes
- [ ] Test payment flows in sandbox before production
- [ ] Backup database regularly
- [ ] Monitor error logs for security issues

## Incident Response

### In Case of Security Breach
1. **Immediate Actions:**
   - Rotate all API keys and secrets
   - Review audit logs for compromised accounts
   - Notify affected users if personal data exposed
   - Document the incident

2. **Investigation:**
   - Identify attack vector
   - Assess scope of breach
   - Check for data exfiltration

3. **Remediation:**
   - Patch vulnerabilities
   - Implement additional security controls
   - Update security documentation
   - Conduct post-mortem review

### Contact Information
- Security issues: Report via GitHub Security Advisories
- Critical vulnerabilities: Contact project maintainers directly

## Compliance

### GDPR Compliance
- User consent collected for data processing
- Privacy policy clearly displayed
- Data retention policies implemented
- User data deletion on request

### PCI DSS Compliance
- No card data storage (Level 4 merchant)
- Payment processing outsourced to PCI-compliant providers
- Secure communication channels (HTTPS)
- Regular security assessments

## Additional Resources
- [Supabase Security Documentation](https://supabase.com/docs/guides/platform/security)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PayPal Security Standards](https://www.paypal.com/us/webapps/mpp/paypal-safety-and-security)

---

**Last Updated:** 2025-12-30
**Version:** 1.0.0
