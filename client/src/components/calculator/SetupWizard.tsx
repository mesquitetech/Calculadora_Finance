
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, DollarSign, Calendar as CalendarIcon2, Users, Building2 } from "lucide-react";
import { LoanParameters } from "./LoanParametersCard";
import { Investor } from "./InvestorsCard";
import { BusinessParameters } from "./BusinessParametersCard";

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loanParams: LoanParameters, investors: Investor[], businessParams: BusinessParameters) => void;
  initialLoanParams: LoanParameters;
  initialInvestors: Investor[];
  initialBusinessParams: BusinessParameters;
}

type WizardStep =
  | 'lease-data'
  | 'financial-data';

export function SetupWizard({
  isOpen,
  onClose,
  onSave,
  initialLoanParams,
  initialInvestors,
  initialBusinessParams,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('lease-data');

  // State for loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);

  // State for loan name validation
  const [loanNameError, setLoanNameError] = useState<string>('');

  // State for business parameters
  const [businessParams, setBusinessParams] = useState<BusinessParameters>(initialBusinessParams);

  // State for investors
  const [investors, setInvestors] = useState<Investor[]>(
    initialInvestors.length > 0
      ? initialInvestors
      : [
          { id: 1, name: "Investor 1", investmentAmount: 0, percentage: 0 }
        ]
  );

  // State for input mode
  const [inputMode, setInputMode] = useState<'amount' | 'percentage'>('amount');

  // Validation logic
  const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;
  const totalAmount = loanParams.assetCost - loanParams.downPayment;
  const isLoanAmountValid = totalAmount >= 1000;

  // Loan name change handler with validation
  const handleLoanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setLoanParams(prev => ({ ...prev, loanName: name }));

    if (name.length >= 0 && name.length <= 3) {
      setLoanNameError('Loan name must be longer than 3 characters.');
    } else if (name.length >= 60) {
      setLoanNameError('Loan name must be shorter than 60 characters.');
    } else {
      setLoanNameError('');
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
      case 'lease-data':
        if (isLoanNameValid && isLoanAmountValid) setCurrentStep('financial-data');
        break;
      case 'financial-data':
        handleSave();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'financial-data':
        setCurrentStep('lease-data');
        break;
    }
  };

  // Navigation handler aliases
  const handleBack = goToPreviousStep;
  const handleNext = goToNextStep;
  const handleFinish = () => {
    handleSave();
    onClose();
  };

  // Handlers
  const handleLoanParamChange = (key: keyof LoanParameters, value: any) => {
    setLoanParams(prev => ({ ...prev, [key]: value }));
  };

  const handleBusinessParamChange = (key: keyof BusinessParameters, value: any) => {
    setBusinessParams(prev => ({ ...prev, [key]: value }));
  };

  const handleInvestorChange = (id: number, key: keyof Investor, value: any) => {
    setInvestors(prev =>
      prev.map(investor =>
        investor.id === id ? { ...investor, [key]: value } : investor
      )
    );
  };

  const handleInvestorPercentageChange = (id: number, percentage: number) => {
    const totalAmount = loanParams.assetCost - loanParams.downPayment;
    const amount = (percentage / 100) * totalAmount;
    setInvestors(prev =>
      prev.map(investor =>
        investor.id === id ? { ...investor, investmentAmount: amount, percentage } : investor
      )
    );
  };

  const handleAddInvestor = () => {
    const newId = investors.length > 0 ? Math.max(...investors.map(i => i.id)) + 1 : 1;
    setInvestors([
      ...investors,
      { id: newId, name: `Investor ${newId}`, investmentAmount: 0, percentage: 0 }
    ]);
  };

  const handleRemoveInvestor = (id: number) => {
    if (investors.length > 1) {
      setInvestors(investors.filter(investor => investor.id !== id));
    }
  };

  const handleSave = () => {
    onSave(loanParams, investors, businessParams);
    onClose();
  };

  const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const loanTotalAmount = loanParams.assetCost - loanParams.downPayment;
  const investmentMatchesLoan = Math.abs(totalInvestment - loanTotalAmount) < 0.01;

  // Validation state
  const loanDetailsValid =
    loanParams.interestRate > 0 &&
    loanParams.termMonths > 0;
  const businessParamsValid = businessParams.assetCost >= 0 && businessParams.otherExpenses >= 0 && businessParams.monthlyExpenses >= 0;
  const investorsValid =
    investors.length >= 1 && investors.length <= 20 &&
    investors.every(inv => inv.name.trim() !== '' && inv.investmentAmount > 0) &&
    investmentMatchesLoan;

  const handleAmountChange = (value: number) => {
    setLoanParams(prev => ({ ...prev, assetCost: value }));
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 999) {
      setLoanParams(prev => ({ ...prev, interestRate: value }));
    }
  };

  const handleTermMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 1200) {
      setLoanParams(prev => ({ ...prev, termMonths: value }));
    }
  };

  const handleDownPaymentChange = (value: number) => {
    setLoanParams(prev => ({ ...prev, downPayment: value }));
  };

  const handleResidualValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, residualValueRate: value }));
  };

  const handleProfitMarginChange = (values: number[]) => {
    setBusinessParams(prev => ({ ...prev, profitMarginPesos: values[0] }));
  };

  const handleMonthlyAdminChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'lease-data':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Lease Data (For the Client)</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure the basic lease information and terms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanName">Lease Name</Label>
                  <Input
                    id="loanName"
                    value={loanParams.loanName}
                    onChange={handleLoanNameChange}
                    placeholder="e.g., Vehicle Lease Project"
                    className={cn(loanNameError && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {loanNameError && (
                    <p className="text-sm text-red-500 mt-1">{loanNameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetCost">Car Value (without VAT)</Label>
                  <CurrencyInput
                    id="asset-cost"
                    name="asset-cost"
                    value={loanParams.assetCost}
                    onChange={handleAmountChange}
                    min={1000}
                    max={100000000}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total vehicle cost without VAT.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment">Client Initial Payment</Label>
                  <CurrencyInput
                    id="down-payment"
                    name="down-payment"
                    value={loanParams.downPayment}
                    onChange={handleDownPaymentChange}
                    min={0}
                    max={loanParams.assetCost}
                  />
                  <p className="text-sm text-muted-foreground">
                    Down payment amount from the client.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (in Months)</Label>
                  <Input
                    id="loan-term"
                    name="loan-term"
                    type="number"
                    value={loanParams.termMonths}
                    onChange={handleTermMonthsChange}
                    min={1}
                    max={360}
                    placeholder="Enter lease term in months"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of months in the contract.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residualValue">Residual Value Percentage (%)</Label>
                  <div className="relative">
                    <Input
                      id="residual-value"
                      name="residual-value"
                      type="number"
                      value={businessParams.residualValueRate}
                      onChange={handleResidualValueChange}
                      min={0}
                      max={100}
                      step={0.1}
                      className="pr-12"
                      placeholder="Residual value"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Percentage of car value remaining as debt at the end.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Annual Interest Rate for Investors (%)</Label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      name="interest-rate"
                      type="number"
                      value={loanParams.interestRate}
                      onChange={handleInterestRateChange}
                      min={0}
                      max={999}
                      step={0.01}
                      className="pr-12"
                      placeholder="Interest rate"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your real financial cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial-data':
        const loanAmount = loanParams.assetCost - loanParams.downPayment;
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Financial Data (Internal for the Lessor)</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure your internal financial parameters and profit margins.
              </p>
            </div>

            <div className="space-y-6">
              {/* Calculated Loan Amount Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Loan Amount to Investors:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    ${loanAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Capital to be financed internally (Car Value - Initial Payment)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Desired Financial Profit Margin (USD)</Label>
                    <div className="space-y-3">
                      <Slider
                        value={[businessParams.profitMarginPesos]}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={handleProfitMarginChange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>$0</span>
                        <span className="font-medium text-blue-600">
                          ${businessParams.profitMarginPesos.toLocaleString()}
                        </span>
                        <span>$10,000</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      How much you want to earn from the rate difference (e.g., $500).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyAdmin">Monthly Administration Expenses (USD)</Label>
                    <CurrencyInput
                      id="monthly-admin"
                      name="monthly-admin"
                      value={businessParams.fixedMonthlyFee}
                      onChange={handleMonthlyAdminChange}
                      min={0}
                      max={10000}
                    />
                    <p className="text-sm text-muted-foreground">
                      Your second layer of utility, administrative costs.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Summary Box */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Financial Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Car Value (no VAT):</span>
                        <span className="font-medium">${loanParams.assetCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client Initial Payment:</span>
                        <span className="font-medium">${loanParams.downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Loan Amount:</span>
                        <span className="font-bold">${loanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <span className="font-medium">{loanParams.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">{loanParams.termMonths} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Residual Value:</span>
                        <span className="font-medium">{businessParams.residualValueRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3 text-green-800">Profit Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Margin:</span>
                        <span className="font-bold text-green-700">${businessParams.profitMarginPesos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Admin:</span>
                        <span className="font-medium">${businessParams.fixedMonthlyFee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const steps = [
    { id: 'lease-data', label: 'Lease Data' },
    { id: 'financial-data', label: 'Financial Data' },
  ];

  const isNextDisabled = () => {
    switch (currentStep) {
      case 'lease-data':
        return !isLoanNameValid || !isLoanAmountValid;
      case 'financial-data':
        return false;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Leasing Setup Wizard</DialogTitle>
          <DialogDescription>
            Complete the steps below to set up your leasing calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex justify-between mb-6 mt-4 px-2">
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'contents' }}>
              {index > 0 && (
                <div className="flex-1 h-0.5 self-center bg-gray-200 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: steps.findIndex(s => s.id === currentStep) >= index ? '100%' : '0%'
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep === step.id ? "bg-blue-600 text-white" :
                    steps.findIndex(s => s.id === currentStep) > index ? "bg-blue-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  )}
                >
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs font-medium mt-2 text-center">{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-1">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 'lease-data'}
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep === 'financial-data' ? (
              <Button 
                onClick={handleFinish}
                disabled={isNextDisabled()}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Setup
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const nextStepMap: Record<string, string> = {
  'lease-data': 'financial-data',
};

const prevStepMap: Record<string, string> = {
  'financial-data': 'lease-data',
};

export default SetupWizard;
