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

export interface PaymentScheduleItem {
  paymentNumber: number;
  paymentDate: Date;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  frequency: string = 'monthly'
): PaymentScheduleItem[] {
  const periodsPerYear = getPaymentPeriodsPerYear(frequency);
  const totalPeriods = Math.ceil(termMonths / (12 / periodsPerYear));
  const periodicPayment = calculatePeriodicPayment(principal, annualRate, termMonths, frequency);
  const periodicRate = annualRate / 100 / periodsPerYear;

  let remainingBalance = principal;
  const schedule: PaymentScheduleItem[] = [];

  for (let period = 1; period <= totalPeriods; period++) {
    const interestPayment = remainingBalance * periodicRate;
    const principalPayment = periodicPayment - interestPayment;
    remainingBalance -= principalPayment;

    // Adjust for final payment
    if (period === totalPeriods && remainingBalance > 0.01) {
      const adjustedPrincipalPayment = principalPayment + remainingBalance;
      remainingBalance = 0;

      const paymentDate = calculateNextPaymentDate(startDate, period - 1, frequency);

      schedule.push({
        paymentNumber: period,
        paymentDate,
        principalPayment: adjustedPrincipalPayment,
        interestPayment,
        totalPayment: adjustedPrincipalPayment + interestPayment,
        remainingBalance
      });
    } else {
      const paymentDate = calculateNextPaymentDate(startDate, period - 1, frequency);

      schedule.push({
        paymentNumber: period,
        paymentDate,
        principalPayment,
        interestPayment,
        totalPayment: periodicPayment,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
  }

  return schedule;
}

export interface InvestorReturn {
  investorId: number;
  name: string;
  investmentAmount: number;
  share: number;
  monthlyReturns: number[];
  totalReturn: number;
  totalInterest: number;
  roi: number;
}

interface MonthlyReturn {
  month: number;
  date: Date;
  monthlyReturn: number;
  cumulativeReturn: number;
  principalBalance: number;
}

export function calculateInvestorReturns(
  investmentAmount: number,
  totalInvestmentAmount: number,
  paymentSchedule: PaymentScheduleItem[],
  investorId: string,
  name: string,
  frequency: string = 'monthly'
): InvestorReturn {
  const investmentPercentage = investmentAmount / totalInvestmentAmount;
  const monthlyReturns: MonthlyReturn[] = [];
  let cumulativeReturn = 0;

  paymentSchedule.forEach((payment) => {
    const periodicReturn = payment.interestPayment * investmentPercentage;
    cumulativeReturn += periodicReturn;

    monthlyReturns.push({
      month: payment.paymentNumber,
      date: payment.paymentDate,
      monthlyReturn: periodicReturn, // Keep field name for compatibility
      cumulativeReturn,
      principalBalance: payment.remainingBalance * investmentPercentage
    });
  });

  const totalReturn = cumulativeReturn;
  const roi = totalReturn / investmentAmount;

  return {
    investorId,
    name,
    investmentAmount,
    investmentPercentage,
    monthlyReturns,
    totalReturn,
    roi
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date in readable format
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format percentage
export function formatPercentage(percent: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percent / 100);
}

// Group payment schedule by year for charts
export function groupPaymentsByYear(schedule: PaymentScheduleEntry[]): {
  year: string;
  principal: number;
  interest: number;
}[] {
  const yearlyData: Record<string, { principal: number; interest: number }> = {};

  schedule.forEach(payment => {
    const year = payment.date.getFullYear().toString();

    if (!yearlyData[year]) {
      yearlyData[year] = { principal: 0, interest: 0 };
    }

    yearlyData[year].principal += payment.principal;
    yearlyData[year].interest += payment.interest;
  });

  return Object.entries(yearlyData).map(([year, data]) => ({
    year,
    principal: data.principal,
    interest: data.interest,
  }));
}