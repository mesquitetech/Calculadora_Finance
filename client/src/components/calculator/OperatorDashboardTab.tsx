import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  BarChart3, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Download,
  Calculator,
  FileText,
  PieChart,
  Users,
  Car,
  Shield,
  Percent
} from "lucide-react";
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";
import { 
  calculateLeasingFinancials, 
  LeasingInputs, 
  formatCurrency,
  formatPercentage,
  formatMonths 
} from "@/lib/leasingCalculations";

interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number;
  fixedMonthlyFee: number;
  adminCommissionPct: number;
  deliveryCosts: number;
  residualValueRate: number;
  discountRate: number;
  downPayment: number;
}

interface LoanParameters {
  loanName: string;
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: string;
}

interface PaymentScheduleEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface OperatorDashboardTabProps {
  businessParams: BusinessParameters;
  loanParams: LoanParameters;
  monthlyPayment: number;
  paymentSchedule: PaymentScheduleEntry[];
  onExportReport: () => void;
}

export function OperatorDashboardTab({
  businessParams,
  loanParams,
  monthlyPayment,
  paymentSchedule,
  onExportReport
}: OperatorDashboardTabProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // === NUEVOS CÁLCULOS EXTENDIDOS ===
  const IVA_RATE = 0.16;
  
  // Cálculos básicos del activo
  // businessParams.assetCost YA INCLUYE IVA
  const asset_cost_with_iva = businessParams.assetCost;
  const asset_cost_sans_iva = asset_cost_with_iva / (1 + IVA_RATE);
  
  // Cálculos de anticipo y financiamiento
  const anticipo_percentage = (businessParams.downPayment / businessParams.assetCost) * 100;
  const anticipo_sin_iva = businessParams.downPayment;
  const anticipo_con_iva = anticipo_sin_iva * (1 + IVA_RATE);
  const monto_financiado = loanParams.totalAmount;
  
  // Cálculos de renta y comisiones
  const annual_profit_target = asset_cost_sans_iva * (businessParams.lessorProfitMarginPct / 100);
  const lessor_monthly_profit = annual_profit_target / 12;
  const initial_admin_commission = asset_cost_sans_iva * (businessParams.adminCommissionPct / 100);
  const residual_value_amount = asset_cost_sans_iva * (businessParams.residualValueRate / 100);
  
  // Cálculo de la amortización
  const amount_to_amortize = asset_cost_sans_iva - anticipo_sin_iva - residual_value_amount;
  const base_rent_amortization = loanParams.termMonths > 0 ? amount_to_amortize / loanParams.termMonths : 0;
  const base_rent_with_margin = base_rent_amortization + lessor_monthly_profit;
  const total_monthly_rent_sans_iva = base_rent_with_margin + businessParams.fixedMonthlyFee;
  const total_monthly_rent_with_iva = total_monthly_rent_sans_iva * (1 + IVA_RATE);
  
  // Análisis del operador
  const monthly_margin = total_monthly_rent_sans_iva - monthlyPayment - businessParams.monthlyExpenses;
  const annual_margin = monthly_margin * 12;
  const total_project_profit = (monthly_margin * loanParams.termMonths) + residual_value_amount;
  
  // NPV y métricas financieras
  const monthly_discount_rate = businessParams.discountRate / 100 / 12;
  let cumulative_npv = 0;
  for (let month = 1; month <= loanParams.termMonths; month++) {
    const monthly_pv = monthly_margin / Math.pow(1 + monthly_discount_rate, month);
    cumulative_npv += monthly_pv;
  }
  // Agregar valor residual al NPV
  if (loanParams.termMonths > 0) {
    cumulative_npv += residual_value_amount / Math.pow(1 + monthly_discount_rate, loanParams.termMonths);
  }
  
  // Cálculo del payback period
  const initial_investment = businessParams.otherExpenses + businessParams.deliveryCosts;
  const payback_months = monthly_margin > 0 ? initial_investment / monthly_margin : Infinity;
  
  // Convert to LeasingInputs format for compatibility
  const leasingInputs: LeasingInputs = {
    asset_cost_sans_iva: asset_cost_sans_iva,
    lease_term_months: loanParams.termMonths,
    lessor_profit_margin_pct: businessParams.lessorProfitMarginPct,
    fixed_monthly_fee: businessParams.fixedMonthlyFee,
    admin_commission_pct: businessParams.adminCommissionPct,
    delivery_costs: businessParams.deliveryCosts,
    other_initial_expenses: businessParams.otherExpenses,
    loan_amount: loanParams.totalAmount,
    annual_interest_rate: loanParams.interestRate,
    monthly_operational_expenses: businessParams.monthlyExpenses,
    residual_value_rate: businessParams.residualValueRate,
    discount_rate: businessParams.discountRate
  };

  const results = calculateLeasingFinancials(leasingInputs, loanParams.startDate);

  // === PREPARACIÓN DE DATOS PARA GRÁFICOS ===
  
  // Datos de flujo de efectivo mensual
  const cashFlowChartData = [];
  let cumulative_cash_flow = -initial_investment;
  let cumulative_npv_calc = -initial_investment;
  
  for (let month = 1; month <= loanParams.termMonths; month++) {
    const net_flow = month === loanParams.termMonths ? monthly_margin + residual_value_amount : monthly_margin;
    cumulative_cash_flow += net_flow;
    const pv = net_flow / Math.pow(1 + monthly_discount_rate, month);
    cumulative_npv_calc += pv;
    
    cashFlowChartData.push({
      month: month,
      "Flujo Mensual": net_flow,
      "Flujo Acumulado": cumulative_cash_flow,
      "VPN Acumulado": cumulative_npv_calc
    });
  }

  // Datos anualizados
  const annualizedData = [];
  const totalYears = Math.ceil(loanParams.termMonths / 12);
  for (let year = 1; year <= totalYears; year++) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, loanParams.termMonths);
    const monthsInYear = endMonth - startMonth + 1;
    
    let totalFlow = monthly_margin * monthsInYear;
    if (endMonth === loanParams.termMonths) {
      totalFlow += residual_value_amount;
    }

    annualizedData.push({
      year: `Año ${year}`,
      "Flujo Anual Total": totalFlow,
      "Promedio Mensual": totalFlow / monthsInYear,
    });
  }

  // Datos para gráfico de pastel de ingresos
  const incomeBreakdown = [
    { name: "Renta Base", value: base_rent_with_margin, color: "#3b82f6" },
    { name: "Gastos Admin", value: businessParams.fixedMonthlyFee, color: "#10b981" },
    { name: "Comisión Apertura", value: initial_admin_commission / loanParams.termMonths, color: "#f59e0b" },
    { name: "Valor Residual", value: residual_value_amount / loanParams.termMonths, color: "#8b5cf6" }
  ];

  // Datos para gráfico de pastel de costos
  const costBreakdown = [
    { name: "Pago a Inversionistas", value: monthlyPayment, color: "#ef4444" },
    { name: "Gastos Operativos", value: businessParams.monthlyExpenses, color: "#f97316" },
    { name: "Otros Gastos", value: businessParams.otherExpenses / loanParams.termMonths, color: "#84cc16" }
  ];

  // Evaluación de viabilidad del proyecto
  const isProjectViable = cumulative_npv > 0 && monthly_margin > 0;
  const profitabilityScore = Math.min(100, Math.max(0, 
    monthly_margin > 0 ? (monthly_margin / total_monthly_rent_sans_iva) * 100 : 0
  ));

  // === CÁLCULOS DE TOTALES PARA RESUMEN ===
  
  // Ingresos totales del proyecto
  const totalRentalIncome = total_monthly_rent_sans_iva * loanParams.termMonths;
  const totalIncome = totalRentalIncome + initial_admin_commission + businessParams.deliveryCosts + residual_value_amount;

  // Costos totales del proyecto
  const totalLoanPayments = monthlyPayment * loanParams.termMonths;
  const totalOperatingExpenses = businessParams.monthlyExpenses * loanParams.termMonths;
  const totalCosts = totalLoanPayments + totalOperatingExpenses + businessParams.otherExpenses;

  // Resumen financiero estilo cotización
  const financialSummary = {
    conceptos_financiados: {
      valor_unidad: asset_cost_with_iva,
      anticipo: anticipo_con_iva,
      monto_total_financiado: monto_financiado,
    },
    pago_inicial: {
      anticipo: anticipo_sin_iva,
      comision: initial_admin_commission,
      delivery: businessParams.deliveryCosts,
      otros_gastos: businessParams.otherExpenses,
      subtotal: anticipo_sin_iva + initial_admin_commission + businessParams.deliveryCosts + businessParams.otherExpenses,
      iva: (anticipo_sin_iva + initial_admin_commission) * IVA_RATE,
      total: (anticipo_sin_iva + initial_admin_commission) * (1 + IVA_RATE) + businessParams.deliveryCosts + businessParams.otherExpenses,
    },
    renta_mensual: {
      renta_basica: base_rent_with_margin,
      gastos_admin: businessParams.fixedMonthlyFee,
      total_sin_iva: total_monthly_rent_sans_iva,
      total_con_iva: total_monthly_rent_with_iva,
    },
    valor_residual: {
      valor_residual: residual_value_amount
    }
  };


  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Panel de Control del Operador
          </h2>
          <p className="text-muted-foreground mt-1">
            Análisis integral de rentabilidad y viabilidad del proyecto de arrendamiento
          </p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Análisis
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${cumulative_npv > 0 ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Presente Neto (VPN)</CardTitle>
            {cumulative_npv > 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cumulative_npv > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cumulative_npv)}
            </div>
            <Badge variant={cumulative_npv > 0 ? "default" : "destructive"} className="text-xs mt-1">
              {cumulative_npv > 0 ? "RENTABLE" : "NO RENTABLE"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Mensual</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthly_margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthly_margin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Margen: {formatPercentage((monthly_margin / total_monthly_rent_sans_iva) * 100)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período de Retorno</CardTitle>
            <Clock className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isFinite(payback_months) ? formatMonths(payback_months) : 'N/A'}
            </div>
            <Progress value={isFinite(payback_months) ? (payback_months / loanParams.termMonths) * 100 : 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total del Proyecto</CardTitle>
            <Target className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(total_project_profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ROI: {formatPercentage((total_project_profit / asset_cost_sans_iva) * 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análisis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Proyecciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Evaluación de Viabilidad del Proyecto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Evaluación de Viabilidad del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isProjectViable ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertTriangle className="h-8 w-8 text-red-600" />}
                  <div>
                    <h3 className={`text-lg font-semibold ${isProjectViable ? 'text-green-700' : 'text-red-700'}`}>
                      {isProjectViable ? 'Proyecto Viable' : 'Proyecto de Alto Riesgo'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isProjectViable 
                        ? 'El proyecto cumple con los criterios de rentabilidad establecidos.'
                        : 'El proyecto no cumple con los criterios mínimos de rentabilidad.'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Puntuación de Rentabilidad</p>
                  <p className="text-2xl font-bold">{profitabilityScore.toFixed(0)}/100</p>
                  <Progress value={profitabilityScore} className="w-24 h-2 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm text-muted-foreground">Flujo Mensual Neto</div>
                  <div className="text-lg font-semibold text-blue-600">{formatCurrency(monthly_margin)}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-sm text-muted-foreground">Valor Residual Esperado</div>
                  <div className="text-lg font-semibold text-green-600">{formatCurrency(residual_value_amount)}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm text-muted-foreground">Pago Mensual a Inversionistas</div>
                  <div className="text-lg font-semibold text-purple-600">{formatCurrency(monthlyPayment)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen Financiero Estilo Cotización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumen Financiero (Estilo Cotización)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold text-base border-b pb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Conceptos Financiados
                </h3>
                <div className="flex justify-between"><span>Valor de la Unidad:</span> <span className="font-medium">{formatCurrency(financialSummary.conceptos_financiados.valor_unidad)}</span></div>
                <div className="flex justify-between"><span>(-) Anticipo:</span> <span className="font-medium">{formatCurrency(financialSummary.conceptos_financiados.anticipo)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>Monto Financiado:</span> <span className="text-blue-600 dark:text-blue-400">{formatCurrency(financialSummary.conceptos_financiados.monto_total_financiado)}</span></div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold text-base border-b pb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pago Inicial
                </h3>
                <div className="flex justify-between"><span>Anticipo (sin IVA):</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.anticipo)}</span></div>
                <div className="flex justify-between"><span>Comisión por apertura:</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.comision)}</span></div>
                <div className="flex justify-between"><span>Gastos de entrega:</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.delivery)}</span></div>
                <div className="flex justify-between"><span>Otros gastos:</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.otros_gastos)}</span></div>
                <div className="flex justify-between border-t pt-1"><span>Subtotal:</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.subtotal)}</span></div>
                <div className="flex justify-between"><span>IVA:</span> <span className="font-medium">{formatCurrency(financialSummary.pago_inicial.iva)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>Total Pago Inicial:</span> <span className="text-blue-600 dark:text-blue-400">{formatCurrency(financialSummary.pago_inicial.total)}</span></div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold text-base border-b pb-2 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Renta y Residual
                </h3>
                <div className="flex justify-between"><span>Renta básica:</span> <span className="font-medium">{formatCurrency(financialSummary.renta_mensual.renta_basica)}</span></div>
                <div className="flex justify-between"><span>Gastos administración:</span> <span className="font-medium">{formatCurrency(financialSummary.renta_mensual.gastos_admin)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>Total Mensual (s/IVA):</span> <span>{formatCurrency(financialSummary.renta_mensual.total_sin_iva)}</span></div>
                <div className="flex justify-between"><span>Total Mensual (c/IVA):</span> <span className="text-green-600">{formatCurrency(financialSummary.renta_mensual.total_con_iva)}</span></div>
                <hr className="my-4 dark:border-gray-600"/>
                <div className="flex justify-between font-bold"><span>Valor Residual:</span> <span className="text-purple-600">{formatCurrency(financialSummary.valor_residual.valor_residual)}</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Desglose Financiero Detallado */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose Financiero del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Columna de Ingresos */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2 text-green-600">
                    <DollarSign className="h-5 w-5" /> 
                    Ingresos del Proyecto
                  </h4>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Renta Mensual (sin IVA):</span> <span className="font-medium">{formatCurrency(total_monthly_rent_sans_iva)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Ingresos por Renta:</span> <span className="font-medium">{formatCurrency(totalRentalIncome)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Comisión de Apertura:</span> <span className="font-medium">{formatCurrency(initial_admin_commission)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Gastos de Entrega:</span> <span className="font-medium">{formatCurrency(businessParams.deliveryCosts)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Valor Residual:</span> <span className="font-medium">{formatCurrency(residual_value_amount)}</span></div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Ingresos:</span>
                      <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Columna de Costos */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2 text-red-600">
                    <BarChart3 className="h-5 w-5" /> 
                    Costos del Proyecto
                  </h4>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Costo del Activo (con IVA):</span> <span className="font-medium">{formatCurrency(asset_cost_with_iva)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Pagos del Préstamo:</span> <span className="font-medium">{formatCurrency(totalLoanPayments)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Gastos Operativos:</span> <span className="font-medium">{formatCurrency(totalOperatingExpenses)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Otros Gastos Iniciales:</span> <span className="font-medium">{formatCurrency(businessParams.otherExpenses)}</span></div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Costos:</span>
                      <span className="text-red-600">{formatCurrency(totalCosts)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Amortización del Operador */}
          <Card>
            <CardHeader>
              <CardTitle>Tabla de Amortización del Operador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Período</th>
                      <th className="px-4 py-2 text-left">Ingresos por Renta</th>
                      <th className="px-4 py-2 text-left">Pago a Inversionistas</th>
                      <th className="px-4 py-2 text-left">Gastos Operativos</th>
                      <th className="px-4 py-2 text-left">Flujo Neto</th>
                      <th className="px-4 py-2 text-left">Flujo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: loanParams.termMonths }, (_, i) => {
                      const month = i + 1;
                      const netFlow = month === loanParams.termMonths ? monthly_margin + residual_value_amount : monthly_margin;
                      const cumulativeFlow = monthly_margin * month + (month === loanParams.termMonths ? residual_value_amount : 0);
                      
                      return (
                        <tr key={month} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-2">{month}</td>
                          <td className="px-4 py-2">{formatCurrency(total_monthly_rent_sans_iva)}</td>
                          <td className="px-4 py-2">{formatCurrency(monthlyPayment)}</td>
                          <td className="px-4 py-2">{formatCurrency(businessParams.monthlyExpenses)}</td>
                          <td className="px-4 py-2 font-medium">{formatCurrency(netFlow)}</td>
                          <td className="px-4 py-2 font-medium">{formatCurrency(cumulativeFlow)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Gráficos de Análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Distribución de Ingresos Mensuales</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <RechartsPieChart data={incomeBreakdown}>
                      {incomeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Distribución de Costos Mensuales</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <RechartsPieChart data={costBreakdown}>
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {/* Gráficos de Proyección */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Flujo de Efectivo Acumulado</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cashFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Meses', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Mes ${label}`} />
                    <Legend />
                    <Area type="monotone" dataKey="Flujo Acumulado" stroke="#2563eb" fill="#dbeafe" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Valor Presente Neto Acumulado</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cashFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: 'Meses', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Mes ${label}`} />
                    <Legend />
                    <Line type="monotone" dataKey="VPN Acumulado" stroke="#dc2626" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Proyección Anual */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Efectivo Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={annualizedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Flujo Anual Total" fill="#3b82f6" name="Flujo Anual Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Promedio Mensual" fill="#10b981" name="Promedio Mensual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
