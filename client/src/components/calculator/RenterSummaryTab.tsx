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
}

export function RenterSummaryTab({
  loanAmount,
  monthlyPayment,
  termMonths,
  interestRate,
  otherExpenses,
  monthlyRevenue,
  setMonthlyRevenue,
  assetCost
}: RenterSummaryTabProps) {
  
  // Calculate break-even point (minimum revenue to cover expenses)
  const breakEvenRevenue = monthlyPayment + otherExpenses;
  
  // Calculate net monthly cash flow
  const netMonthlyCashFlow = monthlyRevenue - monthlyPayment - otherExpenses;
  
  // Calculate total expenses over loan term
  const totalLoanPayments = monthlyPayment * termMonths;
  const totalOperatingExpenses = otherExpenses * termMonths;
  const totalRevenue = monthlyRevenue * termMonths;
  
  // Calculate financial metrics
  const initialInvestment = assetCost - loanAmount; // Down payment
  const annualCashFlow = netMonthlyCashFlow * 12;
  
  // Generate cash flows for IRR calculation (simple annual cash flows)
  const cashFlows = Array(Math.ceil(termMonths / 12)).fill(annualCashFlow);
  
  // Calculate NPV (using 7.5% discount rate as suggested)
  const discountRate = 0.075;
  const npv = calculateNPV(initialInvestment, cashFlows, discountRate);
  
  // Calculate IRR
  const irr = calculateIRR(-initialInvestment, cashFlows);
  
  // Calculate payback period (in months)
  const paybackPeriod = initialInvestment > 0 ? initialInvestment / Math.max(netMonthlyCashFlow, 1) : 0;
  
  // Calculate total return over loan term
  const totalNetIncome = netMonthlyCashFlow * termMonths;
  const roi = initialInvestment > 0 ? (totalNetIncome / initialInvestment) * 100 : 0;

  const handleRevenueChange = (value: number[]) => {
    setMonthlyRevenue(value[0]);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Interactive Revenue Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Monthly Revenue Control</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Adjust the slider to see how different revenue levels affect your investment returns
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Revenue:</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(monthlyRevenue)}</span>
            </div>
            <Slider
              value={[monthlyRevenue]}
              onValueChange={handleRevenueChange}
              min={0}
              max={breakEvenRevenue * 3} // Allow up to 3x break-even
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span className="text-orange-600 font-medium">
                Break-even: {formatCurrency(breakEvenRevenue)}
              </span>
              <span>{formatCurrency(breakEvenRevenue * 3)}</span>
            </div>
          </div>
          
          {/* Cash Flow Indicator */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Net Monthly Cash Flow</p>
              <p className={`text-2xl font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netMonthlyCashFlow)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
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
            <p className="text-sm text-muted-foreground">At 7.5% discount rate</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatDollarAmount(npv)}
            </div>
          </CardContent>
        </Card>

        {/* Internal Rate of Return */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Internal Rate of Return (IRR)</CardTitle>
            <p className="text-sm text-muted-foreground">Annual return rate</p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${irr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(irr * 100)}
            </div>
          </CardContent>
        </Card>

        {/* Payback Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payback Period</CardTitle>
            <p className="text-sm text-muted-foreground">Time to recover investment</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {paybackPeriod > 0 ? `${Math.ceil(paybackPeriod)} months` : 'Never'}
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
              {formatPercentage(roi)}
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