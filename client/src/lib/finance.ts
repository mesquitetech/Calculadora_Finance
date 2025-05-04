/**
 * Finance utility functions for the investment calculator
 */

// Calculate monthly payment for a loan
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Handle edge cases
  if (monthlyRate === 0) return principal / termMonths;
  if (termMonths === 0) return principal;
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
}

export interface PaymentScheduleEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

// Generate complete payment schedule
export function generatePaymentSchedule(
  principal: number,
  annualInterestRate: number,
  termMonths: number,
  startDate: Date,
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' = 'monthly'
): PaymentScheduleEntry[] {
  const schedule: PaymentScheduleEntry[] = [];
  let balance = principal;
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Handle different payment frequencies
  let paymentInterval: number;
  let numberOfPayments: number;
  
  switch (paymentFrequency) {
    case 'quarterly':
      paymentInterval = 3;
      numberOfPayments = Math.ceil(termMonths / 3);
      break;
    case 'semi-annual':
      paymentInterval = 6;
      numberOfPayments = Math.ceil(termMonths / 6);
      break;
    case 'annual':
      paymentInterval = 12;
      numberOfPayments = Math.ceil(termMonths / 12);
      break;
    default: // monthly
      paymentInterval = 1;
      numberOfPayments = termMonths;
      break;
  }
  
  // Calculate payment amount based on frequency
  const periodicRate = monthlyRate * paymentInterval;
  const payment = calculateMonthlyPayment(principal, annualInterestRate, termMonths) * paymentInterval;
  
  for (let i = 0; i < numberOfPayments; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i * paymentInterval);
    
    // Calculate interest for this period
    const interest = balance * periodicRate;
    
    // Calculate principal for this period
    const principalPayment = payment - interest;
    
    // Update balance
    balance = Math.max(0, balance - principalPayment);
    
    schedule.push({
      paymentNumber: i + 1,
      date,
      payment,
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

// Calculate returns for each investor
export function calculateInvestorReturns(
  investors: Array<{id: number, name: string, investmentAmount: number}>,
  paymentSchedule: PaymentScheduleEntry[]
): InvestorReturn[] {
  const totalInvestment = investors.reduce(
    (sum, investor) => sum + investor.investmentAmount,
    0
  );
  
  return investors.map(investor => {
    const share = investor.investmentAmount / totalInvestment;
    const monthlyReturns = paymentSchedule.map(
      entry => entry.payment * share
    );
    
    const totalPrincipal = investor.investmentAmount;
    const totalPayments = monthlyReturns.reduce((sum, payment) => sum + payment, 0);
    const totalInterest = totalPayments - totalPrincipal;
    const roi = (totalInterest / totalPrincipal) * 100;
    
    return {
      investorId: investor.id,
      name: investor.name,
      investmentAmount: investor.investmentAmount,
      share,
      monthlyReturns,
      totalReturn: totalPayments,
      totalInterest,
      roi,
    };
  });
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
