
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  PieChart,
  LineChart
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

interface RenterDashboardTabProps {
  businessParams: BusinessParameters;
  loanParams: LoanParameters;
  onExportReport: () => void;
}

export function RenterDashboardTab({
  businessParams,
  loanParams,
  onExportReport
}: RenterDashboardTabProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);

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

  // Initialize revenue with the calculated monthly rent if not set
  React.useEffect(() => {
    if (monthlyRevenue === 0) {
      setMonthlyRevenue(results.total_monthly_rent_sans_iva);
    }
  }, [results.total_monthly_rent_sans_iva, monthlyRevenue]);

  // Calculate renter-specific metrics
  const monthlyRent = results.total_monthly_rent_sans_iva;
  const initialPayment = results.initial_payment_sans_iva;
  const totalRentPaid = monthlyRent * leasingInputs.lease_term_months;
  const totalCostOfLeasing = initialPayment + totalRentPaid;
  const residualValue = results.residual_value_amount;

  // Alternative investment analysis (if they bought instead of leased)
  const downPayment = businessParams.assetCost * 0.2; // Assume 20% down payment
  const loanAmountIfBuying = businessParams.assetCost - downPayment;
  const monthlyLoanPayment = results.monthly_loan_payment;
  const totalLoanPayments = monthlyLoanPayment * leasingInputs.lease_term_months;
  const totalCostOfBuying = downPayment + totalLoanPayments;
  const costSavings = totalCostOfBuying - totalCostOfLeasing;

  // Prepare data for charts
  const cashFlowChartData = results.cash_flow_schedule.map(entry => ({
    month: entry.month,
    "Lease Payment": -monthlyRent,
    "Cumulative Cost": -(initialPayment + (monthlyRent * entry.month)),
    "Alternative Loan Payment": entry.month === 0 ? -downPayment : -monthlyLoanPayment,
    "Cumulative Alternative Cost": entry.month === 0 ? -downPayment : -(downPayment + (monthlyLoanPayment * entry.month))
  }));

  // Annual breakdown
  const annualData = [];
  const totalYears = Math.ceil(leasingInputs.lease_term_months / 12);
  for (let year = 1; year <= totalYears; year++) {
    const monthsInYear = Math.min(12, leasingInputs.lease_term_months - (year - 1) * 12);
    annualData.push({
      year: `Year ${year}`,
      "Lease Payments": monthlyRent * monthsInYear,
      "Loan Payments (Alternative)": monthlyLoanPayment * monthsInYear,
      "Operating Expenses": businessParams.monthlyExpenses * monthsInYear
    });
  }

  const handleRevenueChange = (value: number[]) => {
    const newValue = typeof value[0] === 'number' && !isNaN(value[0]) ? value[0] : 0;
    setMonthlyRevenue(newValue);
  };

  // Calculate profitability if using leased asset for business
  const netMonthlyCashFlow = monthlyRevenue - monthlyRent - businessParams.monthlyExpenses;
  const breakEvenRevenue = monthlyRent + businessParams.monthlyExpenses;
  const totalNetIncome = netMonthlyCashFlow * leasingInputs.lease_term_months;
  const roi = initialPayment > 0 ? (totalNetIncome / initialPayment) * 100 : 
    (totalNetIncome > 0 ? Infinity : 0);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="h-8 w-8 text-green-600" />
            Renter Analysis Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive leasing cost analysis and business profitability
          </p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="comparison">Buy vs Lease</TabsTrigger>
          <TabsTrigger value="business">Business Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Lease Payment</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyRent)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Including fees and margin
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Initial Payment</CardTitle>
                <Calculator className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(initialPayment)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Commission + Deposit + Delivery
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lease Cost</CardTitle>
                <BarChart3 className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCostOfLeasing)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Over {leasingInputs.lease_term_months} months
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Residual Value</CardTitle>
                <Target className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(residualValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Asset value at lease end
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lease Structure Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Structure Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Initial Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Administrative Commission:</span>
                      <span className="font-medium">{formatCurrency(results.initial_admin_commission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-medium">{formatCurrency(results.initial_security_deposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Costs:</span>
                      <span className="font-medium">{formatCurrency(leasingInputs.delivery_costs)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Initial Payment:</span>
                      <span>{formatCurrency(initialPayment)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Monthly Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Rent + Margin:</span>
                      <span className="font-medium">{formatCurrency(results.base_rent_with_margin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Monthly Fee:</span>
                      <span className="font-medium">{formatCurrency(leasingInputs.fixed_monthly_fee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Monthly Payment:</span>
                      <span>{formatCurrency(monthlyRent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-6">
          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Cost Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track how leasing costs accumulate compared to loan payments
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(Math.abs(value))} labelFormatter={(label) => `Month ${label}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Cumulative Cost" stroke="#ef4444" strokeWidth={3} name="Lease Cost" />
                  <Line type="monotone" dataKey="Cumulative Alternative Cost" stroke="#3b82f6" strokeWidth={3} name="Loan Cost" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Annual Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Lease Payments" fill="#ef4444" name="Lease Payments" />
                  <Bar dataKey="Loan Payments (Alternative)" fill="#3b82f6" name="Loan Payments (Alternative)" />
                  <Bar dataKey="Operating Expenses" fill="#f97316" name="Operating Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Buy vs Lease Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Leasing Option</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Initial Payment:</span>
                  <span className="font-medium">{formatCurrency(initialPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Payments:</span>
                  <span className="font-medium">{formatCurrency(monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payments:</span>
                  <span className="font-medium">{formatCurrency(totalRentPaid)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className="text-green-600">{formatCurrency(totalCostOfLeasing)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Asset at end:</span>
                  <span>Return to lessor</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Buying Option</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Down Payment (20%):</span>
                  <span className="font-medium">{formatCurrency(downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Loan Payment:</span>
                  <span className="font-medium">{formatCurrency(monthlyLoanPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Loan Payments:</span>
                  <span className="font-medium">{formatCurrency(totalLoanPayments)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className="text-blue-600">{formatCurrency(totalCostOfBuying)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Asset at end:</span>
                  <span>You own it ({formatCurrency(residualValue)} value)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Savings Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Cost Difference:</span>
                  <span className={`text-2xl font-bold ${costSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {costSavings > 0 ? `Save ${formatCurrency(costSavings)}` : `Cost ${formatCurrency(Math.abs(costSavings))} more`}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {costSavings > 0 
                    ? "Leasing is cheaper than buying over the lease term"
                    : "Buying would be cheaper than leasing over the same period"
                  }
                </div>
                <div className="bg-muted p-4 rounded">
                  <p className="text-sm">
                    <strong>Note:</strong> This comparison doesn't include the residual value you would own after buying. 
                    If you bought the asset, you would own an asset worth approximately {formatCurrency(residualValue)} at the end of the term.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          {/* Revenue Control */}
          <Card>
            <CardHeader>
              <CardTitle>Business Revenue Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze profitability if using the leased asset for business purposes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Revenue:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={monthlyRevenue}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          setMonthlyRevenue(isNaN(newValue) ? 0 : newValue);
                        }}
                        className="w-24 px-2 py-1 text-sm border rounded text-right"
                        step="100"
                      />
                      <span className="text-sm text-muted-foreground">$</span>
                    </div>
                  </div>
                  <Slider
                    value={[monthlyRevenue]}
                    onValueChange={handleRevenueChange}
                    min={0}
                    max={breakEvenRevenue * 3}
                    step={100}
                    className="w-full"
                  />
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

          {/* Business Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Break-Even Revenue</CardTitle>
                <p className="text-sm text-muted-foreground">Minimum revenue needed</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(breakEvenRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Net Income</CardTitle>
                <p className="text-sm text-muted-foreground">Over lease term</p>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalNetIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ROI</CardTitle>
                <p className="text-sm text-muted-foreground">Return on initial investment</p>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi === Infinity ? '∞%' : formatPercentage(roi)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Business Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Income</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Revenue:</span>
                      <span className="font-medium">{formatCurrency(monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(monthlyRevenue * leasingInputs.lease_term_months)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Expenses</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Lease:</span>
                      <span className="font-medium">{formatCurrency(monthlyRent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Operations:</span>
                      <span className="font-medium">{formatCurrency(businessParams.monthlyExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Lease Payments:</span>
                      <span className="font-medium">{formatCurrency(totalRentPaid)}</span>
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
