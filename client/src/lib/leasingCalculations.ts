/**
 * Central Calculation Engine for Pure Leasing
 * Implements the specified financial formulas and corrects the cash flow logic.
 * @version 2.1 (Translated)
 */

// ============= INTERFACES AND TYPES =============

export interface LeasingInputs {
  // Basic asset variables
  asset_cost_sans_iva: number;
  lease_term_months: number;

  // Operator (lessor) variables
  lessor_profit_margin_pct: number; // Desired ANNUAL profit rate on the asset cost
  fixed_monthly_fee: number; // Fixed monthly administrative fee

  // Initial payment variables
  admin_commission_pct: number; // Opening commission on the asset cost
  security_deposit_months: number; // Months of base rent as a security deposit
  delivery_costs: number; // Delivery costs
  other_initial_expenses: number; // NEW: For management, plates, paperwork, etc.

  // Investor loan variables
  loan_amount: number;
  annual_interest_rate: number;

  // Cash flow variables
  monthly_operational_expenses: number; // Insurance, maintenance, etc.
  residual_value_rate: number; // % of initial value at contract end
  discount_rate: number; // Discount rate for NPV (e.g., 4%)
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
  cash_inflow: number;
  cash_outflow: number;
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
 * 1.1 Calculates the lessor's monthly profit from an ANNUAL rate.
 * Formula: (asset_cost_sans_iva * lessor_profit_margin_pct / 100) / 12
 */
export function calculateLessorMonthlyProfit(
  asset_cost_sans_iva: number,
  lessor_profit_margin_pct: number // ANNUAL rate
): number {
  return (asset_cost_sans_iva * (lessor_profit_margin_pct / 100)) / 12;
}

/**
 * 1.2 Calculates the asset amortization.
 * Formula: asset_cost_sans_iva / lease_term_months
 */
export function calculateBaseRentAmortization(
  asset_cost_sans_iva: number,
  lease_term_months: number
): number {
  return asset_cost_sans_iva / lease_term_months;
}

/**
 * 1.3 Calculates the base rent with margin.
 * Formula: base_rent_amortization + lessor_monthly_profit
 */
export function calculateBaseRentWithMargin(
  base_rent_amortization: number,
  lessor_monthly_profit: number
): number {
  return base_rent_amortization + lessor_monthly_profit;
}

/**
 * 1.4 Calculates the total monthly rent without VAT.
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
 * 2.1 Calculates the opening commission.
 * Formula: asset_cost_sans_iva * admin_commission_pct
 */
export function calculateInitialAdminCommission(
  asset_cost_sans_iva: number,
  admin_commission_pct: number
): number {
  return asset_cost_sans_iva * (admin_commission_pct / 100);
}

/**
 * 2.2 Calculates the security deposit.
 * Formula: base_rent_with_margin * security_deposit_months
 */
export function calculateInitialSecurityDeposit(
  base_rent_with_margin: number,
  security_deposit_months: number
): number {
  return base_rent_with_margin * security_deposit_months;
}

/**
 * 2.3 Calculates the total initial payment without VAT.
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
 * Calculates the monthly loan payment using the PMT formula.
 * Formula: P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateLoanMonthlyPayment(
  loan_amount: number,
  annual_interest_rate: number,
  term_months: number
): number {
  if (annual_interest_rate === 0) {
    return term_months > 0 ? loan_amount / term_months : 0;
  }
  if (term_months === 0) return 0;

  const monthly_rate = annual_interest_rate / 100 / 12;
  const numerator = monthly_rate * Math.pow(1 + monthly_rate, term_months);
  const denominator = Math.pow(1 + monthly_rate, term_months) - 1;

  if (denominator === 0) return 0;

  return loan_amount * (numerator / denominator);
}

/**
 * Generates the loan amortization schedule.
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
    let principal_payment = monthly_payment - interest_payment;

    if (month === term_months) {
        principal_payment = remaining_balance;
        remaining_balance = 0;
    } else {
        remaining_balance -= principal_payment;
    }

    const payment_date = new Date(start_date);
    payment_date.setMonth(payment_date.getMonth() + month);

    schedule.push({
      payment_number: month,
      date: payment_date,
      payment_amount: month === term_months ? interest_payment + principal_payment : monthly_payment,
      interest_payment,
      principal_payment,
      remaining_balance: Math.max(0, remaining_balance)
    });
  }
  return schedule;
}

// ============= MODULE 4: CASH FLOW AND KPIs (CORRECTED LOGIC) =============

/**
 * Generates the complete project cash flow with corrected logic.
 */
export function generateProjectCashFlow(inputs: LeasingInputs, start_date: Date): CashFlowEntry[] {
  const {
    asset_cost_sans_iva,
    lease_term_months,
    loan_amount,
    monthly_operational_expenses,
    residual_value_rate,
    discount_rate,
    other_initial_expenses,
    delivery_costs
  } = inputs;

  // --- Component Calculations ---
  const lessor_monthly_profit = calculateLessorMonthlyProfit(asset_cost_sans_iva, inputs.lessor_profit_margin_pct);
  const base_rent_amortization = calculateBaseRentAmortization(asset_cost_sans_iva, lease_term_months);
  const base_rent_with_margin = calculateBaseRentWithMargin(base_rent_amortization, lessor_monthly_profit);
  const total_monthly_rent = calculateTotalMonthlyRentSansIva(base_rent_with_margin, inputs.fixed_monthly_fee);
  const initial_admin_commission = calculateInitialAdminCommission(asset_cost_sans_iva, inputs.admin_commission_pct);
  const initial_security_deposit = calculateInitialSecurityDeposit(base_rent_with_margin, inputs.security_deposit_months);
  const monthly_loan_payment = calculateLoanMonthlyPayment(loan_amount, inputs.annual_interest_rate, lease_term_months);
  const residual_value = asset_cost_sans_iva * (residual_value_rate / 100);
  const monthly_discount_rate = discount_rate > 0 ? discount_rate / 100 / 12 : 0;

  const cash_flow: CashFlowEntry[] = [];
  let cumulative_cash_flow = 0;
  let cumulative_npv = 0;

  // ===== MONTH 0: Initial Investment (CORRECTED) =====
  // INFLOW: Money the operator receives to start (loan + initial customer payments).
  const initial_inflow = loan_amount + initial_admin_commission + initial_security_deposit;
  // OUTFLOW: Money the operator spends (asset purchase WITHOUT VAT + initial expenses).
  const initial_outflow = asset_cost_sans_iva + delivery_costs + other_initial_expenses;
  const initial_net_flow = initial_inflow - initial_outflow;

  cumulative_cash_flow = initial_net_flow;
  cumulative_npv = initial_net_flow; // Present value in month 0 is the flow itself.

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

  // ===== MONTHS 1 to N (Operating Flows) =====
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

  // ===== FINAL MONTH: Final Flows (CORRECTED) =====
  // Add residual value (inflow) and return security deposit (outflow).
  const final_month_entry = cash_flow[lease_term_months];
  if (final_month_entry) {
    const final_inflow_adjustment = residual_value;
    const final_outflow_adjustment = initial_security_deposit;
    const final_net_adjustment = final_inflow_adjustment - final_outflow_adjustment;

    final_month_entry.cash_inflow += final_inflow_adjustment;
    final_month_entry.cash_outflow += final_outflow_adjustment;
    final_month_entry.net_cash_flow += final_net_adjustment;
    final_month_entry.cumulative_cash_flow += final_net_adjustment;

    const final_pv_adjustment = final_net_adjustment / Math.pow(1 + monthly_discount_rate, lease_term_months);
    final_month_entry.present_value += final_pv_adjustment;
    final_month_entry.cumulative_npv += final_pv_adjustment;
  }

  return cash_flow;
}

/**
 * Calculates the IRR (Internal Rate of Return) using the bisection method for better stability.
 */
export function calculateIRR(cash_flows: number[]): number {
  // Check if cash flows are valid
  if (!cash_flows || cash_flows.length < 2) {
    return 0;
  }

  // Check for alternating signs (requirement for IRR)
  const hasPositive = cash_flows.some(cf => cf > 0);
  const hasNegative = cash_flows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) {
    return 0;
  }

