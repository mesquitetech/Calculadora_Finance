/**
 * Motor de Cálculos de Leasing - Versión Excel-Equivalente
 * Implementa funciones financieras precisas para replicar la lógica del PDF de ejemplo
 * Basado en las especificaciones de refactoring para ABCLEASING
 */

// ============= INTERFACES Y TIPOS =============

export interface LeasingInputs {
  // Variables básicas del activo
  assetValue: number;           // Valor de la unidad sin IVA
  downPayment: number;          // Anticipo inicial
  termMonths: number;           // Plazo en meses
  clientAnnualInterestRate: number;  // Tasa anual del cliente
  residualValuePercentage: number;   // % valor residual
  
  // Variables del préstamo del inversionista
  investorLoanAmount: number;        // Monto del préstamo del inversionista
  investorAnnualInterestRate: number; // Tasa anual del inversionista
  
  // Información adicional para el PDF
  clientName: string;
  vehicleInfo: string;
  promoter: string;
  phone: string;
  folio: string;
  city: string;
  
  // Campos del pago inicial (para el PDF)
  firstYearInsurance: number;   // Seguro primer año
  openingCommission: number;    // Comisión por apertura
  adminExpenses: number;        // Gastos de administración mensual
}

export interface AmortizationEntry {
  period: number;
  date: Date;
  payment: number;
  interest: number;
  principal: number;
  outstandingBalance: number;
}

export interface LeasingModels {
  // Modelo de Cotización al Cliente
  clientQuotation: {
    monthlyPayment: number;
    amortizationSchedule: AmortizationEntry[];
    finalBalance: number;
  };
  
  // Modelo de Costo del Arrendador
  lessorCost: {
    monthlyPayment: number;
    amortizationSchedule: AmortizationEntry[];
    finalBalance: number;
  };
  
  // Rentabilidad del Arrendador
  profitability: {
    grossMonthlyMargin: number;
    totalProfit: number;
    profitMarginPercentage: number;
  };
  
  // Datos para el PDF
  pdfData: {
    inputs: LeasingInputs;
    financedAmount: number;
    initialPaymentSubtotal: number;
    initialPaymentTax: number;
    initialPaymentTotal: number;
    monthlyRentBasic: number;
    monthlyRentAdmin: number;
    monthlyRentTotal: number;
    residualValue: number;
  };
}

// ============= FUNCIONES FINANCIERAS EQUIVALENTES A EXCEL =============

/**
 * PMT(rate, nper, pv, [fv], [type])
 * Calcula el pago mensual fijo para un préstamo
 * @param rate - Tasa de interés por período
 * @param nper - Número total de períodos
 * @param pv - Valor presente (monto del préstamo)
 * @param fv - Valor futuro (opcional, por defecto 0)
 * @param type - Tipo de pago (0 = al final del período, 1 = al inicio)
 */
export function PMT(rate: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
  if (rate === 0) {
    return -(pv + fv) / nper;
  }
  
  const pvif = Math.pow(1 + rate, nper);
  let pmt = -(pv * pvif + fv) / ((pvif - 1) / rate);
  
  if (type === 1) {
    pmt = pmt / (1 + rate);
  }
  
  return pmt;
}

/**
 * IPMT(rate, per, nper, pv, [fv], [type])
 * Calcula la porción de interés de un pago para un período específico
 * @param rate - Tasa de interés por período
 * @param per - Período específico (1 a nper)
 * @param nper - Número total de períodos
 * @param pv - Valor presente
 * @param fv - Valor futuro (opcional)
 * @param type - Tipo de pago
 */
export function IPMT(rate: number, per: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
  if (per < 1 || per > nper) {
    return 0;
  }
  
  const pmt = PMT(rate, nper, pv, fv, type);
  let balance = pv;
  
  if (type === 1) {
    balance += pmt;
  }
  
  for (let i = 1; i < per; i++) {
    const interestPayment = balance * rate;
    const principalPayment = pmt - interestPayment;
    balance += principalPayment;
  }
  
  return balance * rate;
}

/**
 * PPMT(rate, per, nper, pv, [fv], [type])
 * Calcula la porción de capital de un pago para un período específico
 * @param rate - Tasa de interés por período
 * @param per - Período específico
 * @param nper - Número total de períodos
 * @param pv - Valor presente
 * @param fv - Valor futuro (opcional)
 * @param type - Tipo de pago
 */
export function PPMT(rate: number, per: number, nper: number, pv: number, fv: number = 0, type: number = 0): number {
  const pmt = PMT(rate, nper, pv, fv, type);
  const ipmt = IPMT(rate, per, nper, pv, fv, type);
  return pmt - ipmt;
}

// ============= FUNCIÓN PRINCIPAL DE ORQUESTACIÓN =============

/**
 * Función principal que genera los modelos de leasing completos
 * @param inputs - Parámetros de entrada del leasing
 * @returns Modelos completos de cotización y análisis
 */
