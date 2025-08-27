/**
 * Finance utility functions for the investment calculator
 */

/**
 * Get the number of payment periods per year based on frequency
 */
export function getPaymentPeriodsPerYear(frequency: string): number {
  switch (frequency.toLowerCase()) {
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semi-annual':
      return 2;
    case 'annual':
      return 1;
    default:
      return 12; // Default to monthly
  }
}

/**
 * Calculate the next payment date based on frequency
 */
export function calculateNextPaymentDate(
  startDate: Date,
  paymentNumber: number,
  frequency: string
): Date {
  const nextDate = new Date(startDate);

  switch (frequency.toLowerCase()) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + paymentNumber);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + (paymentNumber * 3));
      break;
    case 'semi-annual':
      nextDate.setMonth(nextDate.getMonth() + (paymentNumber * 6));
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + paymentNumber);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + paymentNumber);
  }

  return nextDate;
}

export function calculatePeriodicPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
  frequency: string = 'monthly'
): number {
  const periodsPerYear = getPaymentPeriodsPerYear(frequency);
  const totalPeriods = Math.ceil(termMonths / (12 / periodsPerYear));

  if (annualRate === 0) {
    return principal / totalPeriods;
  }

  const periodicRate = annualRate / 100 / periodsPerYear;
  const numerator = periodicRate * Math.pow(1 + periodicRate, totalPeriods);
  const denominator = Math.pow(1 + periodicRate, totalPeriods) - 1;

  return principal * (numerator / denominator);
}

// Keep the old function for backward compatibility
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  return calculatePeriodicPayment(principal, annualRate, termMonths, 'monthly');
}

export interface PaymentScheduleEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

// --- INICIO DE LA REFACTORIZACIÓN ---
// Se elimina la interfaz 'PaymentScheduleItem' para usar una única estructura.

