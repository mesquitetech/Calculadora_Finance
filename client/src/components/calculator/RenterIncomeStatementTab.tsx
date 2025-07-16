import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/finance";

interface RenterIncomeStatementTabProps {
  loanAmount: number;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number;
  otherExpenses: number;
  monthlyRevenue: number;
  setMonthlyRevenue: (value: number) => void;
  assetCost: number;
  discountRate?: number;
  residualValueRate?: number;
}

export function RenterIncomeStatementTab({
  loanAmount,
  monthlyPayment,
  termMonths,
  interestRate,
  otherExpenses,
  monthlyRevenue,
  setMonthlyRevenue,
  assetCost,
  discountRate = 0.04,
  residualValueRate = 0.15
}: RenterIncomeStatementTabProps) {
  
  // Calculate break-even point and handler
  const breakEvenRevenue = monthlyPayment + otherExpenses;
  const netMonthlyCashFlow = monthlyRevenue - monthlyPayment - otherExpenses;

  const handleRevenueChange = (value: number[]) => {
    setMonthlyRevenue(value[0]);
  };

  // Calculate annual figures
  const annualRevenue = monthlyRevenue * 12;
  const annualOperatingExpenses = otherExpenses * 12;
  const annualLoanPayments = monthlyPayment * 12;
  
  // For simplification, assume interest portion is roughly 80% of payment in early years
  // In a real application, you'd calculate this more precisely using an amortization schedule
  const annualInterestExpense = annualLoanPayments * 0.8;
  const annualPrincipalPayment = annualLoanPayments * 0.2;
  
  // Calculate depreciation (assuming 27.5 year straight-line for rental property)
  const annualDepreciation = assetCost / 27.5;
  
  // Calculate profit/loss figures
  const grossProfit = annualRevenue;
  const totalOperatingExpenses = annualOperatingExpenses;
  const ebitda = grossProfit - totalOperatingExpenses;
  const ebit = ebitda - annualDepreciation;
  const ebt = ebit - annualInterestExpense; // Earnings Before Tax
  
  // Simplified tax calculation (assume 25% rate)
  const taxRate = 0.25;
  const taxes = Math.max(0, ebt * taxRate);
  const netIncome = ebt - taxes;
  
  // Calculate margins
  const grossMargin = annualRevenue > 0 ? (grossProfit / annualRevenue) * 100 : 0;
  const operatingMargin = annualRevenue > 0 ? (ebit / annualRevenue) * 100 : 0;
  const netMargin = annualRevenue > 0 ? (netIncome / annualRevenue) * 100 : 0;

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
    <div className="space-y-6 p-6">
      
      {/* Interactive Revenue Control - Fixed Position */}
      <div className="sticky top-4 z-10 mb-6">
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
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-sm border rounded text-right"
                      min="0"
                      step="100"
                    />
                    <span className="text-sm text-muted-foreground">$</span>
                  </div>
                </div>
                <div className="relative">
                  <Slider
                    value={[monthlyRevenue]}
                    onValueChange={handleRevenueChange}
                    min={0}
                    max={breakEvenRevenue * 3}
                    step={100}
                    className="w-full opacity-70"
                  />
                  {/* Breakeven marker */}
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
                  <span>{formatCurrency(breakEvenRevenue * 3)}</span>
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
      </div>
      
      {/* Income Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Annual Income Statement (Profit & Loss)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Professional P&L statement showing all revenue, expenses, and profitability
          </p>
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
                <span className="text-green-600">{formatValue(grossProfit)}</span>
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
                <span className="text-red-600">{formatValue(totalOperatingExpenses, true)}</span>
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
              <p className="text-xs text-muted-foreground">
                Earnings Before Interest, Taxes, Depreciation, and Amortization
              </p>
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
              <p className="text-xs text-muted-foreground">
                Earnings Before Interest and Taxes
              </p>
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
              <p className="text-xs text-muted-foreground">
                Earnings Before Taxes
              </p>
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
              <p className="text-sm text-muted-foreground mt-1">
                After all expenses, depreciation, interest, and taxes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios and Margins */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gross Margin</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue efficiency</p>
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
            <p className="text-sm text-muted-foreground">Operating efficiency</p>
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
            <p className="text-sm text-muted-foreground">Overall profitability</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(netMargin)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Cash Flow Components</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual Loan Payment:</span>
                  <span className="font-medium">{formatCurrency(annualLoanPayments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Principal Payment:</span>
                  <span className="font-medium">{formatCurrency(annualPrincipalPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>- Interest Payment:</span>
                  <span className="font-medium">{formatCurrency(annualInterestExpense)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Monthly Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Net Income:</span>
                  <span className="font-medium">{formatCurrency(netIncome / 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Cash Flow:</span>
                  <span className="font-medium">{formatCurrency((netIncome + annualDepreciation) / 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Depreciation:</span>
                  <span className="font-medium">{formatCurrency(annualDepreciation / 12)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}