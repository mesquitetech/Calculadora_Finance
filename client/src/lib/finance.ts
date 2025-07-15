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