export function generateLeasingModels(inputs: LeasingInputs): LeasingModels {
  const monthlyClientRate = inputs.clientAnnualInterestRate / 100 / 12;
  const monthlyInvestorRate = inputs.investorAnnualInterestRate / 100 / 12;
  
  // ===== MODELO DE COTIZACIÓN AL CLIENTE =====
  const clientQuotation = generateClientQuotationModel(inputs, monthlyClientRate);
  
  // ===== MODELO DE COSTO DEL ARRENDADOR =====
  const lessorCost = generateLessorCostModel(inputs, monthlyInvestorRate);
  
  // ===== CÁLCULO DE RENTABILIDAD =====
  const grossMonthlyMargin = clientQuotation.monthlyPayment - lessorCost.monthlyPayment;
  const totalProfit = grossMonthlyMargin * inputs.termMonths;
  const profitMarginPercentage = (grossMonthlyMargin / clientQuotation.monthlyPayment) * 100;
  
  // ===== DATOS PARA EL PDF =====
  const pdfData = generatePDFData(inputs, clientQuotation);
  
  return {
    clientQuotation,
    lessorCost,
    profitability: {
      grossMonthlyMargin,
      totalProfit,
      profitMarginPercentage
    },
    pdfData
  };
}

/**
 * Genera el modelo de cotización al cliente
 */
function generateClientQuotationModel(inputs: LeasingInputs, monthlyRate: number): LeasingModels['clientQuotation'] {
  const presentValue = inputs.assetValue - inputs.downPayment;
  const futureValue = -(inputs.assetValue * (inputs.residualValuePercentage / 100)); // Negativo: es un pago final
  
  const monthlyPayment = PMT(monthlyRate, inputs.termMonths, presentValue, futureValue);
  const amortizationSchedule: AmortizationEntry[] = [];
  
  let outstandingBalance = presentValue;
  const startDate = new Date();
  
  for (let period = 1; period <= inputs.termMonths; period++) {
    const interest = IPMT(monthlyRate, period, inputs.termMonths, presentValue, futureValue);
    const principal = PPMT(monthlyRate, period, inputs.termMonths, presentValue, futureValue);
    outstandingBalance -= principal;
    
    const entryDate = new Date(startDate);
    entryDate.setMonth(entryDate.getMonth() + period);
    
    amortizationSchedule.push({
      period,
      date: entryDate,
      payment: monthlyPayment,
      interest,
      principal,
      outstandingBalance: Math.max(0, outstandingBalance)
    });
  }
  
  const finalBalance = Math.abs(futureValue); // El valor residual final
  
  return {
    monthlyPayment: Math.abs(monthlyPayment),
    amortizationSchedule,
    finalBalance
  };
}

/**
 * Genera el modelo de costo del arrendador
 */
function generateLessorCostModel(inputs: LeasingInputs, monthlyRate: number): LeasingModels['lessorCost'] {
  const presentValue = inputs.investorLoanAmount;
  const futureValue = 0; // El préstamo del inversionista se paga completamente
  
  const monthlyPayment = PMT(monthlyRate, inputs.termMonths, presentValue, futureValue);
  const amortizationSchedule: AmortizationEntry[] = [];
  
  let outstandingBalance = presentValue;
  const startDate = new Date();
  
  for (let period = 1; period <= inputs.termMonths; period++) {
    const interest = IPMT(monthlyRate, period, inputs.termMonths, presentValue, futureValue);
    const principal = PPMT(monthlyRate, period, inputs.termMonths, presentValue, futureValue);
    outstandingBalance -= principal;
    
    const entryDate = new Date(startDate);
    entryDate.setMonth(entryDate.getMonth() + period);
    
    amortizationSchedule.push({
      period,
      date: entryDate,
      payment: monthlyPayment,
      interest,
      principal,
      outstandingBalance: Math.max(0, outstandingBalance)
    });
  }
  
  return {
    monthlyPayment: Math.abs(monthlyPayment),
    amortizationSchedule,
    finalBalance: 0
  };
}

/**
 * Genera los datos específicos para el PDF
 */
function generatePDFData(inputs: LeasingInputs, clientQuotation: LeasingModels['clientQuotation']): LeasingModels['pdfData'] {
  const financedAmount = inputs.assetValue - inputs.downPayment;
  
  // Calcular pago inicial (basado en el PDF de ejemplo)
  const initialPaymentSubtotal = inputs.downPayment + inputs.firstYearInsurance + inputs.openingCommission;
  const initialPaymentTax = initialPaymentSubtotal * 0.16; // IVA 16%
  const initialPaymentTotal = initialPaymentSubtotal + initialPaymentTax;
  
  // Calcular renta mensual (sin IVA)
  const monthlyRentBasic = clientQuotation.monthlyPayment;
  const monthlyRentAdmin = inputs.adminExpenses;
  const monthlyRentTotal = monthlyRentBasic + monthlyRentAdmin;
  
  // Valor residual
  const residualValue = inputs.assetValue * (inputs.residualValuePercentage / 100);
  
  return {
    inputs,
    financedAmount,
    initialPaymentSubtotal,
    initialPaymentTax,
    initialPaymentTotal,
    monthlyRentBasic,
    monthlyRentAdmin,
    monthlyRentTotal,
    residualValue
  };
}

// ============= FUNCIONES DE UTILIDAD =============

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(rate: number): string {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return '0.00%';
  }
  return `${rate.toFixed(2)}%`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}