import {
  User,
  InsertUser,
  Loan,
  InsertLoan,
  Investor,
  InsertInvestor,
  Payment,
  InsertPayment,
  UserSettings,
  InsertUserSettings,
  BusinessParametersDB,
  InsertBusinessParameters,
  users,
  loans,
  investors,
  payments,
  userSettings,
  businessParameters
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

  // User Settings operations
  getUserSettings(sessionId: string): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;

  // Business Parameters operations
  getBusinessParametersByLoanId(loanId: number): Promise<BusinessParametersDB | undefined>;
  createBusinessParameters(businessParams: InsertBusinessParameters): Promise<BusinessParametersDB>;
  updateBusinessParameters(loanId: number, businessParams: Partial<InsertBusinessParameters>): Promise<BusinessParametersDB>;
  deleteBusinessParametersByLoanId(loanId: number): Promise<void>;
}


// In-memory storage implementation (for testing or development)
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private loans: Map<number, Loan> = new Map();
  private investors: Map<number, Investor> = new Map();
  private payments: Map<number, Payment> = new Map();
  private userSettings: Map<number, UserSettings> = new Map();
  private businessParams: Map<number, BusinessParametersDB> = new Map();

  private userId: number = 1;
  private loanId: number = 1;
  private investorId: number = 1;
  private paymentId: number = 1;
  private userSettingsId: number = 1;
  private businessParamsId: number = 1;

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
    this.deleteBusinessParametersByLoanId(id);
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

  // User Settings methods
  async getUserSettings(sessionId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.sessionId === sessionId);
  }

  async createOrUpdateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(insertSettings.sessionId);
    const now = new Date();

    if (existing) {
      const updated: UserSettings = {
        ...existing,
        ...insertSettings,
        updatedAt: now
      };
      this.userSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.userSettingsId++;
      const settings: UserSettings = {
        ...insertSettings,
        id,
        createdAt: now,
        updatedAt: now
      };
      this.userSettings.set(id, settings);
      return settings;
    }
  }

  // Business Parameters methods
  async getBusinessParametersByLoanId(loanId: number): Promise<BusinessParametersDB | undefined> {
    return Array.from(this.businessParams.values()).find(params => params.loanId === loanId);
  }

  async createBusinessParameters(insertBusinessParams: InsertBusinessParameters): Promise<BusinessParametersDB> {
    const id = this.businessParamsId++;
    const now = new Date();
    const businessParams: BusinessParametersDB = {
      ...insertBusinessParams,
      id,
      createdAt: now
    };
    this.businessParams.set(id, businessParams);
    return businessParams;
  }

  async updateBusinessParameters(loanId: number, businessParamsData: Partial<InsertBusinessParameters>): Promise<BusinessParametersDB> {
    const existing = await this.getBusinessParametersByLoanId(loanId);
    if (!existing) {
      throw new Error(`Business parameters for loan ${loanId} not found`);
    }
    const updated = { ...existing, ...businessParamsData };
    this.businessParams.set(existing.id, updated);
    return updated;
  }

  async deleteBusinessParametersByLoanId(loanId: number): Promise<void> {
    const existing = await this.getBusinessParametersByLoanId(loanId);
    if (existing) {
      this.businessParams.delete(existing.id);
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

  // User Settings methods
  async getUserSettings(sessionId: string): Promise<UserSettings | undefined> {
    return await db.query.userSettings.findFirst({ where: eq(userSettings.sessionId, sessionId) });
  }

  async createOrUpdateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(insertSettings.sessionId);

    if (existing) {
      const [updated] = await db.update(userSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(userSettings.sessionId, insertSettings.sessionId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userSettings).values(insertSettings).returning();
      return created;
    }
  }

  // Business Parameters methods
  async getBusinessParametersByLoanId(loanId: number): Promise<BusinessParametersDB | undefined> {
    return await db.query.businessParameters.findFirst({ where: eq(businessParameters.loanId, loanId) });
  }

  async createBusinessParameters(insertBusinessParams: InsertBusinessParameters): Promise<BusinessParametersDB> {
    const [businessParam] = await db.insert(businessParameters).values(insertBusinessParams).returning();
    return businessParam;
  }

  async updateBusinessParameters(loanId: number, businessParamsData: Partial<InsertBusinessParameters>): Promise<BusinessParametersDB> {
    const [updated] = await db.update(businessParameters)
      .set(businessParamsData)
      .where(eq(businessParameters.loanId, loanId))
      .returning();
    return updated;
  }

  async deleteBusinessParametersByLoanId(loanId: number): Promise<void> {
    await db.delete(businessParameters).where(eq(businessParameters.loanId, loanId));
  }
}

// Create and export a single storage instance for the application to use.
export const storage: IStorage = new DatabaseStorage();