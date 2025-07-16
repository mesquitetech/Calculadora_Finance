CREATE TABLE "business_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_id" integer NOT NULL,
	"asset_cost" numeric(12, 2) NOT NULL,
	"other_expenses" numeric(12, 2) NOT NULL,
	"monthly_expenses" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_parameters" ADD CONSTRAINT "business_parameters_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;