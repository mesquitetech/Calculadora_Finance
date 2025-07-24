/**
 * Motor de Cálculo Central para Arrendamiento Puro
 * Implementa las fórmulas financieras especificadas en el documento de requerimientos
 */

// ============= INTERFACES Y TIPOS =============

export interface LeasingInputs {
  // Variables básicas del activo
  asset_cost_sans_iva: number;
  lease_term_months: number;
  
  // Variables del operador (arrendador)
  lessor_profit_margin_pct: number; // Ej. 20%
  fixed_monthly_fee: number; // Cuota administrativa fija
  
  // Variables del pago inicial
  admin_commission_pct: number; // Ej. 1.0%
  security_deposit_months: number; // Ej. 1 mes
  delivery_costs: number; // Costos de trámites
  
  // Variables del préstamo a inversionistas
  loan_amount: number;
  annual_interest_rate: number;
  
  // Variables del flujo de caja
  monthly_operational_expenses: number; // Seguros, mantenimiento, etc.
  residual_value_rate: number; // % del valor inicial al final del contrato
  discount_rate: number; // Tasa de descuento para NPV (ej. 4%)
}

export interface LeasingResults {
  // Resultados para el Arrendatario (Cliente)
  lessor_monthly_profit: number;
  base_rent_amortization: number;
  base_rent_with_margin: number;
  total_monthly_rent_sans_iva: number;
  
  // Resultados del Pago Inicial
  initial_admin_commission: number;
  initial_security_deposit: number;
  initial_payment_sans_iva: number;
  
  // Resultados para el Operador
  monthly_loan_payment: number;
  net_monthly_cash_flow: number;
  residual_value_amount: number;
  
  // KPIs del Operador
  net_present_value: number;
  internal_rate_of_return: number;
  payback_period_months: number;
  total_project_profit: number;
  
  // Flujo de caja detallado
  cash_flow_schedule: CashFlowEntry[];
  
  // Amortización del préstamo para inversionistas
  loan_amortization_schedule: LoanPaymentEntry[];
}

export interface CashFlowEntry {
  month: number;
  date: Date;
  cash_inflow: number; // Rentas + ingresos
  cash_outflow: number; // Pagos de préstamo + gastos
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

// ============= MÓDULO 1: CÁLCULOS DE RENTA MENSUAL =============

/**
 * 1.1 Calcula la ganancia mensual del arrendador
 * Fórmula: (asset_cost_sans_iva * lessor_profit_margin_pct / 12) * (lease_term_months / 12) / lease_term_months
 */
export function calculateLessorMonthlyProfit(
  asset_cost_sans_iva: number,
  lessor_profit_margin_pct: number,
  lease_term_months: number
): number {
  return (asset_cost_sans_iva * (lessor_profit_margin_pct / 100) / 12) * (lease_term_months / 12) / lease_term_months;
}

/**
 * 1.2 Calcula la amortización del activo
 * Fórmula: asset_cost_sans_iva / lease_term_months
 */
export function calculateBaseRentAmortization(
  asset_cost_sans_iva: number,
  lease_term_months: number
): number {
  return asset_cost_sans_iva / lease_term_months;
}

/**
 * 1.3 Calcula la renta base con margen
 * Fórmula: base_rent_amortization + lessor_monthly_profit
 */
export function calculateBaseRentWithMargin(
  base_rent_amortization: number,
  lessor_monthly_profit: number
): number {
  return base_rent_amortization + lessor_monthly_profit;
}

/**
 * 1.4 Calcula la renta mensual total sin IVA
 * Fórmula: base_rent_with_margin + fixed_monthly_fee
 */
export function calculateTotalMonthlyRentSansIva(
  base_rent_with_margin: number,
  fixed_monthly_fee: number
): number {
  return base_rent_with_margin + fixed_monthly_fee;
}

// ============= MÓDULO 2: CÁLCULOS DE PAGO INICIAL =============

/**
 * 2.1 Calcula la comisión por apertura
 * Fórmula: asset_cost_sans_iva * admin_commission_pct
 */
export function calculateInitialAdminCommission(
  asset_cost_sans_iva: number,
  admin_commission_pct: number
): number {
  return asset_cost_sans_iva * (admin_commission_pct / 100);
}

/**
 * 2.2 Calcula el depósito en garantía
 * Fórmula: base_rent_with_margin * security_deposit_months
 */
export function calculateInitialSecurityDeposit(
  base_rent_with_margin: number,
  security_deposit_months: number
): number {
  return base_rent_with_margin * security_deposit_months;
}

/**
 * 2.3 Calcula el pago inicial total sin IVA
 * Fórmula: initial_admin_commission + initial_security_deposit + delivery_costs
 */
export function calculateInitialPaymentSansIva(
  initial_admin_commission: number,
  initial_security_deposit: number,
  delivery_costs: number
): number {
  return initial_admin_commission + initial_security_deposit + delivery_costs;
}

// ============= MÓDULO 3: CÁLCULOS DEL PRÉSTAMO =============

/**
 * Calcula el pago mensual del préstamo usando la fórmula PMT
 * Fórmula: P × [r(1+r)^n] / [(1+r)^n - 1]
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
 * Genera la tabla de amortización del préstamo
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
    
    // Ajustar el último pago si hay pequeños residuos
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

// ============= MÓDULO 4: FLUJO DE CAJA Y KPIs =============

/**
 * Genera el flujo de caja completo del proyecto
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
  
  // Calcular componentes
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
  
  // Mes 0 - Inversión inicial
  const initial_inflow = loan_amount + initial_admin_commission + inputs.delivery_costs;
  const initial_outflow = asset_cost_sans_iva * 1.16; // Asumiendo 16% IVA
  const initial_net_flow = initial_inflow - initial_outflow;
  
  cumulative_cash_flow += initial_net_flow;
  cumulative_npv += initial_net_flow; // Mes 0 no se descuenta
  
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
  
  // Meses 1 a lease_term_months
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
  
  // Mes final - Valor residual y devolución de depósito
  const final_month = lease_term_months;
  const final_inflow = residual_value;
  const final_outflow = initial_security_deposit;
  const final_net_flow = final_inflow - final_outflow;
  
  const final_present_value = final_net_flow / Math.pow(1 + monthly_discount_rate, final_month);
  
  // Actualizar último mes con flujos finales
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
 * Calcula la TIR (IRR) usando el método de Newton-Raphson
 */
export function calculateIRR(cash_flows: number[]): number {
  let rate = 0.1; // Estimación inicial del 10%
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
      return rate * 100; // Convertir a porcentaje
    }
    
