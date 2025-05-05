import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  FileTextIcon, 
  DownloadIcon, 
  DollarSign, 
  BriefcaseIcon, 
  ChartBarIcon,
  FileIcon,
  PieChartIcon, 
  CreditCardIcon,
  ClipboardListIcon,
  BarChart3Icon,
  PresentationIcon
} from "lucide-react";

import { InvestorReturn } from '@/lib/finance';
import { 
  calculateInvestmentMetrics, 
  formatDollarAmount,
  formatPercent,
  formatRatio
} from '@/lib/financialMetrics';

interface BankerReportsTabProps {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  startDate: Date;
  endDate: Date;
  investors: InvestorReturn[];
}

export function BankerReportsTab({
  loanAmount,
  interestRate,
  termMonths,
  monthlyPayment,
  totalInterest,
  startDate,
  endDate,
  investors
}: BankerReportsTabProps) {
  const [reportType, setReportType] = useState<string>('creditAnalysis');
  const [includeSensitivity, setIncludeSensitivity] = useState<boolean>(true);
  const [includeInvestorDetails, setIncludeInvestorDetails] = useState<boolean>(true);
  const [includeFinancialProjections, setIncludeFinancialProjections] = useState<boolean>(true);
  
  // Calculate investment metrics
  const metrics = calculateInvestmentMetrics(
    loanAmount,
    interestRate,
    termMonths,
    monthlyPayment
  );
  
  // Generate synthetic data for report previews
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  const investorDistribution = investors.map((investor, index) => ({
    name: investor.name,
    value: investor.investmentAmount,
    color: COLORS[index % COLORS.length]
  }));
  
  const cashFlowData = Array.from({ length: 12 }, (_, i) => ({
    name: `Month ${i + 1}`,
    principal: monthlyPayment * 0.7,
    interest: monthlyPayment * 0.3,
    total: monthlyPayment
  }));
  
  const generateReport = () => {
    // In a real implementation, this would generate and download a PDF report
    console.log(`Generating ${reportType} report...`);
    
    setTimeout(() => {
      alert(`${reportType} report has been generated and is ready for download.`);
    }, 1500);
  };
  
  // Report section rendering functions
  const renderCreditAnalysisReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Credit Analysis Report</CardTitle>
          <CardDescription>
            Comprehensive analysis of credit risk and loan performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Loan Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-medium">{formatDollarAmount(loanAmount, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="font-medium">{interestRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term:</span>
                  <span className="font-medium">{termMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span className="font-medium">{formatDollarAmount(monthlyPayment, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest:</span>
                  <span className="font-medium">{formatDollarAmount(totalInterest, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Repayment:</span>
                  <span className="font-medium">{formatDollarAmount(loanAmount + totalInterest, 2)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-semibold mb-3">Credit Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debt Service Coverage Ratio:</span>
                  <span className="font-medium">{formatRatio(metrics.debtServiceCoverageRatio, 2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan to Value Ratio:</span>
                  <span className="font-medium">{formatPercent(metrics.loanToValueRatio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Coverage Ratio:</span>
                  <span className="font-medium">{formatRatio(metrics.interestCoverageRatio, 2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Break-Even Point:</span>
                  <span className="font-medium">{Math.round(metrics.breakEvenPoint)} months</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Credit Risk:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <span className="font-medium">Low</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Liquidity Risk:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: '48%' }}
                    ></div>
                  </div>
                  <span className="font-medium">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Interest Rate Risk:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: '52%' }}
                    ></div>
                  </div>
                  <span className="font-medium">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operational Risk:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: '30%' }}
                    ></div>
                  </div>
                  <span className="font-medium">Low</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-3">Cash Flow Analysis</h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatDollarAmount(Number(value), 2)} />
                    <Legend />
                    <Line type="monotone" dataKey="principal" name="Principal" stroke="#8884d8" />
                    <Line type="monotone" dataKey="interest" name="Interest" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Investor Distribution</h3>
              <div className="h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {investorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatDollarAmount(Number(value), 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Credit Recommendation</CardTitle>
          <CardDescription>
            Assessment of credit quality and loan recommendation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-semibold">Credit Rating: A-</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Based on the comprehensive analysis of this loan, we recommend approval with standard monitoring. 
            The borrower demonstrates strong repayment capacity with a DSCR of {formatRatio(metrics.debtServiceCoverageRatio, 2)}x,
            which exceeds our minimum threshold of 1.25x. The loan exhibits favorable characteristics including:
          </p>
          
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Strong cash flow coverage of debt service obligations</li>
            <li>Reasonable loan-to-value ratio of {formatPercent(metrics.loanToValueRatio)}</li>
            <li>Diversified investor base reducing concentration risk</li>
            <li>Projected break-even point at {Math.round(metrics.breakEvenPoint)} months, well within the loan term</li>
            <li>Interest coverage ratio of {formatRatio(metrics.interestCoverageRatio, 2)}x indicating sufficient earnings to cover interest payments</li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            Recommended monitoring includes quarterly financial reviews and annual property valuation updates.
            Consider offering an interest rate reduction of 0.25% if the borrower maintains a DSCR above 1.5x
            for four consecutive quarters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderUnderwritingReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Loan Underwriting Report</CardTitle>
          <CardDescription>
            Comprehensive underwriting analysis for loan approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Loan Structure</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Loan Amount:</span>
                    <span className="font-medium">{formatDollarAmount(loanAmount, 2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Rate:</span>
                    <span className="font-medium">{interestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Term:</span>
                    <span className="font-medium">{termMonths} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Amortization:</span>
                    <span className="font-medium">{termMonths} months</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-green-800 mb-2">Financial Metrics</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">DSCR:</span>
                    <span className="font-medium">{formatRatio(metrics.debtServiceCoverageRatio, 2)}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">LTV:</span>
                    <span className="font-medium">{formatPercent(metrics.loanToValueRatio)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Debt Yield:</span>
                    <span className="font-medium">{formatPercent(1 / metrics.paybackPeriod * 12)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Break-Even OCC:</span>
                    <span className="font-medium">{(100 - 100 / metrics.debtServiceCoverageRatio).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="text-sm font-medium text-purple-800 mb-2">Risk Assessment</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Credit Risk:</span>
                    <span className="font-medium text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Market Risk:</span>
                    <span className="font-medium text-yellow-600">Medium</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Liquidity Risk:</span>
                    <span className="font-medium text-green-600">Low</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">Overall Risk:</span>
                    <span className="font-medium text-green-600">Low</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Investor Analysis</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Investment Amount</TableHead>
                      <TableHead>Ownership %</TableHead>
                      <TableHead>Projected Return</TableHead>
                      <TableHead>Projected ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors.map((investor, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{investor.name}</TableCell>
                        <TableCell>{formatDollarAmount(investor.investmentAmount, 2)}</TableCell>
                        <TableCell>{formatPercent(investor.investmentAmount / loanAmount)}</TableCell>
                        <TableCell>{formatDollarAmount(investor.totalReturn, 2)}</TableCell>
                        <TableCell>{formatPercent(investor.roi)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Underwriting Conditions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Standard Conditions</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Verification of all investor funds prior to closing</li>
                    <li>Execution of loan agreement and promissory notes for all parties</li>
                    <li>Proof of insurance coverage for the full asset value</li>
                    <li>Establishment of approved payment mechanism</li>
                    <li>Completion of all required due diligence documentation</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Special Conditions</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Quarterly financial reporting to be submitted within 45 days of quarter-end</li>
                    <li>Maintenance of minimum DSCR of 1.2x throughout the loan term</li>
                    <li>Interest rate step-down of 0.25% available after 12 months of on-time payments</li>
                    <li>Establishment of capital reserve account with minimum balance of {formatDollarAmount(loanAmount * 0.05, 0)}</li>
                    <li>Annual third-party validation of asset performance metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium">Recommended for Approval</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Underwritten by: <span className="font-medium">MESQUITE FINANCIAL</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
  
  const renderRegulatoryReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Regulatory Compliance Report</CardTitle>
          <CardDescription>
            Compliance analysis for regulatory requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Loan Classification</h3>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Type:</span>
                    <span className="font-medium">Term Loan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regulatory Classification:</span>
                    <span className="font-medium">1 - Pass</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Weighting:</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CECL Reserve:</span>
                    <span className="font-medium">{formatPercent(0.0075)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Special Mention:</span>
                    <span className="font-medium">No</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">Compliance Checklist</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-1" checked />
                    <Label htmlFor="item-1" className="text-sm">
                      KYC/AML verification completed for all investors
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-2" checked />
                    <Label htmlFor="item-2" className="text-sm">
                      OFAC screening conducted with no matches
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-3" checked />
                    <Label htmlFor="item-3" className="text-sm">
                      Beneficial ownership certification obtained
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-4" checked />
                    <Label htmlFor="item-4" className="text-sm">
                      Loan terms comply with Regulation Z / Truth in Lending
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-5" checked />
                    <Label htmlFor="item-5" className="text-sm">
                      Fair lending compliance verified
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-6" checked />
                    <Label htmlFor="item-6" className="text-sm">
                      HMDA reporting requirements verified (if applicable)
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-7" checked />
                    <Label htmlFor="item-7" className="text-sm">
                      All required disclosures provided to investors
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="item-8" checked />
                    <Label htmlFor="item-8" className="text-sm">
                      Compliance with usury laws verified
                    </Label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Capital Requirements Impact</h3>
                <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This loan has the following impact on regulatory capital requirements:
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk-Weighted Asset Addition:</span>
                      <span className="font-medium">{formatDollarAmount(loanAmount, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Required Capital at 8%:</span>
                      <span className="font-medium">{formatDollarAmount(loanAmount * 0.08, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CECL Reserve Requirement:</span>
                      <span className="font-medium">{formatDollarAmount(loanAmount * 0.0075, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Capital Impact:</span>
                      <span className="font-medium">{formatDollarAmount(loanAmount * 0.0875, 0)}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">Stress Testing Results</h3>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Loan performance under regulatory stress scenarios:
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Baseline Scenario:</span>
                        <span className="text-sm font-medium text-green-600">Pass</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Adverse Scenario:</span>
                        <span className="text-sm font-medium text-yellow-600">Marginal</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Severely Adverse:</span>
                        <span className="text-sm font-medium text-red-600">Fail</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Under severely adverse conditions (3% increase in interest rates, 20% decrease in income), 
                    this loan would require additional monitoring and possible classification downgrade.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Regulatory Actions Required</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Responsible Party</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Call Report Filing</TableCell>
                    <TableCell>Quarterly</TableCell>
                    <TableCell>Finance Department</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Compliant</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CECL Loan Loss Review</TableCell>
                    <TableCell>Quarterly</TableCell>
                    <TableCell>Credit Risk</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Compliant</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Stress Testing</TableCell>
                    <TableCell>Annual</TableCell>
                    <TableCell>Risk Management</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Compliant</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>BSA Monitoring</TableCell>
                    <TableCell>Ongoing</TableCell>
                    <TableCell>Compliance</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Compliant</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fair Lending Review</TableCell>
                    <TableCell>Annual</TableCell>
                    <TableCell>Compliance</TableCell>
                    <TableCell><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Compliant</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full">
            <div className="flex items-center justify-center mb-2">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                Complies with all applicable regulations
              </span>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              This compliance assessment was conducted in accordance with federal regulatory requirements
              and internal policies as of {new Date().toLocaleDateString()}.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Banking & Financial Institution Reports</h2>
      <p className="text-muted-foreground">
        Generate professional reports designed for bankers, investors, and financial institutions.
      </p>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Financial Report Generator</CardTitle>
          <CardDescription>
            Customize and generate professional financial reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select 
                  value={reportType} 
                  onValueChange={setReportType}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Banking Reports</SelectLabel>
                      <SelectItem value="creditAnalysis">Credit Analysis Report</SelectItem>
                      <SelectItem value="underwriting">Loan Underwriting Report</SelectItem>
                      <SelectItem value="regulatory">Regulatory Compliance Report</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Investment Reports</SelectLabel>
                      <SelectItem value="investmentMemo">Investment Memorandum</SelectItem>
                      <SelectItem value="portfolioAnalysis">Portfolio Analysis</SelectItem>
                      <SelectItem value="performanceReport">Performance Report</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the type of financial report you need to generate.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Report Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sensitivity"
                      checked={includeSensitivity}
                      onCheckedChange={(checked) => setIncludeSensitivity(!!checked)}
                    />
                    <Label htmlFor="sensitivity" className="text-sm font-normal">
                      Include sensitivity analysis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="investor-details"
                      checked={includeInvestorDetails}
                      onCheckedChange={(checked) => setIncludeInvestorDetails(!!checked)}
                    />
                    <Label htmlFor="investor-details" className="text-sm font-normal">
                      Include detailed investor breakdown
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projections"
                      checked={includeFinancialProjections}
                      onCheckedChange={(checked) => setIncludeFinancialProjections(!!checked)}
                    />
                    <Label htmlFor="projections" className="text-sm font-normal">
                      Include financial projections
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Available Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center text-center ${
                    reportType === 'creditAnalysis' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setReportType('creditAnalysis')}
                >
                  <CreditCardIcon className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Credit Analysis</span>
                  <span className="text-xs text-muted-foreground">Standard banking report</span>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center text-center ${
                    reportType === 'underwriting' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setReportType('underwriting')}
                >
                  <ClipboardListIcon className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Underwriting</span>
                  <span className="text-xs text-muted-foreground">Loan approval report</span>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center text-center ${
                    reportType === 'regulatory' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setReportType('regulatory')}
                >
                  <BriefcaseIcon className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Regulatory</span>
                  <span className="text-xs text-muted-foreground">Compliance report</span>
                </div>
                
                <div 
                  className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center text-center ${
                    reportType === 'investmentMemo' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setReportType('investmentMemo')}
                >
                  <PresentationIcon className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Investment Memo</span>
                  <span className="text-xs text-muted-foreground">For investment committees</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={generateReport}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Report Preview</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileIcon className="h-4 w-4" />
            <span>Generated by MESQUITE FINANCIAL</span>
          </div>
        </div>
        
        <ScrollArea className="h-[600px] rounded-md border p-4">
          {reportType === 'creditAnalysis' && renderCreditAnalysisReport()}
          {reportType === 'underwriting' && renderUnderwritingReport()}
          {reportType === 'regulatory' && renderRegulatoryReport()}
          {reportType === 'investmentMemo' && renderCreditAnalysisReport()}
          {reportType === 'portfolioAnalysis' && renderUnderwritingReport()}
          {reportType === 'performanceReport' && renderRegulatoryReport()}
        </ScrollArea>
      </div>
    </div>
  );
}