# Copilot Instructions - Wool Witch

This is a React + TypeScript e-commerce application for handmade crochet goods, built with Supabase backend and Vite tooling.

## Architecture Overview

**State Management**: React Context pattern with two main providers:
- `AuthContext` - User authentication, admin role checking, and session management
- `CartContext` - Shopping cart state with localStorage persistence

**Navigation**: Single-page app using state-based routing in `App.tsx` (`shop | cart | checkout | admin`)

**Data Layer**: Supabase client (`src/lib/supabase.ts`) with TypeScript types in `src/types/database.ts`

**Authentication Flow**: Email/password auth with role-based access control via `user_roles` table. Admin status checked on auth state change.

## Development Workflow

**Primary Commands** (use [Task](https://taskfile.dev/) runner):
```bash
task setup    # First-time setup: deps + env + database
task dev      # Start Supabase + dev server
task test     # Run lint + typecheck
task db:reset # Reset local database
```

**Database**: Local Supabase in Docker. Access Studio at `http://localhost:54323`, API at `http://localhost:54321`

**Environment**: Auto-generated `.env.local` with local Supabase credentials (see `Taskfile.yml` setup-env task)

## Key Patterns

**Component Structure**:
- Pages in `src/pages/` - main route components
- Shared components in `src/components/` - reusable UI pieces
- Context hooks pattern: `useAuth()`, `useCart()` with error boundaries

**Database Operations**:
- Row Level Security (RLS) policies protect admin operations
- Products table has public read, admin-only write policies
- User roles checked via `user_roles` table join on auth state change

**Product Management**:
- Images stored in Supabase Storage (`product-images` bucket)
- Upload script: `bin/upload-products.mjs` (requires SUPABASE_SERVICE_ROLE_KEY)
- Demo products via `task setup-products`

## Critical Implementation Details

**Admin Access**: Check `AuthContext.isAdmin` before showing admin features. Admin status comes from database query, not JWT claims.

**Image Handling**: Product images reference Supabase Storage URLs. Use `upload-products.mjs` script to sync local images in `src/assets/products/` to storage.

**Local Development**: Database runs in Docker via Supabase CLI. Migrations in `supabase/migrations/` auto-apply. Use `task db:status` to check connection.

**TypeScript**: Strict database types generated from Supabase schema. Import from `src/types/database.ts`.

## Common Tasks

**Add New Product**: Update database via Admin UI or use `upload-products.mjs` script for batch operations

**Database Changes**: Create migration files in `supabase/migrations/`, update types in `src/types/database.ts`

**Admin Testing**: Use SQL script `docs/promote_user_to_admin.sql` to grant admin role to test users

**Styling**: Tailwind CSS with design system focused on rose/pink palette, serif fonts for headings

When working on this codebase, always start the database first (`task db:start` or `task dev`) and check admin role requirements for any product management features.