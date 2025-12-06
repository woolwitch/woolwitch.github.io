# Authentication Setup Guide

This document explains how to set up and test the Supabase authentication integration with admin-only product editing.

## Features Implemented

1. **User Authentication**: Users can sign up and sign in using email/password
2. **Role-Based Access Control**: Users are assigned either 'admin' or 'user' role
3. **Admin Dashboard**: Only admins can access the Admin page to create, edit, and delete products
4. **Protected Operations**: Product CRUD operations are protected by Row Level Security (RLS) policies

## Database Schema

### Tables

#### `user_roles`
- `id` (uuid) - Primary key
- `user_id` (uuid) - References auth.users
- `role` (text) - Either 'admin' or 'user'
- `created_at` (timestamptz)

### Row Level Security Policies

#### Products Table
- **Anyone can view available products**: Public read access for products with `is_available = true`
- **Admins can view all products**: Admins can see all products regardless of availability
- **Admins can insert products**: Only admins can create new products
- **Admins can update products**: Only admins can modify products
- **Admins can delete products**: Only admins can delete products

## Testing Locally

### Prerequisites
- Docker installed and running
- Supabase CLI installed
- Node.js >= 18

### Setup Steps

1. **Start Supabase Local Development**:
   ```bash
   supabase start
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:5173
   - Supabase Studio: http://localhost:54323

### Creating an Admin User

By default, all new users are assigned the 'user' role. To create an admin user:

1. **Sign up a new user** through the application UI
2. **Open Supabase Studio** at http://localhost:54323
3. **Navigate to Table Editor** > `user_roles`
4. **Find your user** and update their role from 'user' to 'admin'
5. **Sign out and sign in again** in the application to refresh the session

Alternatively, run this SQL in Supabase Studio SQL Editor:

```sql
-- Replace 'user-email@example.com' with the actual user email
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'user-email@example.com'
);
```

## User Flow

### Regular User Flow
1. User visits the shop
2. User can browse products and add to cart
3. User can proceed to checkout
4. User can sign up/sign in (optional for browsing)

### Admin User Flow
1. Admin signs in
2. Admin sees an "Admin" badge in the header
3. Admin has access to the "Admin" menu item
4. Admin can access the Admin page to:
   - View all products (including unavailable ones)
   - Create new products
   - Edit existing products
   - Delete products
   - Toggle product availability

## Security Features

1. **Row Level Security (RLS)**: All database tables have RLS enabled
2. **Policy-Based Access Control**: Database policies enforce role-based permissions
3. **Client-Side Guards**: UI components check authentication status before rendering
4. **Server-Side Validation**: All product modifications are validated by Supabase RLS policies

## API Integration

The authentication system uses Supabase's built-in auth methods:

- `supabase.auth.signUp()` - Create new user account
- `supabase.auth.signInWithPassword()` - Sign in existing user
- `supabase.auth.signOut()` - Sign out current user
- `supabase.auth.getSession()` - Get current session
- `supabase.auth.onAuthStateChange()` - Listen to auth state changes

## Troubleshooting

### Issue: Admin menu doesn't appear after role change
**Solution**: Sign out and sign in again to refresh the session

### Issue: Products not loading
**Solution**: Check that Supabase is running and the database is properly migrated

### Issue: Can't modify products as admin
**Solution**: Verify that:
1. Your user role is set to 'admin' in the `user_roles` table
2. You've signed out and back in after the role change
3. The RLS policies are correctly applied (run migrations)

## Production Deployment

### Environment Variables

Set these variables in your production environment:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Creating Admin Users in Production

1. Use Supabase Dashboard SQL Editor
2. Run the SQL command to update user role (see above)
3. Or create a secure admin invite system (recommended for production)

## Future Enhancements

Potential improvements for the authentication system:

1. **Password Reset**: Add forgot password functionality
2. **Email Verification**: Require email confirmation before access
3. **Social Auth**: Add Google/GitHub OAuth providers
4. **Admin Invite System**: Create secure invite-only admin registration
5. **Audit Logging**: Track admin actions for accountability
6. **Multi-Factor Authentication**: Add 2FA for admin accounts
