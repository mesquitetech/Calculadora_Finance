/**
 * Motor de Cálculo Central para Arrendamiento Puro
 * Implementa las fórmulas financieras especificadas y corrige la lógica del flujo de caja.
 * @version 2.0 (Corregida)
 */

// ============= INTERFACES Y TIPOS =============

export interface LeasingInputs {
  // Variables básicas del activo
  asset_cost_sans_iva: number;
  lease_term_months: number;

  // Variables del operador (arrendador)
  lessor_profit_margin_pct: number; // Tasa de ganancia ANUAL deseada sobre el costo del activo
  fixed_monthly_fee: number; // Cuota administrativa fija mensual

  // Variables del pago inicial
  admin_commission_pct: number; // Comisión por apertura sobre el costo del activo
  security_deposit_months: number; // Meses de renta base como depósito en garantía
  delivery_costs: number; // Costos de entrega
  other_initial_expenses: number; // NUEVO: Para gestoría, placas, trámites, etc.

  // Variables del préstamo para inversionistas
  loan_amount: number;
  annual_interest_rate: number;

  // Variables del flujo de caja
  monthly_operational_expenses: number; // Seguros, mantenimiento, etc.
  residual_value_rate: number; // % del valor inicial al final del contrato
  discount_rate: number; // Tasa de descuento para el VPN (ej. 4%)
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
 * 1.1 Calcula la ganancia mensual del arrendador a partir de una tasa ANUAL.
 * Fórmula: (costo_activo_sin_iva * margen_ganancia_pct / 100) / 12
 */
export function calculateLessorMonthlyProfit(
  asset_cost_sans_iva: number,
  lessor_profit_margin_pct: number // Tasa ANUAL
): number {
  return (asset_cost_sans_iva * (lessor_profit_margin_pct / 100)) / 12;
}

/**
 * 1.2 Calcula la amortización del activo.
 * Fórmula: costo_activo_sin_iva / plazo_arrendamiento_meses
 */
export function calculateBaseRentAmortization(
  asset_cost_sans_iva: number,
  lease_term_months: number
): number {
  return asset_cost_sans_iva / lease_term_months;
}

/**
 * 1.3 Calcula la renta base con margen.
 * Fórmula: amortizacion_renta_base + ganancia_mensual_arrendador
 */
export function calculateBaseRentWithMargin(
  base_rent_amortization: number,
  lessor_monthly_profit: number
): number {
  return base_rent_amortization + lessor_monthly_profit;
}

/**
 * 1.4 Calcula la renta mensual total sin IVA.
 * Fórmula: renta_base_con_margen + cuota_fija_mensual
 */
export function calculateTotalMonthlyRentSansIva(
  base_rent_with_margin: number,
  fixed_monthly_fee: number
): number {
  return base_rent_with_margin + fixed_monthly_fee;
}

// ============= MÓDULO 2: CÁLCULOS DE PAGO INICIAL =============

/**
 * 2.1 Calcula la comisión por apertura.
 * Fórmula: costo_activo_sin_iva * comision_admin_pct
 */
export function calculateInitialAdminCommission(
  asset_cost_sans_iva: number,
  admin_commission_pct: number
): number {
  return asset_cost_sans_iva * (admin_commission_pct / 100);
}

/**
 * 2.2 Calcula el depósito en garantía.
 * Fórmula: renta_base_con_margen * meses_deposito_garantia
 */
export function calculateInitialSecurityDeposit(
  base_rent_with_margin: number,
  security_deposit_months: number
): number {
  return base_rent_with_margin * security_deposit_months;
}

/**
 * 2.3 Calcula el pago inicial total sin IVA.
 * Fórmula: comision_admin_inicial + deposito_garantia_inicial + costos_entrega
 */
export function calculateInitialPaymentSansIva(
  initial_admin_commission: number,
  initial_security_deposit: number,
  delivery_costs: number
): number {
  return initial_admin_commission + initial_security_deposit + delivery_costs;
}

// ============= MÓDULO 3: CÁLCULOS DE PRÉSTAMO =============

/**
 * Calcula el pago mensual del préstamo usando la fórmula PMT.
 * Fórmula: P × [r(1+r)^n] / [(1+r)^n - 1]
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
 * Genera la tabla de amortización del préstamo.
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

    // Ajuste para el último pago para que el saldo sea exactamente 0
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

// ============= MÓDULO 4: FLUJO DE CAJA Y KPIs (LÓGICA CORREGIDA) =============

/**
 * Genera el flujo de caja completo del proyecto con la lógica corregida.
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

  // --- Cálculos de componentes ---
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

  // ===== MES 0: Inversión Inicial (CORREGIDO) =====
  // INFLOW: Dinero que recibe la operadora para iniciar (préstamo + cobros iniciales al cliente).
  const initial_inflow = loan_amount + initial_admin_commission + initial_security_deposit;
  // OUTFLOW: Dinero que gasta la operadora (compra del activo SIN IVA + gastos iniciales).
  const initial_outflow = asset_cost_sans_iva + delivery_costs + other_initial_expenses;
  const initial_net_flow = initial_inflow - initial_outflow;

  cumulative_cash_flow = initial_net_flow;
  cumulative_npv = initial_net_flow; // El valor presente en el mes 0 es el mismo flujo.

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

  // ===== MESES 1 a N (Flujos operativos) =====
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

  // ===== ÚLTIMO MES: Flujos Finales (CORREGIDO) =====
  // Se añade el valor residual (inflow) y se devuelve el depósito (outflow).
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
 * Calcula la TIR (Tasa Interna de Retorno) usando el método de Newton-Raphson.
 */
export function calculateIRR(cash_flows: number[]): number {
  const max_iterations = 100;
  const precision = 1e-7;
  let rate = 0.1; // Estimación inicial

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
    if (npv_derivative === 0) {
        break; // Evitar división por cero
    }
    rate -= npv / npv_derivative;
  }
  return rate * 100; // Retornar la última estimación si no converge
}