// La función ahora devuelve el tipo 'PaymentScheduleEntry[]', que es el que el frontend espera.
export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  frequency: string = 'monthly'
): PaymentScheduleEntry[] {
  const periodsPerYear = getPaymentPeriodsPerYear(frequency);
  const totalPeriods = Math.ceil(termMonths / (12 / periodsPerYear));
  const periodicPayment = calculatePeriodicPayment(principal, annualRate, termMonths, frequency);
  const periodicRate = annualRate / 100 / periodsPerYear;

  let remainingBalance = principal;
  const schedule: PaymentScheduleEntry[] = [];

  for (let period = 1; period <= totalPeriods; period++) {
    const interestPayment = remainingBalance * periodicRate;
    const principalPayment = periodicPayment - interestPayment;
    remainingBalance -= principalPayment;

    // Adjust for final payment
    if (period === totalPeriods && remainingBalance > 0.01) {
      const adjustedPrincipalPayment = principalPayment + remainingBalance;
      remainingBalance = 0;
      const paymentDate = calculateNextPaymentDate(startDate, period - 1, frequency);

      // Las propiedades del objeto ahora coinciden con la interfaz 'PaymentScheduleEntry'.
      schedule.push({
        paymentNumber: period,
        date: paymentDate,
        payment: adjustedPrincipalPayment + interestPayment,
        principal: adjustedPrincipalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    } else {
      const paymentDate = calculateNextPaymentDate(startDate, period - 1, frequency);

      // Las propiedades del objeto ahora coinciden con la interfaz 'PaymentScheduleEntry'.
      schedule.push({
        paymentNumber: period,
        date: paymentDate,
        payment: periodicPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }
  }

  return schedule;
}

export interface InvestorReturn {
  investorId: number | string;
  name: string;
  investmentAmount: number;
  share: number;
  monthlyReturns: number[];
  totalReturn: number;
  totalInterest: number;
  roi: number;
}

// La función ahora espera el tipo de calendario de pagos correcto.
export function calculateInvestorReturns(
  investmentAmount: number,
  totalInvestmentAmount: number,
  paymentSchedule: PaymentScheduleEntry[], // Se usa la interfaz correcta
  investorId: string,
  name: string
): InvestorReturn {
  const share = totalInvestmentAmount > 0 ? investmentAmount / totalInvestmentAmount : 0;

  const monthlyReturns: number[] = [];
  let cumulativeInterest = 0;

  paymentSchedule.forEach((payment) => {
    const periodicInterest = payment.interest * share;
    cumulativeInterest += periodicInterest;
    monthlyReturns.push(periodicInterest);
  });

  const totalInterest = cumulativeInterest;
  const totalReturn = investmentAmount + totalInterest;
  const roi = investmentAmount > 0 ? totalInterest / investmentAmount : 0;

  return {
    investorId,
    name,
    investmentAmount,
    share,
    monthlyReturns,
    totalReturn,
    totalInterest,
    roi
  };
}
// --- FIN DE LA REFACTORIZACIÓN ---

// Funciones de formato (con comprobaciones de seguridad)
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: Date | string): string {
  if (!date) return "Invalid Date";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj);
}

export function formatPercentage(percent: number): string {
  if (typeof percent !== 'number' || isNaN(percent)) {
    return '0.00%';
  }
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(percent / 100);
}

export function groupPaymentsByYear(schedule: PaymentScheduleEntry[]): {
  year: string;
  principal: number;
  interest: number;
}[] {
  const yearlyData: Record<string, { principal: number; interest: number }> = {};
  schedule.forEach(payment => {
    if (payment && payment.date) {
        const dateObj = payment.date instanceof Date ? payment.date : new Date(payment.date);
        if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear().toString();
            if (!yearlyData[year]) {
                yearlyData[year] = { principal: 0, interest: 0 };
            }
            yearlyData[year].principal += payment.principal || 0;
            yearlyData[year].interest += payment.interest || 0;
        }
    }
  });
  return Object.entries(yearlyData).map(([year, data]) => ({
    year,
    principal: data.principal,
    interest: data.interest,
  }));
}

// ===== NUEVO MOTOR DE CÁLCULO =====

/**
 * Implementa la función RATE usando método de Newton-Raphson
 * Encuentra la tasa de interés que justifica un pago mensual específico
 */
export function calculateRate(
  nper: number, // Número de períodos
  pmt: number,  // Pago mensual
  pv: number,   // Valor presente (principal)
  fv: number = 0, // Valor futuro (residual)
  type: number = 0, // 0 = pago al final del período
  guess: number = 0.1 // Estimación inicial
): number {
  let rate = guess;
  const tolerance = 1e-6;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = calculatePresentValue(rate, nper, pmt, fv, type) - pv;
    const dfx = calculatePresentValueDerivative(rate, nper, pmt, fv, type);
    
    if (Math.abs(dfx) < tolerance) break;
    
    const newRate = rate - fx / dfx;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

/**
 * Calcula el valor presente para la función RATE
 */
function calculatePresentValue(rate: number, nper: number, pmt: number, fv: number, type: number): number {
  if (rate === 0) {
    return -(pmt * nper + fv);
  }
  
  const term = Math.pow(1 + rate, nper);
  return -(pmt * (1 + rate * type) * (term - 1) / rate + fv) / term;
}

/**
 * Calcula la derivada del valor presente para la función RATE
 */
function calculatePresentValueDerivative(rate: number, nper: number, pmt: number, fv: number, type: number): number {
  if (rate === 0) {
    return -pmt * nper * (nper - 1) / 2;
  }
  
  const term = Math.pow(1 + rate, nper);
  const termMinus1 = Math.pow(1 + rate, nper - 1);
  
  const numerator = pmt * (1 + rate * type) * (term - 1);
  const denominator = rate;
  
  const d_numerator = pmt * type * (term - 1) + pmt * (1 + rate * type) * nper * termMinus1;
  const d_denominator = 1;
  
  const firstTerm = (d_numerator * denominator - numerator * d_denominator) / (denominator * denominator);
  const secondTerm = -fv * nper * termMinus1;
  
  return -(firstTerm + secondTerm) / term + (numerator / denominator + fv) * nper * termMinus1 / (term * term);
}

/**
 * Genera tabla de amortización para el cliente con valor residual
 */
export function generateClientAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  residualValue: number,
  frequency: string = 'monthly'
): PaymentScheduleEntry[] {
  const periodsPerYear = getPaymentPeriodsPerYear(frequency);
  const totalPeriods = Math.ceil(termMonths / (12 / periodsPerYear));
  const periodicRate = annualRate / 100 / periodsPerYear;
  
  // Calcular el pago mensual usando la fórmula que incluye valor residual
  const periodicPayment = calculatePeriodicPaymentWithResidual(principal, annualRate, termMonths, residualValue, frequency);
  
  let remainingBalance = principal;
  const schedule: PaymentScheduleEntry[] = [];

  for (let period = 1; period <= totalPeriods; period++) {
    const interestPayment = remainingBalance * periodicRate;
    let principalPayment = periodicPayment - interestPayment;
    
    // En el último pago, ajustar para que el saldo final sea exactamente el valor residual
    if (period === totalPeriods) {
      principalPayment = remainingBalance - residualValue;
      remainingBalance = residualValue;
    } else {
      remainingBalance -= principalPayment;
    }

    const paymentDate = calculateNextPaymentDate(startDate, period - 1, frequency);
    
    schedule.push({
      paymentNumber: period,
      date: paymentDate,
      payment: principalPayment + interestPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, remainingBalance)
    });
  }

  return schedule;
}