    const new_rate = rate - npv / npv_derivative;
    
    if (Math.abs(new_rate - rate) < precision) {
      return new_rate * 100;
    }
    
    rate = new_rate;
  }
  
  return rate * 100; // Si no converge, devolver la última estimación
}

/**
 * Calcula el período de recuperación en meses
 */
export function calculatePaybackPeriod(cash_flows: CashFlowEntry[]): number {
  for (let i = 0; i < cash_flows.length; i++) {
    if (cash_flows[i].cumulative_cash_flow >= 0) {
      return i;
    }
  }
  return cash_flows.length; // Si nunca se recupera
}

// ============= FUNCIÓN PRINCIPAL =============

/**
 * Función principal que ejecuta todos los cálculos
 */
export function calculateLeasingFinancials(inputs: LeasingInputs, start_date: Date): LeasingResults {
  // Módulo 1: Cálculos de renta
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
  
  // Módulo 2: Cálculos de pago inicial
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
  
  // Módulo 3: Cálculos del préstamo
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
  
  // Módulo 4: Flujo de caja y KPIs
  const cash_flow_schedule = generateProjectCashFlow(inputs, start_date);
  
  const net_monthly_cash_flow = total_monthly_rent_sans_iva - monthly_loan_payment - inputs.monthly_operational_expenses;
  const residual_value_amount = inputs.asset_cost_sans_iva * (inputs.residual_value_rate / 100);
  
  // Extraer flujos de caja para cálculo de TIR
  const cash_flows_for_irr = cash_flow_schedule.map(entry => entry.net_cash_flow);
  const internal_rate_of_return = calculateIRR(cash_flows_for_irr);
  
  const net_present_value = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_npv;
  const payback_period_months = calculatePaybackPeriod(cash_flow_schedule);
  
  const total_project_profit = cash_flow_schedule[cash_flow_schedule.length - 1].cumulative_cash_flow;
  
  return {
    // Resultados para el Arrendatario
    lessor_monthly_profit,
    base_rent_amortization,
    base_rent_with_margin,
    total_monthly_rent_sans_iva,
    
    // Resultados del Pago Inicial
    initial_admin_commission,
    initial_security_deposit,
    initial_payment_sans_iva,
    
    // Resultados para el Operador
    monthly_loan_payment,
    net_monthly_cash_flow,
    residual_value_amount,
    
    // KPIs del Operador
    net_present_value,
    internal_rate_of_return,
    payback_period_months,
    total_project_profit,
    
    // Datos detallados
    cash_flow_schedule,
    loan_amortization_schedule
  };
}

// ============= FUNCIONES DE UTILIDAD =============

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) {
    return `${months} meses`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  } else {
    return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} meses`;
  }
}