/**
 * Calcula el periodo de recuperación (Payback Period) en meses.
 */
export function calculatePaybackPeriod(cash_flows: CashFlowEntry[]): number {
  // Busca el primer mes donde el flujo acumulado es positivo
  const initialInvestment = -cash_flows[0].net_cash_flow;
  if (initialInvestment <= 0) return 0;

  for (let i = 1; i < cash_flows.length; i++) {
    if (cash_flows[i].cumulative_cash_flow >= 0) {
      // Opcional: cálculo fraccional para más precisión
      const last_negative_flow = cash_flows[i - 1].cumulative_cash_flow;
      const current_month_flow = cash_flows[i].net_cash_flow;
      return (i - 1) + (-last_negative_flow / current_month_flow);
    }
  }
  return Infinity; // Si nunca se recupera la inversión
}

// ============= FUNCIÓN PRINCIPAL =============

/**
 * Función principal que ejecuta todos los cálculos y retorna el objeto de resultados.
 */
export function calculateLeasingFinancials(inputs: LeasingInputs, start_date: Date): LeasingResults {
  // Módulo 1: Cálculos de Renta
  const lessor_monthly_profit = calculateLessorMonthlyProfit(inputs.asset_cost_sans_iva, inputs.lessor_profit_margin_pct);
  const base_rent_amortization = calculateBaseRentAmortization(inputs.asset_cost_sans_iva, inputs.lease_term_months);
  const base_rent_with_margin = calculateBaseRentWithMargin(base_rent_amortization, lessor_monthly_profit);
  const total_monthly_rent_sans_iva = calculateTotalMonthlyRentSansIva(base_rent_with_margin, inputs.fixed_monthly_fee);

  // Módulo 2: Cálculos de Pago Inicial
  const initial_admin_commission = calculateInitialAdminCommission(inputs.asset_cost_sans_iva, inputs.admin_commission_pct);
  const initial_security_deposit = calculateInitialSecurityDeposit(base_rent_with_margin, inputs.security_deposit_months);
  const initial_payment_sans_iva = calculateInitialPaymentSansIva(initial_admin_commission, initial_security_deposit, inputs.delivery_costs);

  // Módulo 3: Cálculos de Préstamo
  const monthly_loan_payment = calculateLoanMonthlyPayment(inputs.loan_amount, inputs.annual_interest_rate, inputs.lease_term_months);
  const loan_amortization_schedule = generateLoanAmortizationSchedule(inputs.loan_amount, inputs.annual_interest_rate, inputs.lease_term_months, start_date);

  // Módulo 4: Flujo de Caja y KPIs
  const cash_flow_schedule = generateProjectCashFlow(inputs, start_date);
  const net_monthly_cash_flow = total_monthly_rent_sans_iva - monthly_loan_payment - inputs.monthly_operational_expenses;
  const residual_value_amount = inputs.asset_cost_sans_iva * (inputs.residual_value_rate / 100);

  // Extraer flujos netos para el cálculo de la TIR
  const cash_flows_for_irr = cash_flow_schedule.map(entry => entry.net_cash_flow);
  const internal_rate_of_return = calculateIRR(cash_flows_for_irr);

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

export function formatMonths(months: number): string {
  if (typeof months !== 'number' || isNaN(months) || !isFinite(months)) {
    return 'N/A';
  }
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} meses`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  } else {
    return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} meses`;
  }
}
