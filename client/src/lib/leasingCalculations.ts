
/**
 * Central Calculation Engine for Pure Leasing
 * Implements the financial formulas specified in the requirements document
 */

// ============= INTERFACES AND TYPES =============

export interface LeasingInputs {
  // Basic asset variables
  asset_cost_sans_iva: number;
  lease_term_months: number;
  
  // Operator (lessor) variables
  lessor_profit_margin_pct: number; // e.g. 20%
  fixed_monthly_fee: number; // Fixed administrative fee
  
  // Initial payment variables
  admin_commission_pct: number; // e.g. 1.0%
  security_deposit_months: number; // e.g. 1 month
  delivery_costs: number; // Processing costs
  
  // Investor loan variables
  loan_amount: number;
  annual_interest_rate: number;
  
  // Cash flow variables
  monthly_operational_expenses: number; // Insurance, maintenance, etc.
  residual_value_rate: number; // % of initial value at contract end
  discount_rate: number; // Discount rate for NPV (e.g. 4%)
}

export interface LeasingResults {
  // Results for the Lessee (Client)
  lessor_monthly_profit: number;
  base_rent_amortization: number;
  base_rent_with_margin: number;
  total_monthly_rent_sans_iva: number;
  
  // Initial Payment Results
  initial_admin_commission: number;
  initial_security_deposit: number;
  initial_payment_sans_iva: number;
  
  // Results for the Operator
  monthly_loan_payment: number;
  net_monthly_cash_flow: number;
  residual_value_amount: number;
  
  // Operator KPIs
  net_present_value: number;
  internal_rate_of_return: number;
  payback_period_months: number;
  total_project_profit: number;
  
  // Detailed cash flow
  cash_flow_schedule: CashFlowEntry[];
  
  // Loan amortization for investors
  loan_amortization_schedule: LoanPaymentEntry[];
}

export interface CashFlowEntry {
  month: number;
  date: Date;
  cash_inflow: number; // Rents + income
  cash_outflow: number; // Loan payments + expenses
  net_cash_flow: number;
  cumulative_cash_flow: number;
  present_value: number;
  cumulative_npv: number;
}

export interface LoanPaymentEntry {
  payment_number: number;
  date: Date;
  payment_amount: number;
  interest_payment: number;
  principal_payment: number;
  remaining_balance: number;
}

// ============= MODULE 1: MONTHLY RENT CALCULATIONS =============

/**
 * 1.1 Calculates the lessor's monthly profit
 * Formula: (asset_cost_sans_iva * lessor_profit_margin_pct / 12) * (lease_term_months / 12) / lease_term_months
 */
export function calculateLessorMonthlyProfit(
  asset_cost_sans_iva: number,
  lessor_profit_margin_pct: number,
  lease_term_months: number
): number {
  return (asset_cost_sans_iva * (lessor_profit_margin_pct / 100) / 12) * (lease_term_months / 12) / lease_term_months;
}

/**
 * 1.2 Calculates the asset amortization
 * Formula: asset_cost_sans_iva / lease_term_months
 */
export function calculateBaseRentAmortization(
  asset_cost_sans_iva: number,
  lease_term_months: number
): number {
  return asset_cost_sans_iva / lease_term_months;
}

/**
 * 1.3 Calculates the base rent with margin
 * Formula: base_rent_amortization + lessor_monthly_profit
 */
export function calculateBaseRentWithMargin(
  base_rent_amortization: number,
  lessor_monthly_profit: number
): number {
  return base_rent_amortization + lessor_monthly_profit;
}

/**
 * 1.4 Calculates the total monthly rent without VAT
 * Formula: base_rent_with_margin + fixed_monthly_fee
 */
export function calculateTotalMonthlyRentSansIva(
  base_rent_with_margin: number,
  fixed_monthly_fee: number
): number {
  return base_rent_with_margin + fixed_monthly_fee;
}

