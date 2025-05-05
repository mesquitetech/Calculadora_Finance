import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalculatorIcon, Wand2 } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { Link, useLocation } from "wouter";
import { TabNavigation, Tab } from "@/components/calculator/TabNavigation";
import { LoanParametersCard, LoanParameters } from "@/components/calculator/LoanParametersCard";
import { InvestorsCard, Investor } from "@/components/calculator/InvestorsCard";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
import { SetupWizard } from "@/components/calculator/SetupWizard";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  calculateMonthlyPayment, 
  generatePaymentSchedule,
  calculateInvestorReturns,
  PaymentScheduleEntry
} from "@/lib/finance";

export default function Home() {
  // Use the Tab type imported from TabNavigation
  const [activeTab, setActiveTab] = useState<Tab>('input');
  
  // State for wizard
  const [wizardOpen, setWizardOpen] = useState(false);

  // State for loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    totalAmount: 100000,
    interestRate: 5.75,
    termMonths: 36,
    startDate: new Date('2023-08-01'),
    paymentFrequency: 'monthly'
  });

  // State for investors
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 1, name: "John Doe", investmentAmount: 40000 },
    { id: 2, name: "Jane Smith", investmentAmount: 35000 },
    { id: 3, name: "Robert Johnson", investmentAmount: 25000 }
  ]);

  // State for calculation results
  const [calculationResults, setCalculationResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    paymentSchedule: PaymentScheduleEntry[];
    investorReturns: any[];
    endDate: Date;
  } | null>(null);

  // Check if inputs are valid
  const [inputsValid, setInputsValid] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Validate inputs
  useEffect(() => {
    const totalInvestment = investors.reduce(
      (sum, investor) => sum + investor.investmentAmount,
      0
    );

    const isValid =
      loanParams.totalAmount > 0 &&
      loanParams.interestRate >= 0 &&
      loanParams.termMonths > 0 &&
      investors.length >= 3 &&
      investors.every(investor => investor.name.trim() !== "") &&
      Math.abs(totalInvestment - loanParams.totalAmount) < 0.01;

    setInputsValid(isValid);
  }, [loanParams, investors]);

  // Calculation mutation using TanStack Query
  const calculateMutation = useMutation({
    mutationFn: async () => {
      // Send calculation request to server
      const response = await apiRequest("POST", "/api/calculate", {
        loanParams,
        investors
      });
      
      const data = await response.json();
      
      // Process the response from server
      const paymentSchedule = data.paymentSchedule.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
        payment: Number(payment.amount),
        principal: Number(payment.principal),
        interest: Number(payment.interest),
        balance: Number(payment.balance)
      }));
      
      // Return the processed data
      return {
        loanId: data.loanId,
        monthlyPayment: data.monthlyPayment,
        totalInterest: data.totalInterest,
        paymentSchedule: paymentSchedule,
        investorReturns: data.investorReturns,
        endDate: new Date(data.endDate)
      };
    },
    onSuccess: (data) => {
      setCalculationResults(data);
      setActiveTab('schedule');
      toast({
        title: "Calculation Complete",
        description: "Your investment returns have been calculated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Calculation Failed",
        description: error.message || "There was an error calculating your investment returns.",
        variant: "destructive",
      });
    }
  });

  const handleCalculate = () => {
    if (!inputsValid) {
      toast({
        title: "Validation Error",
        description: "Please ensure all required fields are filled correctly and investor amounts match the loan amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCalculating(true);
    calculateMutation.mutate();
  };

  const handleExportSummary = () => {
    toast({
      title: "Export Started",
      description: "Your summary report is being generated.",
    });
    
    // In a real app, this would trigger a download from the server
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your summary report has been downloaded.",
      });
    }, 1500);
  };
  
  // Wizard functions
  const openWizard = () => {
    setWizardOpen(true);
  };
  
  const closeWizard = () => {
    setWizardOpen(false);
  };
  
  const handleWizardSave = (newLoanParams: LoanParameters, newInvestors: Investor[]) => {
    setLoanParams(newLoanParams);
    setInvestors(newInvestors);
    
    toast({
      title: "Setup Complete",
      description: "Your financing plan has been created successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900 text-foreground">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Finance Calculator</h1>
          <div className="flex gap-3">
            <Button
              onClick={handleCalculate}
              disabled={!inputsValid || calculateMutation.isPending}
              className="px-6"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Calculate Investment Returns
            </Button>
            <Button
              variant="outline"
              onClick={openWizard}
              className="px-6"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              Setup Wizard
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = "/"}
            >
              Calculator
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/saved-calculations"}
            >
              View Saved Calculations
            </Button>
          </div>
        </div>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="tab-content">
          {/* Input Parameters Tab */}
          {activeTab === 'input' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LoanParametersCard 
                  loanParams={loanParams} 
                  setLoanParams={setLoanParams}
                  isCalculating={calculateMutation.isPending}
                />
                <InvestorsCard 
                  investors={investors} 
                  setInvestors={setInvestors}
                  totalRequired={loanParams.totalAmount}
                  isCalculating={calculateMutation.isPending}
                />
              </div>
              
              {/* Removed duplicate Calculate button since we moved it to the top */}
            </div>
          )}

          {/* Payment Schedule Tab */}
          {activeTab === 'schedule' && calculationResults && (
            <PaymentScheduleTab 
              loanAmount={loanParams.totalAmount}
              monthlyPayment={calculationResults.monthlyPayment}
              totalInterest={calculationResults.totalInterest}
              paymentSchedule={calculationResults.paymentSchedule}
            />
          )}

          {/* Investor Returns Tab */}
          {activeTab === 'investors' && calculationResults && (
            <InvestorReturnsTab 
              investorReturns={calculationResults.investorReturns}
              paymentSchedule={calculationResults.paymentSchedule}
            />
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && calculationResults && (
            <SummaryTab 
              loanAmount={loanParams.totalAmount}
              interestRate={loanParams.interestRate}
              termMonths={loanParams.termMonths}
              monthlyPayment={calculationResults.monthlyPayment}
              totalInterest={calculationResults.totalInterest}
              startDate={loanParams.startDate}
              endDate={calculationResults.endDate}
              investors={calculationResults.investorReturns}
              paymentSchedule={calculationResults.paymentSchedule}
              onExport={handleExportSummary}
            />
          )}

          {/* Reports & Documents Tab */}
          {activeTab === 'reports' && calculationResults && (
            <ReportsTab
              loanAmount={loanParams.totalAmount}
              interestRate={loanParams.interestRate}
              termMonths={loanParams.termMonths}
              monthlyPayment={calculationResults.monthlyPayment}
              totalInterest={calculationResults.totalInterest}
              startDate={loanParams.startDate}
              endDate={calculationResults.endDate}
              investors={calculationResults.investorReturns}
              paymentSchedule={calculationResults.paymentSchedule}
            />
          )}
        </div>
      </main>

      <Footer />
      
      {/* Setup Wizard */}
      <SetupWizard
        isOpen={wizardOpen}
        onClose={closeWizard}
        onSave={handleWizardSave}
        initialLoanParams={loanParams}
        initialInvestors={investors}
      />
    </div>
  );
}
