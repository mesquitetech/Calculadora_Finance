import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency } from "@/lib/finance";

interface RenterCashFlowTabProps {
  loanAmount: number;
  monthlyPayment: number;
  termMonths: number;
  otherExpenses: number;
  monthlyRevenue: number;
  setMonthlyRevenue: (value: number) => void;
}

export function RenterCashFlowTab({
  loanAmount,
  monthlyPayment,
  termMonths,
  otherExpenses,
  monthlyRevenue,
  setMonthlyRevenue
}: RenterCashFlowTabProps) {
  
  // Validate and sanitize all input values
  const safeLoanAmount = typeof loanAmount === 'number' && !isNaN(loanAmount) ? loanAmount : 0;
  const safeMonthlyPayment = typeof monthlyPayment === 'number' && !isNaN(monthlyPayment) ? monthlyPayment : 0;
  const safeTermMonths = typeof termMonths === 'number' && !isNaN(termMonths) ? termMonths : 60;
  const safeOtherExpenses = typeof otherExpenses === 'number' && !isNaN(otherExpenses) ? otherExpenses : 0;
  const safeMonthlyRevenue = typeof monthlyRevenue === 'number' && !isNaN(monthlyRevenue) ? monthlyRevenue : 0;
  
  // Calculate break-even point (minimum revenue to cover expenses)
  const breakEvenRevenue = safeMonthlyPayment + safeOtherExpenses;

  // Initialize monthlyRevenue with break-even only if it's currently 0
  React.useEffect(() => {
    if (safeMonthlyRevenue === 0) {
      setMonthlyRevenue(breakEvenRevenue);
    }
  }, [breakEvenRevenue, safeMonthlyRevenue, setMonthlyRevenue]);
  
  // Calculate monthly cash flow
  const netMonthlyCashFlow = safeMonthlyRevenue - safeMonthlyPayment - safeOtherExpenses;

  const handleRevenueChange = (value: number[]) => {
    const newValue = typeof value[0] === 'number' && !isNaN(value[0]) ? value[0] : 0;
    setMonthlyRevenue(newValue);
  };
  
  // Generate monthly cash flow data for the chart
  const cashFlowData = Array.from({ length: safeTermMonths }, (_, index) => {
    const month = index + 1;
    return {
      month: month,
      revenue: safeMonthlyRevenue,
      loanPayment: safeMonthlyPayment,
      expenses: safeOtherExpenses,
      netCashFlow: netMonthlyCashFlow,
      cumulativeCashFlow: netMonthlyCashFlow * month
    };
  });

  // Aggregate data by year for annual view
  const yearlyData = [];
  for (let year = 1; year <= Math.ceil(safeTermMonths / 12); year++) {
    const monthsInYear = Math.min(12, safeTermMonths - (year - 1) * 12);
    yearlyData.push({
      year: year,
      revenue: safeMonthlyRevenue * monthsInYear,
      loanPayment: safeMonthlyPayment * monthsInYear,
      expenses: safeOtherExpenses * monthsInYear,
      netCashFlow: netMonthlyCashFlow * monthsInYear
    });
  }

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
                        // Allow free editing while typing
                        const newValue = Number(e.target.value);
                        setMonthlyRevenue(isNaN(newValue) ? 0 : newValue);
                      }}
                      onBlur={(e) => {
                        // Validate only that it's not negative
                        const newValue = Number(e.target.value);
                        if (isNaN(newValue) || newValue < 0) {
                          setMonthlyRevenue(0);
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
                    value={[safeMonthlyRevenue]}
                    onValueChange={handleRevenueChange}
                    min={0}
                    max={50000}
                    step={100}
                    className="w-full opacity-70"
                  />
                  {/* Breakeven marker */}
                  <div 
                    className="absolute top-0 w-0.5 h-6 bg-orange-500 pointer-events-none"
                    style={{
                      left: `${(breakEvenRevenue / 50000) * 100}%`,
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
                  <span>$50,000</span>
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
      
      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(safeMonthlyRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Loan Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(safeMonthlyPayment)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(safeOtherExpenses)}
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
          <p className="text-sm text-muted-foreground">
            Yearly comparison of revenue, expenses, and net cash flow
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                tickFormatter={(value) => `Year ${value}`}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Year ${label}`}
              />
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
          <p className="text-sm text-muted-foreground">
            Track how your cumulative cash flow grows over the loan term
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => `Month ${value}`}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeCashFlow" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Cumulative Cash Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Cash Flow Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed view of monthly cash flow components
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Component</th>
                  <th className="text-right p-2">Monthly Amount</th>
                  <th className="text-right p-2">Annual Amount</th>
                  <th className="text-right p-2">Total (Loan Term)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium text-green-600">Revenue</td>
                  <td className="p-2 text-right">{formatCurrency(safeMonthlyRevenue)}</td>
                  <td className="p-2 text-right">{formatCurrency(safeMonthlyRevenue * 12)}</td>
                  <td className="p-2 text-right">{formatCurrency(safeMonthlyRevenue * safeTermMonths)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium text-red-600">Loan Payment</td>
                  <td className="p-2 text-right">-{formatCurrency(safeMonthlyPayment)}</td>
                  <td className="p-2 text-right">-{formatCurrency(safeMonthlyPayment * 12)}</td>
                  <td className="p-2 text-right">-{formatCurrency(safeMonthlyPayment * safeTermMonths)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium text-orange-600">Operating Expenses</td>
                  <td className="p-2 text-right">-{formatCurrency(safeOtherExpenses)}</td>
                  <td className="p-2 text-right">-{formatCurrency(safeOtherExpenses * 12)}</td>
                  <td className="p-2 text-right">-{formatCurrency(safeOtherExpenses * safeTermMonths)}</td>
                </tr>
                <tr className="border-b bg-muted/50">
                  <td className="p-2 font-bold">Net Cash Flow</td>
                  <td className={`p-2 text-right font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netMonthlyCashFlow)}
                  </td>
                  <td className={`p-2 text-right font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netMonthlyCashFlow * 12)}
                  </td>
                  <td className={`p-2 text-right font-bold ${netMonthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netMonthlyCashFlow * termMonths)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}