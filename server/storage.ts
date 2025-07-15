import {
  User,
  InsertUser,
  Loan,
  InsertLoan,
  Investor,
  InsertInvestor,
  Payment,
  InsertPayment,
  users,
  loans,
  investors,
  payments
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations, defining the contract for storage classes.
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Loan operations
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  deleteLoan(id: number): Promise<void>;
  updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan>;

  // Investor operations
  getInvestorsByLoanId(loanId: number): Promise<Investor[]>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  deleteInvestorsByLoanId(loanId: number): Promise<void>;

  // Payment operations
  getPaymentsByLoanId(loanId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  deletePaymentsByLoanId(loanId: number): Promise<void>;
}


// In-memory storage implementation (for testing or development)
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private loans: Map<number, Loan> = new Map();
  private investors: Map<number, Investor> = new Map();
  private payments: Map<number, Payment> = new Map();

  private userId: number = 1;
  private loanId: number = 1;
  private investorId: number = 1;
  private paymentId: number = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Loan methods
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.loanId++;
    const now = new Date();
    const loan: Loan = {
      ...insertLoan,
      id,
      createdAt: now,
      paymentFrequency: insertLoan.paymentFrequency || 'monthly'
    };
    this.loans.set(id, loan);
    return loan;
  }

  async deleteLoan(id: number): Promise<void> {
    this.deleteInvestorsByLoanId(id);
    this.deletePaymentsByLoanId(id);
    this.loans.delete(id);
  }

  async updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan> {
    const loan = this.loans.get(id);
    if (!loan) {
      throw new Error(`Loan with id ${id} not found`);
    }
    const updatedLoan = { ...loan, ...loanData };
    this.loans.set(id, updatedLoan as Loan);
    return updatedLoan as Loan;
  }

  // Investor methods
  async getInvestorsByLoanId(loanId: number): Promise<Investor[]> {
    return Array.from(this.investors.values()).filter(investor => investor.loanId === loanId);
  }

  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const id = this.investorId++;
    const now = new Date();
    const investor: Investor = { ...insertInvestor, id, createdAt: now };
    this.investors.set(id, investor);
    return investor;
  }

  async deleteInvestorsByLoanId(loanId: number): Promise<void> {
      const investorsToDelete = await this.getInvestorsByLoanId(loanId);
      for (const investor of investorsToDelete) {
          this.investors.delete(investor.id);
      }
  }

  // Payment methods
  async getPaymentsByLoanId(loanId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.loanId === loanId)
      .sort((a, b) => a.paymentNumber - b.paymentNumber);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const now = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt: now };
    this.payments.set(id, payment);
    return payment;
  }

  async deletePaymentsByLoanId(loanId: number): Promise<void> {
      const paymentsToDelete = await this.getPaymentsByLoanId(loanId);
      for (const payment of paymentsToDelete) {
          this.payments.delete(payment.id);
      }
  }
}

// Database storage implementation (for production)

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({ where: eq(users.username, username) });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Loan methods
  async getLoan(id: number): Promise<Loan | undefined> {
    return await db.query.loans.findFirst({ where: eq(loans.id, id) });
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(insertLoan).returning();
    return loan;
  }

  async deleteLoan(id: number): Promise<void> {
    await 
      db.delete(loans).where(eq(loans.id, id));
  }

  async deleteAllLoans(): Promise<void> {
    await db.delete(loans);  
  }

  async updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan> {
    const [updatedLoan] = await db.update(loans).set(loanData).where(eq(loans.id, id)).returning();
    return updatedLoan;
  }

  // Investor methods
  async getInvestorsByLoanId(loanId: number): Promise<Investor[]> {
    return await db.query.investors.findMany({ where: eq(investors.loanId, loanId) });
  }

  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const [investor] = await db.insert(investors).values(insertInvestor).returning();
    return investor;
  }

  async deleteInvestorsByLoanId(loanId: number): Promise<void> {
    await db.delete(investors).where(eq(investors.loanId, loanId));
  }

  // Payment methods
  async getPaymentsByLoanId(loanId: number): Promise<Payment[]> {
    return await db.query.payments.findMany({
      where: eq(payments.loanId, loanId),
      orderBy: (payments, { asc }) => [asc(payments.paymentNumber)],
    });
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async deletePaymentsByLoanId(loanId: number): Promise<void> {
    await db.delete(payments).where(eq(payments.loanId, loanId));
  }
}

// Create and export a single storage instance for the application to use.
export const storage: IStorage = new DatabaseStorage();