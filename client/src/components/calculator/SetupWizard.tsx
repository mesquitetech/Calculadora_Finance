
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
  | 'loan-basic'
  | 'loan-details'
  | 'business-params'
  | 'investors'
  | 'review';

export function SetupWizard({
  isOpen,
  onClose,
  onSave,
  initialLoanParams,
  initialInvestors,
  initialBusinessParams,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('loan-basic');

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
      case 'loan-basic':
        if (isLoanNameValid && isLoanAmountValid) setCurrentStep('loan-details');
        break;
      case 'loan-details':
        setCurrentStep('business-params');
        break;
      case 'business-params':
        setCurrentStep('investors');
        break;
      case 'investors':
        setCurrentStep('review');
        break;
      case 'review':
        handleSave();
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'loan-details':
        setCurrentStep('loan-basic');
        break;
      case 'business-params':
        setCurrentStep('loan-details');
        break;
      case 'investors':
        setCurrentStep('business-params');
        break;
      case 'review':
        setCurrentStep('investors');
        break;
    }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'loan-basic':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Loan Information</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Let's start with the basic loan information: name and amount.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanName">Loan Name</Label>
                <Input
                  id="loanName"
                  value={loanParams.loanName}
                  onChange={handleLoanNameChange}
                  placeholder="e.g., Downtown Office Renovation"
                  className={cn(loanNameError && "border-red-500 focus-visible:ring-red-500")}
                />
                {loanNameError && (
                  <p className="text-sm text-red-500 mt-1">{loanNameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetCost">Asset Cost</Label>
                <CurrencyInput
                  id="asset-cost"
                  name="asset-cost"
                  value={loanParams.assetCost}
                  onChange={handleAmountChange}
                  min={1000}
                  max={100000000}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the full amount needed for the financing project.
                </p>
              </div>
            </div>
          </div>
        );

      case 'loan-details':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Loan Details</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Now let's set up the terms and conditions for this loan.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="termMonths">Term Length (months)</Label>
                <Input
                  id="loan-term"
                  name="loan-term"
                  type="number"
                  value={loanParams.termMonths}
                  onChange={handleTermMonthsChange}
                  min={1}
                  max={360}
                  placeholder="Enter loan term in months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                <Select
                  value={loanParams.paymentFrequency}
                  onValueChange={(value) => handleLoanParamChange('paymentFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !loanParams.startDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {loanParams.startDate ? format(loanParams.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={loanParams.startDate}
                      onSelect={(date) => handleLoanParamChange('startDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );

      case 'business-params':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Business Parameters</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure the business parameters for operational analysis.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assetCost">Asset Cost</Label>
                <CurrencyInput
                  id="asset-cost"
                  name="asset-cost"
                  value={businessParams.assetCost}
                  onChange={(value) => handleBusinessParamChange('assetCost', value)}
                  min={0}
                  max={100000000}
                />
                <p className="text-sm text-muted-foreground">
                  Cost of the asset being financed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherExpenses">Other Expenses</Label>
                <CurrencyInput
                  id="other-expenses"
                  name="other-expenses"
                  value={businessParams.otherExpenses}
                  onChange={(value) => handleBusinessParamChange('otherExpenses', value)}
                  min={0}
                  max={100000000}
                />
                <p className="text-sm text-muted-foreground">
                  One-time expenses added to the total project cost.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                <CurrencyInput
                  id="monthly-expenses"
                  name="monthly-expenses"
                  value={businessParams.monthlyExpenses}
                  onChange={(value) => handleBusinessParamChange('monthlyExpenses', value)}
                  min={0}
                  max={100000000}
                />
                <p className="text-sm text-muted-foreground">
                  Recurring monthly operational expenses.
                </p>
              </div>
            </div>
          </div>
        );

      case 'investors':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Investor Details</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Add information about the investors contributing to this project.
              </p>
              <div className="flex border rounded-md p-1 mt-4">
                <button
                  onClick={() => setInputMode('amount')}
                  className={`px-3 py-1 text-sm rounded-sm ${inputMode === 'amount' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Amount
                </button>
                <button
                  onClick={() => setInputMode('percentage')}
                  className={`px-3 py-1 text-sm rounded-sm ${inputMode === 'percentage' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
                >
                  Percentage
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {investors.map((investor, index) => (
                <div key={investor.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Investor {index + 1}</h3>
                    {investors.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvestor(investor.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`investor-name-${investor.id}`}>Name</Label>
                    <Input
                      id={`investor-name-${investor.id}`}
                      value={investor.name}
                      onChange={(e) => handleInvestorChange(investor.id, 'name', e.target.value)}
                      placeholder="Investor name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`investor-amount-${investor.id}`}>
                      {inputMode === 'amount' ? 'Investment Amount' : 'Investment Percentage'}
                    </Label>
                    {inputMode === 'amount' ? (
                      <CurrencyInput
                        id={`investor-amount-${investor.id}`}
                        value={investor.investmentAmount}
                        onChange={(value) => handleInvestorChange(investor.id, 'investmentAmount', value)}
                        placeholder="Investment amount"
                      />
                    ) : (
                      <div className="relative">
                        <Input
                          type="number"
                          value={((investor.investmentAmount / (loanParams.assetCost - loanParams.downPayment)) * 100).toFixed(2)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 100) {
                              handleInvestorPercentageChange(investor.id, value);
                            }
                          }}
                          min={0}
                          max={100}
                          step={0.01}
                          placeholder="Percentage"
                          className="pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddInvestor}
                disabled={investors.length >= 20}
              >
                + Add Another Investor
              </Button>

              <div className={cn(
                "p-4 rounded-lg mt-4",
                investmentMatchesLoan ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              )}>
                <div className="flex justify-between items-center">
                  <span>Total Investment:</span>
                  <span className="font-bold">${totalInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Loan Amount:</span>
                  <span className="font-bold">${(loanParams.assetCost - loanParams.downPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Difference:</span>
                  <span className={cn(
                    "font-bold",
                    !investmentMatchesLoan ? "text-red-600" : "text-green-600"
                  )}>
                    ${Math.abs(totalInvestment - (loanParams.assetCost - loanParams.downPayment)).toLocaleString()}
                  </span>
                </div>
                {!investmentMatchesLoan && (
                  <p className="text-sm mt-2">
                    The total investment amount must equal the loan amount.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon2 className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Review Your Financing Plan</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Please review the details before finalizing the calculation.
              </p>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Loan Name:</div>
                  <div className="font-medium">{loanParams.loanName}</div>

                  <div className="text-muted-foreground">Loan Amount:</div>
                  <div className="font-medium">${(loanParams.assetCost - loanParams.downPayment).toLocaleString()}</div>

                  <div className="text-muted-foreground">Interest Rate:</div>
                  <div className="font-medium">{loanParams.interestRate}%</div>

                  <div className="text-muted-foreground">Term Length:</div>
                  <div className="font-medium">{loanParams.termMonths} months</div>

                  <div className="text-muted-foreground">Payment Frequency:</div>
                  <div className="font-medium capitalize">{loanParams.paymentFrequency}</div>

                  <div className="text-muted-foreground">Start Date:</div>
                  <div className="font-medium">{format(loanParams.startDate, "PPP")}</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Business Parameters</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Asset Cost:</div>
                  <div className="font-medium">${businessParams.assetCost.toLocaleString()}</div>

                  <div className="text-muted-foreground">Other Expenses:</div>
                  <div className="font-medium">${businessParams.otherExpenses.toLocaleString()}</div>

                  <div className="text-muted-foreground">Monthly Expenses:</div>
                  <div className="font-medium">${businessParams.monthlyExpenses.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Investors</h3>
                {investors.map((investor) => (
                  <div key={investor.id} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Name:</div>
                      <div className="font-medium">{investor.name}</div>

                      <div className="text-muted-foreground">Investment Amount:</div>
                      <div className="font-medium">${investor.investmentAmount.toLocaleString()}</div>

                      <div className="text-muted-foreground">Share Percentage:</div>
                      <div className="font-medium">
                        {((investor.investmentAmount / (loanParams.assetCost - loanParams.downPayment)) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  const steps = [
    { id: 'loan-basic', label: 'Loan Info' },
    { id: 'loan-details', label: 'Loan Details' },
    { id: 'business-params', label: 'Business' },
    { id: 'investors', label: 'Investors' },
    { id: 'review', label: 'Review' },
  ];

  const isNextDisabled = () => {
    switch (currentStep) {
      case 'loan-basic':
        return !isLoanNameValid || !isLoanAmountValid;
      case 'loan-details':
        return !loanDetailsValid;
      case 'business-params':
        return !businessParamsValid;
      case 'investors':
        return !investorsValid;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Financing Setup Wizard</DialogTitle>
          <DialogDescription>
            Complete the steps below to set up your financing calculation.
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
                    steps.findIndex(s => s.id === currentStep) > index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1">{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        <DialogFooter className="pt-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 'loan-basic' ? onClose : goToPreviousStep}
          >
            {currentStep === 'loan-basic' ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={goToNextStep}
            disabled={isNextDisabled()}
          >
            {currentStep === 'review' ? 'Finish' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
