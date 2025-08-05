-- Direct check of users table
-- Let's see what's actually in there

-- Show all columns with their positions
SELECT 
    column_name,
    data_type,
    is_nullable,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Try to see the actual table definition
\d users;

-- Or try this alternative approach
SELECT 
    schemaname,
    tablename,
    columnname,
    data_type
FROM pg_tables pt
JOIN pg_attribute pa ON pt.tablename = 'users'
WHERE pa.attrelid = 'users'::regclass
AND pa.attnum > 0
AND NOT pa.attisdropped
ORDER BY pa.attnum; 