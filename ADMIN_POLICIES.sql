-- Additional RLS Policies for Admin User Management
-- Run this SQL in your Supabase SQL Editor to allow admins to manage users

-- Drop the existing update policy if needed (optional, but recommended for clean setup)
-- DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate the user update policy (same as before)
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- NEW: Allow admins to update any user profile
CREATE POLICY IF NOT EXISTS "Admins can update any profile" 
  ON profiles FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NEW: Allow admins to delete user profiles (for rejection)
CREATE POLICY IF NOT EXISTS "Admins can delete profiles" 
  ON profiles FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

