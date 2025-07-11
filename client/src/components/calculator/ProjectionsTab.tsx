import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Download, File, FileSpreadsheet } from "lucide-react";
import {
  calculateInvestmentMetrics,
  generateFinancialProjections,
  generateQuarterlyPerformance,
  generateRiskAssessment,
  formatDollarAmount,
  formatPercent,
  formatRatio,
  formatInteger,
  FinancialProjection,
  QuarterlyPerformance,
  RiskAssessment,
  InvestmentMetrics
} from '@/lib/financialMetrics';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";

interface ProjectionsTabProps {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: Date;
}

export function ProjectionsTab({
  loanAmount,
  interestRate,
  termMonths,
  monthlyPayment,
  startDate
}: ProjectionsTabProps) {
  // Hooks and State
  const { toast } = useToast();
  const [annualRevenue, setAnnualRevenue] = useState<number>(loanAmount * 0.25);
  const [annualExpenses, setAnnualExpenses] = useState<number>(annualRevenue * 0.6);
  const [growthRate, setGrowthRate] = useState<number>(0.03);
  const [projectionYears, setProjectionYears] = useState<number>(5);
  const [assumedPropertyValue, setAssumedPropertyValue] = useState<number>(loanAmount * 1.25);
  const [discountRate, setDiscountRate] = useState<number>(interestRate / 100);

  // Data Calculation
  const investmentMetrics = calculateInvestmentMetrics(loanAmount, interestRate, termMonths, monthlyPayment, assumedPropertyValue, annualRevenue);
  const financialProjections = generateFinancialProjections(loanAmount, annualRevenue * 0.15, growthRate * 4, discountRate, projectionYears);
  const quarterlyPerformance = generateQuarterlyPerformance(loanAmount, annualRevenue, annualExpenses, growthRate, projectionYears);
  const riskAssessment = generateRiskAssessment();
  const averageQuarterlyRevenue = quarterlyPerformance.reduce((sum, q) => sum + q.revenue, 0) / quarterlyPerformance.length;
  const averageQuarterlyNetIncome = quarterlyPerformance.reduce((sum, q) => sum + q.netIncome, 0) / quarterlyPerformance.length;
  const totalProjectedCashFlow = quarterlyPerformance.reduce((sum, q) => sum + q.cashFlow, 0);
  const finalCapitalReserves = quarterlyPerformance.length > 0 ? quarterlyPerformance[quarterlyPerformance.length - 1].capitalReserves : 0;

  // Chart Colors
  const chartColors = {
    revenue: "#4f46e5",
    expenses: "#ef4444",
    netIncome: "#10b981",
    cashFlow: "#f59e0b",
    npv: "#8b5cf6",
    reserves: "#0ea5e9"
  };

  // --- EXPORT FUNCTIONS ---

  const handleGeneratePDF = () => {
    toast({ title: "Generating PDF Report...", description: "Please wait, this may take a moment." });
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Financial Projections & Analytics Report", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [['Key Investment Metric', 'Value']],
        body: [
          ['Internal Rate of Return (IRR)', formatPercent(investmentMetrics.internalRateOfReturn)],
          ['Net Present Value (NPV)', formatDollarAmount(investmentMetrics.netPresentValue, 0)],
          ['Debt Service Coverage Ratio (DSCR)', `${formatRatio(investmentMetrics.debtServiceCoverageRatio)}x`],
          ['Break-Even Point', `${formatInteger(investmentMetrics.breakEvenPoint)} months`],
          ['Return on Investment (ROI)', formatPercent(investmentMetrics.returnOnInvestment)],
          ['Loan to Value (LTV) Ratio', formatPercent(investmentMetrics.loanToValueRatio)],
        ],
        theme: 'striped'
      });

      doc.addPage();

      autoTable(doc, {
        head: [['Quarter', 'Revenue', 'Expenses', 'Net Income', 'Cash Flow']],
        body: quarterlyPerformance.map(q => [
          q.quarter,
          formatDollarAmount(q.revenue, 0),
          formatDollarAmount(q.expenses, 0),
          formatDollarAmount(q.netIncome, 0),
          formatDollarAmount(q.cashFlow, 0),
        ]),
        didDrawPage: (data) => {
            doc.setFontSize(14);
            doc.text("Quarterly Performance Data", 14, (data.settings.margin as any).top);
        }
      });

      doc.addPage();

      autoTable(doc, {
        head: [['Period', 'Cash Flow', 'NPV', 'Cumulative NPV', 'ROI', 'IRR']],
        body: financialProjections.map(p => [
          p.period,
          formatDollarAmount(p.cashFlow, 0),
          formatDollarAmount(p.netPresentValue, 0),
          formatDollarAmount(p.cumulativeNPV, 0),
          formatPercent(p.roi),
          formatPercent(p.irr)
        ]),
         didDrawPage: (data) => {
            doc.setFontSize(14);
            doc.text("Annual Financial Projections", 14, (data.settings.margin as any).top);
        }
      });

       autoTable(doc, {
        head: [['Risk Category', 'Probability', 'Impact', 'Risk Score']],
        body: riskAssessment.map(r => [
          r.category,
          formatPercent(r.probability),
          formatPercent(r.impact),
          formatPercent(r.riskScore)
        ]),
         didDrawPage: (data) => {
            doc.setFontSize(14);
            doc.text("Risk Assessment Matrix", 14, (data.settings.margin as any).top);
        }
      });

      doc.save("Financial_Projections_Report.pdf");
      toast({ title: "Success!", description: "PDF report has been downloaded." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    toast({ title: "Exporting to CSV...", description: "Preparing your data for download." });

    const quarterlyHeaders = "Quarter,Revenue,Expenses,Net Income,Cash Flow,Debt Servicing,Projected Growth,Capital Reserves\n";
    const annualHeaders = "Period,Cash Flow,Net Present Value,Cumulative NPV,ROI,IRR\n";

    const quarterlyRows = quarterlyPerformance.map(q => 
      `${q.quarter},${q.revenue},${q.expenses},${q.netIncome},${q.cashFlow},${q.debtServicing},${q.projectedGrowth},${q.capitalReserves}`
    ).join("\n");

    const annualRows = financialProjections.map(p => 
      `${p.period},${p.cashFlow},${p.netPresentValue},${p.cumulativeNPV},${p.roi},${p.irr}`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Quarterly Performance\n"
      + quarterlyHeaders 
      + quarterlyRows 
      + "\n\nAnnual Projections\n" 
      + annualHeaders 
      + annualRows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_projections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Success!", description: "CSV file has been downloaded." });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Financial Projections & Analytics</h2>
      <p className="text-muted-foreground">
        Advanced financial analytics and projections for investment decision-making.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Projection Parameters</CardTitle>
          <CardDescription>
            Adjust these parameters to customize your financial projections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="annual-revenue">Annual Revenue</Label>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="annual-revenue"
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual-expenses">Annual Expenses</Label>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="annual-expenses"
                  type="number"
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-value">Asset Value</Label>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="property-value"
                  type="number"
                  value={assumedPropertyValue}
                  onChange={(e) => setAssumedPropertyValue(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Growth Rate ({(growthRate * 100).toFixed(1)}% quarterly)</Label>
              <Slider
                value={[growthRate * 100]}
                min={0}
                max={10}
                step={0.1}
                onValueChange={(value) => setGrowthRate(value[0] / 100)}
              />
            </div>

            <div className="space-y-2">
              <Label>Projection Years</Label>
              <Slider
                value={[projectionYears]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setProjectionYears(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Rate ({(discountRate * 100).toFixed(1)}%)</Label>
              <Slider
                value={[discountRate * 100]}
                min={1}
                max={20}
                step={0.5}
                onValueChange={(value) => setDiscountRate(value[0] / 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Internal Rate of Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(investmentMetrics.internalRateOfReturn)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Annual return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Present Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDollarAmount(investmentMetrics.netPresentValue, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Present value of future cash flows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debt Service Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRatio(investmentMetrics.debtServiceCoverageRatio)}x
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Income relative to debt obligations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Break-Even Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatInteger(investmentMetrics.breakEvenPoint)} months
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time to recover investment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="performance">Quarterly Performance</TabsTrigger>
          <TabsTrigger value="projections">Financial Projections</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quarterly Revenue & Expenses</CardTitle>
                <CardDescription>
                  Projected quarterly financial performance over {projectionYears} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={quarterlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatDollarAmount(Number(value), 0)}
                        labelFormatter={(label) => `Quarter: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue" 
                        fill={chartColors.revenue} 
                        stroke={chartColors.revenue} 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        fill={chartColors.expenses} 
                        stroke={chartColors.expenses} 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="netIncome" 
                        name="Net Income" 
                        fill={chartColors.netIncome} 
                        stroke={chartColors.netIncome} 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Key business performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Quarterly Revenue</span>
                    <span className="font-medium">{formatDollarAmount(averageQuarterlyRevenue, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg. Quarterly Net Income</span>
                    <span className="font-medium">{formatDollarAmount(averageQuarterlyNetIncome, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Projected Cash Flow</span>
                    <span className="font-medium">{formatDollarAmount(totalProjectedCashFlow, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Final Capital Reserves</span>
                    <span className="font-medium">{formatDollarAmount(finalCapitalReserves, 0)}</span>
                  </div>
                </div>

                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={quarterlyPerformance}>
                      <XAxis dataKey="quarter" tick={false} />
                      <Tooltip 
                        formatter={(value) => formatDollarAmount(Number(value), 0)}
                        labelFormatter={(label) => `Quarter: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="capitalReserves" 
                        name="Capital Reserves" 
                        stroke={chartColors.reserves} 
                        strokeWidth={2} 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Project Viability</AlertTitle>
                  <AlertDescription>
                    {investmentMetrics.debtServiceCoverageRatio >= 1.25 ? (
                      <span className="text-green-600">This project shows strong financial viability with healthy debt service coverage.</span>
                    ) : investmentMetrics.debtServiceCoverageRatio >= 1.0 ? (
                      <span className="text-amber-600">This project meets minimum viability standards but has limited safety margin.</span>
                    ) : (
                      <span className="text-red-600">This project shows insufficient income to service debt obligations.</span>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quarterly Performance Data</CardTitle>
              <CardDescription>
                Detailed quarterly financial projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Net Income</TableHead>
                      <TableHead>Cash Flow</TableHead>
                      <TableHead>Debt Servicing</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Capital Reserves</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarterlyPerformance.map((quarter, index) => (
                      <TableRow key={index}>
                        <TableCell>{quarter.quarter}</TableCell>
                        <TableCell>{formatDollarAmount(quarter.revenue, 0)}</TableCell>
                        <TableCell>{formatDollarAmount(quarter.expenses, 0)}</TableCell>
                        <TableCell>{formatDollarAmount(quarter.netIncome, 0)}</TableCell>
                        <TableCell>{formatDollarAmount(quarter.cashFlow, 0)}</TableCell>
                        <TableCell>{formatDollarAmount(quarter.debtServicing, 0)}</TableCell>
                        <TableCell>{quarter.projectedGrowth.toFixed(1)}%</TableCell>
                        <TableCell>{formatDollarAmount(quarter.capitalReserves, 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>NPV and Cash Flow Projections</CardTitle>
                <CardDescription>
                  Projected annual financial metrics over {projectionYears} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialProjections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value) => formatDollarAmount(Number(value), 0)}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="cashFlow" 
                        name="Cash Flow" 
                        stroke={chartColors.cashFlow} 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="cumulativeNPV" 
                        name="Cumulative NPV" 
                        stroke={chartColors.npv} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Metrics</CardTitle>
                <CardDescription>
                  Key financial metrics for this investment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Internal Rate of Return (IRR)</span>
                    <span className="font-medium">{formatPercent(investmentMetrics.internalRateOfReturn)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net Present Value (NPV)</span>
                    <span className="font-medium">{formatDollarAmount(investmentMetrics.netPresentValue, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profitability Index</span>
                    <span className="font-medium">{formatRatio(investmentMetrics.profitabilityIndex)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payback Period</span>
                    <span className="font-medium">{formatInteger(investmentMetrics.paybackPeriod)} months</span>
                  </div>
                </div>

                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "IRR", value: investmentMetrics.internalRateOfReturn * 100 },
                      { name: "ROI", value: investmentMetrics.returnOnInvestment * 100 },
                      { name: "LTV", value: investmentMetrics.loanToValueRatio * 100 }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `${Number(value).toFixed(2)}%`}
                      />
                      <Bar dataKey="value" fill={chartColors.revenue} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
            {/* CORREGIDO: Se ha restaurado la tabla de proyecciones anuales */}
            <Card>
                <CardHeader>
                    <CardTitle>Annual Financial Projections</CardTitle>
                    <CardDescription>
                        Detailed annual financial projections and returns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Cash Flow</TableHead>
                                    <TableHead>Net Present Value</TableHead>
                                    <TableHead>Cumulative NPV</TableHead>
                                    <TableHead>Return on Investment</TableHead>
                                    <TableHead>Internal Rate of Return</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financialProjections.map((projection, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{projection.period}</TableCell>
                                        <TableCell>{formatDollarAmount(projection.cashFlow, 0)}</TableCell>
                                        <TableCell>{formatDollarAmount(projection.netPresentValue, 0)}</TableCell>
                                        <TableCell>{formatDollarAmount(projection.cumulativeNPV, 0)}</TableCell>
                                        <TableCell>{formatPercent(projection.roi)}</TableCell>
                                        <TableCell>{formatPercent(projection.irr)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>
                  Analysis of key risks affecting investment performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Probability</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Mitigation Strategy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskAssessment.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell>{risk.category}</TableCell>
                          <TableCell>{formatPercent(risk.probability)}</TableCell>
                          <TableCell>{formatPercent(risk.impact)}</TableCell>
                          <TableCell>
                            <span className={
                              risk.riskScore > 0.2 ? 'text-red-600 font-medium' :
                              risk.riskScore > 0.1 ? 'text-amber-600 font-medium' :
                              'text-green-600 font-medium'
                            }>
                              {formatPercent(risk.riskScore)}
                            </span>
                          </TableCell>
                          <TableCell>{risk.mitigationStrategy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Score Visualization</CardTitle>
                <CardDescription>
                  Visual representation of risk assessment scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={riskAssessment}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis dataKey="category" type="category" width={100} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                      <Legend />
                      <Bar 
                        dataKey="riskScore" 
                        name="Risk Score" 
                        fill="#ef4444" 
                        background={{ fill: '#eee' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
           {/* CORREGIDO: Se ha restaurado el análisis de sensibilidad de riesgos */}
           <Card>
              <CardHeader>
                <CardTitle>Risk Sensitivity Analysis</CardTitle>
                <CardDescription>
                  How changes in key factors affect investment performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Interest Rate Sensitivity</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Each 1% increase in interest rates would reduce the NPV by approximately {
                        formatDollarAmount(investmentMetrics.netPresentValue * 0.08, 0)
                      } and increase the monthly payment by {
                        formatDollarAmount(monthlyPayment * 0.06, 0)
                      }.
                    </p>

                    <h4 className="text-sm font-medium mb-3">Revenue Sensitivity</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      A 10% decrease in projected revenue would reduce the DSCR from {
                        formatRatio(investmentMetrics.debtServiceCoverageRatio)
                      }x to {
                        formatRatio(investmentMetrics.debtServiceCoverageRatio * 0.9)
                      }x.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Risk Mitigation Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                        <span>Consider interest rate hedging strategies to mitigate interest rate risk.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                        <span>Maintain capital reserves of at least {formatDollarAmount(loanAmount * 0.1, 0)}.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
        <Button onClick={handleGeneratePDF}>
          <File className="mr-2 h-4 w-4" />
          Generate PDF Report
        </Button>
      </div>
    </div>
  );
}
