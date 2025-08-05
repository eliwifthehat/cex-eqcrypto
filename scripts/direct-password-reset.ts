import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// Create Supabase client with service role key for admin operations
let supabase: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Generate a secure password
function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function directPasswordReset() {
  const userEmail = 'elij6405@gmail.com';
  const newPassword = generateSecurePassword();

  console.log('🔑 Direct Password Reset via Database...');
  console.log(`📧 Email: ${userEmail}`);
  console.log(`🔒 New Password: ${newPassword}\n`);

  try {
    // Method 1: Try using Supabase Auth API if we have the service role key
    if (supabase) {
      console.log('1️⃣ Attempting password reset via Supabase Auth API...');
      
      // First, get the user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.log(`   ⚠️  Could not list users: ${userError.message}`);
      } else {
        const user = userData.users.find((u: any) => u.email === userEmail);
        
        if (user) {
          console.log(`   ✅ Found user with ID: ${user.id}`);
          
          // Update the user's password
          const { data, error } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
          );

          if (error) {
            console.log(`   ❌ Password update failed: ${error.message}`);
          } else {
            console.log(`   ✅ Password updated successfully!`);
            console.log(`   🔑 New password: ${newPassword}`);
            console.log(`   📧 You can now log in with: elij6405@gmail.com`);
            console.log(`   🔒 Password: ${newPassword}`);
            return;
          }
        } else {
          console.log(`   ❌ User not found in Supabase Auth`);
        }
      }
    } else {
      console.log('1️⃣ Supabase service role key not available, trying database method...');
    }

    // Method 2: Direct database update (if Supabase API fails)
    console.log('\n2️⃣ Attempting direct database password update...');
    
    // Get the user's encrypted password hash from auth.users
    const userResult = await sql`
      SELECT id, encrypted_password, email_confirmed_at
      FROM auth.users 
      WHERE email = ${userEmail}
    `;

    if (userResult.length === 0) {
      console.log(`   ❌ User not found in database`);
      return;
    }

    const userId = userResult[0].id;
    console.log(`   ✅ Found user with ID: ${userId}`);

    // Generate a new password hash using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    const updateResult = await sql`
      UPDATE auth.users 
      SET 
        encrypted_password = ${hashedPassword},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log(`   ✅ Password updated in database!`);
    console.log(`   🔑 New password: ${newPassword}`);
    console.log(`   📧 You can now log in with: elij6405@gmail.com`);
    console.log(`   🔒 Password: ${newPassword}`);

    // Also update the user's email confirmation if needed
    if (!userResult[0].email_confirmed_at) {
      await sql`
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = ${userId}
      `;
      console.log(`   ✅ Email confirmed`);
    }

    console.log('\n🎉 Password reset completed successfully!');
    console.log('📝 Save this password somewhere safe:');
    console.log(`   Email: ${userEmail}`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error during password reset:', error);
    
    // Fallback: Send password reset email
    console.log('\n🔄 Trying fallback method: Send password reset email...');
    if (supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(userEmail);
      if (error) {
        console.log(`   ❌ Password reset email failed: ${error.message}`);
      } else {
        console.log(`   ✅ Password reset email sent to ${userEmail}`);
        console.log(`   📧 Check your email for the reset link`);
      }
    }
  } finally {
    await sql.end();
  }
}

directPasswordReset(); 