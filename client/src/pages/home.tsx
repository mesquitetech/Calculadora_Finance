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
import { SetupWizard } from "@/components/calculator/SetupWizard";
import { ProjectionsTab } from "@/components/calculator/ProjectionsTab";
import { BankerReportsTab } from "@/components/calculator/BankerReportsTab";
import { RenterSummaryTab } from "@/components/calculator/RenterSummaryTab";
import { RenterCashFlowTab } from "@/components/calculator/RenterCashFlowTab";
import { RenterIncomeStatementTab } from "@/components/calculator/RenterIncomeStatementTab";
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
                    id="monthly-expenses"
                    value={businessParams.monthlyExpenses}
                    onChange={(value) => setBusinessParams(prev => ({ ...prev, monthlyExpenses: value }))}
                    min={0}
                    max={1000000}
                    disabled={isCalculating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Insurance, maintenance, recurring operating expenses</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financing-investors':
        return (
          <div className="space-y-8">
            {/* Loan Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4"><Calculator className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Financing Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="interest-rate">Annual Interest Rate (%) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      type="number"
                      value={loanParams.interestRate.toString()}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 999) {
                          setLoanParams(prev => ({ ...prev, interestRate: value }));
                        } else if (e.target.value === '') {
                          setLoanParams(prev => ({ ...prev, interestRate: 0 }));
                        }
                      }}
                      min={0}
                      max={999}
                      step={0.01}
                      className="pr-12"
                      placeholder="0.00"
                      disabled={isCalculating}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Maximum interest rate: 999%</p>
                </div>

                <div className="form-group">
                  <Label htmlFor="loan-term">Loan Term (Months) <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan-term"
                    type="number"
                    value={loanParams.termMonths.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 1 && value <= 1200) {
                        setLoanParams(prev => ({ ...prev, termMonths: value }));
                      } else if (e.target.value === '') {
                        setLoanParams(prev => ({ ...prev, termMonths: 0 }));
                      }
                    }}
                    min={1}
                    max={1200}
                    placeholder="Enter loan term in months"
                    disabled={isCalculating}
                    required
                    className={cn(termError && "border-red-500")}
                  />
                  {termError && <p className="text-xs text-red-500 mt-1">{termError}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Investors Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Investors</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">1-20 allowed</div>
                  <div className="flex border rounded-md p-1">
                    <button
                      onClick={() => setInputMode('amount')}
                      className={`px-2 py-1 text-xs rounded-sm ${inputMode === 'amount' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                    >
                      Amount
                    </button>
                    <button
                      onClick={() => setInputMode('percentage')}
                      className={`px-2 py-1 text-xs rounded-sm ${inputMode === 'percentage' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                    >
                      %
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {investors.map((investor, index) => (
                  <div 
                    key={investor.id} 
                    className="investor-entry rounded-lg p-3 border"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Investor {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvestor(investor.id)}
                        disabled={investors.length <= 1 || isCalculating}
                        className="text-muted-foreground hover:text-red-500 h-6 w-6 p-0"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          value={investor.name}
                          onChange={(e) => updateInvestor(investor.id, 'name', e.target.value)}
                          placeholder={`Investor ${index + 1}`}
                          disabled={isCalculating}
                          className="text-sm h-9"
                        />
                      </div>
                      <div>
                        {inputMode === 'amount' ? (
                          <CurrencyInput
                            value={investor.investmentAmount}
                            onChange={(value) => updateInvestor(investor.id, 'investmentAmount', value)}
                            min={0}
                            disabled={isCalculating}
                            className="text-sm h-9"
                          />
                        ) : (
                          <div className="relative">
                            <Input
                              type="number"
                              value={getPercentageDisplayValue(investor)}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                  handlePercentageInputChange(investor.id, value);
                                }
                              }}
                              onBlur={() => handlePercentageInputBlur(investor.id)}
                              min={0}
                              max={100}
                              step={0.01}
                              disabled={isCalculating}
                              className="text-sm h-9 pr-8"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={addInvestor}
                variant="secondary"
                size="sm"
                disabled={isCalculating}
                className="w-full h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Investor
              </Button>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Investment:</span>
                    <span className={`font-bold ${
                      Math.abs(loanParams.totalAmount - totalInvestment) < 0.01 ? "text-green-600" : "text-gray-900"
                    }`}>
                      {formatCurrency(totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Required:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(loanParams.totalAmount)}
                    </span>
                  </div>
                  {Math.abs(loanParams.totalAmount - totalInvestment) >= 0.01 && (
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="font-medium text-orange-600">Difference:</span>
                      <span className="font-bold text-orange-600">
                        {(loanParams.totalAmount - totalInvestment) > 0 ? "+" : ""}{formatCurrency(loanParams.totalAmount - totalInvestment)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {investorError && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{investorError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      case 'review-calculate':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Review and Calculate</h3>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Loan Name:</span>
                    <span className="text-sm font-medium">{loanParams.loanName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Amount:</span>
                    <span className="text-sm font-medium">{formatCurrency(loanParams.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Start Date:</span>
                    <span className="text-sm font-medium">{loanParams.startDate.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Asset Cost:</span>
                    <span className="text-sm font-medium">{formatCurrency(businessParams.assetCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Residual Value:</span>
                    <span className="text-sm font-medium">{businessParams.residualValueRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Profit Margin:</span>
                    <span className="text-sm font-medium">{businessParams.lessorProfitMarginPct}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Financing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Interest Rate:</span>
                    <span className="text-sm font-medium">{loanParams.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Term:</span>
                    <span className="text-sm font-medium">{loanParams.termMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Fee:</span>
                    <span className="text-sm font-medium">{formatCurrency(businessParams.fixedMonthlyFee)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Investors Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investors:</span>
                    <span className="text-sm font-medium">{investors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Investment:</span>
                    <span className="text-sm font-medium">{formatCurrency(totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Match Status:</span>
                    <Badge variant={Math.abs(loanParams.totalAmount - totalInvestment) < 0.01 ? "default" : "destructive"}>
                      {Math.abs(loanParams.totalAmount - totalInvestment) < 0.01 ? "Match" : "Mismatch"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investors List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Investor Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {investors.map((investor, index) => (
                    <div key={investor.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span className="text-sm font-medium">{investor.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(investor.investmentAmount)}</div>
                        <div className="text-xs text-muted-foreground">{investor.percentage.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <div className="pt-4">
              <Button
                onClick={handleCalculate}
                disabled={!inputsValid || calculateMutation.isPending}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                {calculateMutation.isPending ? "Calculating..." : "Calculate Investment Returns"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMainTabContent = () => {
    switch (activeMainTab) {
      case 'input':
        return (
          <div className="px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicators */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {[
                    { id: 'asset-leasing', label: 'Asset & Leasing', icon: Car },
                    { id: 'financing-investors', label: 'Financing & Investors', icon: Users },
                    { id: 'review-calculate', label: 'Review & Calculate', icon: Calculator }
                  ].map((step, index) => {
                    const isActive = currentWizardStep === step.id;
                    const isCompleted = index < ['asset-leasing', 'financing-investors', 'review-calculate'].indexOf(currentWizardStep);
                    const StepIcon = step.icon;

                    return (
                      <React.Fragment key={step.id}>
                        {index > 0 && (
                          <div className={`w-12 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                              isActive ? "bg-blue-600 text-white" :
                              isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                            )}
                          >
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <span className="text-xs mt-2 text-center max-w-[80px]">{step.label}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Main Wizard Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center">
                    {currentWizardStep === 'asset-leasing' && 'Asset & Leasing Configuration'}
                    {currentWizardStep === 'financing-investors' && 'Financing & Investors Setup'}
                    {currentWizardStep === 'review-calculate' && 'Review & Calculate'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {renderWizardStep()}
                </CardContent>

                {/* Navigation Footer */}
                <div className="border-t p-6 flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentWizardStep === 'asset-leasing'}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Step {['asset-leasing', 'financing-investors', 'review-calculate'].indexOf(currentWizardStep) + 1} of 3
                  </div>

                  <Button
                    onClick={goToNextStep}
                    disabled={
                      (currentWizardStep === 'asset-leasing' && !isStep1Valid()) ||
                      (currentWizardStep === 'financing-investors' && !isStep2Valid()) ||
                      currentWizardStep === 'review-calculate'
                    }
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
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
                paymentFrequency={loanParams.paymentFrequency}
                periodicPayment={calculationResults.monthlyPayment}
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
                  asset_cost_sans_iva: businessParams.assetCost,
                  lease_term_months: loanParams.termMonths,
                  lessor_profit_margin_pct: businessParams.lessorProfitMarginPct,
                  fixed_monthly_fee: businessParams.fixedMonthlyFee,
                  admin_commission_pct: businessParams.adminCommissionPct,
                  security_deposit_months: businessParams.securityDepositMonths,
                  delivery_costs: businessParams.deliveryCosts,
                  loan_amount: loanParams.totalAmount,
                  annual_interest_rate: loanParams.interestRate,
                  monthly_operational_expenses: businessParams.monthlyExpenses,
                  residual_value_rate: businessParams.residualValueRate,
                  discount_rate: businessParams.discountRate,
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
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