  const max_iterations = 1000;
  const precision = 1e-6;
  
  // Use bisection method for more stable convergence
  let rate_low = -0.99; // Lower bound
  let rate_high = 10.0;  // Upper bound (1000% annual)
  
  // Function to calculate NPV at given rate
  const calculateNPV = (rate: number): number => {
    let npv = 0;
    for (let t = 0; t < cash_flows.length; t++) {
      if (t === 0) {
        npv += cash_flows[t]; // Initial investment at t=0
      } else {
        npv += cash_flows[t] / Math.pow(1 + rate, t);
      }
    }
    return npv;
  };

  // Check bounds
  const npv_low = calculateNPV(rate_low);
  const npv_high = calculateNPV(rate_high);
  
  // If NPV doesn't change sign across bounds, no solution
  if (npv_low * npv_high > 0) {
    return 0;
  }

  // Bisection method
  for (let i = 0; i < max_iterations; i++) {
    const rate_mid = (rate_low + rate_high) / 2;
    const npv_mid = calculateNPV(rate_mid);
    
    if (Math.abs(npv_mid) < precision || Math.abs(rate_high - rate_low) < precision) {
      const annual_irr = rate_mid * 100; // Convert to percentage
      // Cap unreasonable values
      if (annual_irr > 500) return 500;
      if (annual_irr < -90) return -90;
      return annual_irr;
    }
    
    if (npv_mid * npv_low < 0) {
      rate_high = rate_mid;
    } else {
      rate_low = rate_mid;
    }
  }
  
