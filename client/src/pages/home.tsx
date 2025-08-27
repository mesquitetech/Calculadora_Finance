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
import { SetupWizard } from "@/components/calculator/SetupWizard";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { OperatorDashboardTab } from "@/components/calculator/OperatorDashboardTab";
import { RenterAnalysisTab } from "@/components/calculator/RenterAnalysisTab";
import { LesseeQuoteTab } from "@/components/calculator/LesseeQuoteTab";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
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
  const [leasingErrors, setLeasingErrors] = useState<{[key: string]: string}>({});

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

  // Leasing validation
  const validateLeasingInputs = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!leasingInputs.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    
    if (!leasingInputs.vehicleInfo.trim()) {
      newErrors.vehicleInfo = "Vehicle information is required";
    }
    
    if (leasingInputs.assetValue <= 0) {
      newErrors.assetValue = "Asset value must be greater than 0";
    }
    
    if (leasingInputs.downPayment < 0) {
      newErrors.downPayment = "Down payment cannot be negative";
    }
    
    if (leasingInputs.downPayment >= leasingInputs.assetValue) {
      newErrors.downPayment = "Down payment must be less than asset value";
    }
    
    if (leasingInputs.termMonths <= 0 || leasingInputs.termMonths > 120) {
      newErrors.termMonths = "Term must be between 1 and 120 months";
    }
    
    if (leasingInputs.clientAnnualInterestRate <= 0 || leasingInputs.clientAnnualInterestRate > 50) {
      newErrors.clientAnnualInterestRate = "Interest rate must be between 0% and 50%";
    }
    
    if (leasingInputs.residualValuePercentage < 0 || leasingInputs.residualValuePercentage > 100) {
      newErrors.residualValuePercentage = "Residual value must be between 0% and 100%";
    }
    
    if (leasingInputs.investorLoanAmount <= 0) {
      newErrors.investorLoanAmount = "Investor loan amount must be greater than 0";
    }
    
    if (leasingInputs.investorAnnualInterestRate <= 0 || leasingInputs.investorAnnualInterestRate > 50) {
      newErrors.investorAnnualInterestRate = "Investor rate must be between 0% and 50%";
    }
    
    setLeasingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate leasing
  const handleCalculateLeasing = () => {
    if (!validateLeasingInputs()) {
      toast({
        title: "Validation Errors",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

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

  const updateLeasingField = (field: keyof LeasingInputs, value: any) => {
    setLeasingInputs(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error if exists
    if (leasingErrors[field]) {
      setLeasingErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
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
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex">
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
            <TabsTrigger value="leasing" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Leasing
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab - Original Investor Loan Calculator */}
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Investment Loan Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SetupWizard
                  initialLoanParams={{
                    ...loanParams,
                    startDate: new Date(loanParams.startDate)
                  }}
                  initialInvestors={investors.map(inv => ({ ...inv, percentage: (inv.investmentAmount / loanParams.totalAmount) * 100 }))}
                  initialBusinessParams={businessParams}
                  onSave={(loanParams, investors, businessParams) => {
                    setLoanParams({
                      ...loanParams,
                      startDate: loanParams.startDate instanceof Date ? loanParams.startDate.toISOString().split('T')[0] : loanParams.startDate.toString()
                    });
                    setInvestors(investors.map(inv => ({ id: inv.id, name: inv.name, investmentAmount: inv.investmentAmount })));
                    setBusinessParams(businessParams);
                    handleCalculateInvestorLoan();
                  }}
                  onCancel={() => {}}
                  isSubmitting={calculateMutation.isPending}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Schedule Tab */}
          <TabsContent value="schedule">
            {isCalculated && (
              <PaymentScheduleTab
                paymentSchedule={paymentSchedule}
                loanAmount={loanParams.totalAmount}
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
                  startDate: new Date(loanParams.startDate)
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
                  startDate: new Date(loanParams.startDate)
                }}
                monthlyPayment={calculateMonthlyPayment(loanParams.totalAmount, loanParams.interestRate, loanParams.termMonths)}
                paymentSchedule={paymentSchedule}
                renterConfig={{
                  monthlyRent: businessParams.fixedMonthlyFee,
                  rentalYield: 12, // Default rental yield
                  vacancyRate: 5, // Default vacancy rate
                  maintenanceCost: businessParams.monthlyExpenses
                }}
                onExportReport={() => {}}
              />
            )}
          </TabsContent>

          {/* Leasing Tab - New Functionality */}
          <TabsContent value="leasing">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Leasing Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Client and Vehicle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="clientName">Client Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="clientName"
                          value={leasingInputs.clientName}
                          onChange={(e) => updateLeasingField('clientName', e.target.value)}
                          placeholder="e.g. MIGUEL GARCIA"
                          className={leasingErrors.clientName ? "border-red-500" : ""}
                        />
                        {leasingErrors.clientName && <p className="text-sm text-red-500 mt-1">{leasingErrors.clientName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="vehicleInfo">Vehicle Information <span className="text-red-500">*</span></Label>
                        <Input
                          id="vehicleInfo"
                          value={leasingInputs.vehicleInfo}
                          onChange={(e) => updateLeasingField('vehicleInfo', e.target.value)}
                          placeholder="e.g. Lincoln AVIATOR 2025"
                          className={leasingErrors.vehicleInfo ? "border-red-500" : ""}
                        />
                        {leasingErrors.vehicleInfo && <p className="text-sm text-red-500 mt-1">{leasingErrors.vehicleInfo}</p>}
                      </div>
                      <div>
                        <Label htmlFor="promoter">Promoter</Label>
                        <Input
                          id="promoter"
                          value={leasingInputs.promoter}
                          onChange={(e) => updateLeasingField('promoter', e.target.value)}
                          placeholder="e.g. Sergio Rodriguez"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={leasingInputs.phone}
                          onChange={(e) => updateLeasingField('phone', e.target.value)}
                          placeholder="e.g. 8125138065"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={leasingInputs.city}
                          onChange={(e) => updateLeasingField('city', e.target.value)}
                          placeholder="e.g. Guadalajara, Jalisco"
                        />
                      </div>
                      <div>
                        <Label htmlFor="folio">Folio</Label>
                        <Input
                          id="folio"
                          value={leasingInputs.folio}
                          onChange={(e) => updateLeasingField('folio', e.target.value)}
                          placeholder="Auto-generated"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Parameters */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Parameters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="assetValue">Asset Value (without VAT) <span className="text-red-500">*</span></Label>
                        <CurrencyInput
                          id="assetValue"
                          value={leasingInputs.assetValue}
                          onChange={(value) => updateLeasingField('assetValue', value)}
                          placeholder="1,512,000.00"
                          className={leasingErrors.assetValue ? "border-red-500" : ""}
                        />
                        {leasingErrors.assetValue && <p className="text-sm text-red-500 mt-1">{leasingErrors.assetValue}</p>}
                      </div>
                      <div>
                        <Label htmlFor="downPayment">Down Payment <span className="text-red-500">*</span></Label>
                        <CurrencyInput
                          id="downPayment"
                          value={leasingInputs.downPayment}
                          onChange={(value) => updateLeasingField('downPayment', value)}
                          placeholder="226,800.00"
                          className={leasingErrors.downPayment ? "border-red-500" : ""}
                        />
                        {leasingErrors.downPayment && <p className="text-sm text-red-500 mt-1">{leasingErrors.downPayment}</p>}
                      </div>
                      <div>
                        <Label htmlFor="termMonths">Term (Months) <span className="text-red-500">*</span></Label>
                        <Input
                          id="termMonths"
                          type="number"
                          value={leasingInputs.termMonths}
                          onChange={(e) => updateLeasingField('termMonths', parseInt(e.target.value) || 0)}
                          placeholder="48"
                          min="1"
                          max="120"
                          className={leasingErrors.termMonths ? "border-red-500" : ""}
                        />
                        {leasingErrors.termMonths && <p className="text-sm text-red-500 mt-1">{leasingErrors.termMonths}</p>}
                      </div>
                      <div>
                        <Label htmlFor="clientRate">Client Annual Rate (%) <span className="text-red-500">*</span></Label>
                        <Input
                          id="clientRate"
                          type="number"
                          step="0.1"
                          value={leasingInputs.clientAnnualInterestRate}
                          onChange={(e) => updateLeasingField('clientAnnualInterestRate', parseFloat(e.target.value) || 0)}
                          placeholder="12.0"
                          min="0"
                          max="50"
                          className={leasingErrors.clientAnnualInterestRate ? "border-red-500" : ""}
                        />
                        {leasingErrors.clientAnnualInterestRate && <p className="text-sm text-red-500 mt-1">{leasingErrors.clientAnnualInterestRate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="residualValue">Residual Value (%) <span className="text-red-500">*</span></Label>
                        <Input
                          id="residualValue"
                          type="number"
                          step="0.1"
                          value={leasingInputs.residualValuePercentage}
                          onChange={(e) => updateLeasingField('residualValuePercentage', parseFloat(e.target.value) || 0)}
                          placeholder="13.0"
                          min="0"
                          max="100"
                          className={leasingErrors.residualValuePercentage ? "border-red-500" : ""}
                        />
                        {leasingErrors.residualValuePercentage && <p className="text-sm text-red-500 mt-1">{leasingErrors.residualValuePercentage}</p>}
                      </div>
                      <div>
                        <Label htmlFor="investorRate">Investor Rate (%) <span className="text-red-500">*</span></Label>
                        <Input
                          id="investorRate"
                          type="number"
                          step="0.1"
                          value={leasingInputs.investorAnnualInterestRate}
                          onChange={(e) => updateLeasingField('investorAnnualInterestRate', parseFloat(e.target.value) || 0)}
                          placeholder="8.5"
                          min="0"
                          max="50"
                          className={leasingErrors.investorAnnualInterestRate ? "border-red-500" : ""}
                        />
                        {leasingErrors.investorAnnualInterestRate && <p className="text-sm text-red-500 mt-1">{leasingErrors.investorAnnualInterestRate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="investorAmount">Investor Loan Amount <span className="text-red-500">*</span></Label>
                        <CurrencyInput
                          id="investorAmount"
                          value={leasingInputs.investorLoanAmount}
                          onChange={(value) => updateLeasingField('investorLoanAmount', value)}
                          placeholder="1,285,200.00"
                          className={leasingErrors.investorLoanAmount ? "border-red-500" : ""}
                        />
                        {leasingErrors.investorLoanAmount && <p className="text-sm text-red-500 mt-1">{leasingErrors.investorLoanAmount}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Additional Fields for PDF */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Additional Information for Quotation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="insurance">First Year Insurance</Label>
                        <CurrencyInput
                          id="insurance"
                          value={leasingInputs.firstYearInsurance}
                          onChange={(value) => updateLeasingField('firstYearInsurance', value)}
                          placeholder="32,758.62"
                        />
                      </div>
                      <div>
                        <Label htmlFor="commission">Opening Commission</Label>
                        <CurrencyInput
                          id="commission"
                          value={leasingInputs.openingCommission}
                          onChange={(value) => updateLeasingField('openingCommission', value)}
                          placeholder="22,158.62"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminExpenses">Admin Expenses (Monthly)</Label>
                        <CurrencyInput
                          id="adminExpenses"
                          value={leasingInputs.adminExpenses}
                          onChange={(value) => updateLeasingField('adminExpenses', value)}
                          placeholder="18,168.60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleCalculateLeasing}
                      disabled={leasingCalculateMutation.isPending}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Calculator className="w-4 h-4" />
                      {leasingCalculateMutation.isPending ? "Calculating..." : "Calculate Leasing"}
                    </Button>
                    {leasingResults && (
                      <Button 
                        onClick={handleGenerateLeasingPDF}
                        variant="outline"
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Generate PDF
                      </Button>
                    )}
                  </div>

                  {/* Results Display */}
                  {leasingResults && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 text-green-600">Calculation Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Client Monthly Payment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(leasingResults.models.clientQuotation.monthlyPayment)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Lessor Monthly Cost</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(leasingResults.models.lessorCost.monthlyPayment)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Gross Monthly Margin</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(leasingResults.models.profitability.grossMonthlyMargin)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Total Profit</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(leasingResults.models.profitability.totalProfit)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Profit Margin</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {leasingResults.models.profitability.profitMarginPercentage.toFixed(2)}%
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}