// ============= MODULE 2: INITIAL PAYMENT CALCULATIONS =============

/**
 * 2.1 Calculates the opening commission
 * Formula: asset_cost_sans_iva * admin_commission_pct
 */
export function calculateInitialAdminCommission(
  asset_cost_sans_iva: number,
  admin_commission_pct: number
): number {
  return asset_cost_sans_iva * (admin_commission_pct / 100);
}

/**
 * 2.2 Calculates the security deposit
 * Formula: base_rent_with_margin * security_deposit_months
 */
export function calculateInitialSecurityDeposit(
  base_rent_with_margin: number,
  security_deposit_months: number
): number {
  return base_rent_with_margin * security_deposit_months;
}

/**
 * 2.3 Calculates the total initial payment without VAT
 * Formula: initial_admin_commission + initial_security_deposit + delivery_costs
 */
export function calculateInitialPaymentSansIva(
  initial_admin_commission: number,
  initial_security_deposit: number,
  delivery_costs: number
): number {
  return initial_admin_commission + initial_security_deposit + delivery_costs;
}

// ============= MODULE 3: LOAN CALCULATIONS =============

/**
 * Calculates the monthly loan payment using the PMT formula
 * Formula: P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateLoanMonthlyPayment(
  loan_amount: number,
  annual_interest_rate: number,
  term_months: number
): number {
  if (annual_interest_rate === 0) {
    return loan_amount / term_months;
  }
  
  const monthly_rate = annual_interest_rate / 100 / 12;
  const numerator = monthly_rate * Math.pow(1 + monthly_rate, term_months);
  const denominator = Math.pow(1 + monthly_rate, term_months) - 1;
  
  return loan_amount * (numerator / denominator);
}

/**
 * Generates the loan amortization schedule
 */
export function generateLoanAmortizationSchedule(
  loan_amount: number,
  annual_interest_rate: number,
  term_months: number,
  start_date: Date
): LoanPaymentEntry[] {
  const monthly_payment = calculateLoanMonthlyPayment(loan_amount, annual_interest_rate, term_months);
  const monthly_rate = annual_interest_rate / 100 / 12;
  let remaining_balance = loan_amount;
  const schedule: LoanPaymentEntry[] = [];
  
  for (let month = 1; month <= term_months; month++) {
    const interest_payment = remaining_balance * monthly_rate;
    const principal_payment = monthly_payment - interest_payment;
    remaining_balance -= principal_payment;
    
    // Adjust the last payment if there are small residuals
    if (month === term_months && remaining_balance > 0.01) {
      const adjusted_principal = principal_payment + remaining_balance;
      remaining_balance = 0;
    }
    
    const payment_date = new Date(start_date);
    payment_date.setMonth(payment_date.getMonth() + month - 1);
    
    schedule.push({
      payment_number: month,
      date: payment_date,
      payment_amount: monthly_payment,
      interest_payment,
      principal_payment: month === term_months ? principal_payment + remaining_balance : principal_payment,
      remaining_balance: Math.max(0, remaining_balance)
    });
  }
  
  return schedule;
}

// ============= MODULE 4: CASH FLOW AND KPIs =============

/**
 * Generates the complete project cash flow
 */
