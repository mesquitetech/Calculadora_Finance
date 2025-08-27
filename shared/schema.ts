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

// Define leasing quotations table for simplified leasing model
export const leasingQuotations = pgTable("leasing_quotations", {
  id: serial("id").primaryKey(),
  
  // Información del cliente
  clientName: text("client_name").notNull(),
  vehicleInfo: text("vehicle_info").notNull(),
  promoter: text("promoter"),
  phone: text("phone"),
  folio: text("folio").notNull().unique(),
  city: text("city"),
  
  // Variables financieras principales
  assetValue: numeric("asset_value", { precision: 12, scale: 2 }).notNull(),
  downPayment: numeric("down_payment", { precision: 12, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(),
  clientAnnualInterestRate: numeric("client_annual_interest_rate", { precision: 5, scale: 2 }).notNull(),
  residualValuePercentage: numeric("residual_value_percentage", { precision: 5, scale: 2 }).notNull(),
  
  // Variables del préstamo del inversionista
  investorLoanAmount: numeric("investor_loan_amount", { precision: 12, scale: 2 }).notNull(),
  investorAnnualInterestRate: numeric("investor_annual_interest_rate", { precision: 5, scale: 2 }).notNull(),
  
  // Campos adicionales para el PDF
  firstYearInsurance: numeric("first_year_insurance", { precision: 12, scale: 2 }).default("0.00"),
  openingCommission: numeric("opening_commission", { precision: 12, scale: 2 }).default("0.00"),
  adminExpenses: numeric("admin_expenses", { precision: 12, scale: 2 }).default("0.00"),
  
  // Resultados calculados
  clientMonthlyPayment: numeric("client_monthly_payment", { precision: 12, scale: 2 }),
  lessorMonthlyPayment: numeric("lessor_monthly_payment", { precision: 12, scale: 2 }),
  grossMonthlyMargin: numeric("gross_monthly_margin", { precision: 12, scale: 2 }),
  totalProfit: numeric("total_profit", { precision: 12, scale: 2 }),
  profitMarginPercentage: numeric("profit_margin_percentage", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeasingQuotationSchema = createInsertSchema(leasingQuotations).pick({
  clientName: true,
  vehicleInfo: true,
  promoter: true,
  phone: true,
  folio: true,
  city: true,
  assetValue: true,
  downPayment: true,
  termMonths: true,
  clientAnnualInterestRate: true,
  residualValuePercentage: true,
  investorLoanAmount: true,
  investorAnnualInterestRate: true,
  firstYearInsurance: true,
  openingCommission: true,
  adminExpenses: true,
});

// Define Relations
export const loansRelations = relations(loans, ({ many }) => ({
  investors: many(investors),
  payments: many(payments),
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

export const leasingQuotationsRelations = relations(leasingQuotations, ({ many }) => ({
  // Las cotizaciones de leasing son independientes y no tienen relaciones directas con loans
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

export type InsertLeasingQuotation = z.infer<typeof insertLeasingQuotationSchema>;
export type LeasingQuotation = typeof leasingQuotations.$inferSelect;