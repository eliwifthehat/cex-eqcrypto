-- Final fix for user_notifications table with proper UUID handling
-- The users.id is UUID, but auth.uid() returns TEXT, so we need to cast it

-- Drop the table if it exists (to fix the constraint issue)
DROP TABLE IF EXISTS user_notifications;

-- User notifications table with correct UUID data type
CREATE TABLE user_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,  -- Back to UUID
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

-- Create RLS policies for user_notifications with proper UUID casting
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own notifications" ON user_notifications
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid()::uuid = user_id);

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

-- Test the RLS policies work
SELECT 
    'RLS Policies' as check_type,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'user_notifications'; 