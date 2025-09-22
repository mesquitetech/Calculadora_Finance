
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calculator,
  FileText,
  PieChart,
  Building,
  Car,
  Shield,
  Percent,
  Users,
  Banknote
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
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
  
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/finance";

// Interfaces para tipos de datos
interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number;
  fixedMonthlyFee: number;
  adminCommissionPct: number;
  deliveryCosts: number;
  residualValueRate: number;
  discountRate: number;
  downPayment: number;
}

interface LoanParameters {
  loanName: string;
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: string;
}

interface PaymentScheduleEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface OperatorDashboardTabProps {
  businessParams: BusinessParameters;
  loanParams: LoanParameters;
  monthlyPayment: number;
  paymentSchedule: PaymentScheduleEntry[];
  onExportReport: () => void;
}

// Constantes
const IVA_RATE = 0.16;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function OperatorDashboardTab({
  businessParams,
  loanParams,
  monthlyPayment,
  paymentSchedule,
  onExportReport
}: OperatorDashboardTabProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // === CÁLCULOS PRINCIPALES ===
  const calculations = useMemo(() => {
    // 1. Cálculos básicos del activo
    const assetCostWithIva = businessParams.assetCost;
    const assetCostSansIva = assetCostWithIva / (1 + IVA_RATE);
    
    // 2. Cálculos de financiamiento y anticipo
    const downPaymentAmount = businessParams.downPayment;
    const financedAmount = loanParams.totalAmount;
    const downPaymentPercentage = (downPaymentAmount / assetCostWithIva) * 100;
    
    // 3. Valor residual y amortización
    const residualValue = assetCostSansIva * (businessParams.residualValueRate / 100);
    const amountToAmortize = assetCostSansIva - downPaymentAmount - residualValue;
    const monthlyAmortization = loanParams.termMonths > 0 ? amountToAmortize / loanParams.termMonths : 0;
    
    // 4. Cálculos de rentabilidad del operador
    const targetProfitMargin = assetCostSansIva * (businessParams.lessorProfitMarginPct / 100);
    const monthlyTargetProfit = targetProfitMargin / 12;
    const openingCommission = assetCostSansIva * (businessParams.adminCommissionPct / 100);
    
    // 5. Estructura de rentas
    const baseRent = monthlyAmortization + monthlyTargetProfit;
    const totalMonthlyRentSansIva = baseRent + businessParams.fixedMonthlyFee;
    const totalMonthlyRentWithIva = totalMonthlyRentSansIva * (1 + IVA_RATE);
    
    // 6. Análisis de márgenes del operador
    const monthlyOperatingMargin = totalMonthlyRentSansIva - monthlyPayment - businessParams.monthlyExpenses;
    const annualOperatingMargin = monthlyOperatingMargin * 12;
    const totalProjectProfit = (monthlyOperatingMargin * loanParams.termMonths) + residualValue + openingCommission;
    
    // 7. Análisis de flujos de efectivo
    const initialInvestment = businessParams.otherExpenses + businessParams.deliveryCosts + openingCommission;
    const paybackPeriod = monthlyOperatingMargin > 0 ? initialInvestment / monthlyOperatingMargin : Infinity;
    
    // 8. Cálculo de NPV
    const monthlyDiscountRate = businessParams.discountRate / 100 / 12;
    let npv = -initialInvestment;
    
    for (let month = 1; month <= loanParams.termMonths; month++) {
      const cashFlow = month === loanParams.termMonths 
        ? monthlyOperatingMargin + residualValue 
        : monthlyOperatingMargin;
      npv += cashFlow / Math.pow(1 + monthlyDiscountRate, month);
    }
    
    // 9. ROI y métricas de rentabilidad
    const roi = (totalProjectProfit / assetCostSansIva) * 100;
    const profitMarginPercentage = (monthlyOperatingMargin / totalMonthlyRentSansIva) * 100;
    const isViable = npv > 0 && monthlyOperatingMargin > 0;
    
    return {
      assetCostWithIva,
      assetCostSansIva,
      downPaymentAmount,
      financedAmount,
      downPaymentPercentage,
      residualValue,
      amountToAmortize,
      monthlyAmortization,
      targetProfitMargin,
      monthlyTargetProfit,
      openingCommission,
      baseRent,
      totalMonthlyRentSansIva,
      totalMonthlyRentWithIva,
      monthlyOperatingMargin,
      annualOperatingMargin,
      totalProjectProfit,
      initialInvestment,
      paybackPeriod,
      npv,
      roi,
      profitMarginPercentage,
      isViable
    };
  }, [businessParams, loanParams, monthlyPayment]);

  // === PREPARACIÓN DE DATOS PARA GRÁFICOS ===
  const chartData = useMemo(() => {
    // Flujo de efectivo mensual
    const cashFlowData = [];
    let cumulativeCashFlow = -calculations.initialInvestment;
    
    for (let month = 1; month <= loanParams.termMonths; month++) {
      const monthlyFlow = month === loanParams.termMonths 
        ? calculations.monthlyOperatingMargin + calculations.residualValue
        : calculations.monthlyOperatingMargin;
      
      cumulativeCashFlow += monthlyFlow;
     
      cashFlowData.push({
        month,
        flujoMensual: monthlyFlow,
        flujoAcumulado: cumulativeCashFlow,
        breakeven: cumulativeCashFlow >= 0 ? cumulativeCashFlow : 0
      });
    }

 
     const total = 
       calculations.baseRent + 
       businessParams.fixedMonthlyFee + 
       (calculations.openingCommission / loanParams.termMonths);

    // Distribución de ingresos
    const incomeDistribution = [
      { name: 'Renta Base', value: calculations.baseRent, percentage: (calculations.baseRent / total) * 100, color: '#0088FE' },
      { name: 'Gastos Admin', value: businessParams.fixedMonthlyFee, percentage: (businessParams.fixedMonthlyFee / total) * 100, color: '#00C49F' },
      { name: 'Comisión Inicial', value: calculations.openingCommission / loanParams.termMonths, percentage: ((calculations.openingCommission / loanParams.termMonths) / total) * 100, color: '#FFBB28' }
    ];
    //Calculo de porcentajes
    {/*const total_cost = monthlyPayment + businessParams.monthlyExpenses + (businessParams.otherExpenses / loanParams.termMonths)
    const pago_percen = Number(((monthlyPayment*100)/(total_cost)).toFixed(2))
    const gastos_percen = Number((businessParams.monthlyExpenses*100)/ total_cost).toFixed(2)
    const otros_percen = Number((businessParams.otherExpenses / loanParams.termMonths)*100 / total_cost).toFixed(2)
    // Distribución de costos
    const costDistribution = [
      { name: 'Pago Inversionistas', value: monthlyPayment, percentage:pago_percen, color: '#FF8042' },
      { name: 'Gastos Operativos', value: businessParams.monthlyExpenses, percentage:gastos_percen, color: '#8884D8' },
      { name: 'Otros Gastos', value: businessParams.otherExpenses / loanParams.termMonths,percentage:otros_percen, color: '#82CA9D' }
    ];*/}
    
    // Proyección anual
    const annualData = [];
    const totalYears = Math.ceil(loanParams.termMonths / 12);
    
    for (let year = 1; year <= totalYears; year++) {
      const monthsInYear = Math.min(12, loanParams.termMonths - (year - 1) * 12);
      const yearlyFlow = calculations.monthlyOperatingMargin * monthsInYear;
      const isLastYear = year === totalYears;
      const totalYearFlow = isLastYear ? yearlyFlow + calculations.residualValue : yearlyFlow;
      
      annualData.push({
        año: `Año ${year}`,
        flujoOperativo: yearlyFlow,
        flujoTotal: totalYearFlow,
        margenPromedio: yearlyFlow / monthsInYear
      });
    }
    
    return {
      cashFlowData,
      incomeDistribution,
      //costDistribution,
      annualData
    };
  }, [calculations, loanParams, monthlyPayment, businessParams]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            Panel del Operador
          </h2>
          <p className="text-muted-foreground mt-1">
            Análisis completo de rentabilidad del negocio de arrendamiento
          </p>
        </div>
        <Button onClick={onExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${calculations.npv > 0 ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Presente Neto</CardTitle>
            {calculations.npv > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculations.npv > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculations.npv)}
            </div>
            <Badge variant={calculations.npv > 0 ? "default" : "destructive"} className="text-xs mt-1">
              {calculations.isViable ? "RENTABLE" : "ALTO RIESGO"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Mensual</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculations.monthlyOperatingMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculations.monthlyOperatingMargin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(calculations.profitMarginPercentage)} de margen
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retorno de Inversión</CardTitle>
            <Target className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage(calculations.roi)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ROI del proyecto completo
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período de Retorno</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isFinite(calculations.paybackPeriod) 
                ? `${calculations.paybackPeriod.toFixed(1)} meses`
                : 'N/A'
              }
            </div>
            <Progress 
              value={isFinite(calculations.paybackPeriod) 
                ? Math.min(100, (calculations.paybackPeriod / loanParams.termMonths) * 100)
                : 0
              } 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análisis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Proyecciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estado del Proyecto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {calculations.isViable ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                Estado del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Activo a Financiar</div>
                  <div className="text-lg font-semibold">{formatCurrency(calculations.assetCostWithIva)}</div>
                  <div className="text-xs text-muted-foreground">
                    Sin IVA: {formatCurrency(calculations.assetCostSansIva)}
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Renta Mensual</div>
                  <div className="text-lg font-semibold">{formatCurrency(calculations.totalMonthlyRentWithIva)}</div>
                  <div className="text-xs text-muted-foreground">
                    Sin IVA: {formatCurrency(calculations.totalMonthlyRentSansIva)}
                  </div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Valor Residual</div>
                  <div className="text-lg font-semibold">{formatCurrency(calculations.residualValue)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPercentage(businessParams.residualValueRate)} del activo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estructura Financiera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Estructura de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renta Base (amortización + margen):</span>
                  <span className="font-medium">{formatCurrency(calculations.baseRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gastos Administrativos:</span>
                  <span className="font-medium">{formatCurrency(businessParams.fixedMonthlyFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comisión de Apertura (total):</span>
                  <span className="font-medium">{formatCurrency(calculations.openingCommission)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Mensual (sin IVA):</span>
                    <span className="text-green-600">{formatCurrency(calculations.totalMonthlyRentSansIva)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estructura de Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago a Inversionistas:</span>
                  <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gastos Operativos:</span>
                  <span className="font-medium">{formatCurrency(businessParams.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Otros Gastos Iniciales:</span>
                  <span className="font-medium">{formatCurrency(businessParams.otherExpenses)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Margen Mensual:</span>
                    <span className={calculations.monthlyOperatingMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(calculations.monthlyOperatingMargin)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Tabla de Flujo de Efectivo */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección de Flujo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Mes</th>
                      <th className="px-4 py-2 text-right">Ingresos</th>
                      <th className="px-4 py-2 text-right">Costos</th>
                      <th className="px-4 py-2 text-right">Flujo Neto</th>
                      <th className="px-4 py-2 text-right">Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.cashFlowData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2">{row.month}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(calculations.totalMonthlyRentSansIva)}</td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(monthlyPayment + businessParams.monthlyExpenses)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(row.flujoMensual)}
                        </td>
                        <td className={`px-4 py-2 text-right font-medium ${row.flujoAcumulado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(row.flujoAcumulado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          {/* Gráficos de Distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ingresos en %</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart >
                    <Pie
                      data={chartData.incomeDistribution}
                      dataKey="percentage"   // 👈 ahora usa porcentaje
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({value }) => `${value.toFixed(2)}%`} // 👈 etiquetas con %
                    >
                      {chartData.incomeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/*<Card>
              <CardHeader>
                <CardTitle>Distribución de Costos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart data={chartData.costDistribution}>
                    <Pie
                      data={chartData.costDistribution}
                      dataKey="percentage"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {chartData.costDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Legend />
                   
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>*/}
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {/* Gráfico de Flujo Acumulado */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Flujo de Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Meses', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} 
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)} 
                    labelFormatter={(label) => `Mes ${label}`} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="flujoAcumulado" 
                    stroke="#2563eb" 
                    fill="#dbeafe" 
                    fillOpacity={0.6}
                    name="Flujo Acumulado"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="breakeven" 
                    stroke="#10b981" 
                    fill="#dcfce7" 
                    fillOpacity={0.8}
                    name="Punto de Equilibrio"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Proyección Anual */}
          <Card>
            <CardHeader>
              <CardTitle>Proyección Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.annualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="año" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar 
                    dataKey="flujoOperativo" 
                    fill="#3b82f6" 
                    name="Flujo Operativo" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="flujoTotal" 
                    fill="#10b981" 
                    name="Flujo Total (con residual)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
