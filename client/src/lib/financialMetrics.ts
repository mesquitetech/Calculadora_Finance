import { InvestorReturn, PaymentScheduleEntry } from "./finance";

/**
 * This module provides advanced financial metrics calculations for investment analysis
 * and professional financial reporting for bankers and investment funds.
 */

export interface FinancialProjection {
  period: string;
  cashFlow: number;
  netPresentValue: number;
  cumulativeNPV: number;
  roi: number;
  irr: number;
}

export interface InvestmentMetrics {
  internalRateOfReturn: number;
  netPresentValue: number;
  paybackPeriod: number;
  profitabilityIndex: number;
  breakEvenPoint: number;
  returnOnInvestment: number;
  debtServiceCoverageRatio: number;
  loanToValueRatio: number;
  interestCoverageRatio: number;
  discountedPaybackPeriod: number;
}

export interface QuarterlyPerformance {
  quarter: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  cashFlow: number;
  debtServicing: number;
  projectedGrowth: number;
  capitalReserves: number;
}

export interface RiskAssessment {
  category: string;
  probability: number;
  impact: number;
  riskScore: number;
  mitigationStrategy: string;
}

/**
 * Calculate Internal Rate of Return (IRR) for an investment
 * 
 * @param initialInvestment - The initial investment amount (negative value)
 * @param cashFlows - Array of cash flows for each period
 * @param maxIterations - Maximum number of iterations for convergence
 * @param tolerance - Error tolerance for convergence
 * @returns The internal rate of return as a decimal (multiply by 100 for percentage)
 */
export function calculateIRR(
  initialInvestment: number,
  cashFlows: number[],
  maxIterations: number = 1000,
  tolerance: number = 0.0000001
): number {
  // Combine initial investment with cash flows
  const allCashFlows = [-initialInvestment, ...cashFlows];
  
  // Initial guesses for IRR calculation
  let irr = 0.1; // Start with 10%
  let irrLow = -0.99; // Lower bound
  let irrHigh = 1.0; // Upper bound
  
  // Function to calculate Net Present Value
  const calculateNPV = (rate: number): number => {
    return allCashFlows.reduce((npv, cf, t) => {
      return npv + cf / Math.pow(1 + rate, t);
    }, 0);
  };
  
  // Use the bisection method to find IRR
  let npv = calculateNPV(irr);
  let iteration = 0;
  
  while (Math.abs(npv) > tolerance && iteration < maxIterations) {
    if (npv > 0) {
      irrLow = irr;
    } else {
      irrHigh = irr;
    }
    
    irr = (irrLow + irrHigh) / 2;
    npv = calculateNPV(irr);
    iteration++;
  }
  
  return iteration === maxIterations ? NaN : irr;
}

/**
 * Calculate Net Present Value (NPV) for an investment
 * 
 * @param initialInvestment - The initial investment amount
 * @param cashFlows - Array of cash flows for each period
 * @param discountRate - The discount rate to apply
 * @returns The net present value of the investment
 */
export function calculateNPV(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number
): number {
  const presentValues = cashFlows.map((cf, t) => {
    return cf / Math.pow(1 + discountRate, t + 1);
  });
  
  const sumPresentValues = presentValues.reduce((sum, pv) => sum + pv, 0);
  return sumPresentValues - initialInvestment;
}

/**
 * Calculate Payback Period for an investment
 * 
 * @param initialInvestment - The initial investment amount
 * @param cashFlows - Array of cash flows for each period
 * @returns The payback period in number of periods (or Infinity if never recovered)
 */
export function calculatePaybackPeriod(
  initialInvestment: number,
  cashFlows: number[]
): number {
  let remainingInvestment = initialInvestment;
  let period = 0;
  
  // Handle full period payback
  for (let i = 0; i < cashFlows.length; i++) {
    remainingInvestment -= cashFlows[i];
    if (remainingInvestment <= 0) {
      return i + 1;
    }
  }
  
  // If full payback doesn't occur in the given cash flows, return Infinity
  return Infinity;
}

/**
 * Calculate Profitability Index (PI) for an investment
 * 
 * @param initialInvestment - The initial investment amount
 * @param cashFlows - Array of cash flows for each period
 * @param discountRate - The discount rate to apply
 * @returns The profitability index
 */
