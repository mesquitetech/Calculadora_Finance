import { 
  User, 
  InsertUser, 
  Loan, 
  InsertLoan, 
  Investor, 
  InsertInvestor, 
  Payment, 
  InsertPayment 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Loan operations
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  
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
      createdAt: now
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

// Create and export storage instance
export const storage = new MemStorage();
