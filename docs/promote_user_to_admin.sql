-- Script to promote a user to admin role
-- Usage: Replace 'user-email@example.com' with the actual user email
-- IMPORTANT: This script must be run with proper schema references for the woolwitch application

-- Method 1: Promote user by email
UPDATE woolwitch.user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'user-email@example.com'
);

-- Method 2: Promote user by user_id (if you know the UUID)
-- UPDATE woolwitch.user_roles 
-- SET role = 'admin' 
-- WHERE user_id = 'user-uuid-here';

-- Method 3: Check all users and their roles
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN woolwitch.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Method 4: List all admin users
SELECT 
  u.id,
  u.email,
  ur.role,
  u.created_at
FROM auth.users u
JOIN woolwitch.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY u.created_at DESC;
