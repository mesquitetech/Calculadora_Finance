
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Building,
  LineChart,
  PieChart
} from "lucide-react";
import { 
  LineChart as RechartsLineChart,
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
import { 
  calculateNPV, 
  calculateIRR, 
  calculatePaybackPeriod,
  formatDollarAmount 
} from "@/lib/financialMetrics";

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
  startDate: Date;
  paymentFrequency: string;
}

interface RenterConfig {
  discountRate: number;
  residualValueRate: number;
}

interface RenterAnalysisTabProps {
  businessParams: BusinessParameters;
  loanParams: LoanParameters;
  monthlyPayment: number;
  paymentSchedule: PaymentScheduleEntry[];
  renterConfig: RenterConfig;
  onExportReport: () => void;
}

export function RenterAnalysisTab({
  businessParams,
  loanParams,
  monthlyPayment,
  paymentSchedule,
  renterConfig,
  onExportReport
}: RenterAnalysisTabProps) {
  // Interactive revenue state
  const [interactiveRevenue, setInteractiveRevenue] = useState<number>(0);

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
    residual_value_rate: renterConfig.residualValueRate,
    discount_rate: renterConfig.discountRate
  };

  const results = calculateLeasingFinancials(leasingInputs, loanParams.startDate);

  // Calculate break-even revenue and initialize interactive revenue
  const breakEvenRevenue = results.monthly_loan_payment + businessParams.monthlyExpenses;
  
  React.useEffect(() => {
    if (interactiveRevenue === 0) {
      setInteractiveRevenue(Math.max(breakEvenRevenue, results.total_monthly_rent_sans_iva * 1.1));
    }
  }, [breakEvenRevenue, results.total_monthly_rent_sans_iva, interactiveRevenue]);

  // Calculate renter/operator metrics based on interactive revenue
  const netMonthlyCashFlow = interactiveRevenue - results.monthly_loan_payment - businessParams.monthlyExpenses;
  const initialInvestment = businessParams.assetCost - loanParams.totalAmount; // Down payment
  const totalAssetCost = businessParams.assetCost + businessParams.otherExpenses;
  const annualCashFlow = netMonthlyCashFlow * 12;
  const residualValue = totalAssetCost * (renterConfig.residualValueRate / 100);

  // Generate cash flows for IRR calculation
  const numYears = Math.ceil(loanParams.termMonths / 12);
  const cashFlows = Array(numYears).fill(annualCashFlow);
  if (cashFlows.length > 0) {
    cashFlows[cashFlows.length - 1] += residualValue;
  }

  // Calculate financial metrics
  const npv = calculateNPV(initialInvestment, cashFlows, renterConfig.discountRate / 100);
  const irr = calculateIRR(-initialInvestment, cashFlows);
  const paybackPeriod = netMonthlyCashFlow > 0 && initialInvestment > 0
    ? initialInvestment / netMonthlyCashFlow 
    : (initialInvestment <= 0 ? null : Infinity);

  const totalNetIncome = netMonthlyCashFlow * loanParams.termMonths;
  const roi = initialInvestment > 0 ? (totalNetIncome / initialInvestment) * 100 : 
    (totalNetIncome > 0 ? Infinity : 0);

  // TIR calculation
  const calculateTIR = () => {
    const cashFlowsMonthly = [-initialInvestment];
    for (let i = 0; i < loanParams.termMonths; i++) {
      cashFlowsMonthly.push(netMonthlyCashFlow);
    }
    if (cashFlowsMonthly.length > 1) {
      cashFlowsMonthly[cashFlowsMonthly.length - 1] += residualValue;
    }
    
    const monthlyTIR = calculateIRR(initialInvestment, cashFlowsMonthly.slice(1));
    const annualTIR = isNaN(monthlyTIR) ? 0 : (Math.pow(1 + monthlyTIR, 12) - 1) * 100;
    return annualTIR;
  };

  const tirValue = calculateTIR();

  // Prepare chart data
  const cashFlowChartData = Array.from({ length: loanParams.termMonths }, (_, index) => {
    const month = index + 1;
    return {
      month: month,
      revenue: interactiveRevenue,
      loanPayment: results.monthly_loan_payment,
      expenses: businessParams.monthlyExpenses,
      netCashFlow: netMonthlyCashFlow,
      cumulativeCashFlow: netMonthlyCashFlow * month
    };
  });

  // Annual data for better visualization
  const annualizedData = [];
  for (let year = 1; year <= Math.ceil(loanParams.termMonths / 12); year++) {
    const monthsInYear = Math.min(12, loanParams.termMonths - (year - 1) * 12);
    annualizedData.push({
      year: `Year ${year}`,
      revenue: interactiveRevenue * monthsInYear,
      loanPayment: results.monthly_loan_payment * monthsInYear,
      expenses: businessParams.monthlyExpenses * monthsInYear,
      netCashFlow: netMonthlyCashFlow * monthsInYear
    });
  }

  // Income statement calculations
  const annualRevenue = interactiveRevenue * 12;
  const annualOperatingExpenses = businessParams.monthlyExpenses * 12;
  const annualLoanPayments = results.monthly_loan_payment * 12;
  const annualInterestExpense = annualLoanPayments * 0.8; // Simplified
  const annualDepreciation = totalAssetCost / 27.5; // Straight-line depreciation
  
  const ebitda = annualRevenue - annualOperatingExpenses;
  const ebit = ebitda - annualDepreciation;
  const ebt = ebit - annualInterestExpense;
  const taxRate = 0.25;
  const taxes = Math.max(0, ebt * taxRate);
  const netIncome = ebt - taxes;

  // Margins
  const grossMargin = annualRevenue > 0 ? (annualRevenue / annualRevenue) * 100 : 0;
  const operatingMargin = annualRevenue > 0 ? (ebit / annualRevenue) * 100 : 0;
  const netMargin = annualRevenue > 0 ? (netIncome / annualRevenue) * 100 : 0;

  // Project viability
  const isProjectViable = npv > 0 && (irr * 100) > renterConfig.discountRate;
  const profitabilityScore = Math.min(100, Math.max(0, (npv / totalAssetCost) * 100 + 50));

  const handleRevenueChange = (value: number[]) => {
    const newValue = typeof value[0] === 'number' && !isNaN(value[0]) ? value[0] : 0;
    setInteractiveRevenue(newValue);
  };

  const formatValue = (value: number, showParens = false) => {
    if (value < 0 && showParens) {
      return `(${formatCurrency(Math.abs(value))})`;
    }
    return formatCurrency(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Renter/Operator Financial Analysis
          </h2>
          <p className="text-muted-foreground mt-1">
            Complete financial analysis for rental operations using unified calculations
          </p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      </div>

      {/* Interactive Revenue Control */}
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-center">Monthly Revenue Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Monthly Revenue:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={interactiveRevenue}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setInteractiveRevenue(isNaN(newValue) ? 0 : newValue);
                    }}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      if (isNaN(newValue) || newValue < 0) {
                        setInteractiveRevenue(0);
                      }
                    }}
                    className="w-24 px-2 py-1 text-sm border rounded text-right"
                    step="100"
                  />
                  <span className="text-sm text-muted-foreground">$</span>
                </div>
              </div>
              <div className="relative">
                <Slider
                  value={[interactiveRevenue]}
                  onValueChange={handleRevenueChange}
                  min={0}
                  max={breakEvenRevenue * 3}
                  step={100}
                  className="w-full opacity-70"
                />
                <div 
                  className="absolute top-0 w-0.5 h-6 bg-orange-500 pointer-events-none"
                  style={{
                    left: `${(breakEvenRevenue / (breakEvenRevenue * 3)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="absolute -top-6 -left-8 text-xs text-orange-600 font-medium whitespace-nowrap">
                    Break-even
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$0</span>
                <span>${(breakEvenRevenue * 3).toLocaleString()}</span>
              </div>
            </div>
            <div className="text-center min-w-[120px]">
              <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              <p className={`text-lg font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netMonthlyCashFlow)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Project Viability Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Investment Viability Assessment
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
                      {isProjectViable ? 'Viable Investment' : 'High Risk Investment'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isProjectViable 
                        ? 'The investment meets established profitability criteria'
                        : 'The investment does not meet minimum profitability criteria'
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
            </CardContent>
          </Card>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Initial Investment</CardTitle>
                <p className="text-sm text-muted-foreground">Your down payment</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatDollarAmount(initialInvestment)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Net Present Value (NPV)</CardTitle>
                <p className="text-sm text-muted-foreground">At {renterConfig.discountRate.toFixed(1)}% discount rate</p>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isNaN(npv) || npv === Infinity ? formatDollarAmount(0) : formatDollarAmount(npv)}
                </div>
                {(isNaN(npv) || npv === Infinity || initialInvestment === 0) && (
                  <div className="text-sm text-muted-foreground mt-2">
                    No initial investment
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payback Period</CardTitle>
                <p className="text-sm text-muted-foreground">Time to recover initial investment</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {paybackPeriod === null 
                    ? 'N/A' 
                    : paybackPeriod === Infinity || paybackPeriod <= 0 
                      ? 'Never' 
                      : `${Math.ceil(paybackPeriod)} months`}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ROI</CardTitle>
                <p className="text-sm text-muted-foreground">Total return percentage</p>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi === Infinity ? '∞%' : formatPercentage(roi)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">TIR (IRR)</CardTitle>
                <p className="text-sm text-muted-foreground">Internal Rate of Return</p>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${tirValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isNaN(tirValue) || tirValue === Infinity ? '0.00' : tirValue.toFixed(2)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Residual Value</CardTitle>
                <p className="text-sm text-muted-foreground">Asset value at end ({renterConfig.residualValueRate}%)</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatDollarAmount(residualValue)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(interactiveRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Loan Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(results.monthly_loan_payment)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(businessParams.monthlyExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netMonthlyCashFlow)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Annual Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Cash Flow Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={annualizedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                  <Bar dataKey="loanPayment" fill="#ef4444" name="Loan Payment" />
                  <Bar dataKey="expenses" fill="#f97316" name="Operating Expenses" />
                  <Bar dataKey="netCashFlow" fill="#3b82f6" name="Net Cash Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Cash Flow Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeCashFlow" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Cumulative Cash Flow"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          {/* Income Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Annual Income Statement (P&L)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Revenue Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-2">Revenue</h3>
                  <div className="flex justify-between py-1">
                    <span>Gross Revenue</span>
                    <span className="font-medium text-green-600">{formatValue(annualRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold border-b">
                    <span>Total Revenue</span>
                    <span className="text-green-600">{formatValue(annualRevenue)}</span>
                  </div>
                </div>

                {/* Operating Expenses Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-2">Operating Expenses</h3>
                  <div className="flex justify-between py-1">
                    <span>Operating Expenses</span>
                    <span className="text-red-600">{formatValue(annualOperatingExpenses, true)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold border-b">
                    <span>Total Operating Expenses</span>
                    <span className="text-red-600">{formatValue(annualOperatingExpenses, true)}</span>
                  </div>
                </div>

                {/* EBITDA */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                  <div className="flex justify-between py-1 font-semibold text-lg">
                    <span>EBITDA</span>
                    <span className={ebitda >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatValue(ebitda, ebitda < 0)}
                    </span>
                  </div>
                </div>

                {/* Depreciation */}
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Less: Depreciation</span>
                    <span className="text-red-600">{formatValue(annualDepreciation, true)}</span>
                  </div>
                </div>

                {/* EBIT */}
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                  <div className="flex justify-between py-1 font-semibold text-lg">
                    <span>EBIT</span>
                    <span className={ebit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatValue(ebit, ebit < 0)}
                    </span>
                  </div>
                </div>

                {/* Interest Expense */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg border-b pb-2">Financial Expenses</h3>
                  <div className="flex justify-between py-1">
                    <span>Interest Expense</span>
                    <span className="text-red-600">{formatValue(annualInterestExpense, true)}</span>
                  </div>
                </div>

                {/* EBT */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded">
                  <div className="flex justify-between py-1 font-semibold text-lg">
                    <span>EBT (Pre-Tax Income)</span>
                    <span className={ebt >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatValue(ebt, ebt < 0)}
                    </span>
                  </div>
                </div>

                {/* Taxes */}
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Income Taxes ({formatPercent(taxRate * 100)})</span>
                    <span className="text-red-600">{formatValue(taxes, true)}</span>
                  </div>
                </div>

                {/* Net Income */}
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="flex justify-between py-1 font-bold text-xl">
                    <span>NET INCOME</span>
                    <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatValue(netIncome, netIncome < 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Ratios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Gross Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercent(grossMargin)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Operating Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${operatingMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(operatingMargin)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Net Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(netMargin)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`border-l-4 ${npv > 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Present Value</p>
                    <p className={`text-2xl font-bold ${npv > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(npv)}
                    </p>
                  </div>
                  {npv > 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${(irr * 100) > renterConfig.discountRate ? 'border-l-green-500' : 'border-l-orange-500'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Internal Rate of Return</p>
                    <p className={`text-2xl font-bold ${(irr * 100) > renterConfig.discountRate ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatPercentage(irr * 100)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {paybackPeriod === null ? 'N/A' : paybackPeriod === Infinity ? 'Never' : `${Math.ceil(paybackPeriod)}m`}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalNetIncome)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Investment Income
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Rental Income:</span>
                      <span className="font-medium">
                        {formatCurrency(interactiveRevenue * loanParams.termMonths)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Residual Value:</span>
                      <span className="font-medium">{formatCurrency(residualValue)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Income:</span>
                        <span className="text-green-600">
                          {formatCurrency(interactiveRevenue * loanParams.termMonths + residualValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                    Investment Costs
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Initial Investment:</span>
                      <span className="font-medium">{formatCurrency(initialInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Operating Expenses:</span>
                      <span className="font-medium">
                        {formatCurrency(businessParams.monthlyExpenses * loanParams.termMonths)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Costs:</span>
                        <span className="text-red-600">
                          {formatCurrency(initialInvestment + businessParams.monthlyExpenses * loanParams.termMonths)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
