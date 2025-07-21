import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CalculatorIcon, Wand2 } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { AboutFooter } from "@/components/calculator/AboutFooter";
import { Link, useLocation } from "wouter";
import { TabNavigation, MainTab, LenderSubTab, RenterSubTab } from "@/components/calculator/TabNavigation";
import { LoanParametersCard, LoanParameters } from "@/components/calculator/LoanParametersCard";
import { InvestorsCard, Investor } from "@/components/calculator/InvestorsCard";
import { BusinessParametersCard, BusinessParameters } from "@/components/calculator/BusinessParametersCard";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
import { SetupWizard } from "@/components/calculator/SetupWizard";
import { ProjectionsTab } from "@/components/calculator/ProjectionsTab";
import { BankerReportsTab } from "@/components/calculator/BankerReportsTab";
import { RenterSummaryTab } from "@/components/calculator/RenterSummaryTab";
import { RenterCashFlowTab } from "@/components/calculator/RenterCashFlowTab";
import { RenterIncomeStatementTab } from "@/components/calculator/RenterIncomeStatementTab";
import { RenterMetricsExplainedTab } from "@/components/calculator/RenterMetricsExplainedTab";
import { RenterConfigModal, RenterConfig } from "@/components/calculator/RenterConfigModal";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  calculateMonthlyPayment,
  generatePaymentSchedule,
  calculateInvestorReturns,
  PaymentScheduleEntry
} from "@/lib/finance";
import { generateProjectSummaryReport } from "@/lib/simplePdfGenerator";

