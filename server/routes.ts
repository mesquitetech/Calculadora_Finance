import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  insertLoanSchema,
  loans,
} from "@shared/schema";
import {
  generatePaymentSchedule,
  calculateInvestorReturns,
} from "@/lib/finance";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { desc, eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/calculate - Crear un nuevo cálculo
  app.post("/api/calculate", async (req, res) => {
    try {
      const { loanParams, investors: clientInvestors } = req.body;
      const validatedLoan = insertLoanSchema.parse({
        loanName: loanParams.loanName,
        amount: String(loanParams.totalAmount),
        interestRate: String(loanParams.interestRate),
        termMonths: loanParams.termMonths,
        startDate: new Date(loanParams.startDate),
        paymentFrequency: loanParams.paymentFrequency,
      });

      if (!Array.isArray(clientInvestors) || clientInvestors.length < 3) {
        return res.status(400).json({ message: "At least 3 investors are required" });
      }

      const validatedInvestors = clientInvestors.map(investor => ({
        name: investor.name,
        investmentAmount: String(investor.investmentAmount),
      }));

      const totalInvestment = validatedInvestors.reduce((sum, inv) => sum + Number(inv.investmentAmount), 0);
      if (Math.abs(totalInvestment - Number(validatedLoan.amount)) > 0.01) {
        return res.status(400).json({ message: "Total investment must match the loan amount" });
      }

      const loan = await storage.createLoan(validatedLoan);
      const createdInvestors = await Promise.all(
        validatedInvestors.map(investor => storage.createInvestor({ ...investor, loanId: loan.id }))
      );

      const paymentSchedule = generatePaymentSchedule(
        Number(loan.amount), Number(loan.interestRate), loan.termMonths, loan.startDate, loan.paymentFrequency
      );

      await Promise.all(
        paymentSchedule.map(p => storage.createPayment({
          loanId: loan.id, paymentNumber: p.paymentNumber, date: p.date, amount: p.payment.toString(),
          principal: p.principal.toString(), interest: p.interest.toString(), balance: p.balance.toString(),
        }))
      );

      const investorReturns = createdInvestors.map(investor =>
        calculateInvestorReturns(Number(investor.investmentAmount), totalInvestment, paymentSchedule, String(investor.id), investor.name)
      );

      res.status(200).json({
        loanId: loan.id, 
        periodicPayment: paymentSchedule.length > 0 ? paymentSchedule[0].payment : 0,
        totalInterest: paymentSchedule.reduce((sum, p) => sum + p.interest, 0),
        paymentSchedule: paymentSchedule,
        investorReturns, 
        endDate: paymentSchedule[paymentSchedule.length - 1].date,
      });
    } catch (error) {
      console.error("Calculation error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to calculate investment returns" });
    }
  });

  // PUT /api/calculations/:id - Actualizar un cálculo existente
  app.put("/api/calculations/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const { loanParams, investors: updatedInvestors } = req.body;
        const validatedLoan = insertLoanSchema.parse({
            loanName: loanParams.loanName, amount: String(loanParams.amount),
            interestRate: String(loanParams.interestRate), termMonths: loanParams.termMonths,
            startDate: new Date(loanParams.startDate), paymentFrequency: loanParams.paymentFrequency,
        });
        if (!Array.isArray(updatedInvestors) || updatedInvestors.length < 3) {
            return res.status(400).json({ message: "At least 3 investors are required" });
        }
        const totalInvestment = updatedInvestors.reduce((sum, inv) => sum + Number(inv.investmentAmount), 0);
        if (Math.abs(totalInvestment - Number(validatedLoan.amount)) > 0.01) {
            return res.status(400).json({ message: "Updated loan amount must match the sum of investments." });
        }
        await storage.deletePaymentsByLoanId(id);
        await storage.deleteInvestorsByLoanId(id);
        const loan = await storage.updateLoan(id, validatedLoan);
        await Promise.all(
            updatedInvestors.map(investor =>
                storage.createInvestor({ name: investor.name, investmentAmount: String(investor.investmentAmount), loanId: id })
            )
        );
        const newPaymentSchedule = generatePaymentSchedule(
            Number(loan.amount), Number(loan.interestRate), loan.termMonths, loan.startDate, loan.paymentFrequency
        );
        await Promise.all(
            newPaymentSchedule.map(p =>
                storage.createPayment({
                    loanId: id, paymentNumber: p.paymentNumber, date: p.date, amount: p.payment.toString(),
                    principal: p.principal.toString(), interest: p.interest.toString(), balance: p.balance.toString(),
                })
            )
        );
        res.status(200).json({ message: "Calculation updated successfully" });
    } catch (error) {
        console.error("Update error:", error);
        if (error instanceof ZodError) {
            return res.status(400).json({ message: fromZodError(error).message });
        }
        res.status(500).json({ message: "Failed to update calculation" });
    }
  });

  // GET /api/calculations - Obtener todos los cálculos
  app.get("/api/calculations", async (req, res) => {
    try {
      const allLoans = await db.select().from(loans).orderBy(desc(loans.createdAt));
      res.status(200).json(allLoans.map(loan => ({...loan, amount: Number(loan.amount), interestRate: Number(loan.interestRate)})));
    } catch (error) {
      console.error("Error fetching calculations:", error);
      res.status(500).json({ message: "Failed to fetch calculations" });
    }
  });

  // DELETE /api/calculations/:id - Borrar un cálculo
  app.delete("/api/calculations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });
      await storage.deleteLoan(id);
      res.status(200).json({ message: `Calculation with ID ${id} deleted successfully.` });
    } catch (error) {
      console.error("Error deleting calculation:", error);
      res.status(500).json({ message: "Failed to delete calculation" });
    }
  });

  // GET /api/calculations/:id - Obtener los detalles de un cálculo específico
  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID format" });

      const loan = await storage.getLoan(id);
      if (!loan) return res.status(404).json({ message: "Calculation not found" });

      const investors = await storage.getInvestorsByLoanId(id);
      const paymentScheduleFromDb = await storage.getPaymentsByLoanId(id);

      // --- INICIO DE LA CORRECCIÓN ---
      // 1. Mapear los datos de la BD al formato que el frontend espera.
      const paymentSchedule = paymentScheduleFromDb.map(p => ({
        paymentNumber: p.paymentNumber,
        date: p.date,
        payment: Number(p.amount), // Se mapea 'amount' a 'payment'
        principal: Number(p.principal),
        interest: Number(p.interest),
        balance: Number(p.balance)
      }));
      // --- FIN DE LA CORRECCIÓN ---

      const totalInvestment = investors.reduce((sum, inv) => sum + Number(inv.investmentAmount), 0);

      // 2. Calcular los retornos usando el calendario ya formateado.
      const investorReturns = investors.map(investor =>
        calculateInvestorReturns(
            Number(investor.investmentAmount), 
            totalInvestment, 
            paymentSchedule, 
            String(investor.id), 
            investor.name
        )
      );

      res.status(200).json({
        loanId: loan.id,
        loanName: loan.loanName,
        amount: Number(loan.amount),
        interestRate: Number(loan.interestRate),
        termMonths: loan.termMonths,
        startDate: loan.startDate,
        paymentFrequency: loan.paymentFrequency,
        periodicPayment:paymentSchedule.length > 0 ? paymentSchedule[0].payment : 0,
        totalInterest: paymentSchedule.reduce((sum, p) => sum + p.interest, 0),
        paymentSchedule: paymentSchedule, // 3. Se envía el calendario formateado desde la BD.
        investorReturns,
        endDate: paymentSchedule.length > 0 ? paymentSchedule[paymentSchedule.length - 1].date : new Date(),
      });
    } catch (error) {
      console.error("Error fetching calculation details:", error);
      res.status(500).json({ message: "Failed to fetch calculation details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
