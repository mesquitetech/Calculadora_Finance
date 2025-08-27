import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  FileText,
  Car,
  DollarSign,
  Target,
  BarChart3
} from "lucide-react";
import { UnifiedSetup } from "@/components/calculator/UnifiedSetup";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { OperatorDashboardTab } from "@/components/calculator/OperatorDashboardTab";
import { RenterAnalysisTab } from "@/components/calculator/RenterAnalysisTab";
import { LesseeQuoteTab } from "@/components/calculator/LesseeQuoteTab";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  calculateMonthlyPayment,
  generatePaymentSchedule,
  calculateInvestorReturns,
  type PaymentScheduleEntry,
  type InvestorReturn,
  formatCurrency as financeFormatCurrency,
  formatDate,
} from "@/lib/finance";
import { generateLeasingModels, type LeasingInputs, formatCurrency } from "@/lib/leasingCalculations";
import { generateLeasingQuotePDF } from "@/lib/leasingQuotePDF";

// Types for the original investor functionality
interface LoanParameters {
  loanName: string;
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
}

interface Investor {
  id: number;
  name: string;
  investmentAmount: number;
}

interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number;
  fixedMonthlyFee: number;
  adminCommissionPct: number;
  securityDepositMonths: number;
  deliveryCosts: number;
  residualValueRate: number;
  discountRate: number;
}

const initialLoanParams: LoanParameters = {
  loanName: "",
  totalAmount: 100000,
  interestRate: 8.5,
  termMonths: 36,
  startDate: new Date().toISOString().split('T')[0],
  paymentFrequency: "monthly" as const
};

const initialBusinessParams: BusinessParameters = {
  assetCost: 100000,
  otherExpenses: 5000,
  monthlyExpenses: 500,
  lessorProfitMarginPct: 15,
  fixedMonthlyFee: 194,
  adminCommissionPct: 2,
  securityDepositMonths: 1,
  deliveryCosts: 6320,
  residualValueRate: 20,
  discountRate: 6
};

const initialInvestors: Investor[] = [
  { id: 1, name: "Investor 1", investmentAmount: 50000 },
  { id: 2, name: "Investor 2", investmentAmount: 30000 },
  { id: 3, name: "Investor 3", investmentAmount: 20000 }
];

// Initial leasing inputs
const initialLeasingInputs: LeasingInputs = {
  clientName: "MIGUEL GARCIA",
  vehicleInfo: "Lincoln AVIATOR 2025",
  promoter: "Sergio Rodriguez",
  phone: "8125138065",
  folio: "ABCLEASING" + Date.now(),
  city: "Guadalajara, Jalisco",
  assetValue: 1512000,
  downPayment: 226800,
  termMonths: 48,
  clientAnnualInterestRate: 12.0,
  residualValuePercentage: 13.0,
  investorLoanAmount: 1285200,
  investorAnnualInterestRate: 8.5,
  firstYearInsurance: 32758.62,
  openingCommission: 22158.62,
  adminExpenses: 18168.60
};

