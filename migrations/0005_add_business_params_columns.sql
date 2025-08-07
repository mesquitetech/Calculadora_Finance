
-- Add new business parameters columns
ALTER TABLE "business_parameters" ADD COLUMN "lessor_profit_margin_pct" numeric(5,2) DEFAULT 15.00;
ALTER TABLE "business_parameters" ADD COLUMN "fixed_monthly_fee" numeric(10,2) DEFAULT 0.00;
ALTER TABLE "business_parameters" ADD COLUMN "admin_commission_pct" numeric(5,2) DEFAULT 2.00;
ALTER TABLE "business_parameters" ADD COLUMN "security_deposit_months" integer DEFAULT 1;
ALTER TABLE "business_parameters" ADD COLUMN "delivery_costs" numeric(10,2) DEFAULT 0.00;
ALTER TABLE "business_parameters" ADD COLUMN "residual_value_rate" numeric(5,2) DEFAULT 20.00;
ALTER TABLE "business_parameters" ADD COLUMN "discount_rate" numeric(5,2) DEFAULT 6.00;
