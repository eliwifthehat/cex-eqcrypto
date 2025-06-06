CREATE TABLE "order_book_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"side" text NOT NULL,
	"price" numeric(18, 8) NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"price" numeric(18, 8) NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"side" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trading_pairs" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"base_asset" text NOT NULL,
	"quote_asset" text NOT NULL,
	"current_price" numeric(18, 8) NOT NULL,
	"price_change_24h" numeric(18, 8) NOT NULL,
	"price_change_percent_24h" numeric(5, 2) NOT NULL,
	"high_24h" numeric(18, 8) NOT NULL,
	"low_24h" numeric(18, 8) NOT NULL,
	"volume_24h" numeric(18, 8) NOT NULL,
	CONSTRAINT "trading_pairs_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
