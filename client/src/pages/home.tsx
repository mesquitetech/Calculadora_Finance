import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorIcon, Wand2, Calculator, Users, TrendingUp, ArrowLeft, ArrowRight, CheckCircle, Car } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { AboutFooter } from "@/components/calculator/AboutFooter";
import { Link, useLocation } from "wouter";
import { TabNavigation, MainTab, LenderSubTab, RenterSubTab } from "@/components/calculator/TabNavigation";
import { LoanParameters, LoanParametersCard } from "@/components/calculator/LoanParametersCard";
import { Investor } from "@/components/calculator/InvestorsCard";
import { BusinessParameters, BusinessParametersCard } from "@/components/calculator/BusinessParametersCard";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
import { ProjectionsTab } from "@/components/calculator/ProjectionsTab";
import { RenterAnalysisTab } from "@/components/calculator/RenterAnalysisTab";
import { RenterMetricsExplainedTab } from "@/components/calculator/RenterMetricsExplainedTab";
import { RenterConfigModal, RenterConfig } from "@/components/calculator/RenterConfigModal";
import { OperatorDashboardTab } from "@/components/calculator/OperatorDashboardTab";
import { LesseeQuoteTab } from "@/components/calculator/LesseeQuoteTab";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  calculateMonthlyPayment,
  generatePaymentSchedule,
  calculateInvestorReturns,
  PaymentScheduleEntry,
  formatCurrency
} from "@/lib/finance";
import { generateProjectSummaryReport } from "@/lib/simplePdfGenerator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Settings, DollarSign, Percent, Calendar, Truck, Trash, Plus, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AdvancedConfigModal, type AdvancedConfig } from "@/components/calculator/AdvancedConfigModal";

type WizardStep = 'asset-leasing' | 'financing-investors' | 'review-calculate';

