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
import { CalendarIcon, CreditCard, DollarSign, Percent, Calendar as CalendarIcon2, Users, FileSignature } from "lucide-react"; // Icono añadido
import { LoanParameters } from "./LoanParametersCard";
import { Investor } from "./InvestorsCard";

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loanParams: LoanParameters, investors: Investor[]) => void;
  initialLoanParams: LoanParameters;
  initialInvestors: Investor[];
}

// 1. Se añade el nuevo paso 'loan-name'
type WizardStep =
  | 'loan-name'
  | 'loan-amount'
  | 'loan-details'
  | 'investors'
  | 'review';

export function SetupWizard({
  isOpen,
  onClose,
  onSave,
  initialLoanParams,
  initialInvestors,
}: SetupWizardProps) {
  // 2. El estado inicial ahora es el nuevo primer paso
  const [currentStep, setCurrentStep] = useState<WizardStep>('loan-name');

  // State for loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);

  // 3. Estado para el error de validación del nombre
  const [loanNameError, setLoanNameError] = useState<string>('');

  // State for investors
  const [investors, setInvestors] = useState<Investor[]>(
    initialInvestors.length > 0
      ? initialInvestors
      : [
          { id: 1, name: "Investor 1", investmentAmount: 0 }
        ]
  );

  // 4. Lógica de validación para el nombre del préstamo
  const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;

  // 5. Manejador específico para el cambio de nombre que incluye la validación
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

  // 6. Se actualiza la navegación para incluir el nuevo paso
  const goToNextStep = () => {
    switch (currentStep) {
      case 'loan-name':
        if (isLoanNameValid) setCurrentStep('loan-amount');
        break;
      case 'loan-amount':
        setCurrentStep('loan-details');
        break;
      case 'loan-details':
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
      case 'loan-amount':
        setCurrentStep('loan-name');
        break;
      case 'loan-details':
        setCurrentStep('loan-amount');
        break;
      case 'investors':
        setCurrentStep('loan-details');
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

  const handleInvestorChange = (id: number, key: keyof Investor, value: any) => {
    setInvestors(prev =>
      prev.map(investor =>
        investor.id === id ? { ...investor, [key]: value } : investor
      )
    );
  };

  const handleAddInvestor = () => {
    const newId = investors.length > 0 ? Math.max(...investors.map(i => i.id)) + 1 : 1;
    setInvestors([
      ...investors,
      { id: newId, name: `Investor ${newId}`, investmentAmount: 0 }
    ]);
  };

  const handleRemoveInvestor = (id: number) => {
    if (investors.length > 1) {
      setInvestors(investors.filter(investor => investor.id !== id));
    }
  };

  const handleSave = () => {
    onSave(loanParams, investors);
    onClose();
  };

  const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const investmentMatchesLoan = Math.abs(totalInvestment - loanParams.totalAmount) < 0.01;

  // Validation state
  const loanAmountValid = loanParams.totalAmount >= 1000;
  const loanDetailsValid =
    loanParams.interestRate > 0 &&
    loanParams.termMonths > 0;
  const investorsValid =
    investors.length >= 1 && investors.length <= 20 &&
    investors.every(inv => inv.name.trim() !== '' && inv.investmentAmount > 0) &&
    investmentMatchesLoan;

  const handleAmountChange = (value: number) => {
    setLoanParams(prev => ({ ...prev, totalAmount: value }));
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

  // 7. Se renderiza el contenido del nuevo primer paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 'loan-name':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileSignature className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Give Your Loan a Name</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Create a unique name for this financing project to easily identify it later.
              </p>
            </div>
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
          </div>
        );
      case 'loan-amount':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Enter Loan Amount</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Let's start by entering the total amount for this financing project.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Loan Amount</Label>
                <CurrencyInput
                  id="total-amount"
                  name="total-amount"
                  value={loanParams.totalAmount}
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
                    <Label htmlFor={`investor-amount-${investor.id}`}>Investment Amount</Label>
                    <CurrencyInput
                      id={`investor-amount-${investor.id}`}
                      value={investor.investmentAmount}
                      onChange={(value) => handleInvestorChange(investor.id, 'investmentAmount', value)}
                      placeholder="Investment amount"
                    />
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
                  <span className="font-bold">${loanParams.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Difference:</span>
                  <span className={cn(
                    "font-bold",
                    !investmentMatchesLoan ? "text-red-600" : "text-green-600"
                  )}>
                    ${Math.abs(totalInvestment - loanParams.totalAmount).toLocaleString()}
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
                  <div className="font-medium">${loanParams.totalAmount.toLocaleString()}</div>

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
                        {((investor.investmentAmount / loanParams.totalAmount) * 100).toFixed(2)}%
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

  // 8. Se actualiza la lista de pasos para el indicador de progreso
  const steps = [
    { id: 'loan-name', label: 'Loan Name' },
    { id: 'loan-amount', label: 'Loan Amount' },
    { id: 'loan-details', label: 'Loan Details' },
    { id: 'investors', label: 'Investors' },
    { id: 'review', label: 'Review' },
  ];

  // 9. Se actualiza la lógica para deshabilitar el botón "Next"
  const isNextDisabled = () => {
    switch (currentStep) {
      case 'loan-name':
        return !isLoanNameValid;
      case 'loan-amount':
        return !loanAmountValid;
      case 'loan-details':
        return !loanDetailsValid;
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
            onClick={currentStep === 'loan-name' ? onClose : goToPreviousStep}
          >
            {currentStep === 'loan-name' ? 'Cancel' : 'Back'}
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