  return 0; // Return 0 if no convergence
}

/**
 * Calculates the Payback Period in months.
 */
export function calculatePaybackPeriod(cash_flows: CashFlowEntry[]): number {
  // Find the first month where cumulative cash flow is positive
  const initialInvestment = -cash_flows[0].net_cash_flow;
  if (initialInvestment <= 0) return 0;

  for (let i = 1; i < cash_flows.length; i++) {
    if (cash_flows[i].cumulative_cash_flow >= 0) {
      // Optional: fractional calculation for more precision
      const last_negative_flow = cash_flows[i - 1].cumulative_cash_flow;
      const current_month_flow = cash_flows[i].net_cash_flow;
      return (i - 1) + (-last_negative_flow / current_month_flow);
    }
  }
  return Infinity; // If the investment is never recovered
}

// ============= MAIN FUNCTION =============

/**
 * Main function that executes all calculations and returns the results object.
 */
export function calculateLeasingFinancials(inputs: LeasingInputs, start_date: Date): LeasingResults {
  // Module 1: Rent Calculations
  const lessor_monthly_profit = calculateLessorMonthlyProfit(inputs.asset_cost_sans_iva, inputs.lessor_profit_margin_pct);
  const base_rent_amortization = calculateBaseRentAmortization(inputs.asset_cost_sans_iva, inputs.lease_term_months);
  const base_rent_with_margin = calculateBaseRentWithMargin(base_rent_amortization, lessor_monthly_profit);
  const total_monthly_rent_sans_iva = calculateTotalMonthlyRentSansIva(base_rent_with_margin, inputs.fixed_monthly_fee);

  // Module 2: Initial Payment Calculations
  const initial_admin_commission = calculateInitialAdminCommission(inputs.asset_cost_sans_iva, inputs.admin_commission_pct);
  const initial_security_deposit = calculateInitialSecurityDeposit(base_rent_with_margin, inputs.security_deposit_months);
  const initial_payment_sans_iva = calculateInitialPaymentSansIva(initial_admin_commission, initial_security_deposit, inputs.delivery_costs);

  // Module 3: Loan Calculations
  const monthly_loan_payment = calculateLoanMonthlyPayment(inputs.loan_amount, inputs.annual_interest_rate, inputs.lease_term_months);
  const loan_amortization_schedule = generateLoanAmortizationSchedule(inputs.loan_amount, inputs.annual_interest_rate, inputs.lease_term_months, start_date);

  // Module 4: Cash Flow and KPIs
  const cash_flow_schedule = generateProjectCashFlow(inputs, start_date);
  const net_monthly_cash_flow = total_monthly_rent_sans_iva - monthly_loan_payment - inputs.monthly_operational_expenses;
  const residual_value_amount = inputs.asset_cost_sans_iva * (inputs.residual_value_rate / 100);

  // Extract net flows for IRR calculation
  const cash_flows_for_irr = cash_flow_schedule.map(entry => entry.net_cash_flow);
  
  // Validate cash flows before IRR calculation
  const hasValidCashFlows = cash_flows_for_irr.length > 1 && 
    cash_flows_for_irr.some(cf => cf > 0) && 
    cash_flows_for_irr.some(cf => cf < 0);
    
  const internal_rate_of_return = hasValidCashFlows ? calculateIRR(cash_flows_for_irr) : 0;

  const net_present_value = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_npv;
  const payback_period_months = calculatePaybackPeriod(cash_flow_schedule);
  const total_project_profit = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_cash_flow;

  return {
    lessor_monthly_profit,
    base_rent_amortization,
    base_rent_with_margin,
    total_monthly_rent_sans_iva,
    initial_admin_commission,
    initial_security_deposit,
    initial_payment_sans_iva,
    monthly_loan_payment,
    net_monthly_cash_flow,
    residual_value_amount,
    net_present_value,
    internal_rate_of_return,
    payback_period_months,
    total_project_profit,
    cash_flow_schedule,
    loan_amortization_schedule
  };
}

// ============= UTILITY FUNCTIONS =============

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
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
  if (typeof months !== 'number' || isNaN(months) || !isFinite(months)) {
    return 'N/A';
  }
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} months`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} months`;
  }
}
