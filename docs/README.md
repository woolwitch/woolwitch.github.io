# Wool Witch Documentation

Technical documentation for the Wool Witch e-commerce platform - a React/TypeScript application with Supabase backend.

## Quick Start

```bash
# First-time setup
task setup

# Daily development
task dev
```

For complete development setup, see [CONTRIBUTING.md](../CONTRIBUTING.md) in the project root.

## Core Guides

- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Complete authentication setup including Google OAuth
- **[DATABASE.md](DATABASE.md)** - Database schema, security, and product management
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - GitHub Pages deployment configuration

## Reference Files

- **[promote_user_to_admin.sql](promote_user_to_admin.sql)** - SQL script for admin role assignment
- **[WOOLWITCH_SCHEMA_SECURITY.md](WOOLWITCH_SCHEMA_SECURITY.md)** - Detailed schema security implementation

## Quick Reference

### Development

- **Frontend**: <http://localhost:5174>
- **Supabase Studio**: <http://localhost:54323>
- **API Endpoint**: <http://localhost:54321>

### Key Commands

```bash
task setup        # Complete setup
task dev          # Start development
task test         # Run linting and typecheck
task db:reset     # Reset database
task upload-products  # Upload demo products
```

### Admin Setup

1. Sign up user via UI
2. Open Supabase Studio → `woolwitch.user_roles`
3. Change role from 'user' to 'admin'
4. Sign out and sign back in

