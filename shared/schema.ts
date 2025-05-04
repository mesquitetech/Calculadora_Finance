import { pgTable, text, serial, numeric, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
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
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(),
  startDate: timestamp("start_date").notNull(),
  paymentFrequency: text("payment_frequency").notNull().default("monthly"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loans).pick({
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
  loanId: integer("loan_id").notNull(),
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
  loanId: integer("loan_id").notNull(),
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

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type Investor = typeof investors.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
