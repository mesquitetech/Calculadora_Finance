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

// Se añade la propiedad 'payment' a la interfaz para que el componente sepa que existe.
interface PaymentScheduleEntry {
  paymentNumber: number;
  payment: number;
}

interface InvestorReturnsTabProps {
  investorReturns: InvestorReturn[];
  paymentSchedule: PaymentScheduleEntry[];
}

export function InvestorReturnsTab({
  investorReturns,
  paymentSchedule
}: InvestorReturnsTabProps) {

  // Lógica para el gráfico de comparación inferior.
  const comparisonData = paymentSchedule.map((payment, index) => {
    const dataPoint: any = {
      period: `Period ${payment.paymentNumber}`,
      paymentNumber: payment.paymentNumber,
    };

    investorReturns.forEach(investor => {
      // Usar valores por defecto para evitar NaN.
      dataPoint[investor.name] = (payment.payment || 0) * (investor.share || 0);
    });

    return dataPoint;
  });

  // Función para obtener una muestra de los índices para los gráficos.
  const getSampleIndices = (total: number) => {
    if (total <= 12) {
        return Array.from({ length: total }, (_, i) => i);
    }
    const samples = [];
    const interval = Math.max(1, Math.floor(total / 11));
    for (let i = 0; i < total; i += interval) {
      samples.push(i);
    }
    if (samples[samples.length - 1] < total - 1) {
      samples.push(total - 1);
    }
    return samples;
  };

  const sampleIndices = getSampleIndices(paymentSchedule.length);

  // Lógica para preparar los datos de retorno acumulado.
  const prepareInvestorCumulativeData = (investor: InvestorReturn) => {
    // Asegurarse de que monthlyReturns es un array.
    if (!Array.isArray(investor.monthlyReturns)) return [];

    const fullCumulativeData = investor.monthlyReturns.map((_, i) => {
      const cumulative = investor.monthlyReturns.slice(0, i + 1).reduce((sum, val) => sum + (val || 0), 0);
      return {
        period: `Period ${paymentSchedule[i]?.paymentNumber}`,
        return: investor.monthlyReturns[i] || 0,
        cumulativeReturn: cumulative,
      };
    });

    return sampleIndices.map(index => fullCumulativeData[index]);
  };

  // Custom tooltip formatter for charts
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {investorReturns.map(investor => {
          // --- INICIO DE LA CORRECCIÓN ---
          // 1. Recalcular los valores clave dentro del componente para asegurar que no sean NaN.
          const safeMonthlyReturns = Array.isArray(investor.monthlyReturns) ? investor.monthlyReturns : [];
          const totalInterest = safeMonthlyReturns.reduce((sum, r) => sum + (r || 0), 0);
          const investmentAmount = investor.investmentAmount || 0;
          const totalReturn = investmentAmount + totalInterest;
          const roi = investmentAmount > 0 ? (totalInterest / investmentAmount) * 100 : 0;
          const share = investor.share || 0;

          const investorData = prepareInvestorCumulativeData(investor);
          // --- FIN DE LA CORRECCIÓN ---

          return (
            <Card key={investor.investorId} className="shadow">
              <CardHeader className="border-b border-neutral-lighter px-6 py-4">
                <CardTitle className="text-lg">{investor.name || 'Unnamed Investor'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {/* 2. Usar los valores seguros calculados. */}
                  {formatPercentage(share * 100)} Investment Share
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(investmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(totalReturn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Interest</p>
                    <p className="text-base font-medium text-primary">{formatCurrency(totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-base font-medium">
                      {`${roi.toFixed(2)}%`}
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
                        dataKey="period"
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
          <CardTitle>Periodic Returns by Investor</CardTitle>
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
                  dataKey="period"
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