/**
 * Genera tabla de amortización para los inversionistas (valor residual = 0)
 */
export function generateInvestorAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  frequency: string = 'monthly'
): PaymentScheduleEntry[] {
  // Usar la función existente que ya hace que el saldo final sea 0
  return generatePaymentSchedule(principal, annualRate, termMonths, startDate, frequency);
}

/**
 * Calcula el pago periódico considerando valor residual
 */
function calculatePeriodicPaymentWithResidual(
  principal: number,
  annualRate: number,
  termMonths: number,
  residualValue: number,
  frequency: string = 'monthly'
): number {
  const periodsPerYear = getPaymentPeriodsPerYear(frequency);
  const totalPeriods = Math.ceil(termMonths / (12 / periodsPerYear));
  const periodicRate = annualRate / 100 / periodsPerYear;

  if (periodicRate === 0) {
    return (principal - residualValue) / totalPeriods;
  }

  const term = Math.pow(1 + periodicRate, totalPeriods);
  const presentValueOfResidual = residualValue / term;
  const netPrincipal = principal - presentValueOfResidual;
  
  const numerator = periodicRate * term;
  const denominator = term - 1;
  
  return netPrincipal * (numerator / denominator);
}

/**
 * Interface for operator results - NEW CALCULATION ENGINE
 */
export interface OperatorResults {
  fixedCost: number;
  financialMargin: number;
  clientBaseRent: number;
  clientRate: number;
  clientSchedule: PaymentScheduleEntry[];
  residualValue: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  paybackPeriodMonths: number;
  totalProjectProfit: number;
  expectedResidualValue: number;
  monthlyPaymentToInvestors: number;
}

/**
 * Interfaz para los resultados del nuevo motor de cálculo
 */
export interface NewCalculationResult {
  // Resultados del flujo de inversionistas (sin cambios)
  investorSchedule: PaymentScheduleEntry[];
  investorReturns: InvestorReturn[];
  
  // Nuevos resultados del operador
  fixedCost: number; // Costo fijo (pago mensual a inversionistas)
  financialMargin: number; // Margen de ganancia financiero deseado
  clientBaseRent: number; // Renta básica del cliente
  clientRate: number; // Tasa del cliente encontrada
  clientSchedule: PaymentScheduleEntry[]; // Tabla del cliente
  residualValue: number; // Valor residual
  
  // Métricas del operador para el panel de control
  netPresentValue: number;
  internalRateOfReturn: number;
  paybackPeriodMonths: number;
  totalProjectProfit: number;
  expectedResidualValue: number;
  monthlyPaymentToInvestors: number;
}

