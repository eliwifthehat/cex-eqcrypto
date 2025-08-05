-- Simple check of users table structure
-- This will show us the actual columns and their types

-- Show all columns in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check which column is the primary key
SELECT 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'PRIMARY KEY'; 