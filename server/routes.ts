import express from "express";
import { storage } from "./storage";
import { generateLeasingModels, LeasingInputs } from "../client/src/lib/leasingCalculations";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ===== NUEVOS ENDPOINTS PARA LEASING =====

// Crear/calcular nueva cotización de leasing
router.post("/leasing-calculate", async (req, res) => {
  try {
    const { inputs }: { inputs: LeasingInputs } = req.body;
    
    if (!inputs) {
      return res.status(400).json({ error: "Leasing inputs are required" });
    }

    // Generar los modelos de leasing usando el nuevo motor de cálculo
    const models = generateLeasingModels(inputs);
    
    // Preparar datos para guardar en la base de datos
    const quotationData = {
      ...inputs,
      clientMonthlyPayment: models.clientQuotation.monthlyPayment.toString(),
      lessorMonthlyPayment: models.lessorCost.monthlyPayment.toString(),
      grossMonthlyMargin: models.profitability.grossMonthlyMargin.toString(),
      totalProfit: models.profitability.totalProfit.toString(),
      profitMarginPercentage: models.profitability.profitMarginPercentage.toString(),
    };

    // Guardar la cotización en la base de datos
    const savedQuotation = await storage.createLeasingQuotation(quotationData);
    
    res.json({
      success: true,
      quotationId: savedQuotation.id,
      models: models,
      savedData: savedQuotation
    });
  } catch (error) {
    console.error("Error calculating leasing:", error);
    res.status(500).json({ 
      error: "Failed to calculate leasing", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Obtener cotización por ID
router.get("/leasing-quotation/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid quotation ID" });
    }

    const quotation = await storage.getLeasingQuotation(id);
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ 
      error: "Failed to fetch quotation", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Obtener cotización por folio
router.get("/leasing-quotation/folio/:folio", async (req, res) => {
  try {
    const folio = req.params.folio;
    const quotation = await storage.getLeasingQuotationByFolio(folio);
    
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation by folio:", error);
    res.status(500).json({ 
      error: "Failed to fetch quotation", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Obtener todas las cotizaciones
router.get("/leasing-quotations", async (req, res) => {
  try {
    const quotations = await storage.getAllLeasingQuotations();
    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ 
      error: "Failed to fetch quotations", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Actualizar cotización
router.put("/leasing-quotation/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid quotation ID" });
    }

    const { inputs }: { inputs: Partial<LeasingInputs> } = req.body;
    
    // Si se proporcionan nuevos inputs, recalcular
    if (inputs && Object.keys(inputs).length > 0) {
      const existingQuotation = await storage.getLeasingQuotation(id);
      if (!existingQuotation) {
        return res.status(404).json({ error: "Quotation not found" });
      }

      // Combinar datos existentes con los nuevos
      const fullInputs: LeasingInputs = {
        clientName: inputs.clientName || existingQuotation.clientName,
        vehicleInfo: inputs.vehicleInfo || existingQuotation.vehicleInfo,
        promoter: inputs.promoter || existingQuotation.promoter || "",
        phone: inputs.phone || existingQuotation.phone || "",
        folio: inputs.folio || existingQuotation.folio,
        city: inputs.city || existingQuotation.city || "",
        assetValue: inputs.assetValue || parseFloat(existingQuotation.assetValue),
        downPayment: inputs.downPayment || parseFloat(existingQuotation.downPayment),
        termMonths: inputs.termMonths || existingQuotation.termMonths,
        clientAnnualInterestRate: inputs.clientAnnualInterestRate || parseFloat(existingQuotation.clientAnnualInterestRate),
        residualValuePercentage: inputs.residualValuePercentage || parseFloat(existingQuotation.residualValuePercentage),
        investorLoanAmount: inputs.investorLoanAmount || parseFloat(existingQuotation.investorLoanAmount),
        investorAnnualInterestRate: inputs.investorAnnualInterestRate || parseFloat(existingQuotation.investorAnnualInterestRate),
        firstYearInsurance: inputs.firstYearInsurance || parseFloat(existingQuotation.firstYearInsurance || "0"),
        openingCommission: inputs.openingCommission || parseFloat(existingQuotation.openingCommission || "0"),
        adminExpenses: inputs.adminExpenses || parseFloat(existingQuotation.adminExpenses || "0"),
      };

      // Recalcular modelos
      const models = generateLeasingModels(fullInputs);
      
      // Actualizar datos
      const updateData = {
        ...fullInputs,
        clientMonthlyPayment: models.clientQuotation.monthlyPayment.toString(),
        lessorMonthlyPayment: models.lessorCost.monthlyPayment.toString(),
        grossMonthlyMargin: models.profitability.grossMonthlyMargin.toString(),
        totalProfit: models.profitability.totalProfit.toString(),
        profitMarginPercentage: models.profitability.profitMarginPercentage.toString(),
      };

      const updatedQuotation = await storage.updateLeasingQuotation(id, updateData);
      res.json({
        success: true,
        quotation: updatedQuotation,
        models: models
      });
    } else {
      return res.status(400).json({ error: "No data provided for update" });
    }
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({ 
      error: "Failed to update quotation", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Eliminar cotización
router.delete("/leasing-quotation/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid quotation ID" });
    }

    await storage.deleteLeasingQuotation(id);
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ 
      error: "Failed to delete quotation", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// ===== ENDPOINTS DE CONFIGURACIÓN DE USUARIO =====

// Obtener configuración del usuario
router.get("/user-settings/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    console.log(`Fetching user settings for sessionId: ${sessionId}`);
    
    const settings = await storage.getUserSettings(sessionId);
    
    if (!settings) {
      console.log(`No settings found for sessionId: ${sessionId}`);
      return res.status(404).json({ error: "Settings not found" });
    }
    
    // Parsear los datos JSON almacenados
    const parsedSettings = {
      ...settings,
      investors: JSON.parse(settings.investors),
      businessParams: JSON.parse(settings.businessParams),
      renterConfig: settings.renterConfig ? JSON.parse(settings.renterConfig) : null
    };
    
    res.json(parsedSettings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ 
      error: "Failed to fetch user settings", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Crear/actualizar configuración del usuario
router.post("/user-settings", async (req, res) => {
  try {
    const { sessionId, investors, businessParams, renterConfig } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    
    const settingsData = {
      sessionId,
      investors: JSON.stringify(investors || []),
      businessParams: JSON.stringify(businessParams || {}),
      renterConfig: renterConfig ? JSON.stringify(renterConfig) : null
    };
    
    const settings = await storage.createOrUpdateUserSettings(settingsData);
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error saving user settings:", error);
    res.status(500).json({ 
      error: "Failed to save user settings", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;