/**
 * Motor principal de cálculo que implementa el nuevo flujo
 */
export function calculateNewLeasingFlow(
  assetCost: number,
  downPayment: number,
  investorRate: number, // Tasa de inversionistas
  termMonths: number,
  startDate: Date,
  investors: Array<{id: number | string, name: string, investmentAmount: number}>,
  financialMarginPesos: number, // Margen en pesos
  residualValueRate: number, // % del valor residual
  discountRate: number = 4 // Tasa de descuento para NPV
): NewCalculationResult {
  const financedAmount = assetCost - downPayment;
  const residualValue = assetCost * (residualValueRate / 100);
  
  // Paso 1: Calcular costo fijo (pago mensual a inversionistas)
  const fixedCost = calculateMonthlyPayment(financedAmount, investorRate, termMonths);
  
  // Paso 2: Calcular renta básica del cliente
  const clientBaseRent = fixedCost + financialMarginPesos;
  
  // Paso 3: Encontrar la tasa del cliente que justifica esa renta
  const clientRate = calculateRate(termMonths, -clientBaseRent, financedAmount, -residualValue) * 12 * 100; // Convertir a tasa anual
  
  // Paso 4: Generar las dos tablas de amortización
  const clientSchedule = generateClientAmortizationSchedule(
    financedAmount, 
    clientRate, 
    termMonths, 
    startDate, 
    residualValue
  );
  
  const investorSchedule = generateInvestorAmortizationSchedule(
    financedAmount,
    investorRate,
    termMonths,
    startDate
  );
  
  // Calcular retornos de inversionistas (sin cambios)
  const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const investorReturns = investors.map(investor =>
    calculateInvestorReturns(
      investor.investmentAmount,
      totalInvestment,
      investorSchedule,
      String(investor.id),
      investor.name
    )
  );
  
  // Calcular métricas del operador
  const monthlyNetCashFlow = clientBaseRent - fixedCost; // Esto debe ser igual al margen financiero
  const totalProjectProfit = monthlyNetCashFlow * termMonths + residualValue;
  
  // Calcular NPV
  const cashFlows = Array(termMonths).fill(monthlyNetCashFlow);
  cashFlows[termMonths - 1] += residualValue; // Añadir valor residual al último mes
  const npv = calculateNPV(discountRate / 100 / 12, cashFlows);
  
  // Calcular IRR (usando los mismos cash flows)
  const irr = calculateIRR([-financedAmount, ...cashFlows]) * 12; // Convertir a anual
  
  // Calcular período de payback
  let cumulativeCashFlow = -financedAmount;
  let paybackPeriodMonths = termMonths;
  for (let i = 0; i < termMonths; i++) {
    cumulativeCashFlow += monthlyNetCashFlow;
    if (cumulativeCashFlow >= 0) {
      paybackPeriodMonths = i + 1;
      break;
    }
  }
  
  return {
    investorSchedule,
    investorReturns,
    fixedCost,
    financialMargin: financialMarginPesos,
    clientBaseRent,
    clientRate,
    clientSchedule,
    residualValue,
    netPresentValue: npv,
    internalRateOfReturn: irr * 100, // Convertir a porcentaje
    paybackPeriodMonths,
    totalProjectProfit,
    expectedResidualValue: residualValue,
    monthlyPaymentToInvestors: fixedCost
  };
}

/**
 * Calcula NPV (Valor Presente Neto)
 */
function calculateNPV(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((npv, cashFlow, index) => {
    return npv + cashFlow / Math.pow(1 + rate, index + 1);
  }, 0);
}

/**
 * Calcula IRR (Tasa Interna de Retorno) usando Newton-Raphson
 */
function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  let rate = guess;
  const tolerance = 1e-6;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = cashFlows.reduce((sum, cf, index) => sum + cf / Math.pow(1 + rate, index), 0);
    const dfx = cashFlows.reduce((sum, cf, index) => sum - index * cf / Math.pow(1 + rate, index + 1), 0);
    
    if (Math.abs(dfx) < tolerance) break;
    
    const newRate = rate - fx / dfx;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}
