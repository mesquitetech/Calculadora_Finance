import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatPercentage } from "@/lib/finance";
import { 
  calculateNPV, 
  calculateIRR, 
  calculatePaybackPeriod,
  formatDollarAmount 
} from "@/lib/financialMetrics";

interface RenterSummaryTabProps {
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

export function RenterSummaryTab({
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
}: RenterSummaryTabProps) {
  
  // Validate and sanitize all input values
  const safeLoanAmount = typeof loanAmount === 'number' && !isNaN(loanAmount) ? loanAmount : 0;
  const safeMonthlyPayment = typeof monthlyPayment === 'number' && !isNaN(monthlyPayment) ? monthlyPayment : 0;
  const safeTermMonths = typeof termMonths === 'number' && !isNaN(termMonths) ? termMonths : 60;
  const safeInterestRate = typeof interestRate === 'number' && !isNaN(interestRate) ? interestRate : 0;
  const safeOtherExpenses = typeof otherExpenses === 'number' && !isNaN(otherExpenses) ? otherExpenses : 0;
  const safeMonthlyRevenue = typeof monthlyRevenue === 'number' && !isNaN(monthlyRevenue) ? monthlyRevenue : 0;
  const safeAssetCost = typeof assetCost === 'number' && !isNaN(assetCost) ? assetCost : 0;
  const safeDiscountRate = typeof discountRate === 'number' && !isNaN(discountRate) ? discountRate : 0.04;
  const safeResidualValueRate = typeof residualValueRate === 'number' && !isNaN(residualValueRate) ? residualValueRate : 0.15;
  
  // Calculate break-even point (minimum revenue to cover expenses)
  const breakEvenRevenue = safeMonthlyPayment + safeOtherExpenses;
  
  // Calculate net monthly cash flow
  const netMonthlyCashFlow = safeMonthlyRevenue - safeMonthlyPayment - safeOtherExpenses;
  
  // Calculate financial metrics
  const initialInvestment = safeAssetCost - safeLoanAmount; // Down payment
  const totalAssetCost = safeAssetCost; // Total cost of the asset (including down payment)
  const annualCashFlow = netMonthlyCashFlow * 12;
  
  // Calculate residual value at end of loan term
  const residualValue = safeAssetCost * safeResidualValueRate;
  
  // Calculate total expenses over loan term
  const totalLoanPayments = safeMonthlyPayment * safeTermMonths;
  const totalOperatingExpenses = safeOtherExpenses * safeTermMonths;
  const totalRevenue = (safeMonthlyRevenue * safeTermMonths) + residualValue;
  
  // Generate cash flows for IRR calculation (including residual value in final year)
  const numYears = Math.ceil(safeTermMonths / 12);
  const cashFlows = Array(numYears).fill(annualCashFlow);
  if (cashFlows.length > 0) {
    cashFlows[cashFlows.length - 1] += residualValue; // Add residual value to final year
  }
  
  // Calculate NPV using configurable discount rate (based on down payment)
  const npv = calculateNPV(initialInvestment, cashFlows, safeDiscountRate);
  
  // Calculate IRR (based on down payment)
  const irr = calculateIRR(-initialInvestment, cashFlows);
  
  // Calculate payback period based on total asset cost and positive monthly cash flow
  const paybackPeriod = netMonthlyCashFlow > 0 
    ? totalAssetCost / netMonthlyCashFlow 
    : Infinity; // Negative cash flow means never recovers
  
  // Calculate total return over loan term
  const totalNetIncome = netMonthlyCashFlow * safeTermMonths;
  const roi = initialInvestment > 0 ? (totalNetIncome / initialInvestment) * 100 : 
    (totalNetIncome > 0 ? Infinity : 0); // Infinite ROI when no initial investment but positive returns

  const handleRevenueChange = (value: number[]) => {
    const newValue = typeof value[0] === 'number' && !isNaN(value[0]) ? value[0] : 0;
    setMonthlyRevenue(newValue);
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
                      value={safeMonthlyRevenue}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        setMonthlyRevenue(isNaN(newValue) ? 0 : newValue);
                      }}
                      className="w-24 px-2 py-1 text-sm border rounded text-right"
                      min="0"
                      step="100"
                    />
                    <span className="text-sm text-muted-foreground">$</span>
                  </div>
                </div>
                <div className="relative">
                  <Slider
                    value={[safeMonthlyRevenue]}
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

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 [&>*]:transition-none [&>*]:transform-none">
        
        {/* Initial Investment */}
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

        {/* Net Present Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Net Present Value (NPV)</CardTitle>
            <p className="text-sm text-muted-foreground">At {(safeDiscountRate * 100).toFixed(1)}% discount rate</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatDollarAmount(npv)}
            </div>
          </CardContent>
        </Card>

        

        {/* Payback Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payback Period</CardTitle>
            <p className="text-sm text-muted-foreground">Time to recover total asset cost</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paybackPeriod === Infinity || paybackPeriod <= 0 
                ? 'Never' 
                : `${Math.ceil(paybackPeriod)} months`}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Time to recover total asset cost of {formatCurrency(totalAssetCost)}
            </div>
          </CardContent>
        </Card>

        {/* Total Available Income */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Revenue (Loan Term)</CardTitle>
            <p className="text-sm text-muted-foreground">Gross income over {termMonths} months + residual value</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatDollarAmount(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Includes {formatCurrency(residualValue)} residual value
            </div>
          </CardContent>
        </Card>

        {/* ROI */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Return on Investment (ROI)</CardTitle>
            <p className="text-sm text-muted-foreground">Total return percentage</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {roi === Infinity ? '∞%' : formatPercentage(roi)}
            </div>
            {roi === Infinity && (
              <div className="text-sm text-muted-foreground mt-2">
                Infinite ROI (no initial investment)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Residual Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Residual Value</CardTitle>
            <p className="text-sm text-muted-foreground">Asset value at loan end ({(safeResidualValueRate * 100).toFixed(0)}%)</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatDollarAmount(residualValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Income</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Income:</span>
                  <span className="font-medium">{formatCurrency(totalNetIncome)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Expenses</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Loan Payments:</span>
                  <span className="font-medium">{formatCurrency(totalLoanPayments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Operating Expenses:</span>
                  <span className="font-medium">{formatCurrency(totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}