export default function Home() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('input');
  const [activeLenderSubTab, setActiveLenderSubTab] = useState<LenderSubTab>('schedule');
  const [activeRenterSubTab, setActiveRenterSubTab] = useState<RenterSubTab>('summary');
  const [wizardOpen, setWizardOpen] = useState(false);

  // Interactive revenue state for renter/operator analysis
  const [interactiveRevenue, setInteractiveRevenue] = useState<number>(15000);

  // Renter configuration state
  const [renterConfig, setRenterConfig] = useState<RenterConfig>({
    discountRate: 4.0,
    residualValueRate: 15
  });

  // Generate or get session ID
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', id);
    }
    return id;
  });

  // Load settings from server on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/user-settings/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.investors && data.investors.length >= 3) {
            setInvestors(data.investors);
          }
          if (data.businessParams) {
            setBusinessParams(data.businessParams);
          }
          if (data.renterConfig) {
            setRenterConfig(data.renterConfig);
          }
        }
      } catch (error) {
        console.error('Error loading settings from server:', error);
      }
    };

    // Load from localStorage first
    const savedBusinessParams = localStorage.getItem('businessParams');
    if (savedBusinessParams) {
      try {
        const parsed = JSON.parse(savedBusinessParams);
        setBusinessParams({
          assetCost: parsed.assetCost || 100000,
          otherExpenses: parsed.otherExpenses || 0,
          monthlyExpenses: parsed.monthlyExpenses || 0,
        });
      } catch (error) {
        console.error('Error parsing saved business parameters:', error);
      }
    }

    loadSettings();
  }, [sessionId]);

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [loanParams, setLoanParams] = useState<LoanParameters>({
    loanName: "New Loan",
    totalAmount: 100000,
    interestRate: 10,
    termMonths: 36,
    startDate: todayDate,
    paymentFrequency: 'monthly'
  });

  // Load investors from server storage
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 1, name: "Investor 1", investmentAmount: 40000 },
    { id: 2, name: "Investor 2", investmentAmount: 35000 },
    { id: 3, name: "Investor 3", investmentAmount: 25000 }
  ]);

  const [businessParams, setBusinessParams] = useState<BusinessParameters>({
    assetCost: 100000,
    otherExpenses: 0,
    monthlyExpenses: 0,
  });

  const [calculationResults, setCalculationResults] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    paymentSchedule: PaymentScheduleEntry[];
    investorReturns: any[];
    endDate: Date;
  } | null>(null);

  const [inputsValid, setInputsValid] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [validations, setValidations] = useState({
    isLoanNameValid: true,
    isTermValid: true,
  });

  const handleValidationChange = useCallback((newValidations: { isLoanNameValid: boolean; isTermValid: boolean }) => {
    setValidations(newValidations);
  }, []);

  useEffect(() => {
    // Check if asset cost is valid (not less than loan amount)
    const assetCostValid = businessParams.assetCost >= loanParams.totalAmount;

    const isButtonEnabled =
      validations.isLoanNameValid &&
      validations.isTermValid &&
      loanParams.interestRate > 0 &&
      loanParams.termMonths > 0 &&
      investors.length >= 1 &&
      investors.every(investor => investor.name.trim() !== "") &&
      assetCostValid;

    setInputsValid(isButtonEnabled);
  }, [loanParams, investors, validations, businessParams.assetCost]);

  // Set break-even revenue when calculation results become available
  useEffect(() => {
    if (calculationResults?.monthlyPayment) {
      const breakEvenRevenue = calculationResults.monthlyPayment + businessParams.monthlyExpenses;
      setInteractiveRevenue(breakEvenRevenue);
    }
  }, [calculationResults, businessParams.monthlyExpenses]);



  // Save investors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('investors', JSON.stringify(investors));
  }, [investors]);

  // Save business parameters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('businessParams', JSON.stringify(businessParams));
  }, [businessParams]);

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calculate", {
        loanParams,
        investors,
        businessParams,
        paymentFrequency: loanParams.paymentFrequency,
      });
      const data = await response.json();

      const paymentSchedule = data.paymentSchedule.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
        payment: Number(payment.payment || payment.amount),
        principal: Number(payment.principal),
        interest: Number(payment.interest),
        balance: Number(payment.balance)
      }));

      const transformedInvestorReturns = data.investorReturns.map((investor: any) => {
        if (!Array.isArray(investor.monthlyReturns)) {
            return { ...investor, totalInterest: 0, totalReturn: investor.investmentAmount, monthlyReturns: [] };
        }

        const numericMonthlyReturns = investor.monthlyReturns.map((ret: any) => 
            typeof ret === 'object' ? Number(ret.monthlyReturn || 0) : Number(ret || 0)
        );

        const totalInterest = numericMonthlyReturns.reduce((sum: number, current: number) => sum + current, 0);
        const totalReturn = investor.investmentAmount + totalInterest;

        return {
          ...investor,
          totalInterest: totalInterest,
          totalReturn: totalReturn,
          monthlyReturns: numericMonthlyReturns,
        };
      });

      return {
        loanId: data.loanId,
        monthlyPayment: data.monthlyPayment,
        totalInterest: data.totalInterest,
        paymentSchedule: paymentSchedule,
        investorReturns: transformedInvestorReturns,
        endDate: new Date(data.endDate)
      };
    },
    onSuccess: (data) => {
      setCalculationResults(data);
      setActiveMainTab('lender-investor');
      setActiveLenderSubTab('schedule');
      setIsCalculating(false);
      toast({
        title: "Calculation Complete",
        description: "Your investment returns have been calculated successfully.",
      });
    },
    onError: (error) => {
      setIsCalculating(false);
      toast({
        title: "Calculation Failed",
        description: error.message || "There was an error calculating your investment returns.",
        variant: "destructive",
      });
    }
  });

  const handleCalculate = () => {
    const totalInvestment = investors.reduce(
      (sum, investor) => sum + investor.investmentAmount,
      0
    );

    if (Math.abs(totalInvestment - loanParams.totalAmount) >= 0.01) {
      toast({
        title: "Amount Mismatch",
        description: "Total investment amount must exactly match the loan amount.",
        variant: "destructive",
      });
      return;
    }

    if (!inputsValid) {
      toast({
        title: "Validation Error",
        description: "Please ensure all required fields are filled correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    calculateMutation.mutate();
  };

  const handleExportSummary = () => {
    if (!calculationResults) {
      toast({
        title: "No Data to Export",
        description: "Please calculate the investment returns first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Report...",
      description: "Your summary report is being created.",
    });

    try {
      const doc = generateProjectSummaryReport(
        loanParams.totalAmount,
        loanParams.interestRate,
        loanParams.termMonths,
        loanParams.startDate,
        calculationResults.endDate,
        calculationResults.monthlyPayment,
        calculationResults.totalInterest,
        calculationResults.investorReturns
      );

      doc.save(`project_summary_${loanParams.loanName.replace(/\s+/g, '_')}.pdf`);

      toast({
        title: "Export Complete",
        description: "Your summary report has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating summary report:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while generating the report.",
        variant: "destructive",
      });
    }
  };

  const openWizard = () => {
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  const handleWizardSave = (loanParams: LoanParameters, investors: Investor[], businessParams: BusinessParameters) => {
    setLoanParams(loanParams);
    setInvestors(investors);
    setBusinessParams(businessParams);
    setWizardOpen(false);
  };

  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'input':
        return (
          <div className="px-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div>
                <LoanParametersCard
                  loanParams={loanParams}
                  setLoanParams={setLoanParams}
                  isCalculating={calculateMutation.isPending}
                  onValidationChange={handleValidationChange}
                />
              </div>
              <div>
                <InvestorsCard
                  investors={investors}
                  setInvestors={setInvestors}
                  totalRequired={loanParams.totalAmount}
                  isCalculating={calculateMutation.isPending}
                />
              </div>
              <div>
                <BusinessParametersCard
                  businessParams={businessParams}
                  setBusinessParams={setBusinessParams}
                  isCalculating={calculateMutation.isPending}
                  loanAmount={loanParams.totalAmount}
                />
              </div>
            </div>
          </div>
        );

      case 'lender-investor':
        if (!calculationResults) {
          return (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No calculation results available.</p>
              <p className="text-sm text-muted-foreground">Please complete the calculation in the Input Parameters tab first.</p>
            </div>
          );
        }

        switch (activeLenderSubTab) {
          case 'schedule':
            return (
              <PaymentScheduleTab
                loanAmount={loanParams.totalAmount}
                monthlyPayment={calculationResults.monthlyPayment}
                totalInterest={calculationResults.totalInterest}
                paymentSchedule={calculationResults.paymentSchedule}
              />
            );
          case 'investors':
            return (
              <InvestorReturnsTab
                investorReturns={calculationResults.investorReturns}
                paymentSchedule={calculationResults.paymentSchedule}
              />
            );
          case 'summary':
            return (
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
            );
          case 'projections':
            return (
              <ProjectionsTab
                loanAmount={loanParams.totalAmount}
                interestRate={loanParams.interestRate}
                termMonths={loanParams.termMonths}
                monthlyPayment={calculationResults.monthlyPayment}
                startDate={loanParams.startDate}
              />
            );
          case 'reports':
            return (
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
            );
          default:
            return null;
        }

      case 'renter-operator':
        if (!calculationResults) {
          return (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No calculation results available.</p>
              <p className="text-sm text-muted-foreground">Please complete the calculation in the Input Parameters tab first.</p>
            </div>
          );
        }

        switch (activeRenterSubTab) {
          case 'summary':
            return (
              <RenterSummaryTab
                loanAmount={typeof loanParams.totalAmount === 'number' && !isNaN(loanParams.totalAmount) ? loanParams.totalAmount : 0}
                monthlyPayment={typeof calculationResults.monthlyPayment === 'number' && !isNaN(calculationResults.monthlyPayment) ? calculationResults.monthlyPayment : 0}
                termMonths={typeof loanParams.termMonths === 'number' && !isNaN(loanParams.termMonths) ? loanParams.termMonths : 60}
                interestRate={typeof loanParams.interestRate === 'number' && !isNaN(loanParams.interestRate) ? loanParams.interestRate : 0}
                otherExpenses={typeof businessParams.monthlyExpenses === 'number' && !isNaN(businessParams.monthlyExpenses) ? businessParams.monthlyExpenses : 0}
                monthlyRevenue={typeof interactiveRevenue === 'number' && !isNaN(interactiveRevenue) ? interactiveRevenue : 0}
                setMonthlyRevenue={setInteractiveRevenue}
                assetCost={(() => {
                  const cost = (typeof businessParams.assetCost === 'number' && !isNaN(businessParams.assetCost) ? businessParams.assetCost : 0) + 
                               (typeof businessParams.otherExpenses === 'number' && !isNaN(businessParams.otherExpenses) ? businessParams.otherExpenses : 0);
                  return cost;
                })()}
                discountRate={typeof renterConfig.discountRate === 'number' && !isNaN(renterConfig.discountRate) ? renterConfig.discountRate / 100 : 0.04}
                residualValueRate={typeof renterConfig.residualValueRate === 'number' && !isNaN(renterConfig.residualValueRate) ? renterConfig.residualValueRate / 100 : 0.15}
              />
            );
          case 'cash-flow':
            return (
              <RenterCashFlowTab
                loanAmount={loanParams.totalAmount}
                monthlyPayment={calculationResults.monthlyPayment}
                termMonths={loanParams.termMonths}
                otherExpenses={businessParams.monthlyExpenses}
                monthlyRevenue={interactiveRevenue}
                setMonthlyRevenue={setInteractiveRevenue}
              />
            );
          case 'income-statement':
            return (
              <RenterIncomeStatementTab
                loanAmount={loanParams.totalAmount}
                monthlyPayment={calculationResults.monthlyPayment}
                termMonths={loanParams.termMonths}
                interestRate={loanParams.interestRate}
                otherExpenses={businessParams.monthlyExpenses}
                monthlyRevenue={interactiveRevenue}
                setMonthlyRevenue={setInteractiveRevenue}
                assetCost={businessParams.assetCost + businessParams.otherExpenses}
                discountRate={renterConfig.discountRate / 100}
                residualValueRate={renterConfig.residualValueRate / 100}
              />
            );
          case 'metrics-explained':
            return <RenterMetricsExplainedTab />;
          default:
            return null;
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900 text-foreground">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            {activeMainTab === 'renter-operator' && (
              <RenterConfigModal
                config={renterConfig}
                onConfigChange={setRenterConfig}
              />
            )}
          </div>
          <div className="flex gap-3">
            {activeMainTab === 'input' && (
              <Button
                onClick={handleCalculate}
                disabled={!inputsValid || calculateMutation.isPending}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                {calculateMutation.isPending ? "Calculating..." : "Calculate Investment Returns"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={openWizard}
              className="px-6 border-2 hover:bg-blue-50"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              Setup Wizard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/saved-calculations"}
              className="border-2 hover:bg-purple-50"
            >
              View Saved Calculations
            </Button>
          </div>
        </div>

        <TabNavigation 
          activeMainTab={activeMainTab} 
          setActiveMainTab={setActiveMainTab}
          activeLenderSubTab={activeLenderSubTab}
          setActiveLenderSubTab={setActiveLenderSubTab}
          activeRenterSubTab={activeRenterSubTab}
          setActiveRenterSubTab={setActiveRenterSubTab}
          showSubTabs={calculationResults !== null}
        />

        <div className="tab-content min-h-[60vh]">
          {renderMainTabContent()}
        </div>
      </main>

      <Footer />

      <AboutFooter />

      <SetupWizard
        isOpen={wizardOpen}
        onClose={closeWizard}
        onSave={handleWizardSave}
        initialLoanParams={loanParams}
        initialInvestors={investors}
        initialBusinessParams={businessParams}
      />
    </div>
  );
}