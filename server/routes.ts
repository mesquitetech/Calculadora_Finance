import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertLoanSchema, 
  insertInvestorSchema, 
  insertPaymentSchema 
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculate investment returns
  app.post("/api/calculate", async (req, res) => {
    try {
      const { loanParams, investors } = req.body;
      
      // Validate inputs
      const validatedLoan = insertLoanSchema.parse({
        amount: loanParams.totalAmount,
        interestRate: loanParams.interestRate,
        termMonths: loanParams.termMonths,
        startDate: new Date(loanParams.startDate),
        paymentFrequency: loanParams.paymentFrequency,
      });
      
      // Validate minimum 3 investors
      if (!Array.isArray(investors) || investors.length < 3) {
        return res.status(400).json({ 
          message: "At least 3 investors are required"
        });
      }
      
      // Validate each investor
      const validatedInvestors = investors.map(investor => {
        return {
          name: investor.name,
          investmentAmount: investor.investmentAmount,
        };
      });
      
      // Check that investment amounts match the loan amount
      const totalInvestment = validatedInvestors.reduce(
        (sum, investor) => sum + Number(investor.investmentAmount),
        0
      );
      
      if (Math.abs(totalInvestment - Number(validatedLoan.amount)) > 0.01) {
        return res.status(400).json({
          message: "Total investment must match the loan amount"
        });
      }
      
      // Create the loan
      const loan = await storage.createLoan(validatedLoan);
      
      // Create investors for the loan
      const createdInvestors = await Promise.all(
        validatedInvestors.map(investor => 
          storage.createInvestor({
            ...investor,
            loanId: loan.id,
          })
        )
      );
      
      // Generate payment schedule
      const paymentSchedule = calculatePaymentSchedule(
        Number(loan.amount),
        Number(loan.interestRate),
        loan.termMonths,
        loan.startDate,
        loan.paymentFrequency
      );
      
      // Save payment schedule
      const savedPayments = await Promise.all(
        paymentSchedule.map(payment => 
          storage.createPayment({
            loanId: loan.id,
            paymentNumber: payment.paymentNumber,
            date: payment.date,
            amount: payment.payment,
            principal: payment.principal,
            interest: payment.interest,
            balance: payment.balance,
          })
        )
      );
      
      // Calculate investor returns
      const investorReturns = calculateInvestorReturns(
        createdInvestors,
        paymentSchedule
      );
      
      // Return calculation results
      res.status(200).json({
        loanId: loan.id,
        monthlyPayment: paymentSchedule[0].payment,
        totalInterest: paymentSchedule.reduce((sum, p) => sum + Number(p.interest), 0),
        paymentSchedule: savedPayments,
        investorReturns,
        endDate: paymentSchedule[paymentSchedule.length - 1].date,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: validationError.message 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to calculate investment returns" 
      });
    }
  });

  // Helper function to calculate payment schedule
  function calculatePaymentSchedule(
    principal: number,
    annualInterestRate: number,
    termMonths: number,
    startDate: Date,
    paymentFrequency: string
  ) {
    const schedule = [];
    let balance = principal;
    const monthlyRate = annualInterestRate / 100 / 12;
    
    // Calculate monthly payment using the formula: P = (Pv*r(1+r)^n)/((1+r)^n-1)
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    for (let i = 0; i < termMonths; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      // Calculate interest for this month
      const interest = balance * monthlyRate;
      
      // Calculate principal for this month
      const principalPayment = monthlyPayment - interest;
      
      // Update balance
      balance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        paymentNumber: i + 1,
        date,
        payment: monthlyPayment,
        principal: principalPayment,
        interest,
        balance,
      });
      
      // Handle final payment adjustments
      if (balance <= 0) {
        break;
      }
    }
    
    return schedule;
  }

  // Helper function to calculate investor returns
  function calculateInvestorReturns(
    investors: Array<{ id: number, name: string, investmentAmount: number | string }>,
    paymentSchedule: Array<{
      payment: number,
      principal: number,
      interest: number
    }>
  ) {
    const totalInvestment = investors.reduce(
      (sum, investor) => sum + Number(investor.investmentAmount),
      0
    );
    
    return investors.map(investor => {
      const investmentAmount = Number(investor.investmentAmount);
      const share = investmentAmount / totalInvestment;
      
      // Calculate monthly returns
      const monthlyReturns = paymentSchedule.map(entry => entry.payment * share);
      
      // Calculate total return
      const totalReturn = monthlyReturns.reduce((sum, payment) => sum + payment, 0);
      
      // Calculate total interest
      const totalInterest = totalReturn - investmentAmount;
      
      // Calculate ROI
      const roi = (totalInterest / investmentAmount) * 100;
      
      return {
        investorId: investor.id,
        name: investor.name,
        investmentAmount,
        share,
        monthlyReturns,
        totalReturn,
        totalInterest,
        roi,
      };
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
