import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import {
  insertLoanSchema,
  loans,
  businessParameters,
  payments,
  investors as investorsTable, // Import businessParameters schema
} from "@shared/schema";
import {
  generatePaymentSchedule,
  calculateInvestorReturns,
  calculateMonthlyPayment,
  calculateNewLeasingFlow,
  type InvestorReturn,
  type NewCalculationResult, // Import calculateMonthlyPayment
} from "@/lib/finance";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { desc, eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/calculate - Calculate loan details and save using NEW CALCULATION ENGINE
  app.post("/api/calculate", async (req, res) => {
    try {
      const { loanParams, investors, businessParams } = req.body;

      // Input validation
      if (!loanParams || !investors || !Array.isArray(investors)) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      if (investors.length === 0) {
        return res.status(400).json({ message: "At least one investor is required" });
      }

      const totalInvestment = investors.reduce((sum: number, inv: any) => sum + (Number(inv.investmentAmount) || 0), 0);
      if (Math.abs(totalInvestment - loanParams.totalAmount) > 0.01) {
        return res.status(400).json({ message: "Total investment must match loan amount" });
      }

      // Extract necessary parameters for new calculation engine
      const assetCost = businessParams?.assetCost || loanParams.totalAmount;
      const downPayment = assetCost - loanParams.totalAmount; // Calculate down payment
      const financialMarginPesos = businessParams?.profitMarginPesos || 500; // Default margin
      const residualValueRate = businessParams?.residualValueRate || 25; // Default 25%
      const discountRate = businessParams?.discountRate || 4; // Default 4%

      // Use NEW CALCULATION ENGINE
      const newResults = calculateNewLeasingFlow(
        assetCost,
        downPayment,
        loanParams.interestRate, // This is the investor rate
        loanParams.termMonths,
        new Date(loanParams.startDate),
        investors.map(inv => ({
          id: inv.id || String(Math.random()),
          name: inv.name,
          investmentAmount: Number(inv.investmentAmount)
        })),
        financialMarginPesos,
        residualValueRate,
        discountRate
      );

      // Use investor schedule for backward compatibility (panel de inversionistas se mantiene igual)
      const paymentSchedule = newResults.investorSchedule;
      const monthlyPayment = newResults.monthlyPaymentToInvestors;
      const totalInterest = paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0);
      const endDate = paymentSchedule[paymentSchedule.length - 1]?.date || new Date();

      // Save to database with transaction
      const result = await db.transaction(async (tx) => {
        // Insert loan record with investor data (maintain backward compatibility)
        const [loan] = await tx.insert(loans).values({
          loanName: loanParams.loanName || "Untitled Loan",
          amount: String(loanParams.totalAmount),
          interestRate: String(loanParams.interestRate),
          termMonths: loanParams.termMonths,
          startDate: new Date(loanParams.startDate),
          paymentFrequency: loanParams.paymentFrequency || 'monthly',
          monthlyPayment: String(monthlyPayment),
          totalInterest: String(totalInterest),
          endDate: new Date(endDate),
        }).returning();

        // Insert business parameters with new operator values
        if (businessParams) {
          await tx.insert(businessParameters).values({
            loanId: loan.id,
            assetCost: String(assetCost),
            otherExpenses: String(businessParams.otherExpenses || 0),
            monthlyExpenses: String(businessParams.monthlyExpenses || 0),
            lessorProfitMarginPct: String(businessParams.lessorProfitMarginPct || 15),
            fixedMonthlyFee: String(businessParams.fixedMonthlyFee || 0),
            adminCommissionPct: String(businessParams.adminCommissionPct || 2),
            securityDepositMonths: businessParams.securityDepositMonths || 1,
            deliveryCosts: String(businessParams.deliveryCosts || 0),
            residualValueRate: String(residualValueRate),
            discountRate: String(discountRate),
          });
        }

        // Insert investor payment schedule (for investor panel)
        const scheduleData = paymentSchedule.map((payment, index) => {
          const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
          if (isNaN(paymentDate.getTime())) {
            throw new Error(`Invalid payment date for payment ${index + 1}: ${payment.date}`);
          }
          return {
            loanId: loan.id,
            paymentNumber: index + 1,
            date: paymentDate,
            amount: payment.payment.toString(),
            principal: payment.principal.toString(),
            interest: payment.interest.toString(),
            balance: payment.balance.toString(),
          };
        });
        await tx.insert(payments).values(scheduleData);

        // Insert investor data
        const investorData = investors.map((investor: any) => ({
          loanId: loan.id,
          name: investor.name,
          investmentAmount: investor.investmentAmount.toString(),
        }));
        await tx.insert(investorsTable).values(investorData);

        return loan;
      });

      // Respond with NEW CALCULATION RESULTS
      res.status(201).json({
        loanId: result.id,
        monthlyPayment, // For investor panel (unchanged)
        totalInterest,  // For investor panel (unchanged)
        paymentSchedule: paymentSchedule.map(p => ({ // For investor panel (unchanged)
          ...p,
          date: p.date instanceof Date ? p.date.toISOString() : new Date(p.date).toISOString()
        })),
        investorReturns: newResults.investorReturns, // For investor panel (unchanged)
        endDate: endDate instanceof Date ? endDate.toISOString() : new Date(endDate).toISOString(),
        
        // NEW OPERATOR RESULTS
        operatorResults: {
          fixedCost: newResults.fixedCost,
          financialMargin: newResults.financialMargin,
          clientBaseRent: newResults.clientBaseRent,
          clientRate: newResults.clientRate,
          clientSchedule: newResults.clientSchedule.map(p => ({
            ...p,
            date: p.date instanceof Date ? p.date.toISOString() : new Date(p.date).toISOString()
          })),
          residualValue: newResults.residualValue,
          netPresentValue: newResults.netPresentValue,
          internalRateOfReturn: newResults.internalRateOfReturn,
          paybackPeriodMonths: newResults.paybackPeriodMonths,
          totalProjectProfit: newResults.totalProjectProfit,
          expectedResidualValue: newResults.expectedResidualValue,
          monthlyPaymentToInvestors: newResults.monthlyPaymentToInvestors
        }
      });

    } catch (error) {
      console.error("Calculate endpoint error:", error);
      res.status(500).json({ message: "Internal server error during calculation" });
    }
  });

  // PUT /api/calculations/:id - Actualizar un cálculo existente
  app.put("/api/calculations/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        console.log("Update request body:", JSON.stringify(req.body, null, 2));
        const { loanParams, investors: updatedInvestors, businessParams: updatedBusinessParams } = req.body; // Destructure businessParams
        const validatedLoan = insertLoanSchema.parse({
            loanName: loanParams.loanName, amount: String(loanParams.amount),
            interestRate: String(loanParams.interestRate), termMonths: loanParams.termMonths,
            startDate: new Date(loanParams.startDate), paymentFrequency: loanParams.paymentFrequency,
        });
        if (!Array.isArray(updatedInvestors) || updatedInvestors.length < 1) {
            return res.status(400).json({ message: "At least 1 investor is required" });
        }
        const totalInvestment = updatedInvestors.reduce((sum, inv) => sum + Number(inv.investmentAmount), 0);
        if (Math.abs(totalInvestment - Number(validatedLoan.amount)) > 0.01) {
            return res.status(400).json({ message: "Updated loan amount must match the sum of investments." });
        }
        await storage.deletePaymentsByLoanId(id);
        await storage.deleteInvestorsByLoanId(id);
        await storage.deleteBusinessParametersByLoanId(id); // Delete existing business parameters
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

        // Save updated business parameters if provided
        if (updatedBusinessParams) {
            console.log("Updating business parameters:", updatedBusinessParams);
            await storage.createBusinessParameters({ // Create new business parameters
                loanId: id,
                assetCost: String(updatedBusinessParams.assetCost || 0),
                otherExpenses: String(updatedBusinessParams.otherExpenses || 0),
                monthlyExpenses: String(updatedBusinessParams.monthlyExpenses || 0),
                lessorProfitMarginPct: String(updatedBusinessParams.lessorProfitMarginPct || 15),
                fixedMonthlyFee: String(updatedBusinessParams.fixedMonthlyFee || 0),
                adminCommissionPct: String(updatedBusinessParams.adminCommissionPct || 2),
                securityDepositMonths: updatedBusinessParams.securityDepositMonths || 1,
                deliveryCosts: String(updatedBusinessParams.deliveryCosts || 0),
                residualValueRate: String(updatedBusinessParams.residualValueRate || 20),
                discountRate: String(updatedBusinessParams.discountRate || 6),
            });
        }

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
      const loansWithBusinessParams = await Promise.all(allLoans.map(async (loan) => {
        const businessParamsRecord = await storage.getBusinessParametersByLoanId(loan.id);
        return {
          ...loan,
          amount: Number(loan.amount),
          interestRate: Number(loan.interestRate),
          businessParams: businessParamsRecord ? {
            assetCost: Number(businessParamsRecord.assetCost),
            otherExpenses: Number(businessParamsRecord.otherExpenses),
            monthlyExpenses: Number(businessParamsRecord.monthlyExpenses),
            lessorProfitMarginPct: Number(businessParamsRecord.lessorProfitMarginPct) || 15,
            fixedMonthlyFee: Number(businessParamsRecord.fixedMonthlyFee) || 0,
            adminCommissionPct: Number(businessParamsRecord.adminCommissionPct) || 2,
            securityDepositMonths: Number(businessParamsRecord.securityDepositMonths) || 1,
            deliveryCosts: Number(businessParamsRecord.deliveryCosts) || 0,
            residualValueRate: Number(businessParamsRecord.residualValueRate) || 20,
            discountRate: Number(businessParamsRecord.discountRate) || 6,
          } : undefined,
        };
      }));
      res.status(200).json(loansWithBusinessParams);
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

  // DELETE /api/calculations - Borrar todos los cálculos
  app.delete("/api/calculations", async (req, res) => {
    try {
      await storage.deleteAllLoans();
      res.status(200).json({ message: "All calculations deleted successfully." });
    } catch (error) {
      console.error("Error deleting all calculations:", error);
      res.status(500).json({ message: "Failed to delete all calculations" });
    }
  });

  // GET /api/user-settings/:sessionId - Obtener configuraciones del usuario
  app.get("/api/user-settings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      console.log("Fetching user settings for sessionId:", sessionId);

      const settings = await storage.getUserSettings(sessionId);

      if (!settings) {
        console.log("No settings found for sessionId:", sessionId);
        // Return default empty settings instead of 404
        return res.status(200).json({
          investors: [],
          businessParams: {},
          renterConfig: null
        });
      }

      console.log("Found settings for sessionId:", sessionId);
      res.status(200).json({
        investors: JSON.parse(settings.investors),
        businessParams: JSON.parse(settings.businessParams),
        renterConfig: settings.renterConfig ? JSON.parse(settings.renterConfig) : null
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  // POST /api/user-settings - Guardar o actualizar configuraciones del usuario
  app.post("/api/user-settings", async (req, res) => {
    try {
      const { sessionId, investors, businessParams, renterConfig } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      const settingsData = {
        sessionId,
        investors: JSON.stringify(investors || []),
        businessParams: JSON.stringify(businessParams || {}),
        renterConfig: renterConfig ? JSON.stringify(renterConfig) : null
      };

      const settings = await storage.createOrUpdateUserSettings(settingsData);

      res.status(200).json({
        message: "Settings saved successfully",
        settingsId: settings.id
      });
    } catch (error) {
      console.error("Error saving user settings:", error);
      res.status(500).json({ message: "Failed to save user settings" });
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
      const businessParamsRecord = await storage.getBusinessParametersByLoanId(id); // Fetch business parameters

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
        monthlyPayment: paymentSchedule.length > 0 ? paymentSchedule[0].payment : 0,
        totalInterest: paymentSchedule.reduce((sum, p) => sum + p.interest, 0),
        paymentSchedule: paymentSchedule,
        investorReturns,
        endDate: paymentSchedule.length > 0 ? paymentSchedule[paymentSchedule.length - 1].date : new Date(),
        businessParams: businessParamsRecord ? { // Include all business parameters
          assetCost: Number(businessParamsRecord.assetCost),
          otherExpenses: Number(businessParamsRecord.otherExpenses),
          monthlyExpenses: Number(businessParamsRecord.monthlyExpenses),
          lessorProfitMarginPct: Number(businessParamsRecord.lessorProfitMarginPct) || 15,
          fixedMonthlyFee: Number(businessParamsRecord.fixedMonthlyFee) || 0,
          adminCommissionPct: Number(businessParamsRecord.adminCommissionPct) || 2,
          securityDepositMonths: Number(businessParamsRecord.securityDepositMonths) || 1,
          deliveryCosts: Number(businessParamsRecord.deliveryCosts) || 0,
          residualValueRate: Number(businessParamsRecord.residualValueRate) || 20,
          discountRate: Number(businessParamsRecord.discountRate) || 6,
        } : {
          assetCost: 0,
          otherExpenses: 0,
          monthlyExpenses: 0,
          lessorProfitMarginPct: 15,
          fixedMonthlyFee: 0,
          adminCommissionPct: 2,
          securityDepositMonths: 1,
          deliveryCosts: 0,
          residualValueRate: 20,
          discountRate: 6,
        },
      });
    } catch (error) {
      console.error("Error fetching calculation details:", error);
      res.status(500).json({ message: "Failed to fetch calculation details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}