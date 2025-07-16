import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency } from "@/lib/finance";

interface RenterCashFlowTabProps {
  loanAmount: number;
  monthlyPayment: number;
  termMonths: number;
  otherExpenses: number;
  monthlyRevenue: number;
}

export function RenterCashFlowTab({
  loanAmount,
  monthlyPayment,
  termMonths,
  otherExpenses,
  monthlyRevenue
}: RenterCashFlowTabProps) {
  
  // Calculate monthly cash flow
  const netMonthlyCashFlow = monthlyRevenue - monthlyPayment - otherExpenses;
  
  // Generate monthly cash flow data for the chart
  const cashFlowData = Array.from({ length: termMonths }, (_, index) => {
    const month = index + 1;
    return {
      month: month,
      revenue: monthlyRevenue,
      loanPayment: monthlyPayment,
      expenses: otherExpenses,
      netCashFlow: netMonthlyCashFlow,
      cumulativeCashFlow: netMonthlyCashFlow * month
    };
  });

  // Aggregate data by year for annual view
  const yearlyData = [];
  for (let year = 1; year <= Math.ceil(termMonths / 12); year++) {
    const monthsInYear = Math.min(12, termMonths - (year - 1) * 12);
    yearlyData.push({
      year: year,
      revenue: monthlyRevenue * monthsInYear,
      loanPayment: monthlyPayment * monthsInYear,
      expenses: otherExpenses * monthsInYear,
      netCashFlow: netMonthlyCashFlow * monthsInYear
    });
  }

  return (
    <div className="space-y-6 p-6">
      
      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Loan Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyPayment)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(otherExpenses)}
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
                  <td className="p-2 text-right">{formatCurrency(monthlyRevenue)}</td>
                  <td className="p-2 text-right">{formatCurrency(monthlyRevenue * 12)}</td>
                  <td className="p-2 text-right">{formatCurrency(monthlyRevenue * termMonths)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium text-red-600">Loan Payment</td>
                  <td className="p-2 text-right">-{formatCurrency(monthlyPayment)}</td>
                  <td className="p-2 text-right">-{formatCurrency(monthlyPayment * 12)}</td>
                  <td className="p-2 text-right">-{formatCurrency(monthlyPayment * termMonths)}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium text-orange-600">Operating Expenses</td>
                  <td className="p-2 text-right">-{formatCurrency(otherExpenses)}</td>
                  <td className="p-2 text-right">-{formatCurrency(otherExpenses * 12)}</td>
                  <td className="p-2 text-right">-{formatCurrency(otherExpenses * termMonths)}</td>
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