export function calculateProfitabilityIndex(
  initialInvestment: number,
  cashFlows: number[],
  discountRate: number
): number {
  const presentValues = cashFlows.map((cf, t) => {
    return cf / Math.pow(1 + discountRate, t + 1);
  });
  
  const sumPresentValues = presentValues.reduce((sum, pv) => sum + pv, 0);
  return sumPresentValues / initialInvestment;
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 * 
 * @param netOperatingIncome - Net operating income
 * @param totalDebtService - Total debt service (principal + interest)
 * @returns The debt service coverage ratio
 */
export function calculateDSCR(
  netOperatingIncome: number,
  totalDebtService: number
): number {
  return netOperatingIncome / totalDebtService;
}

/**
 * Calculate Loan to Value (LTV) Ratio
 * 
 * @param loanAmount - The loan amount
 * @param propertyValue - The property or asset value
 * @returns The loan to value ratio
 */
export function calculateLTV(
  loanAmount: number,
  propertyValue: number
): number {
  return loanAmount / propertyValue;
}

/**
 * Calculate Interest Coverage Ratio
 * 
 * @param earnings - Earnings before interest and taxes (EBIT)
 * @param interestExpense - Total interest expense
 * @returns The interest coverage ratio
 */
export function calculateInterestCoverageRatio(
  earnings: number,
  interestExpense: number
): number {
  return earnings / interestExpense;
}

/**
 * Generate financial projections for the investment
 * 
 * @param initialInvestment - The initial investment amount
 * @param annualCashFlow - Expected annual cash flow
 * @param growthRate - Annual growth rate for cash flow
 * @param discountRate - Discount rate for present value calculations
 * @param years - Number of years to project
 * @returns Array of financial projections by period
 */
export function generateFinancialProjections(
  initialInvestment: number,
  annualCashFlow: number,
  growthRate: number,
  discountRate: number,
  years: number
): FinancialProjection[] {
  const projections: FinancialProjection[] = [];
  let cumulativeNPV = -initialInvestment;
  const cashFlows: number[] = [];
  
  for (let year = 1; year <= years; year++) {
    // Calculate growing cash flow
    const cashFlow = annualCashFlow * Math.pow(1 + growthRate, year - 1);
    cashFlows.push(cashFlow);
    
    // Calculate NPV for this period's cash flow
    const periodNPV = cashFlow / Math.pow(1 + discountRate, year);
    cumulativeNPV += periodNPV;
    
    // Calculate IRR using all cash flows up to this point
    const irr = calculateIRR(initialInvestment, cashFlows.slice(0, year));
    
    // Calculate ROI for this period
    const totalCashFlowToDate = cashFlows.reduce((sum, cf) => sum + cf, 0);
    const roi = (totalCashFlowToDate - initialInvestment) / initialInvestment;
    
    projections.push({
      period: `Year ${year}`,
      cashFlow,
      netPresentValue: periodNPV,
      cumulativeNPV,
      roi,
      irr: isNaN(irr) ? 0 : irr
    });
  }
  
  return projections;
}

/**
 * Generate quarterly business performance metrics
 * 
 * @param loanAmount - The loan amount
 * @param annualRevenue - Base annual revenue
 * @param annualExpenses - Base annual expenses
 * @param growthRate - Quarterly growth rate
 * @param years - Number of years to project
 * @returns Array of quarterly performance metrics
 */
export function generateQuarterlyPerformance(
  loanAmount: number,
  annualRevenue: number,
  annualExpenses: number,
  growthRate: number,
  years: number
): QuarterlyPerformance[] {
  const performance: QuarterlyPerformance[] = [];
  let capitalReserves = loanAmount * 0.1; // Assume 10% of loan as capital reserves
  
  const quarterlyRevenue = annualRevenue / 4;
  const quarterlyExpenses = annualExpenses / 4;
  const quarterlyDebtServicing = loanAmount * 0.03 / 4; // Assume 3% quarterly debt servicing
  
  for (let year = 1; year <= years; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const growthMultiplier = Math.pow(1 + growthRate, (year - 1) * 4 + quarter - 1);
      const quarterLabel = `Y${year}Q${quarter}`;
      
      const revenue = quarterlyRevenue * growthMultiplier;
      const expenses = quarterlyExpenses * (1 + (growthRate * 0.7)); // Expenses grow slower
      const netIncome = revenue - expenses - quarterlyDebtServicing;
      const cashFlow = netIncome * 0.7; // Assume 70% of net income is cash flow
      
      // Add 50% of cash flow to capital reserves
      capitalReserves += cashFlow * 0.5;
      
      performance.push({
        quarter: quarterLabel,
        revenue,
        expenses,
        netIncome,
        cashFlow,
        debtServicing: quarterlyDebtServicing,
        projectedGrowth: growthRate * 100,
        capitalReserves
      });
    }
  }
  
  return performance;
}

/**
 * Generate risk assessment for the investment
 * 
 * @returns Array of risk assessment metrics
 */
