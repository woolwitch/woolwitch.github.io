# PayPal Task 01: Production Account Setup

## Objective
Set up PayPal Business Account and obtain production credentials for Wool Witch payment processing.

## Prerequisites
- Access to business documentation/information
- Valid business email address
- Business verification documents (if required)

## Steps

### 1. Create PayPal Business Account
- [ ] Go to PayPal Developer Portal (developer.paypal.com)
- [ ] Create or verify existing PayPal Business Account
- [ ] Complete business information and verification process
- [ ] Note: This may take 1-3 business days for verification

### 2. Create Production Application
- [ ] Log into PayPal Developer Dashboard
- [ ] Navigate to "My Apps & Credentials"
- [ ] Click "Create App" 
- [ ] Select "Default Application" type
- [ ] Choose "Live" environment (not Sandbox)
- [ ] Select business account
- [ ] Configure app settings:
  - App Name: "Wool Witch E-commerce"
  - Features: Payment buttons, Express Checkout
  - Return URL: Set production domain
  - Cancel URL: Set production domain

### 3. Obtain Production Client ID
- [ ] Copy the Live Client ID from the application dashboard
- [ ] Securely store the Client ID (needed for environment configuration)
- [ ] Do NOT commit Client ID to version control

### 4. Configure PayPal Application Settings
- [ ] Set up domain allowlist with production URL
- [ ] Configure webhook endpoints (if needed for future features)
- [ ] Review and accept PayPal terms for production usage

## Expected Outputs
- ✅ Verified PayPal Business Account
- ✅ Production PayPal Application created
- ✅ Production Client ID obtained
- ✅ Application configured for production domain

## Next Steps
Proceed to Task 02: Environment Configuration with the obtained production Client ID.

## Notes
- Business verification may require additional documentation
- Keep production Client ID secure and separate from sandbox credentials
- Document any specific PayPal application settings for future reference

## Estimated Time
1-2 days (including potential verification wait time)