export function generateProjectCashFlow(inputs: LeasingInputs, start_date: Date): CashFlowEntry[] {
  const {
    asset_cost_sans_iva,
    lease_term_months,
    loan_amount,
    monthly_operational_expenses,
    residual_value_rate,
    discount_rate
  } = inputs;
  
  // Calculate components
  const lessor_monthly_profit = calculateLessorMonthlyProfit(
    asset_cost_sans_iva, 
    inputs.lessor_profit_margin_pct, 
    lease_term_months
  );
  
  const base_rent_amortization = calculateBaseRentAmortization(asset_cost_sans_iva, lease_term_months);
  const base_rent_with_margin = calculateBaseRentWithMargin(base_rent_amortization, lessor_monthly_profit);
  const total_monthly_rent = calculateTotalMonthlyRentSansIva(base_rent_with_margin, inputs.fixed_monthly_fee);
  
  const initial_admin_commission = calculateInitialAdminCommission(asset_cost_sans_iva, inputs.admin_commission_pct);
  const initial_security_deposit = calculateInitialSecurityDeposit(base_rent_with_margin, inputs.security_deposit_months);
  
  const monthly_loan_payment = calculateLoanMonthlyPayment(
    loan_amount, 
    inputs.annual_interest_rate, 
    lease_term_months
  );
  
  const residual_value = asset_cost_sans_iva * (residual_value_rate / 100);
  const monthly_discount_rate = discount_rate / 100 / 12;
  
  const cash_flow: CashFlowEntry[] = [];
  let cumulative_cash_flow = 0;
  let cumulative_npv = 0;
  
  // Month 0 - Initial investment
  const initial_inflow = loan_amount + initial_admin_commission + inputs.delivery_costs;
  const initial_outflow = asset_cost_sans_iva * 1.16; // Assuming 16% VAT
  const initial_net_flow = initial_inflow - initial_outflow;
  
  cumulative_cash_flow += initial_net_flow;
  cumulative_npv += initial_net_flow; // Month 0 is not discounted
  
  cash_flow.push({
    month: 0,
    date: start_date,
    cash_inflow: initial_inflow,
    cash_outflow: initial_outflow,
    net_cash_flow: initial_net_flow,
    cumulative_cash_flow,
    present_value: initial_net_flow,
    cumulative_npv
  });
  
  // Months 1 to lease_term_months
  for (let month = 1; month <= lease_term_months; month++) {
    const cash_inflow = total_monthly_rent;
    const cash_outflow = monthly_loan_payment + monthly_operational_expenses;
    const net_cash_flow = cash_inflow - cash_outflow;
    
    cumulative_cash_flow += net_cash_flow;
    
    const present_value = net_cash_flow / Math.pow(1 + monthly_discount_rate, month);
    cumulative_npv += present_value;
    
    const month_date = new Date(start_date);
    month_date.setMonth(month_date.getMonth() + month);
    
    cash_flow.push({
      month,
      date: month_date,
      cash_inflow,
      cash_outflow,
      net_cash_flow,
      cumulative_cash_flow,
      present_value,
      cumulative_npv
    });
  }
  
  // Final month - Residual value and deposit return
  const final_month = lease_term_months;
  const final_inflow = residual_value;
  const final_outflow = initial_security_deposit;
  const final_net_flow = final_inflow - final_outflow;
  
  const final_present_value = final_net_flow / Math.pow(1 + monthly_discount_rate, final_month);
  
  // Update last month with final flows
  if (cash_flow[final_month]) {
    cash_flow[final_month].cash_inflow += final_inflow;
    cash_flow[final_month].cash_outflow += final_outflow;
    cash_flow[final_month].net_cash_flow += final_net_flow;
    cash_flow[final_month].cumulative_cash_flow += final_net_flow;
    cash_flow[final_month].present_value += final_present_value;
    cash_flow[final_month].cumulative_npv += final_present_value;
  }
  
  return cash_flow;
}

/**
 * Calculates the IRR using the Newton-Raphson method
 */
export function calculateIRR(cash_flows: number[]): number {
  let rate = 0.1; // Initial estimate of 10%
  const precision = 0.000001;
  const max_iterations = 100;
  
  for (let i = 0; i < max_iterations; i++) {
    let npv = 0;
    let npv_derivative = 0;
    
    for (let t = 0; t < cash_flows.length; t++) {
      npv += cash_flows[t] / Math.pow(1 + rate, t);
      npv_derivative -= (t * cash_flows[t]) / Math.pow(1 + rate, t + 1);
    }
    
    if (Math.abs(npv) < precision) {
      return rate * 100; // Convert to percentage
    }
    
    const new_rate = rate - npv / npv_derivative;
    
    if (Math.abs(new_rate - rate) < precision) {
      return new_rate * 100;
    }
    
    rate = new_rate;
  }
  
  return rate * 100; // If it doesn't converge, return the last estimate
}