export default function Home() {
  // States for investor loan functionality
  const [activeTab, setActiveTab] = useState("setup");
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [businessParams, setBusinessParams] = useState<BusinessParameters>(initialBusinessParams);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleEntry[]>([]);
  const [investorReturns, setInvestorReturns] = useState<InvestorReturn[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  // States for leasing functionality
  const [leasingInputs, setLeasingInputs] = useState<LeasingInputs>(initialLeasingInputs);
  const [leasingResults, setLeasingResults] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Investor loan calculation mutation
  const calculateMutation = useMutation({
    mutationFn: async (data: { loanParams: LoanParameters; investors: Investor[]; businessParams: BusinessParameters }) => {
      return apiRequest("POST", "/api/calculate", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Calculation Complete",
        description: "Investment analysis has been calculated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      setActiveTab("schedule");
    },
    onError: (error: any) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate investment analysis.",
        variant: "destructive",
      });
    }
  });

  // Leasing calculation mutation
  const leasingCalculateMutation = useMutation({
    mutationFn: async (inputs: LeasingInputs) => {
      return apiRequest("POST", "/api/leasing-calculate", { inputs });
    },
    onSuccess: (data) => {
      setLeasingResults(data);
      toast({
        title: "Leasing Calculation Complete",
        description: "Leasing analysis has been calculated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Leasing Calculation Failed", 
        description: error.message || "Failed to calculate leasing analysis.",
        variant: "destructive",
      });
    }
  });

  // Calculate investor loan locally for immediate feedback
  const handleCalculateInvestorLoan = () => {
    try {
      // Validation
      if (!loanParams.loanName || loanParams.totalAmount <= 0 || loanParams.interestRate < 0 || loanParams.termMonths <= 0) {
        toast({
          title: "Invalid Input",
          description: "Please fill in all required loan parameters.",
          variant: "destructive",
        });
        return;
      }

      if (investors.length === 0) {
        toast({
          title: "No Investors",
          description: "Please add at least one investor.",
          variant: "destructive",
        });
        return;
      }

      const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
      if (Math.abs(totalInvestment - loanParams.totalAmount) > 0.01) {
        toast({
          title: "Investment Mismatch",
          description: "Total investment amount must equal loan amount.",
          variant: "destructive",
        });
        return;
      }

      // Generate payment schedule
      const schedule = generatePaymentSchedule(
        loanParams.totalAmount,
        loanParams.interestRate,
        loanParams.termMonths,
        new Date(loanParams.startDate),
        loanParams.paymentFrequency
      );

      // Calculate investor returns
      const returns = investors.map(investor =>
        calculateInvestorReturns(
          investor.investmentAmount,
          totalInvestment,
          schedule,
          investor.id.toString(),
          investor.name
        )
      );

      setPaymentSchedule(schedule);
      setInvestorReturns(returns);
      setIsCalculated(true);

      // Save to database
      calculateMutation.mutate({ loanParams, investors, businessParams });

    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "An error occurred during calculation.",
        variant: "destructive",
      });
    }
  };

  // Calculate leasing
  const handleCalculateLeasing = () => {
    try {
      // Generate unique folio if not provided
      if (!leasingInputs.folio) {
        const timestamp = Date.now().toString();
        setLeasingInputs(prev => ({ ...prev, folio: `ABC${timestamp}` }));
      }

      leasingCalculateMutation.mutate(leasingInputs);
    } catch (error) {
      console.error("Leasing calculation error:", error);
      toast({
        title: "Leasing Calculation Error",
        description: "An error occurred during leasing calculation.",
        variant: "destructive",
      });
    }
  };

  // Generate leasing PDF
  const handleGenerateLeasingPDF = () => {
    if (!leasingResults?.models) {
      toast({
        title: "No Data",
        description: "Please calculate leasing first before generating PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      generateLeasingQuotePDF(leasingInputs, leasingResults.models);
      toast({
        title: "PDF Generated",
        description: "Leasing quotation PDF has been downloaded.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF document.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Investment Financing Calculator
              </h1>
              <p className="text-lg text-gray-600">
                Comprehensive financial analysis for investment loans and leasing solutions
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Calculator className="w-4 h-4 mr-1" />
                Professional Analysis
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Real-time Calculations
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="schedule" disabled={!isCalculated} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="investors" disabled={!isCalculated} className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!isCalculated} className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="operator" disabled={!isCalculated} className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Operator
            </TabsTrigger>
            <TabsTrigger value="renter" disabled={!isCalculated} className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Renter
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab - Unified Asset & Leasing Configuration */}
          <TabsContent value="setup">
            <UnifiedSetup
              initialLoanParams={loanParams}
              initialInvestors={investors}
              initialBusinessParams={businessParams}
              initialLeasingInputs={leasingInputs}
              onSaveInvestorLoan={(data) => {
                setLoanParams(data.loanParams);
                setInvestors(data.investors);
                setBusinessParams(data.businessParams);
                handleCalculateInvestorLoan();
              }}
              onSaveLeasing={(inputs) => {
                setLeasingInputs(inputs);
                handleCalculateLeasing();
              }}
              isSubmittingLoan={calculateMutation.isPending}
              isSubmittingLeasing={leasingCalculateMutation.isPending}
              leasingResults={leasingResults}
              onGenerateLeasingPDF={handleGenerateLeasingPDF}
            />
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="schedule">
            {isCalculated && (
              <PaymentScheduleTab
                paymentSchedule={paymentSchedule}
                loanAmount={loanParams.totalAmount}
                monthlyPayment={calculateMonthlyPayment(loanParams.totalAmount, loanParams.interestRate, loanParams.termMonths)}
                totalInterest={paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0)}
              />
            )}
          </TabsContent>

          {/* Investor Returns Tab */}
          <TabsContent value="investors">
            {isCalculated && (
              <InvestorReturnsTab
                investorReturns={investorReturns}
                paymentSchedule={paymentSchedule}
              />
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary">
            {isCalculated && (
              <SummaryTab
                loanAmount={loanParams.totalAmount}
                interestRate={loanParams.interestRate}
                termMonths={loanParams.termMonths}
                monthlyPayment={calculateMonthlyPayment(loanParams.totalAmount, loanParams.interestRate, loanParams.termMonths)}
                paymentFrequency={loanParams.paymentFrequency}
                investors={investorReturns}
                paymentSchedule={paymentSchedule}
                startDate={new Date(loanParams.startDate)}
                endDate={paymentSchedule.length > 0 ? paymentSchedule[paymentSchedule.length - 1].date : new Date()}
                totalInterest={paymentSchedule.reduce((sum, payment) => sum + payment.interest, 0)}
                periodicPayment={calculateMonthlyPayment(loanParams.totalAmount, loanParams.interestRate, loanParams.termMonths)}
                onExport={() => {}}
              />
            )}
          </TabsContent>

          {/* Operator Dashboard Tab */}
          <TabsContent value="operator">
            {isCalculated && (
              <OperatorDashboardTab
                businessParams={businessParams}
                loanParams={{
                  ...loanParams,
                  startDate: loanParams.startDate
                }}
                onExportReport={() => {}}
              />
            )}
          </TabsContent>

          {/* Renter Analysis Tab */}
          <TabsContent value="renter">
            {isCalculated && (
              <RenterAnalysisTab
                businessParams={businessParams}
                loanParams={{
                  ...loanParams,
                  startDate: loanParams.startDate
                }}
                monthlyPayment={calculateMonthlyPayment(loanParams.totalAmount, loanParams.interestRate, loanParams.termMonths)}
                paymentSchedule={paymentSchedule}
                renterConfig={{
                  expectedRent: businessParams.fixedMonthlyFee,
                  rentalYield: 12, // Default rental yield
                  vacancyRate: 5, // Default vacancy rate
                  maintenanceCost: businessParams.monthlyExpenses
                }}
                onExportReport={() => {}}
              />
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}