import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { FileDown } from "lucide-react";
import { 
  formatCurrency, 
  formatDate, 
  groupPaymentsByYear,
  PaymentScheduleEntry,
  InvestorReturn
} from "@/lib/finance";

interface SummaryTabProps {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  startDate: Date;
  endDate: Date;
  investors: InvestorReturn[];
  paymentSchedule: PaymentScheduleEntry[];
  onExport: () => void;
}

export function SummaryTab({
  loanAmount,
  interestRate,
  termMonths,
  monthlyPayment,
  totalInterest,
  startDate,
  endDate,
  investors,
  paymentSchedule,
  onExport
}: SummaryTabProps) {
  // Prepare data for the investment distribution chart
  const investmentData = investors.map(investor => ({
    name: investor.name,
    value: investor.investmentAmount
  }));
  
  // Colors for the charts
  const COLORS = ['#1a56db', '#0694a2', '#047857', '#9333ea', '#db2777', '#dc2626'];
  
  // Prepare data for principal vs interest chart
  const yearlyData = groupPaymentsByYear(paymentSchedule);
  
  // Calculate average investment
  const avgInvestment = investors.length > 0
    ? loanAmount / investors.length
    : 0;
  
  // Format tooltip for the pie chart
  const renderCustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-neutral-lighter shadow-sm rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">
            {((data.value / loanAmount) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow">
        <CardHeader className="border-b border-neutral-lighter px-6 py-4">
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Loan Amount</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(loanAmount)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Interest Rate</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {interestRate.toFixed(2)}%
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Loan Term</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {termMonths} months
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Monthly Payment</dt>
              <dd className="mt-1 text-lg font-semibold text-green-600">
                {formatCurrency(monthlyPayment)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Total Interest</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">
                {formatCurrency(totalInterest)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Total Payments</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(loanAmount + totalInterest)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatDate(startDate)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatDate(endDate)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardHeader className="border-b border-neutral-lighter px-6 py-4">
          <CardTitle>Investment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {investmentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={renderCustomPieTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-neutral-lighter pt-4">
            <dl className="grid grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-muted-foreground">Total Investment</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(loanAmount)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-muted-foreground">Number of Investors</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  {investors.length}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-muted-foreground">Avg. Investment</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(avgInvestment)}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow lg:col-span-2">
        <CardHeader className="border-b border-neutral-lighter px-6 py-4">
          <CardTitle>Principal vs Interest Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)} 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb' 
                  }}
                />
                <Legend />
                <Bar dataKey="principal" stackId="a" name="Principal" fill="#1a56db" />
                <Bar dataKey="interest" stackId="a" name="Interest" fill="#0694a2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-center mt-4">
        <Button 
          onClick={onExport} 
          className="px-6 py-3"
        >
          <FileDown className="h-5 w-5 mr-2" />
          Export Summary Report
        </Button>
      </div>
    </div>
  );
}
