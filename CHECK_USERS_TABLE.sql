-- Check the actual users table structure
-- This will help us understand the column types

-- Show all columns in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any constraints on the users table
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users';

-- Check the actual table definition
SELECT 
    'USERS TABLE STRUCTURE' as info,
    string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'users'; 