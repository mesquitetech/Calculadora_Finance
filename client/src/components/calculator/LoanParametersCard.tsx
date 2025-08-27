import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface LoanParameters {
  loanName: string,
  assetCost: number;
  downPayment: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: "monthly" | "quarterly" | "semi-annual" | "annual";
}

interface LoanParametersCardProps {
  loanParams: LoanParameters;
  setLoanParams: React.Dispatch<React.SetStateAction<LoanParameters>>;
  isCalculating: boolean;
  onValidationChange: (validations: { isLoanNameValid: boolean; isTermValid: boolean }) => void;
}

export function LoanParametersCard({
  loanParams,
  setLoanParams,
  isCalculating,
  onValidationChange
}: LoanParametersCardProps) {
  const [loanNameError, setLoanNameError] = useState('');
  const [termError, setTermError] = useState('');

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
    onValidationChange({ isLoanNameValid, isTermValid });

  }, [loanParams.loanName, loanParams.termMonths, loanParams.paymentFrequency, onValidationChange]);

  // Manejadores de eventos individuales para mantener la lógica original
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanParams(prev => ({ ...prev, loanName: e.target.value }));
  }, [setLoanParams]);

  const handleAssetCostChange = useCallback((value: number) => {
    setLoanParams(prev => ({ 
      ...prev, 
      assetCost: value,
      downPayment: Math.min(prev.downPayment, value) // Ensure down payment doesn't exceed asset cost
    }));
  }, [setLoanParams]);

  const handleDownPaymentChange = useCallback((value: number) => {
    setLoanParams(prev => ({ ...prev, downPayment: value }));
  }, [setLoanParams]);

  const handleInterestRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 999) {
      setLoanParams(prev => ({ ...prev, interestRate: value }));
    } else if (e.target.value === '') {
        setLoanParams(prev => ({...prev, interestRate: 0}));
    }
  }, [setLoanParams]);

  const handleTermMonthsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
     if (!isNaN(value) && value >= 1 && value <= 1200) {
      setLoanParams(prev => ({ ...prev, termMonths: value }));
    } else if (e.target.value === '') {
        setLoanParams(prev => ({...prev, termMonths: 0}));
    }
  }, [setLoanParams]);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setLoanParams(prev => ({ ...prev, startDate: date }));
    }
  }, [setLoanParams]);

  const handleFrequencyChange = useCallback((value: string) => {
    setLoanParams(prev => ({
      ...prev,
      paymentFrequency: value as "monthly" | "quarterly" | "semi-annual" | "annual"
    }));
  }, [setLoanParams]);

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <h2 className="text-lg font-bold mb-4 text-foreground">Loan Parameters</h2>
        <div className="space-y-4">
          <div className="form-group">
            <Label htmlFor="loan-name">Loan Name <span className="text-destructive">*</span></Label>
            <Input
              id="loan-name"
              name="loan-name"
              type="text"
              value={loanParams.loanName}
              onChange={handleTitleChange}
              disabled={isCalculating}
              required
              className={cn(loanNameError && "border-red-500 focus-visible:ring-red-500")}
            />
            {loanNameError && <p className="text-xs text-red-500 mt-1">{loanNameError}</p>}
          </div>

          <div className="form-group">
            <Label htmlFor="asset-cost">Asset Cost <span className="text-destructive">*</span></Label>
            <CurrencyInput
              id="asset-cost"
              name="asset-cost"
              value={loanParams.assetCost}
              onChange={handleAssetCostChange}
              min={1000}
              max={100000000}
              disabled={isCalculating}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum required amount: $1,000 Maximum: $100,000,000</p>
          </div>

          <div className="form-group">
            <Label htmlFor="down-payment">Down Payment (Enganche) <span className="text-destructive">*</span></Label>
            <CurrencyInput
              id="down-payment"
              name="down-payment"
              value={loanParams.downPayment}
              onChange={handleDownPaymentChange}
              min={0}
              max={loanParams.assetCost}
              disabled={isCalculating}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Amount paid upfront. Maximum: Asset Cost</p>
          </div>

          <div className="form-group">
            <Label htmlFor="interest-rate">Annual Interest Rate (%) <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="interest-rate"
                name="interest-rate"
                type="number"
                value={loanParams.interestRate.toString()}
                onChange={handleInterestRateChange}
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
              name="loan-term"
              type="number"
              value={loanParams.termMonths.toString()}
              onChange={handleTermMonthsChange}
              min={1}
              max={1200}
              placeholder="Enter loan term in months"
              disabled={isCalculating}
              required
              className={cn(termError && "border-red-500")}
            />
            {termError && <p className="text-xs text-red-500 mt-1">{termError}</p>}
          </div>

          <div className="form-group">
            <Label>Start Date <span className="text-destructive">*</span></Label>
            <DatePicker
              date={loanParams.startDate}
              setDate={handleStartDateChange}
              disabled={isCalculating}
            />
          </div>

          {/* Payment Frequency - Temporarily disabled
          <div className="form-group">
            <Label htmlFor="payment-frequency">Payment Frequency</Label>
            <Select
              value={loanParams.paymentFrequency}
              onValueChange={handleFrequencyChange}
              disabled={isCalculating}
            >
              <SelectTrigger id="payment-frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          */}
        </div>
      </CardContent>
    </Card>
  );
}
