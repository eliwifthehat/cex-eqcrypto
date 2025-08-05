import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function simplePasswordReset() {
  const userEmail = 'elij6405@gmail.com';

  console.log('🔑 Checking user account status...');
  console.log(`📧 Email: ${userEmail}\n`);

  try {
    // Check if user exists in auth.users table (Supabase's built-in auth)
    console.log('1️⃣ Checking Supabase auth.users table...');
    const authUserResult = await sql`
      SELECT id, email, created_at, last_sign_in_at
      FROM auth.users 
      WHERE email = ${userEmail}
    `;

    if (authUserResult.length > 0) {
      console.log(`   ✅ User found in Supabase auth:`);
      console.log(`   👤 User ID: ${authUserResult[0].id}`);
      console.log(`   📧 Email: ${authUserResult[0].email}`);
      console.log(`   📅 Created: ${authUserResult[0].created_at}`);
      console.log(`   🔐 Last sign in: ${authUserResult[0].last_sign_in_at || 'Never'}`);
      
      console.log('\n🔑 To reset password:');
      console.log('   1. Go to your website');
      console.log('   2. Click "Forgot Password" or "Reset Password"');
      console.log('   3. Enter: elij6405@gmail.com');
      console.log('   4. Check your email for reset link');
      
    } else {
      console.log(`   ❌ User not found in Supabase auth`);
    }

    // Check if user exists in our custom users table
    console.log('\n2️⃣ Checking custom users table...');
    try {
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
    } catch (error) {
      console.log(`   ⚠️  Custom users table doesn't exist yet`);
    }

    // Check user profiles
    console.log('\n3️⃣ Checking user profiles...');
    try {
      const profileResult = await sql`
        SELECT id, uid, first_name, last_name, verified
        FROM user_profiles 
        WHERE id IN (
          SELECT id FROM users WHERE email = ${userEmail}
        )
      `;

      if (profileResult.length > 0) {
        console.log(`   ✅ User profile found:`);
        console.log(`   👤 Name: ${profileResult[0].first_name} ${profileResult[0].last_name}`);
        console.log(`   🆔 UID: ${profileResult[0].uid}`);
        console.log(`   ✅ Verified: ${profileResult[0].verified}`);
      } else {
        console.log(`   ❌ No user profile found`);
      }
    } catch (error) {
      console.log(`   ⚠️  User profiles table doesn't exist yet`);
    }

    console.log('\n🎯 Password Reset Options:');
    console.log('   Option 1: Use your website\'s "Forgot Password" feature');
    console.log('   Option 2: Go to Supabase Dashboard → Authentication → Users');
    console.log('   Option 3: Contact your website administrator');
    
    console.log('\n📧 Make sure you can access: elij6405@gmail.com');
    console.log('🔑 The reset link will be sent to that email address');

  } catch (error) {
    console.error('❌ Error checking user account:', error);
  } finally {
    await sql.end();
  }
}

simplePasswordReset(); 