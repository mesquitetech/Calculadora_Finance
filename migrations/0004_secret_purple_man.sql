CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"investors" text NOT NULL,
	"business_params" text NOT NULL,
	"renter_config" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_session_id_unique" UNIQUE("session_id")
);