export default function Home() {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('input');
  const [activeLenderSubTab, setActiveLenderSubTab] = useState<LenderSubTab>('schedule');
  const [activeRenterSubTab, setActiveRenterSubTab] = useState<RenterSubTab>('dashboard');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState<WizardStep>('asset-leasing');

  // Interactive revenue state for renter/operator analysis
  const [interactiveRevenue, setInteractiveRevenue] = useState<number>(18000);

  // Renter configuration state
  const [renterConfig, setRenterConfig] = useState<RenterConfig>({
    discountRate: 4,
    residualValueRate: 20
  });

  // Advanced configuration state
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    residualValueRate: 25,
    discountRate: 4,
    adminCommissionPct: 1,
    securityDepositMonths: 1
  });

  // Generate or get session ID
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', id);

      // Clean up any corrupted localStorage data
      localStorage.removeItem('businessParams');
      localStorage.removeItem('investors');
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
            // Only update if the saved values are meaningful (not 0 or undefined)
            setBusinessParams(prev => ({
              assetCost: data.businessParams.assetCost > 0 ? data.businessParams.assetCost : prev.assetCost,
              otherExpenses: data.businessParams.otherExpenses !== undefined ? data.businessParams.otherExpenses : prev.otherExpenses,
              monthlyExpenses: data.businessParams.monthlyExpenses !== undefined ? data.businessParams.monthlyExpenses : prev.monthlyExpenses,
              lessorProfitMarginPct: data.businessParams.lessorProfitMarginPct > 0 ? data.businessParams.lessorProfitMarginPct : prev.lessorProfitMarginPct,
              fixedMonthlyFee: data.businessParams.fixedMonthlyFee > 0 ? data.businessParams.fixedMonthlyFee : prev.fixedMonthlyFee,
              adminCommissionPct: data.businessParams.adminCommissionPct > 0 ? data.businessParams.adminCommissionPct : prev.adminCommissionPct,
              securityDepositMonths: data.businessParams.securityDepositMonths > 0 ? data.businessParams.securityDepositMonths : prev.securityDepositMonths,
              deliveryCosts: data.businessParams.deliveryCosts > 0 ? data.businessParams.deliveryCosts : prev.deliveryCosts,
              residualValueRate: data.businessParams.residualValueRate > 0 ? data.businessParams.residualValueRate : prev.residualValueRate,
              discountRate: data.businessParams.discountRate > 0 ? data.businessParams.discountRate : prev.discountRate,
              profitMarginPesos: data.businessParams.profitMarginPesos > 0 ? data.businessParams.profitMarginPesos : prev.profitMarginPesos,
            }));
          }
          if (data.renterConfig) {
            setRenterConfig(data.renterConfig);
          }
          // Load advanced settings if available
          if (data.advancedConfig) {
            setAdvancedConfig(data.advancedConfig);
          }
        }
      } catch (error) {
        console.error('Error loading settings from server:', error);
      }
    };

    // Load from localStorage - only if values are meaningful
    const savedBusinessParams = localStorage.getItem('businessParams');
    if (savedBusinessParams) {
      try {
        const parsed = JSON.parse(savedBusinessParams);
        // Only apply saved values if they are meaningful (not 0 or empty)
        setBusinessParams(prev => ({
          assetCost: parsed.assetCost > 0 ? parsed.assetCost : prev.assetCost,
          otherExpenses: parsed.otherExpenses !== undefined ? parsed.otherExpenses : prev.otherExpenses,
          monthlyExpenses: parsed.monthlyExpenses !== undefined ? parsed.monthlyExpenses : prev.monthlyExpenses,
          lessorProfitMarginPct: parsed.lessorProfitMarginPct > 0 ? parsed.lessorProfitMarginPct : prev.lessorProfitMarginPct,
          fixedMonthlyFee: parsed.fixedMonthlyFee > 0 ? parsed.fixedMonthlyFee : prev.fixedMonthlyFee,
          adminCommissionPct: parsed.adminCommissionPct > 0 ? parsed.adminCommissionPct : prev.adminCommissionPct,
          securityDepositMonths: parsed.securityDepositMonths > 0 ? parsed.securityDepositMonths : prev.securityDepositMonths,
          deliveryCosts: parsed.deliveryCosts > 0 ? parsed.deliveryCosts : prev.deliveryCosts,
          residualValueRate: parsed.residualValueRate > 0 ? parsed.residualValueRate : prev.residualValueRate,
          discountRate: parsed.discountRate > 0 ? parsed.discountRate : prev.discountRate,
          profitMarginPesos: parsed.profitMarginPesos > 0 ? parsed.profitMarginPesos : prev.profitMarginPesos,
        }));
      } catch (error) {
        console.error('Error parsing saved business parameters:', error);
      }
    }

    // Load advanced config from localStorage
    const savedAdvancedConfig = localStorage.getItem('advancedConfig');
    if (savedAdvancedConfig) {
      try {
        setAdvancedConfig(JSON.parse(savedAdvancedConfig));
      } catch (error) {
        console.error('Error parsing saved advanced config:', error);
      }
    }


    loadSettings();
  }, [sessionId]);

  // Sync business parameters with advanced config
  useEffect(() => {
    setBusinessParams(prev => ({
      ...prev,
      residualValueRate: advancedConfig.residualValueRate,
      discountRate: advancedConfig.discountRate,
      adminCommissionPct: advancedConfig.adminCommissionPct,
      securityDepositMonths: advancedConfig.securityDepositMonths
    }));
  }, [advancedConfig]);

  // Save advanced config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('advancedConfig', JSON.stringify(advancedConfig));
  }, [advancedConfig]);


  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const [loanParams, setLoanParams] = useState<LoanParameters>({
    loanName: "Equipment Leasing Project",
    assetCost: 150000,
    downPayment: 0,
    interestRate: 8.5,
    termMonths: 48,
    startDate: todayDate,
    paymentFrequency: 'monthly'
  });

  // Load investors from server storage
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 1, name: "Primary Bank", investmentAmount: 75000, percentage: 50 }, // 50%
    { id: 2, name: "Investment Fund A", investmentAmount: 45000, percentage: 30 }, // 30%
    { id: 3, name: "Private Investor", investmentAmount: 30000, percentage: 20 }  // 20%
  ]);

  const [businessParams, setBusinessParams] = useState<BusinessParameters>({
    assetCost: 150000, // Initial value, will be synced with loanParams.assetCost
    otherExpenses: 5000, // Gastos iniciales adicionales
    monthlyExpenses: 0, // Gastos operativos mensuales
    lessorProfitMarginPct: 18.0, // 18% margen de ganancia
    fixedMonthlyFee: 250.0, // Cuota administrativa fija
    adminCommissionPct: 1.0, // 1% comisión por apertura (now from advancedConfig)
    securityDepositMonths: 1, // 1 mes de depósito (now from advancedConfig)
    deliveryCosts: 7500.0, // Costos de trámites y entrega
    residualValueRate: 25.0, // 25% valor residual (now from advancedConfig)
    discountRate: 4.0, // 4% tasa de descuento (now from advancedConfig)
    profitMarginPesos: 500, // New field for peso-based profit margin
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

  // Validation states for wizard steps
  const [loanNameError, setLoanNameError] = useState('');
  const [termError, setTermError] = useState('');
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [investorError, setInvestorError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'amount' | 'percentage'>('percentage');
  const [percentageInputs, setPercentageInputs] = useState<{[key: number]: string}>({});

  const handleValidationChange = useCallback((newValidations: { isLoanNameValid: boolean; isTermValid: boolean }) => {
    setValidations(newValidations);
  }, []);

  const handleResidualValueChange = useCallback((value: number) => {
    setBusinessParams(prev => ({ ...prev, residualValueRate: value }));
  }, []);

  useEffect(() => {
    // Validation: Asset cost must be greater than or equal to down payment
    const assetCostValid = businessParams.assetCost >= loanParams.downPayment;
    // Validation: Down payment must be non-negative and not exceed asset cost
    const downPaymentValid = loanParams.downPayment >= 0 && loanParams.downPayment <= loanParams.assetCost;


    const isButtonEnabled =
      validations.isLoanNameValid &&
      validations.isTermValid &&
      loanParams.interestRate > 0 &&
      loanParams.termMonths > 0 &&
      investors.length >= 1 &&
      investors.every(investor => investor.name.trim() !== "") &&
      assetCostValid &&
      downPaymentValid;

    setInputsValid(isButtonEnabled);
  }, [loanParams, investors, validations, businessParams.assetCost, loanParams.downPayment, loanParams.assetCost]);

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

  // Validation effects for wizard
  useEffect(() => {
    // Validación del nombre del préstamo
    const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;
    if (loanParams.loanName.length > 0 && !isLoanNameValid) {
      setLoanNameError(loanParams.loanName.length < 3 ? 'Loan name must be at least 3 characters long.' : 'Loan name must be shorter than 60 characters.');
    } else {
      setLoanNameError('');
    }

    // Validación del plazo del préstamo
    const { termMonths, paymentFrequency } = loanParams;
    let isTermValid = true;
    let termErrorMessage = '';
    const monthsPerPeriod = {
      'monthly': 1,
      'quarterly': 3,
      'semi-annual': 6,
      'annual': 12
    }[paymentFrequency];

    if (termMonths > 0 && termMonths % monthsPerPeriod !== 0) {
      isTermValid = false;
      termErrorMessage = `For ${paymentFrequency} payments, term must be a multiple of ${monthsPerPeriod}.`;
    }
    setTermError(termErrorMessage);

    // Notificar al componente padre del estado de ambas validaciones
    handleValidationChange({ isLoanNameValid, isTermValid });

  }, [loanParams.loanName, loanParams.termMonths, loanParams.paymentFrequency, handleValidationChange]);

  // Recalculate amounts when totalRequired changes (loan amount changes)
  useEffect(() => {
    if (loanParams.assetCost > 0) {
      const financedAmount = loanParams.assetCost - loanParams.downPayment;
      const updatedInvestors = investors.map(investor => ({
        ...investor,
        investmentAmount: (investor.percentage / 100) * financedAmount
      }));

      // Only update if there's actually a change to prevent infinite loops
      const hasChanged = investors.some((investor, index) => 
        Math.abs(investor.investmentAmount - updatedInvestors[index].investmentAmount) > 0.01
      );

      if (hasChanged) {
        setInvestors(updatedInvestors);
      }
    }
  }, [loanParams.assetCost, loanParams.downPayment]); // Removed investors from dependencies to prevent loops

  // Calculate total investment whenever investors change
  useEffect(() => {
    const total = investors.reduce(
      (sum, investor) => sum + investor.investmentAmount,
      0
    );
    setTotalInvestment(total);

    // Clear error if investments match the financed amount (assetCost - downPayment)
    const financedAmount = loanParams.assetCost - loanParams.downPayment;
    if (Math.abs(total - financedAmount) < 0.01) {
      setInvestorError(null);
    } else if (investors.length > 0) {
      setInvestorError("Total investment amount must match the financed amount (Asset Cost - Down Payment).");
    }
  }, [investors, loanParams.assetCost, loanParams.downPayment]);


  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calculate", {
        loanParams: { // Pass relevant loan parameters
          ...loanParams,
          totalAmount: loanParams.assetCost - loanParams.downPayment, // Calculate financed amount
          residualValueRate: advancedConfig.residualValueRate, // Include advanced config values
          discountRate: advancedConfig.discountRate,
          adminCommissionPct: advancedConfig.adminCommissionPct,
          securityDepositMonths: advancedConfig.securityDepositMonths,
        },
        investors,
        businessParams, // Note: businessParams might not be directly used if parameters are moved to advancedConfig/loanParams
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
        endDate: new Date(data.endDate),
        // NEW OPERATOR RESULTS
        operatorResults: data.operatorResults ? {
          fixedCost: data.operatorResults.fixedCost,
          financialMargin: data.operatorResults.financialMargin,
          clientBaseRent: data.operatorResults.clientBaseRent,
          clientRate: data.operatorResults.clientRate,
          clientSchedule: data.operatorResults.clientSchedule.map((payment: any) => ({
            ...payment,
            date: new Date(payment.date),
            payment: Number(payment.payment || payment.amount),
            principal: Number(payment.principal),
            interest: Number(payment.interest),
            balance: Number(payment.balance)
          })),
          residualValue: data.operatorResults.residualValue,
          netPresentValue: data.operatorResults.netPresentValue,
          internalRateOfReturn: data.operatorResults.internalRateOfReturn,
          paybackPeriodMonths: data.operatorResults.paybackPeriodMonths,
          totalProjectProfit: data.operatorResults.totalProjectProfit,
          expectedResidualValue: data.operatorResults.expectedResidualValue,
          monthlyPaymentToInvestors: data.operatorResults.monthlyPaymentToInvestors
        } : undefined
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
    const financedAmount = loanParams.assetCost - loanParams.downPayment;

    if (Math.abs((loanParams.assetCost - loanParams.downPayment) - financedAmount) >= 0.01) {
      toast({
        title: "Amount Mismatch",
        description: "Total financed amount must exactly match the loan amount.",
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
        loanParams.assetCost - loanParams.downPayment, // This should now represent the financed amount
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


  // Validation for each step
  const isStep1Valid = () => {
    const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;
    const assetCostValid = loanParams.assetCost >= 1000; // Asset cost should be at least 1000
    const downPaymentValid = loanParams.downPayment >= 0 && loanParams.downPayment <= loanParams.assetCost; // Down payment validation
    return isLoanNameValid && assetCostValid && downPaymentValid;
  };

  // Investor management functions
  const addInvestor = () => {
    const newId = investors.length > 0
      ? Math.max(...investors.map(i => i.id)) + 1
      : 1;

    const newInvestorNumber = investors.length + 1;

    // Calculate the financed amount to set initial investment amount and percentage
    const financedAmount = loanParams.assetCost - loanParams.downPayment;
    const initialInvestment = financedAmount > 0 ? financedAmount / (investors.length + 1) : 0;
    const initialPercentage = financedAmount > 0 ? (100 / (investors.length + 1)) : 0;


    setInvestors([
      ...investors,
      { id: newId, name: `Investor ${newInvestorNumber}`, investmentAmount: initialInvestment, percentage: initialPercentage }
    ]);
  };

  const removeInvestor = (id: number) => {
    setInvestors(investors.filter(investor => investor.id !== id));
    setPercentageInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
  };

  const updateInvestor = (id: number, field: keyof Investor, value: string | number) => {
    setInvestors(
      investors.map(investor => {
        if (investor.id === id) {
          const updated = { ...investor, [field]: value };
          // When investment amount changes, update percentage based on the financed amount
          if (field === 'investmentAmount' && loanParams.assetCost > loanParams.downPayment) {
            const financedAmount = loanParams.assetCost - loanParams.downPayment;
            updated.percentage = (Number(value) / financedAmount) * 100;
          }
          return updated;
        }
        return investor;
      })
    );
  };

  const handlePercentageInputChange = (id: number, value: string) => {
    setPercentageInputs(prev => ({ ...prev, [id]: value }));
  };

  const handlePercentageInputBlur = (id: number) => {
    const value = percentageInputs[id];
    if (value !== undefined) {
      let percentage = parseFloat(value) || 0;

      if (percentage < 0) {
        percentage = 0;
        setPercentageInputs(prev => ({ ...prev, [id]: '0' }));
      } else if (percentage > 100) {
        percentage = 100;
        setPercentageInputs(prev => ({ ...prev, [id]: '100' }));
      }

      const financedAmount = loanParams.assetCost - loanParams.downPayment;
      const amount = (percentage / 100) * financedAmount;
      setInvestors(
        investors.map(investor =>
          investor.id === id ? { ...investor, investmentAmount: amount, percentage: percentage } : investor
        )
      );
    }
  };

  const getPercentageDisplayValue = (investor: Investor) => {
    if (percentageInputs[investor.id] !== undefined) {
      return percentageInputs[investor.id];
    }
    return investor.percentage.toFixed(2);
  };

    const handleExportReport = () => {
        toast({
            title: "Reporte generado",
            description: "El análisis del operador ha sido exportado exitosamente",
        });
    };

  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'input':
        return (
          <div className="px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Lease Data Section */}
                <LoanParametersCard
                  loanParams={loanParams}
                  setLoanParams={setLoanParams}
                  isCalculating={isCalculating}
                  onValidationChange={handleValidationChange}
                  residualValueRate={businessParams.residualValueRate}
                  onResidualValueChange={handleResidualValueChange}
                />

                {/* Financial Data Section */}
                <BusinessParametersCard
                  businessParams={businessParams}
                  setBusinessParams={setBusinessParams}
                  isCalculating={isCalculating}
                  loanAmount={loanParams.assetCost - loanParams.downPayment}
                />
              </div>

              {/* Calculate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleCalculate}
                  disabled={!inputsValid || calculateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  {calculateMutation.isPending ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Calculate Lease
                    </>
                  )}
                </Button>
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
                loanAmount={loanParams.assetCost - loanParams.downPayment} // Pass financed amount
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
                loanAmount={loanParams.assetCost - loanParams.downPayment} // Pass financed amount
                interestRate={loanParams.interestRate}
                termMonths={loanParams.termMonths}
                monthlyPayment={calculationResults.monthlyPayment}
                totalInterest={calculationResults.totalInterest}
                startDate={loanParams.startDate}
                endDate={calculationResults.endDate}
                investors={calculationResults.investorReturns}
                paymentSchedule={calculationResults.paymentSchedule}
                onExport={handleExportSummary}
                paymentFrequency={loanParams.paymentFrequency}
                periodicPayment={calculationResults.monthlyPayment}
              />
            );
          case 'projections':
            return (
              <ProjectionsTab
                loanAmount={loanParams.assetCost - loanParams.downPayment} // Pass financed amount
                interestRate={loanParams.interestRate}
                termMonths={loanParams.termMonths}
                monthlyPayment={calculationResults.monthlyPayment}
                startDate={loanParams.startDate}
              />
            );
          case 'reports':
            return (
              <ReportsTab
                loanAmount={loanParams.assetCost - loanParams.downPayment} // Pass financed amount
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
          case 'dashboard':
            return (
              <OperatorDashboardTab
                businessParams={businessParams}
                loanParams={loanParams}
                monthlyPayment={calculationResults?.monthlyPayment || 0}
                paymentSchedule={calculationResults?.paymentSchedule || []}
                onExportReport={handleExportReport}
              />
            );
          case 'lessee-quote':
            return (
              <LesseeQuoteTab
                leasingInputs={{
                  asset_cost_sans_iva: loanParams.assetCost, // Use asset cost
                  lease_term_months: loanParams.termMonths,
                  lessor_profit_margin_pct: businessParams.lessorProfitMarginPct,
                  fixed_monthly_fee: businessParams.fixedMonthlyFee,
                  admin_commission_pct: advancedConfig.adminCommissionPct, // Use advanced config
                  security_deposit_months: advancedConfig.securityDepositMonths, // Use advanced config
                  delivery_costs: businessParams.deliveryCosts,
                  loan_amount: loanParams.assetCost - loanParams.downPayment, // Financed amount
                  annual_interest_rate: loanParams.interestRate,
                  monthly_operational_expenses: businessParams.monthlyExpenses,
                  residual_value_rate: advancedConfig.residualValueRate, // Use advanced config
                  discount_rate: advancedConfig.discountRate, // Use advanced config
                }}
                startDate={loanParams.startDate}
                onExportQuote={() => {
                  toast({
                    title: "Cotización generada",
                    description: "La cotización para el cliente ha sido exportada exitosamente",
                  });
                }}
              />
            );
          case 'summary':
          case 'cash-flow':
          case 'income-statement':
            return (
              <RenterAnalysisTab
                businessParams={businessParams}
                loanParams={loanParams}
                monthlyPayment={calculationResults?.monthlyPayment || 0}
                paymentSchedule={calculationResults?.paymentSchedule || []}
                renterConfig={renterConfig}
                onExportReport={handleExportReport}
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <AdvancedConfigModal
                config={advancedConfig}
                onConfigChange={setAdvancedConfig}
              />
              {activeMainTab === 'renter-operator' && (
                <RenterConfigModal
                  config={renterConfig}
                  onConfigChange={setRenterConfig}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/saved-calculations"}
                className="border-2 hover:bg-purple-50"
              >
                View Saved Calculations
              </Button>
            </div>
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
    </div>
  );
}