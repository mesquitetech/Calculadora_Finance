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
  Calculator
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
} from "@/lib/leasingCalculations"; // Ensure the path is correct

interface BusinessParameters {
  assetCost: number;
  otherExpenses: number; // Field for other initial expenses
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
  paymentSchedule: any[];
  onExportReport: () => void;
}

export function OperatorDashboardTab({
  businessParams,
  loanParams,
  monthlyPayment,
  paymentSchedule,
  onExportReport
}: OperatorDashboardTabProps) {
  // Convert form parameters to the format expected by the calculation engine
  const leasingInputs: LeasingInputs = {
    asset_cost_sans_iva: businessParams.assetCost,
    lease_term_months: loanParams.termMonths,
    lessor_profit_margin_pct: businessParams.lessorProfitMarginPct,
    fixed_monthly_fee: businessParams.fixedMonthlyFee,
    admin_commission_pct: businessParams.adminCommissionPct,
    security_deposit_months: businessParams.securityDepositMonths,
    delivery_costs: businessParams.deliveryCosts,
    other_initial_expenses: businessParams.otherExpenses,
    loan_amount: loanParams.totalAmount,
    annual_interest_rate: loanParams.interestRate,
    monthly_operational_expenses: businessParams.monthlyExpenses,
    residual_value_rate: businessParams.residualValueRate,
    discount_rate: businessParams.discountRate
  };

  // Validate the date before use
  const startDate = new Date(loanParams.startDate);
  if (isNaN(startDate.getTime())) {
      console.error("Invalid start date:", loanParams.startDate);
      return <div>Error: The start date is not valid.</div>;
  }

  const results = calculateLeasingFinancials(leasingInputs, startDate);

  // Prepare data for charts
  const cashFlowChartData = results.cash_flow_schedule.map(entry => ({
    month: entry.month,
    "Monthly Flow": entry.net_cash_flow,
    "Cumulative Flow": entry.cumulative_cash_flow,
    "Cumulative NPV": entry.cumulative_npv
  }));

  // Annualized data for better visualization
  const annualizedData = [];
  const totalYears = Math.ceil(leasingInputs.lease_term_months / 12);
  for (let year = 1; year <= totalYears; year++) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, leasingInputs.lease_term_months);

    const yearData = results.cash_flow_schedule.slice(startMonth, endMonth + 1);
    const totalFlow = yearData.reduce((sum, entry) => sum + entry.net_cash_flow, 0);
    const avgMonthlyFlow = yearData.length > 0 ? totalFlow / yearData.length : 0;

    annualizedData.push({
      year: `Year ${year}`,
      "Total Annual Flow": totalFlow,
      "Monthly Average": avgMonthlyFlow,
    });
  }

  // Project viability assessment
  const isProjectViable = results.net_present_value > 0 && results.internal_rate_of_return > leasingInputs.discount_rate;
  const profitabilityScore = Math.min(100, Math.max(0, 
    (results.internal_rate_of_return / (leasingInputs.discount_rate * 1.5)) * 100
  ));

  // Calculate totals for the breakdown section
  const totalRentalIncome = results.total_monthly_rent_sans_iva * leasingInputs.lease_term_months;
  const totalIncome = totalRentalIncome + results.initial_admin_commission + leasingInputs.delivery_costs + results.residual_value_amount;

  const totalLoanPayments = results.monthly_loan_payment * leasingInputs.lease_term_months;
  const totalOperatingExpenses = leasingInputs.monthly_operational_expenses * leasingInputs.lease_term_months;
  const assetCostWithVAT = leasingInputs.asset_cost_sans_iva * 1.16; // Assuming 16% VAT

  // CORRECTED LOGIC: Total Costs should reflect lifetime operational cash outflows for this summary view.
  // The asset cost is covered by the loan payments, so we don't add it here to avoid double-counting.
  const totalCosts = totalLoanPayments + totalOperatingExpenses + results.initial_security_deposit;


  return (
    <div className="space-y-6 p-4">
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

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${results.net_present_value > 0 ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Present Value (NPV)</CardTitle>
            {results.net_present_value > 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${results.net_present_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(results.net_present_value)}
            </div>
            <Badge variant={results.net_present_value > 0 ? "default" : "destructive"} className="text-xs mt-1">
              {results.net_present_value > 0 ? "PROFITABLE" : "NOT PROFITABLE"}
            </Badge>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${results.internal_rate_of_return > leasingInputs.discount_rate ? 'border-green-500' : 'border-orange-500'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Internal Rate of Return (IRR)</CardTitle>
                <Target className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${results.internal_rate_of_return > leasingInputs.discount_rate ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatPercentage(results.internal_rate_of_return)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Target: {formatPercentage(leasingInputs.discount_rate)}
                </p>
            </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
                <Clock className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                    {formatMonths(results.payback_period_months)}
                </div>
                <Progress value={(results.payback_period_months / leasingInputs.lease_term_months) * 100} className="h-2 mt-2" />
            </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Project Profit</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.total_project_profit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Margin: {formatPercentage((results.total_project_profit / (leasingInputs.asset_cost_sans_iva || 1)) * 100)}
                </p>
            </CardContent>
        </Card>
      </div>

      {/* Project Viability Assessment */}
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
              {isProjectViable ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertTriangle className="h-8 w-8 text-red-600" />}
              <div>
                <h3 className={`text-lg font-semibold ${isProjectViable ? 'text-green-700' : 'text-red-700'}`}>
                  {isProjectViable ? 'Viable Project' : 'High-Risk Project'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isProjectViable 
                    ? 'The project meets the established profitability criteria.'
                    : 'The project does not meet the minimum profitability criteria.'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Net Monthly Cash Flow</div>
              <div className="text-lg font-semibold text-blue-600">{formatCurrency(results.net_monthly_cash_flow)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Expected Residual Value</div>
              <div className="text-lg font-semibold text-green-600">{formatCurrency(results.residual_value_amount)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Monthly Payment to Investors</div>
              <div className="text-lg font-semibold text-purple-600">{formatCurrency(results.monthly_loan_payment)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Cumulative Cash Flow</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Month ${label}`} />
                <Legend />
                <Area type="monotone" dataKey="Cumulative Flow" stroke="#2563eb" fill="#dbeafe" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cumulative Net Present Value</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Month ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="Cumulative NPV" stroke="#dc2626" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Annual Analysis */}
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
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Total Annual Flow" fill="#3b82f6" name="Total Annual Flow" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Monthly Average" fill="#10b981" name="Monthly Average" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Project Financial Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Income Column */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2"><DollarSign className="h-5 w-5 text-green-600" /> Project Income</h4>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Monthly Rent (without VAT):</span> <span className="font-medium">{formatCurrency(results.total_monthly_rent_sans_iva)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Rental Income:</span> <span className="font-medium">{formatCurrency(totalRentalIncome)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Opening Commission:</span> <span className="font-medium">{formatCurrency(results.initial_admin_commission)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Costs:</span> <span className="font-medium">{formatCurrency(leasingInputs.delivery_costs)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Residual Value:</span> <span className="font-medium">{formatCurrency(results.residual_value_amount)}</span></div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Income:</span>
                  <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                </div>
              </div>
            </div>
            {/* Costs Column */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg flex items-center gap-2 border-b pb-2"><BarChart3 className="h-5 w-5 text-red-600" /> Project Costs</h4>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Asset Cost (with VAT):</span> <span className="font-medium">{formatCurrency(assetCostWithVAT)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Loan Payments:</span> <span className="font-medium">{formatCurrency(totalLoanPayments)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Operating Expenses:</span> <span className="font-medium">{formatCurrency(totalOperatingExpenses)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Deposit Return:</span> <span className="font-medium">{formatCurrency(results.initial_security_deposit)}</span></div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Costs:</span>
                  <span className="text-red-600">{formatCurrency(totalCosts)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
