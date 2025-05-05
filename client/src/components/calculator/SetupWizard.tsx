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
import { CalendarIcon, CreditCard, DollarSign, Percent, Calendar as CalendarIcon2, Users } from "lucide-react";
import { LoanParameters } from "./LoanParametersCard";
import { Investor } from "./InvestorsCard";

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loanParams: LoanParameters, investors: Investor[]) => void;
  initialLoanParams: LoanParameters;
  initialInvestors: Investor[];
}

type WizardStep = 
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
  // State for the current step in the wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('loan-amount');
  
  // State for loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);
  
  // State for investors
  const [investors, setInvestors] = useState<Investor[]>(
    initialInvestors.length > 0 
      ? initialInvestors 
      : [
          { id: 1, name: "Investor 1", investmentAmount: 0 },
          { id: 2, name: "Investor 2", investmentAmount: 0 },
          { id: 3, name: "Investor 3", investmentAmount: 0 },
        ]
  );
  
  // Navigation functions
  const goToNextStep = () => {
    switch (currentStep) {
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
    const newId = Math.max(...investors.map(i => i.id)) + 1;
    setInvestors([
      ...investors,
      { id: newId, name: `Investor ${newId}`, investmentAmount: 0 }
    ]);
  };
  
  const handleRemoveInvestor = (id: number) => {
    if (investors.length > 3) {
      setInvestors(investors.filter(investor => investor.id !== id));
    }
  };
  
  const handleSave = () => {
    onSave(loanParams, investors);
    onClose();
  };
  
  // Check if investment amounts add up to loan amount
  const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const investmentMatchesLoan = totalInvestment === loanParams.totalAmount;
  
  // Validation state
  const loanAmountValid = loanParams.totalAmount > 0;
  const loanDetailsValid = 
    loanParams.interestRate > 0 && 
    loanParams.termMonths > 0;
  const investorsValid = 
    investors.length >= 3 && 
    investors.every(inv => inv.name.trim() !== '' && inv.investmentAmount > 0) &&
    investmentMatchesLoan;
  
  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="totalAmount"
                    type="number"
                    className="pl-7"
                    value={loanParams.totalAmount || ''}
                    onChange={(e) => handleLoanParamChange('totalAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Enter loan amount"
                  />
                </div>
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
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="pr-8"
                    value={loanParams.interestRate || ''}
                    onChange={(e) => handleLoanParamChange('interestRate', parseFloat(e.target.value) || 0)}
                    placeholder="Interest rate"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="termMonths">Term Length (months)</Label>
                <Input
                  id="termMonths"
                  type="number"
                  min="1"
                  className="w-full"
                  value={loanParams.termMonths || ''}
                  onChange={(e) => handleLoanParamChange('termMonths', parseInt(e.target.value) || 0)}
                  placeholder="Enter term in months"
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
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !loanParams.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {loanParams.startDate ? (
                        format(loanParams.startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
                    {investors.length > 3 && (
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id={`investor-amount-${investor.id}`}
                        type="number"
                        className="pl-7"
                        value={investor.investmentAmount || ''}
                        onChange={(e) => handleInvestorChange(investor.id, 'investmentAmount', parseFloat(e.target.value) || 0)}
                        placeholder="Investment amount"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAddInvestor}
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
                    totalInvestment !== loanParams.totalAmount ? "text-red-600" : "text-green-600"
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
                {investors.map((investor, index) => (
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
  
  // Step labels for the progress indicators
  const steps = [
    { id: 'loan-amount', label: 'Loan Amount' },
    { id: 'loan-details', label: 'Loan Details' },
    { id: 'investors', label: 'Investors' },
    { id: 'review', label: 'Review' },
  ];
  
  // Check if next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
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
        
        {/* Progress bar */}
        <div className="w-full flex justify-between mb-6 mt-4 px-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Line connector */}
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
              
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep === step.id ? "bg-blue-600 text-white" : 
                    steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1">{step.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Step content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="pt-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 'loan-amount' ? onClose : goToPreviousStep}
          >
            {currentStep === 'loan-amount' ? 'Cancel' : 'Back'}
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