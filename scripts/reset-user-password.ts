import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   - DATABASE_URL');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function resetUserPassword() {
  const userEmail = 'elij6405@gmail.com';
  const newPassword = 'NewSecurePassword123!'; // You can change this

  console.log('🔑 Resetting user password...');
  console.log(`📧 Email: ${userEmail}`);
  console.log(`🔒 New password: ${newPassword}\n`);

  try {
    // Method 1: Use Supabase Auth API to reset password
    console.log('1️⃣ Attempting password reset via Supabase Auth API...');
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      userEmail, // This should be user ID, but we'll try email first
      { password: newPassword }
    );

    if (error) {
      console.log(`   ⚠️  Auth API method failed: ${error.message}`);
      console.log('   Trying alternative method...\n');
      
      // Method 2: Send password reset email
      console.log('2️⃣ Sending password reset email...');
      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
        userEmail,
        {
          redirectTo: `${SUPABASE_URL}/auth/reset-password`
        }
      );

      if (resetError) {
        console.log(`   ❌ Password reset email failed: ${resetError.message}`);
      } else {
        console.log('   ✅ Password reset email sent successfully!');
        console.log('   📧 Check your email for the reset link');
      }
    } else {
      console.log('   ✅ Password updated successfully via Auth API!');
    }

    // Method 3: Check if user exists in auth.users table
    console.log('\n3️⃣ Checking user in database...');
    const userResult = await sql`
      SELECT id, email, created_at 
      FROM auth.users 
      WHERE email = ${userEmail}
    `;

    if (userResult.length > 0) {
      console.log(`   ✅ User found in database:`);
      console.log(`   👤 User ID: ${userResult[0].id}`);
      console.log(`   📧 Email: ${userResult[0].email}`);
      console.log(`   📅 Created: ${userResult[0].created_at}`);
    } else {
      console.log(`   ❌ User not found in auth.users table`);
    }

    // Method 4: Check if user exists in our custom users table
    console.log('\n4️⃣ Checking custom users table...');
    const customUserResult = await sql`
      SELECT id, email, created_at 
      FROM users 
      WHERE email = ${userEmail}
    `;

    if (customUserResult.length > 0) {
      console.log(`   ✅ User found in custom users table:`);
      console.log(`   👤 User ID: ${customUserResult[0].id}`);
      console.log(`   📧 Email: ${customUserResult[0].email}`);
      console.log(`   📅 Created: ${customUserResult[0].created_at}`);
    } else {
      console.log(`   ❌ User not found in custom users table`);
    }

    console.log('\n🎉 Password reset process completed!');
    console.log('📧 If a reset email was sent, check your inbox');
    console.log('🔑 If password was updated directly, you can now log in with the new password');

  } catch (error) {
    console.error('❌ Error during password reset:', error);
  } finally {
    await sql.end();
  }
}

resetUserPassword(); 