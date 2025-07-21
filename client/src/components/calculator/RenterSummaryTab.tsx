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

  // Initialize monthlyRevenue with break-even if it's currently 0 or below break-even
  React.useEffect(() => {
    if (safeMonthlyRevenue === 0 || safeMonthlyRevenue < breakEvenRevenue) {
      setMonthlyRevenue(breakEvenRevenue);
    }
  }, [breakEvenRevenue, safeMonthlyRevenue, setMonthlyRevenue]);

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
  const totalRevenue = safeMonthlyRevenue * safeTermMonths;

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

  // Calculate TIR (IRR) - Internal Rate of Return
  const calculateTIR = () => {
    // Create cash flow array starting with negative down payment (initial investment)
    const cashFlows = [-initialInvestment];
    
    // Add monthly net cash flows for each month of the loan term
    for (let i = 0; i < safeTermMonths; i++) {
      cashFlows.push(netMonthlyCashFlow);
    }
    
    // Add residual value to the last cash flow
    if (cashFlows.length > 1) {
      cashFlows[cashFlows.length - 1] += residualValue;
    }
    
    // Calculate monthly TIR using the IRR function
    const monthlyTIR = calculateIRR(initialInvestment, cashFlows.slice(1));
    
    // Convert to annual rate: (1 + monthly_rate)^12 - 1
    const annualTIR = isNaN(monthlyTIR) ? 0 : (Math.pow(1 + monthlyTIR, 12) - 1) * 100;
    
    return annualTIR;
  };

  const tirValue = calculateTIR();

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
              {isNaN(npv) || npv === Infinity ? formatDollarAmount(0) : formatDollarAmount(npv)}
            </div>
            {(isNaN(npv) || npv === Infinity || initialInvestment === 0) && (
              <div className="text-sm text-muted-foreground mt-2">
                No initial investment
              </div>
            )}
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
            <p className="text-sm text-muted-foreground">Gross income over {termMonths} months</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatDollarAmount(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Monthly revenue over loan term
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

        {/* TIR (Internal Rate of Return) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">TIR (Internal Rate of Return)</CardTitle>
            <p className="text-sm text-muted-foreground">Annual return rate considering all cash flows</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tirValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isNaN(tirValue) || tirValue === Infinity ? '0.00' : tirValue.toFixed(2)}%
            </div>
            {(isNaN(tirValue) || tirValue === Infinity || initialInvestment === 0) && (
              <div className="text-sm text-muted-foreground mt-2">
                No initial investment
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

      {/* Total Revenue with Residual Value */}
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Total Revenue with Residual Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total Operational Revenue:</span>
              <span className="font-medium">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Residual Value at Loan End:</span>
              <span className="font-medium">{formatCurrency(residualValue)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Total Revenue (Including Residual):</span>
              <span className="font-bold text-green-600">{formatCurrency(totalRevenue + residualValue)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * The residual value represents the estimated asset value at the end of the loan term 
              ({(safeResidualValueRate * 100).toFixed(0)}% of original asset cost).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}