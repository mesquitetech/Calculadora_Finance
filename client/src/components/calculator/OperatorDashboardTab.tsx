import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Building
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
  Bar
} from "recharts";
import { 
  calculateLeasingFinancials, 
  LeasingInputs, 
  formatCurrency,
  formatPercentage,
  formatMonths 
} from "@/lib/leasingCalculations";
import { PaymentScheduleEntry } from "@/lib/finance";

interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number;
  fixedMonthlyFee: number;
  adminCommissionPct: number;
  securityDepositMonths: number;
  deliveryCosts: number;
  residualValueRate: number;
  discountRate: number;
}

interface LoanParameters {
  loanName: string;
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
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
  // Convert to LeasingInputs format for calculations
  const leasingInputs: LeasingInputs = {
    asset_cost_sans_iva: businessParams.assetCost,
    lease_term_months: loanParams.termMonths,
    lessor_profit_margin_pct: businessParams.lessorProfitMarginPct,
    fixed_monthly_fee: businessParams.fixedMonthlyFee,
    admin_commission_pct: businessParams.adminCommissionPct,
    security_deposit_months: businessParams.securityDepositMonths,
    delivery_costs: businessParams.deliveryCosts,
    loan_amount: loanParams.totalAmount,
    annual_interest_rate: loanParams.interestRate,
    monthly_operational_expenses: businessParams.monthlyExpenses,
    residual_value_rate: businessParams.residualValueRate,
    discount_rate: businessParams.discountRate
  };

  const startDate = new Date(loanParams.startDate);
  const results = calculateLeasingFinancials(leasingInputs, startDate);

  // Prepare data for charts
  const cashFlowChartData = results.cash_flow_schedule.map(entry => ({
    month: entry.month,
    cashFlow: entry.net_cash_flow,
    cumulativeCashFlow: entry.cumulative_cash_flow,
    npv: entry.cumulative_npv
  }));

  // Annualized data for better visualization
  const annualizedData = [];
  for (let year = 1; year <= Math.ceil(leasingInputs.lease_term_months / 12); year++) {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(year * 12, leasingInputs.lease_term_months);

    const yearData = results.cash_flow_schedule.slice(startMonth, endMonth + 1);
    const totalCashFlow = yearData.reduce((sum, entry) => sum + entry.net_cash_flow, 0);
    const avgMonthlyFlow = totalCashFlow / (endMonth - startMonth);

    annualizedData.push({
      year: `Year ${year}`,
      monthlyAverage: avgMonthlyFlow,
      totalFlow: totalCashFlow,
      cumulativeNPV: yearData[yearData.length - 1]?.cumulative_npv || 0
    });
  }

  // Project viability assessment
  const isProjectViable = results.net_present_value > 0 && results.internal_rate_of_return > leasingInputs.discount_rate;
  const profitabilityScore = Math.min(100, Math.max(0, 
    (results.net_present_value / leasingInputs.asset_cost_sans_iva) * 100 + 50
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Operator Control Panel
          </h2>
          <p className="text-muted-foreground mt-1">
            Leasing project profitability and viability analysis
          </p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${results.net_present_value > 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Present Value</p>
                <p className={`text-2xl font-bold ${results.net_present_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.net_present_value)}
                </p>
              </div>
              {results.net_present_value > 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div className="mt-2">
              <Badge variant={results.net_present_value > 0 ? "default" : "destructive"} className="text-xs">
                {results.net_present_value > 0 ? "PROFITABLE" : "NOT PROFITABLE"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${results.internal_rate_of_return > leasingInputs.discount_rate ? 'border-l-green-500' : 'border-l-orange-500'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Internal Rate of Return</p>
                <p className={`text-2xl font-bold ${results.internal_rate_of_return > leasingInputs.discount_rate ? 'text-green-600' : 'text-orange-600'}`}>
                  {formatPercentage(results.internal_rate_of_return)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Target: {formatPercentage(leasingInputs.discount_rate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatMonths(results.payback_period_months)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Progress 
                value={(results.payback_period_months / leasingInputs.lease_term_months) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.total_project_profit)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Margin: {formatPercentage((results.total_project_profit / leasingInputs.asset_cost_sans_iva) * 100)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluación del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Project Viability Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isProjectViable ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${isProjectViable ? 'text-green-700' : 'text-red-700'}`}>
                  {isProjectViable ? 'Viable Project' : 'High Risk Project'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isProjectViable 
                    ? 'The project meets the established profitability criteria'
                    : 'The project does not meet minimum profitability criteria'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Profitability Score</p>
              <p className="text-2xl font-bold">{profitabilityScore.toFixed(0)}/100</p>
              <Progress value={profitabilityScore} className="w-24 h-2 mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(results.net_monthly_cash_flow)}
              </div>
              <div className="text-sm text-muted-foreground">Net Monthly Cash Flow</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(results.residual_value_amount)}
              </div>
              <div className="text-sm text-muted-foreground">Expected Residual Value</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {formatCurrency(results.monthly_loan_payment)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Payment to Investors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulativeCashFlow" 
                  stroke="#2563eb" 
                  fill="#dbeafe" 
                  fillOpacity={0.3}
                  name="Cumulative Flow"
                />
                <Line 
                  type="monotone" 
                  dataKey="cashFlow" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={false}
                  name="Monthly Flow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Net Present Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="npv" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  dot={false}
                  name="Cumulative NPV"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Año */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Cash Flow Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={annualizedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="totalFlow" 
                fill="#3b82f6" 
                name="Total Annual Flow"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="monthlyAverage" 
                fill="#10b981" 
                name="Monthly Average"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumen Financiero Detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Project Financial Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Project Income
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Rent (without VAT):</span>
                  <span className="font-medium">{formatCurrency(results.total_monthly_rent_sans_iva)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rental Income:</span>
                  <span className="font-medium">
                    {formatCurrency(results.total_monthly_rent_sans_iva * leasingInputs.lease_term_months)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Opening Commission:</span>
                  <span className="font-medium">{formatCurrency(results.initial_admin_commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Costs:</span>
                  <span className="font-medium">{formatCurrency(leasingInputs.delivery_costs)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Residual Value:</span>
                  <span className="font-medium">{formatCurrency(results.residual_value_amount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Income:</span>
                    <span className="text-green-600">
                      {formatCurrency(
                        results.total_monthly_rent_sans_iva * leasingInputs.lease_term_months +
                        results.initial_admin_commission +
                        leasingInputs.delivery_costs +
                        results.residual_value_amount
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-600" />
                Project Costs
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Asset Cost (with VAT):</span>
                  <span className="font-medium">
                    {formatCurrency(leasingInputs.asset_cost_sans_iva * 1.16)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Loan Payments:</span>
                  <span className="font-medium">
                    {formatCurrency(results.monthly_loan_payment * leasingInputs.lease_term_months)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Operating Expenses:</span>
                  <span className="font-medium">
                    {formatCurrency(leasingInputs.monthly_operational_expenses * leasingInputs.lease_term_months)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Return:</span>
                  <span className="font-medium">{formatCurrency(results.initial_security_deposit)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Costs:</span>
                    <span className="text-red-600">
                      {formatCurrency(
                        leasingInputs.asset_cost_sans_iva * 1.16 +
                        results.monthly_loan_payment * leasingInputs.lease_term_months +
                        leasingInputs.monthly_operational_expenses * leasingInputs.lease_term_months +
                        results.initial_security_deposit
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}