/**
 * Calculates the payback period in months
 */
export function calculatePaybackPeriod(cash_flows: CashFlowEntry[]): number {
  for (let i = 0; i < cash_flows.length; i++) {
    if (cash_flows[i].cumulative_cash_flow >= 0) {
      return i;
    }
  }
  return cash_flows.length; // If it never recovers
}

// ============= MAIN FUNCTION =============

/**
 * Main function that executes all calculations
 */
export function calculateLeasingFinancials(inputs: LeasingInputs, start_date: Date): LeasingResults {
  // Module 1: Rent calculations
  const lessor_monthly_profit = calculateLessorMonthlyProfit(
    inputs.asset_cost_sans_iva,
    inputs.lessor_profit_margin_pct,
    inputs.lease_term_months
  );
  
  const base_rent_amortization = calculateBaseRentAmortization(
    inputs.asset_cost_sans_iva,
    inputs.lease_term_months
  );
  
  const base_rent_with_margin = calculateBaseRentWithMargin(
    base_rent_amortization,
    lessor_monthly_profit
  );
  
  const total_monthly_rent_sans_iva = calculateTotalMonthlyRentSansIva(
    base_rent_with_margin,
    inputs.fixed_monthly_fee
  );
  
  // Module 2: Initial payment calculations
  const initial_admin_commission = calculateInitialAdminCommission(
    inputs.asset_cost_sans_iva,
    inputs.admin_commission_pct
  );
  
  const initial_security_deposit = calculateInitialSecurityDeposit(
    base_rent_with_margin,
    inputs.security_deposit_months
  );
  
  const initial_payment_sans_iva = calculateInitialPaymentSansIva(
    initial_admin_commission,
    initial_security_deposit,
    inputs.delivery_costs
  );
  
  // Module 3: Loan calculations
  const monthly_loan_payment = calculateLoanMonthlyPayment(
    inputs.loan_amount,
    inputs.annual_interest_rate,
    inputs.lease_term_months
  );
  
  const loan_amortization_schedule = generateLoanAmortizationSchedule(
    inputs.loan_amount,
    inputs.annual_interest_rate,
    inputs.lease_term_months,
    start_date
  );
  
  // Module 4: Cash flow and KPIs
  const cash_flow_schedule = generateProjectCashFlow(inputs, start_date);
  
  const net_monthly_cash_flow = total_monthly_rent_sans_iva - monthly_loan_payment - inputs.monthly_operational_expenses;
  const residual_value_amount = inputs.asset_cost_sans_iva * (inputs.residual_value_rate / 100);
  
  // Extract cash flows for IRR calculation
  const cash_flows_for_irr = cash_flow_schedule.map(entry => entry.net_cash_flow);
  const internal_rate_of_return = calculateIRR(cash_flows_for_irr);
  
  const net_present_value = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_npv;
  const payback_period_months = calculatePaybackPeriod(cash_flow_schedule);
  
  const total_project_profit = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_cash_flow;
  
  return {
    // Results for the Lessee
    lessor_monthly_profit,
    base_rent_amortization,
    base_rent_with_margin,
    total_monthly_rent_sans_iva,
    
    // Initial Payment Results
    initial_admin_commission,
    initial_security_deposit,
    initial_payment_sans_iva,
    
    // Results for the Operator
    monthly_loan_payment,
    net_monthly_cash_flow,
    residual_value_amount,
    
    // Operator KPIs
    net_present_value,
    internal_rate_of_return,
    payback_period_months,
    total_project_profit,
    
    // Detailed data
    cash_flow_schedule,
    loan_amortization_schedule
  };
}

// ============= UTILITY FUNCTIONS =============

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} months`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} months`;
  }
}
