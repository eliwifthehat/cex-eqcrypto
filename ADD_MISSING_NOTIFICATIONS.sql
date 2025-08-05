-- Add the missing user_notifications table
-- This table was missing from the schema run

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- Create RLS policies for user_notifications
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