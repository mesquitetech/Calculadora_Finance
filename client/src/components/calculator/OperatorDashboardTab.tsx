import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Calculator
} from "lucide-react";
import { 
  LineChart,
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
import { formatCurrency, formatPercentage, type OperatorResults } from '@/lib/finance';

interface OperatorDashboardTabProps {
  operatorResults: OperatorResults;
  onExportReport: () => void;
}

export function OperatorDashboardTab({
  operatorResults,
  onExportReport
}: OperatorDashboardTabProps) {

  // Early return if operatorMetrics is undefined
  if (!operatorResults) {
    return (
      <div className="p-4">
        <p>Loading operator metrics...</p>
      </div>
    );
  }

  // Calculate additional metrics for charts
  const monthlyNetCashFlow = operatorResults.clientBaseRent - operatorResults.monthlyPaymentToInvestors;

  // Generate cumulative cash flow data for charts
  const cumulativeCashFlowData = Array.from({ length: operatorResults.clientSchedule.length }, (_, i) => {
    const month = i + 1;
    const cumulativeFlow = monthlyNetCashFlow * month;
    const cumulativeNPV = operatorResults.netPresentValue * (month / operatorResults.clientSchedule.length);

    return {
      month,
      cumulativeFlow,
      cumulativeNPV
    };
  });

  const cumulativeNPVData = Array.from({ length: operatorResults.clientSchedule.length }, (_, i) => {
    const month = i + 1;
    const cumulativeNPV = operatorResults.netPresentValue * (month / operatorResults.clientSchedule.length);

    return {
      month,
      cumulativeNPV
    };
  });

  // Determine profitability status
  const isProfitable = operatorResults.netPresentValue > 0;
  const profitabilityScore = Math.max(0, Math.min(100, 
    (operatorResults.netPresentValue / Math.abs(operatorResults.netPresentValue || 1)) * 50 + 50
  ));

  return (
    <div className="space-y-6 p-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Operator Control Panel
          </h2>
          <p className="text-muted-foreground">Leasing project profitability and viability analysis</p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Present Value (NPV) */}
        <Card className={`border-l-4 ${operatorResults.netPresentValue >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Net Present Value (NPV)</p>
                <p className={`text-2xl font-bold ${operatorResults.netPresentValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(operatorResults.netPresentValue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {operatorResults.netPresentValue >= 0 ? 'PROFITABLE' : 'NOT PROFITABLE'}
                </p>
              </div>
              <div className="text-right">
                {operatorResults.netPresentValue >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal Rate of Return (IRR) */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Internal Rate of Return (IRR)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {operatorResults.internalRateOfReturn ? operatorResults.internalRateOfReturn.toFixed(2) + '%' : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Target: 6.00%</p>
              </div>
              <div className="text-right">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payback Period */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold text-purple-600">
                  {operatorResults.paybackPeriodMonths ? 
                    (operatorResults.paybackPeriodMonths >= 12 ? 
                      `${(operatorResults.paybackPeriodMonths / 12).toFixed(1)} years` : 
                      `${operatorResults.paybackPeriodMonths} months`) : 'N/A'}
                </p>
                <Progress value={Math.min(100, (operatorResults.paybackPeriodMonths / 60) * 100)} className="w-full h-2 mt-1" />
              </div>
              <div className="text-right">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Project Profit */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Project Profit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(operatorResults.totalProjectProfit)}
                </p>
                <p className="text-xs text-muted-foreground">Margin: 0.00%</p>
              </div>
              <div className="text-right">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Viability Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Project Viability Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-700">High-Risk Project</p>
                <p className="text-sm text-muted-foreground">
                  The project does not meet the minimum profitability criteria.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Profitability Score</p>
              <p className="text-2xl font-bold">NaN/100</p>
              <Progress value={profitabilityScore} className="w-24 h-2 mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-4">
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Net Monthly Cash Flow</div>
              <div className="text-lg font-semibold text-blue-600">{formatCurrency(monthlyNetCashFlow)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Expected Residual Value</div>
              <div className="text-lg font-semibold text-green-600">{formatCurrency(operatorResults.expectedResidualValue)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm text-muted-foreground">Monthly Payment to Investors</div>
              <div className="text-lg font-semibold text-purple-600">{formatCurrency(operatorResults.monthlyPaymentToInvestors)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Cumulative Cash Flow</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeCashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Month ${label}`} />
                <Legend />
                <Area type="monotone" dataKey="cumulativeFlow" stroke="#2563eb" fill="#dbeafe" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cumulative Net Present Value</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cumulativeNPVData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Month ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="cumulativeNPV" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}