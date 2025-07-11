CREATE TABLE "investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"investment_amount" numeric(12, 2) NOT NULL,
	"loan_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_name" varchar(256) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"interest_rate" numeric(5, 2) NOT NULL,
	"term_months" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"payment_frequency" text DEFAULT 'monthly' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_id" integer NOT NULL,
	"payment_number" integer NOT NULL,
	"date" timestamp NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"principal" numeric(12, 2) NOT NULL,
	"interest" numeric(12, 2) NOT NULL,
	"balance" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
