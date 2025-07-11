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

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Loan operations
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  deleteLoan(id: number): Promise<void>;
  
  // Investor operations
  getInvestor(id: number): Promise<Investor | undefined>;
  getInvestorsByLoanId(loanId: number): Promise<Investor[]>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByLoanId(loanId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private loans: Map<number, Loan>;
  private investors: Map<number, Investor>;
  private payments: Map<number, Payment>;
  
  private userId: number;
  private loanId: number;
  private investorId: number;
  private paymentId: number;

  constructor() {
    this.users = new Map();
    this.loans = new Map();
    this.investors = new Map();
    this.payments = new Map();
    
    this.userId = 1;
    this.loanId = 1;
    this.investorId = 1;
    this.paymentId = 1;
  }

  // User methods
  async deleteLoan(id: number): Promise<void> {
    // Borra también los inversores y pagos asociados para mantener la consistencia
    const investorsToDelete = Array.from(this.investors.values()).filter(
      (investor) => investor.loanId === id
    );
    for (const investor of investorsToDelete) {
      this.investors.delete(investor.id);
    }

    const paymentsToDelete = Array.from(this.payments.values()).filter(
      (payment) => payment.loanId === id
    );
    for (const payment of paymentsToDelete) {
      this.payments.delete(payment.id);
    }

    this.loans.delete(id);
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
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
  
  // Investor methods
  async getInvestor(id: number): Promise<Investor | undefined> {
    return this.investors.get(id);
  }
  
  async getInvestorsByLoanId(loanId: number): Promise<Investor[]> {
    return Array.from(this.investors.values()).filter(
      (investor) => investor.loanId === loanId
    );
  }
  
  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const id = this.investorId++;
    const now = new Date();
    const investor: Investor = {
      ...insertInvestor,
      id,
      createdAt: now
    };
    this.investors.set(id, investor);
    return investor;
  }
  
  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByLoanId(loanId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter((payment) => payment.loanId === loanId)
      .sort((a, b) => a.paymentNumber - b.paymentNumber);
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const now = new Date();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: now
    };
    this.payments.set(id, payment);
    return payment;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async deleteLoan(id: number): Promise<void> {
    await db.delete(loans).where(eq(loans.id, id));
  }
  
  // Loan methods
  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }
  
  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db
      .insert(loans)
      .values(insertLoan)
      .returning();
    return loan;
  }
  
  // Investor methods
  async getInvestor(id: number): Promise<Investor | undefined> {
    const [investor] = await db.select().from(investors).where(eq(investors.id, id));
    return investor || undefined;
  }
  
  async getInvestorsByLoanId(loanId: number): Promise<Investor[]> {
    return await db
      .select()
      .from(investors)
      .where(eq(investors.loanId, loanId));
  }
  
  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const [investor] = await db
      .insert(investors)
      .values(insertInvestor)
      .returning();
    return investor;
  }
  
  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }
  
  async getPaymentsByLoanId(loanId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.loanId, loanId))
      .orderBy(payments.paymentNumber);
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();
