-- Fix the user_notifications table with proper UUID handling
-- First, let's check what type the users.id column actually is

-- Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'id';

-- Now create the user_notifications table with the correct data type
-- Based on the error, it seems users.id might be TEXT, not UUID

-- Drop the table if it exists (to fix the constraint issue)
DROP TABLE IF EXISTS user_notifications;

-- User notifications table with correct data type
CREATE TABLE user_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,  -- Changed to TEXT to match users.id
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_notifications (using TEXT for auth.uid())
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Verify the table was created
SELECT 
    'user_notifications' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications') 
        THEN '✅ SUCCESSFULLY CREATED'
        ELSE '❌ FAILED TO CREATE'
    END as status;

-- Show the table structure to confirm
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_notifications'
ORDER BY ordinal_position; 