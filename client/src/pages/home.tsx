import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorIcon, Wand2, Calculator, Users, TrendingUp, ArrowLeft, ArrowRight, CheckCircle, Car } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { AboutFooter } from "@/components/calculator/AboutFooter";
import { Link, useLocation } from "wouter";
import { TabNavigation, MainTab, LenderSubTab, RenterSubTab } from "@/components/calculator/TabNavigation";
import { LoanParameters } from "@/components/calculator/LoanParametersCard";
import { Investor } from "@/components/calculator/InvestorsCard";
import { BusinessParameters } from "@/components/calculator/BusinessParametersCard";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
//import { SetupWizard } from "@/components/calculator/SetupWizard";
import { ProjectionsTab } from "@/components/calculator/ProjectionsTab";
import { BankerReportsTab } from "@/components/calculator/BankerReportsTab";
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
import { RenterDashboardTab } from "@/components/calculator/RenterDashboardTab";

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
    discountRate: 6.0,
    residualValueRate: 20
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
            }));
          }
          if (data.renterConfig) {
            setRenterConfig(data.renterConfig);
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
        }));
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
    loanName: "Equipment Leasing Project",
    totalAmount: 150000,
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
    assetCost: 150000, // Igual al loan amount
    otherExpenses: 5000, // Gastos iniciales adicionales
    monthlyExpenses: 0, // Gastos operativos mensuales
    lessorProfitMarginPct: 18.0, // 18% margen de ganancia
    fixedMonthlyFee: 250.0, // Cuota administrativa fija
    adminCommissionPct: 1.0, // 1% comisión por apertura
    securityDepositMonths: 1, // 1 mes de depósito
    deliveryCosts: 7500.0, // Costos de trámites y entrega
    residualValueRate: 20.0, // 20% valor residual
    discountRate: 6.0, // 6% tasa de descuento
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
    if (loanParams.totalAmount > 0) {
      const updatedInvestors = investors.map(investor => ({
        ...investor,
        investmentAmount: (investor.percentage / 100) * loanParams.totalAmount
      }));
      setInvestors(updatedInvestors);

      // Sync asset cost with loan amount
      setBusinessParams(prev => ({
        ...prev,
        assetCost: loanParams.totalAmount
      }));
    }
  }, [loanParams.totalAmount]);

  // Calculate total investment whenever investors change
  useEffect(() => {
    const total = investors.reduce(
      (sum, investor) => sum + investor.investmentAmount,
      0
    );
    setTotalInvestment(total);

    // Clear error if investments match required amount
    if (Math.abs(total - loanParams.totalAmount) < 0.01) {
      setInvestorError(null);
    } else if (investors.length > 0) {
      setInvestorError("Total investment amount must match the required loan amount.");
    }
  }, [investors, loanParams.totalAmount]);

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

  // Wizard navigation functions
  const goToNextStep = () => {
    if (currentWizardStep === 'asset-leasing') {
      setCurrentWizardStep('financing-investors');
    } else if (currentWizardStep === 'financing-investors') {
      setCurrentWizardStep('review-calculate');
    }
  };

  const goToPreviousStep = () => {
    if (currentWizardStep === 'financing-investors') {
      setCurrentWizardStep('asset-leasing');
    } else if (currentWizardStep === 'review-calculate') {
      setCurrentWizardStep('financing-investors');
    }
  };

  // Validation for each step
  const isStep1Valid = () => {
    const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;
    const assetCostValid = businessParams.assetCost >= loanParams.totalAmount;
    return isLoanNameValid && loanParams.totalAmount >= 1000 && assetCostValid;
  };

  const isStep2Valid = () => {
    const isLoanDetailsValid = loanParams.interestRate > 0 && loanParams.termMonths > 0 && !termError;
    const investmentDifference = Math.abs(totalInvestment - loanParams.totalAmount);
    const isInvestorsValid = investors.length >= 1 && 
                            investors.every(investor => investor.name.trim() !== "") &&
                            investmentDifference < 0.01;
    return isLoanDetailsValid && isInvestorsValid;
  };

  // Investor management functions
  const addInvestor = () => {
    const newId = investors.length > 0
      ? Math.max(...investors.map(i => i.id)) + 1
      : 1;

    const newInvestorNumber = investors.length + 1;

    setInvestors([
      ...investors,
      { id: newId, name: `Investor ${newInvestorNumber}`, investmentAmount: 0, percentage: 0 }
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
          if (field === 'investmentAmount' && loanParams.totalAmount > 0) {
            updated.percentage = (Number(value) / loanParams.totalAmount) * 100;
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

      const amount = (percentage / 100) * loanParams.totalAmount;
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
    if (activeMainTab.startsWith("renter")) {
      // Generate renter-specific report
      generateProjectSummaryReport({
        loanParams,
        businessParams,
        monthlyPayment: calculationResults?.monthlyPayment || 0,
        totalLoanAmount: loanParams.totalAmount,
        totalInterest: (calculationResults?.monthlyPayment || 0 * loanParams.termMonths) - loanParams.totalAmount,
        paymentSchedule: calculationResults?.paymentSchedule.slice(0, 12) || [], // First year
        investors: investors,
        reportType: "renter"
      });
    } else {
      // Generate standard report
      generateProjectSummaryReport({
        loanParams,
        businessParams,
        monthlyPayment: calculationResults?.monthlyPayment || 0,
        totalLoanAmount: loanParams.totalAmount,
        totalInterest: (calculationResults?.monthlyPayment || 0 * loanParams.termMonths) - loanParams.totalAmount,
        paymentSchedule: calculationResults?.paymentSchedule.slice(0, 12) || [], // First year
        investors: investors
      });
    }
      toast({
          title: "Reporte generado",
          description: "El análisis del operador ha sido exportado exitosamente",
      });
  };

  // Render wizard step content
  const renderWizardStep = () => {
    switch (currentWizardStep) {
      case 'asset-leasing':
        return (
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="loan-name">Loan Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan-name"
                    type="text"
                    value={loanParams.loanName}
                    onChange={(e) => setLoanParams(prev => ({ ...prev, loanName: e.target.value }))}
                    disabled={isCalculating}
                    required
                    className={cn(loanNameError && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {loanNameError && <p className="text-xs text-red-500 mt-1">{loanNameError}</p>}
                </div>

                <div className="form-group">
                  <Label htmlFor="total-amount">Total Loan Amount <span className="text-destructive">*</span></Label>
                  <CurrencyInput
                    id="total-amount"
                    value={loanParams.totalAmount}
                    onChange={(value) => setLoanParams(prev => ({ ...prev, totalAmount: value }))}
                    min={1000}
                    max={100000000}
                    disabled={isCalculating}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum: $1,000 Maximum: $100,000,000</p>
                </div>
              </div>

              <div className="form-group">
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <DatePicker
                  date={loanParams.startDate}
                  setDate={(date) => date && setLoanParams(prev => ({ ...prev, startDate: date }))}
                  disabled={isCalculating}
                />
              </div>
            </div>

            <Separator />

            {/* Asset Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-sm">Asset Information</h3>
              </div>

              <div className="form-group">
                <Label htmlFor="asset-cost">Asset Cost (without VAT)</Label>
                <CurrencyInput
                  id="asset-cost"
                  value={businessParams.assetCost}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, assetCost: value }))}
                  min={0}
                  max={100000000}
                  disabled={isCalculating}
                  className={businessParams.assetCost < loanParams.totalAmount ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {businessParams.assetCost < loanParams.totalAmount && (
                  <p className="text-xs text-red-500 mt-1">Asset cost cannot be less than loan amount</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <Label htmlFor="residual-value">Residual Value (%)</Label>
                  <div className="relative">
                    <Input
                      id="residual-value"
                      type="number"
                      value={businessParams.residualValueRate}
                      onChange={(e) => setBusinessParams(prev => ({ ...prev, residualValueRate: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={isCalculating}
                      className="pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="form-group">
                  <Label htmlFor="discount-rate">Discount Rate (%)</Label>
                  <div className="relative">
                    <Input
                      id="discount-rate"
                      type="number"
                      value={businessParams.discountRate}
                      onChange={(e) => setBusinessParams(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={isCalculating}
                      className="pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Leasing Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-sm">Leasing Parameters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="lessor-margin">Profit Margin (%)</Label>
                  <div className="relative">
                    <Input
                      id="lessor-margin"
                      type="number"
                      value={businessParams.lessorProfitMarginPct}
                      onChange={(e) => setBusinessParams(prev => ({ ...prev, lessorProfitMarginPct: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={isCalculating}
                      className="pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="form-group">
                  <Label htmlFor="fixed-fee">Monthly Administrative Fee</Label>
                  <CurrencyInput
                    id="fixed-fee"
                    value={businessParams.fixedMonthlyFee}
                    onChange={(value) => setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }))}
                    min={0}
                    max={10000}
                    disabled={isCalculating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <Label htmlFor="admin-commission">Opening Commission (%)</Label>
                  <div className="relative">
                    <Input
                      id="admin-commission"
                      type="number"
                      value={businessParams.adminCommissionPct}
                      onChange={(e) => setBusinessParams(prev => ({ ...prev, adminCommissionPct: parseFloat(e.target.value) || 0 }))}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={isCalculating}
                      className="pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="form-group">
                  <Label htmlFor="security-deposit">Deposit (months)</Label>
                  <Input
                    id="security-deposit"
                    type="number"
                    value={businessParams.securityDepositMonths}
                    onChange={(e) => setBusinessParams(prev => ({ ...prev, securityDepositMonths: parseInt(e.target.value) || 0 }))}
                    min={0}
                    max={12}
                    step={1}
                    disabled={isCalculating}
                  />
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="delivery-costs">Processing and Delivery Costs</Label>
                <CurrencyInput
                  id="delivery-costs"
                  value={businessParams.deliveryCosts}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, deliveryCosts: value }))}
                  min={0}
                  max={50000}
                  disabled={isCalculating}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="other-expenses">Other Initial Expenses</Label>
                  <CurrencyInput
                    id="other-expenses"
                    value={businessParams.otherExpenses}
                    onChange={(value) => setBusinessParams(prev => ({ ...prev, otherExpenses: value }))}
                    min={0}
                    max={1000000}
                    disabled={isCalculating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Additional one-time expenses (setup, etc.)</p>
                </div>

                <div className="form-group">
                  <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                  <CurrencyInput