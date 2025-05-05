import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, TrendingUpIcon, AreaChartIcon, BarChart3Icon } from "lucide-react";
import {
  calculateInvestmentMetrics,
  generateFinancialProjections,
  generateQuarterlyPerformance,
  generateRiskAssessment,
  formatDollarAmount,
  formatPercent,
  formatRatio,
  formatInteger,
  formatNumber,
  FinancialProjection,
  QuarterlyPerformance,
  RiskAssessment,
  InvestmentMetrics
} from '@/lib/financialMetrics';

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
  // Projection parameters
  const [annualRevenue, setAnnualRevenue] = useState<number>(loanAmount * 0.25);
  const [annualExpenses, setAnnualExpenses] = useState<number>(annualRevenue * 0.6);
  const [growthRate, setGrowthRate] = useState<number>(0.03); // 3% quarterly growth
  const [projectionYears, setProjectionYears] = useState<number>(5);
  const [assumedPropertyValue, setAssumedPropertyValue] = useState<number>(loanAmount * 1.25);
  const [discountRate, setDiscountRate] = useState<number>(interestRate / 100);
  
  // Calculate metrics
  const investmentMetrics = calculateInvestmentMetrics(
    loanAmount,
    interestRate,
    termMonths,
    monthlyPayment,
    assumedPropertyValue,
    annualRevenue
  );
  
  // Generate projections
  const financialProjections = generateFinancialProjections(
    loanAmount,
    annualRevenue * 0.15, // Assume 15% of revenue is cash flow
    growthRate * 4, // Convert quarterly to annual
    discountRate,
    projectionYears
  );
  
  const quarterlyPerformance = generateQuarterlyPerformance(
    loanAmount,
    annualRevenue,
    annualExpenses,
    growthRate,
    projectionYears
  );
  
  const riskAssessment = generateRiskAssessment();
  
  // Calculate performance indicators for dashboard
  const averageQuarterlyRevenue = quarterlyPerformance.reduce((sum, q) => sum + q.revenue, 0) / quarterlyPerformance.length;
  const averageQuarterlyNetIncome = quarterlyPerformance.reduce((sum, q) => sum + q.netIncome, 0) / quarterlyPerformance.length;
  const totalProjectedCashFlow = quarterlyPerformance.reduce((sum, q) => sum + q.cashFlow, 0);
  const finalCapitalReserves = quarterlyPerformance[quarterlyPerformance.length - 1].capitalReserves;
  
  // Colors for charts
  const chartColors = {
    revenue: "#4f46e5",
    expenses: "#ef4444",
    netIncome: "#10b981",
    cashFlow: "#f59e0b",
    npv: "#8b5cf6",
    reserves: "#0ea5e9"
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Financial Projections & Analytics</h2>
      <p className="text-muted-foreground">
        Advanced financial analytics and projections for investment decision-making.
      </p>
      
      {/* Parameters Section */}
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
              <p className="text-xs text-muted-foreground">
                Expected annual revenue from the investment.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Expected annual operating expenses.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Estimated value of the asset being financed.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Expected quarterly growth rate (0-10%).
              </p>
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
              <p className="text-xs text-muted-foreground">
                Number of years to project financial performance.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Rate used for present value calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics Dashboard */}
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
      
      {/* Tabs for different projections */}
      <Tabs defaultValue="performance">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="performance">Quarterly Performance</TabsTrigger>
          <TabsTrigger value="projections">Financial Projections</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>
        
        {/* Quarterly Performance Tab */}
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
        
        {/* Financial Projections Tab */}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discounted Payback Period</span>
                    <span className="font-medium">{formatInteger(investmentMetrics.discountedPaybackPeriod)} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Return on Investment</span>
                    <span className="font-medium">{formatPercent(investmentMetrics.returnOnInvestment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan to Value Ratio</span>
                    <span className="font-medium">{formatPercent(investmentMetrics.loanToValueRatio)}</span>
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
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                      <Bar dataKey="value" fill={chartColors.revenue} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
        
        {/* Risk Assessment Tab */}
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
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Risk Assessment Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    The highest risk factor is {
                      riskAssessment.reduce((max, risk) => 
                        risk.riskScore > max.riskScore ? risk : max
                      ).category
                    } with a {
                      formatPercent(riskAssessment.reduce((max, risk) => 
                        risk.riskScore > max.riskScore ? risk : max
                      ).riskScore)
                    } risk score. Overall portfolio risk is {
                      formatPercent(riskAssessment.reduce((sum, risk) => sum + risk.riskScore, 0) / 
                      riskAssessment.length)
                    }.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
                    }x and extend the payback period by approximately {
                      Math.round(investmentMetrics.paybackPeriod * 0.12)
                    } months.
                  </p>
                  
                  <h4 className="text-sm font-medium mb-3">Property Value Sensitivity</h4>
                  <p className="text-sm text-muted-foreground">
                    A 15% decrease in property value would increase the LTV ratio from {
                      formatPercent(investmentMetrics.loanToValueRatio)
                    } to {
                      formatPercent(investmentMetrics.loanToValueRatio / 0.85)
                    }, potentially affecting refinancing options.
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
                      <span>Maintain capital reserves of at least {formatDollarAmount(loanAmount * 0.1, 0)} for unexpected expenses or revenue shortfalls.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      <span>Develop contingency plans for scenarios where growth falls below {formatPercent(growthRate * 2)} annually.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                      <span>Consider property insurance to protect asset value and mitigate potential LTV increases.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                      <span>Implement quarterly performance reviews to monitor actual results against projections.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2">
          Export to Excel
        </Button>
        <Button>
          Generate PDF Report
        </Button>
      </div>
    </div>
  );
}