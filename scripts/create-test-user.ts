import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://heldzockilbftitlcbac.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'password123',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: 'Admin User'
      }
    })

    if (error) {
      console.error('Error creating user:', error)
    } else {
      console.log('✅ Test user created successfully!')
      console.log('Email: admin@example.com')
      console.log('Password: password123')
      console.log('User ID:', data.user?.id)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

createTestUser() 