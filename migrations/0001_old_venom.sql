CREATE TABLE "user_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"api_key" text NOT NULL,
	"secret_key" text NOT NULL,
	"permissions" text[] DEFAULT '{"read"}',
	"ip_whitelist" text[],
	"is_active" boolean DEFAULT true,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "user_api_keys_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text,
	"last_seen" timestamp DEFAULT now(),
	"user_agent" text,
	"ip_address" text,
	"location" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"level" text DEFAULT 'basic',
	"perks" text[] DEFAULT '{}',
	"expiry_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'general',
	"is_read" boolean DEFAULT false,
	"priority" text DEFAULT 'normal',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"priority" text DEFAULT 'normal',
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"type" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8),
	"filled_quantity" numeric(20, 8) DEFAULT '0',
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"asset" text NOT NULL,
	"balance" numeric(20, 8) DEFAULT '0',
	"locked_balance" numeric(20, 8) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
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
	CONSTRAINT "user_profiles_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "user_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"status" text DEFAULT 'pending',
	"reward_amount" numeric(20, 8) DEFAULT '0',
	"reward_currency" text DEFAULT 'USDT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_security_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"success" boolean DEFAULT true,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_id" integer,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(20, 8) NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"fee" numeric(20, 8) DEFAULT '0',
	"fee_asset" text DEFAULT 'USDT',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_messages" ADD CONSTRAINT "user_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_orders" ADD CONSTRAINT "user_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_portfolios" ADD CONSTRAINT "user_portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_security_logs" ADD CONSTRAINT "user_security_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trades" ADD CONSTRAINT "user_trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trades" ADD CONSTRAINT "user_trades_order_id_user_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."user_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");