import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { InvestorReturn, formatCurrency, formatPercentage } from "@/lib/finance";

interface PaymentScheduleEntry {
  paymentNumber: number;
  // Add other properties if needed
}

interface InvestorReturnsTabProps {
  investorReturns: InvestorReturn[];
  paymentSchedule: PaymentScheduleEntry[];
}

export function InvestorReturnsTab({ 
  investorReturns,
  paymentSchedule
}: InvestorReturnsTabProps) {
  // Prepare data for the comparison chart
  const comparisonData = paymentSchedule.map((payment, index) => {
    const dataPoint: any = {
      month: `Month ${index + 1}`,
      paymentNumber: payment.paymentNumber,
    };

    investorReturns.forEach(investor => {
      dataPoint[investor.name] = investor.monthlyReturns[index] || 0;
    });

    return dataPoint;
  });

  // Get sample months for the investor charts (to avoid overcrowding)
  const getSampleMonths = (total: number) => {
    const samples = [];
    const interval = Math.max(1, Math.floor(total / 6));

    for (let i = 0; i < total; i += interval) {
      samples.push(i);
    }

    // Always include the last month
    if (samples.length > 0 && samples[samples.length - 1] !== total - 1) {
      samples.push(total - 1);
    }

    return samples;
  };

  const sampleIndices = getSampleMonths(paymentSchedule.length);

  // Prepare cumulative return data for each investor
  const prepareInvestorCumulativeData = (investor: InvestorReturn) => {
    let cumulativeReturn = 0;

    return sampleIndices.map(index => {
      cumulativeReturn += investor.monthlyReturns[index] || 0;
      return {
        month: `Month ${paymentSchedule[index]?.paymentNumber}`,
        return: investor.monthlyReturns[index] || 0,
        cumulativeReturn,
      };
    });
  };

  // Custom tooltip formatter for charts
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {investorReturns.map(investor => {
          const investorData = prepareInvestorCumulativeData(investor);

          return (
            <Card key={investor.investorId} className="shadow">
              <CardHeader className="border-b border-neutral-lighter px-6 py-4">
                <CardTitle className="text-lg">{investor.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(investor.share * 100)} Investment Share
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(investor.investmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(investor.totalReturn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-base font-medium text-primary">{formatCurrency(investor.totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    {/* CORRECCIÓN: Se añade una comprobación para asegurar que 'investor.roi' es un número antes de llamar a .toFixed() */}
                    <p className="text-base font-medium">
                      {typeof investor.roi === 'number' ? `${investor.roi.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={investorData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="month" 
                        fontSize={10} 
                        tick={{ fill: '#6b7280' }} 
                      />
                      <YAxis 
                        fontSize={10} 
                        tick={{ fill: '#6b7280' }} 
                        tickFormatter={formatTooltipValue} 
                      />
                      <Tooltip formatter={formatTooltipValue} />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeReturn" 
                        name="Cumulative Return" 
                        stroke="#1a56db" 
                        fill="rgba(26, 86, 219, 0.1)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow">
        <CardHeader className="border-b border-neutral-lighter px-6 py-4">
          <CardTitle>Monthly Returns by Investor</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  fontSize={11}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  tickFormatter={formatTooltipValue} 
                  fontSize={11}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  formatter={formatTooltipValue} 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb' 
                  }}
                />
                <Legend />
                {investorReturns.map((investor, index) => {
                  const colors = ['#1a56db', '#0694a2', '#047857', '#9333ea', '#db2777'];
                  return (
                    <Line
                      key={investor.investorId}
                      type="monotone"
                      dataKey={investor.name}
                      stroke={colors[index % colors.length]}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}