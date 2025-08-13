-- Create missing tables for CEX admin functionality

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" text PRIMARY KEY NOT NULL,
    "uid" text NOT NULL,
    "first_name" text,
    "last_name" text,
    "avatar" text,
    "verified" boolean DEFAULT false,
    "kyc_status" text DEFAULT 'pending',
    "security_level" integer DEFAULT 1,
    "withdrawal_limit" numeric(20, 2) DEFAULT '1000.00',
    "two_factor_enabled" boolean DEFAULT false,
    "phone_verified" boolean DEFAULT false,
    "email_verified" boolean DEFAULT false,
    "api_key_enabled" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    "slippage_tolerance" numeric(5, 2) DEFAULT '0.50',
    CONSTRAINT "user_profiles_uid_unique" UNIQUE("uid"),
    CONSTRAINT "user_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

-- Add some sample data for testing
INSERT INTO "users" ("id", "email", "phone") VALUES 
('test-user-1', 'user1@example.com', '+1234567890'),
('test-user-2', 'user2@example.com', '+0987654321')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "user_profiles" ("id", "uid", "first_name", "last_name", "verified") VALUES 
('test-user-1', 'EQ123456789', 'John', 'Doe', true),
('test-user-2', 'EQ987654321', 'Jane', 'Smith', false)
ON CONFLICT ("id") DO NOTHING;