export function generateRiskAssessment(): RiskAssessment[] {
  return [
    {
      category: "Market Risk",
      probability: 0.3,
      impact: 0.7,
      riskScore: 0.21,
      mitigationStrategy: "Diversify investment across multiple market segments"
    },
    {
      category: "Interest Rate Risk",
      probability: 0.4,
      impact: 0.6,
      riskScore: 0.24,
      mitigationStrategy: "Implement interest rate hedging strategies"
    },
    {
      category: "Operational Risk",
      probability: 0.25,
      impact: 0.5,
      riskScore: 0.125,
      mitigationStrategy: "Strengthen operational controls and monitoring"
    },
    {
      category: "Credit Risk",
      probability: 0.2,
      impact: 0.8,
      riskScore: 0.16,
      mitigationStrategy: "Enhance credit analysis and monitoring procedures"
    },
    {
      category: "Liquidity Risk",
      probability: 0.15,
      impact: 0.9,
      riskScore: 0.135,
      mitigationStrategy: "Maintain adequate liquidity reserves"
    }
  ];
}

/**
 * Calculate complete investment metrics based on loan parameters
 * 
 * @param loanAmount - The loan amount
 * @param interestRate - Annual interest rate
 * @param termMonths - Loan term in months
 * @param monthlyPayment - Monthly loan payment
 * @param assumedPropertyValue - Assumed property/asset value
 * @param annualRevenue - Expected annual revenue
 * @returns Complete investment metrics
 */
export function calculateInvestmentMetrics(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  monthlyPayment: number,
  assumedPropertyValue: number = loanAmount * 1.25, // Default to 125% of loan amount
  annualRevenue: number = loanAmount * 0.25 // Default to 25% of loan amount
): InvestmentMetrics {
  // Calculate cash flows
  const discountRate = interestRate / 100;
  const cashFlows: number[] = [];
  
  for (let i = 0; i < termMonths; i++) {
    cashFlows.push(monthlyPayment);
  }
  
  // Calculate net operating income (simplified)
  const annualExpenses = annualRevenue * 0.6; // Assume 60% expense ratio
  const netOperatingIncome = annualRevenue - annualExpenses;
  
  // Calculate total interest paid
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - loanAmount;
  
  // Calculate investment metrics
  const irr = calculateIRR(loanAmount, cashFlows) * 12; // Convert to annual rate
  const npv = calculateNPV(loanAmount, cashFlows, discountRate / 12);
  const paybackPeriod = calculatePaybackPeriod(loanAmount, cashFlows);
  const profitabilityIndex = calculateProfitabilityIndex(loanAmount, cashFlows, discountRate / 12);
  const dscr = calculateDSCR(netOperatingIncome, monthlyPayment * 12);
  const ltv = calculateLTV(loanAmount, assumedPropertyValue);
  const interestCoverageRatio = calculateInterestCoverageRatio(netOperatingIncome, totalInterest / termMonths * 12);
  
  // Calculate break-even point (months)
  const breakEvenPoint = loanAmount / (monthlyPayment - (loanAmount * interestRate / 100 / 12));
  
  // Calculate ROI
  const returnOnInvestment = (totalPayments - loanAmount) / loanAmount;
  
  // Calculate discounted payback period
  let discountedPaybackPeriod = 0;
  let cumulativePV = -loanAmount;
  
  for (let i = 0; i < cashFlows.length; i++) {
    const pv = cashFlows[i] / Math.pow(1 + discountRate / 12, i + 1);
    cumulativePV += pv;
    
    if (cumulativePV >= 0 && discountedPaybackPeriod === 0) {
      discountedPaybackPeriod = i + 1;
    }
  }
  
  // Handle case where investment is never recovered
  if (discountedPaybackPeriod === 0) {
    discountedPaybackPeriod = Infinity;
  }
  
  return {
    internalRateOfReturn: irr,
    netPresentValue: npv,
    paybackPeriod,
    profitabilityIndex,
    breakEvenPoint,
    returnOnInvestment,
    debtServiceCoverageRatio: dscr,
    loanToValueRatio: ltv,
    interestCoverageRatio,
    discountedPaybackPeriod
  };
}

/**
 * Format a value as a percentage
 * 
 * @param value - The decimal value to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a value as a ratio
 * 
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted ratio string
 */
export function formatRatio(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format a number as an integer
 * 
 * @param value - The value to format
 * @returns Formatted integer string
 */
export function formatInteger(value: number): string {
  return Math.round(value).toString();
}

/**
 * Format a value as an integer for display
 * 
 * @param value - The value to format
 * @returns The formatted number as a string
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toLocaleString();
}

/**
 * Format a dollar amount with custom precision
 * 
 * @param amount - The amount to format
 * @param precision - Number of decimal places
 * @returns Formatted dollar amount string
 */
export function formatDollarAmount(amount: number, precision: number = 2): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
}