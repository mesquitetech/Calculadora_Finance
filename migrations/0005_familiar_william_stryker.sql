CREATE TABLE "business_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_id" integer NOT NULL,
	"asset_cost" numeric(12, 2) NOT NULL,
	"other_expenses" numeric(12, 2) NOT NULL,
	"monthly_expenses" numeric(12, 2) NOT NULL,
	"lessor_profit_margin_pct" numeric(5, 2) DEFAULT '15.00',
	"fixed_monthly_fee" numeric(10, 2) DEFAULT '0.00',
	"admin_commission_pct" numeric(5, 2) DEFAULT '2.00',
	"security_deposit_months" integer DEFAULT 1,
	"delivery_costs" numeric(10, 2) DEFAULT '0.00',
	"residual_value_rate" numeric(5, 2) DEFAULT '20.00',
	"discount_rate" numeric(5, 2) DEFAULT '6.00',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "monthly_payment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "total_interest" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "business_parameters" ADD CONSTRAINT "business_parameters_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;