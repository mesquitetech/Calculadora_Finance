import { pgTable, text, serial, numeric, timestamp, integer, varchar, primaryKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define the users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define the loans table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  loanName: text('loan_name').notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(),
  startDate: timestamp("start_date").notNull(),
  paymentFrequency: text("payment_frequency").notNull().default("monthly"),
  monthlyPayment: numeric("monthly_payment", { precision: 12, scale: 2 }),
  totalInterest: numeric("total_interest", { precision: 12, scale: 2 }),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loans).pick({
  loanName: true,
  amount: true,
  interestRate: true,
  termMonths: true,
  startDate: true,
  paymentFrequency: true,
});

// Define the investors table
export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  investmentAmount: numeric("investment_amount", { precision: 12, scale: 2 }).notNull(),
  // CORREGIDO: Se añade la referencia a la tabla 'loans' con borrado en cascada.
  loanId: integer("loan_id").notNull().references(() => loans.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvestorSchema = createInsertSchema(investors).pick({
  name: true,
  investmentAmount: true,
  loanId: true,
});

// Define the payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  // CORREGIDO: Se añade la referencia a la tabla 'loans' con borrado en cascada.
  loanId: integer("loan_id").notNull().references(() => loans.id, { onDelete: 'cascade' }),
  paymentNumber: integer("payment_number").notNull(),
  date: timestamp("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
  interest: numeric("interest", { precision: 12, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  loanId: true,
  paymentNumber: true,
  date: true,
  amount: true,
  principal: true,
  interest: true,
  balance: true,
});

// Define user settings table for persistent configuration
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  investors: text("investors").notNull(), // JSON string
  businessParams: text("business_params").notNull(), // JSON string
  renterConfig: text("renter_config"), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  sessionId: true,
  investors: true,
  businessParams: true,
  renterConfig: true,
});

// Define business parameters table with leasing-specific variables
export const businessParameters = pgTable("business_parameters", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id, { onDelete: "cascade" }).notNull(),
  assetCost: numeric("asset_cost", { precision: 12, scale: 2 }).notNull(),
  otherExpenses: numeric("other_expenses", { precision: 12, scale: 2 }).notNull(),
  monthlyExpenses: numeric("monthly_expenses", { precision: 12, scale: 2 }).notNull(),
  lessorProfitMarginPct: numeric("lessor_profit_margin_pct", { precision: 5, scale: 2 }).default("15.00"),
  fixedMonthlyFee: numeric("fixed_monthly_fee", { precision: 10, scale: 2 }).default("0.00"),
  adminCommissionPct: numeric("admin_commission_pct", { precision: 5, scale: 2 }).default("2.00"),
  securityDepositMonths: integer("security_deposit_months").default(1),
  deliveryCosts: numeric("delivery_costs", { precision: 10, scale: 2 }).default("0.00"),
  residualValueRate: numeric("residual_value_rate", { precision: 5, scale: 2 }).default("20.00"),
  discountRate: numeric("discount_rate", { precision: 5, scale: 2 }).default("6.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessParametersSchema = createInsertSchema(businessParameters).pick({
  loanId: true,
  assetCost: true,
  otherExpenses: true,
  monthlyExpenses: true,
  lessorProfitMarginPct: true,
  fixedMonthlyFee: true,
  adminCommissionPct: true,
  securityDepositMonths: true,
  deliveryCosts: true,
  residualValueRate: true,
  discountRate: true,
});

// Define Relations
export const loansRelations = relations(loans, ({ many, one }) => ({
  investors: many(investors),
  payments: many(payments),
  businessParameters: one(businessParameters),
}));

export const investorsRelations = relations(investors, ({ one }) => ({
  loan: one(loans, {
    fields: [investors.loanId],
    references: [loans.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  loan: one(loans, {
    fields: [payments.loanId],
    references: [loans.id],
  }),
}));

export const businessParametersRelations = relations(businessParameters, ({ one }) => ({
  loan: one(loans, {
    fields: [businessParameters.loanId],
    references: [loans.id],
  }),
}));

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investors.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertBusinessParameters = z.infer<typeof insertBusinessParametersSchema>;
export type BusinessParametersDB = typeof businessParameters.$inferSelect;