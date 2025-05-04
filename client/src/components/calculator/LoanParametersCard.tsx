import React from "react";
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

interface LoanParameters {
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: "monthly" | "quarterly" | "semi-annual" | "annual";
}

interface LoanParametersCardProps {
  loanParams: LoanParameters;
  setLoanParams: React.Dispatch<React.SetStateAction<LoanParameters>>;
  isCalculating: boolean;
}

export function LoanParametersCard({ 
  loanParams, 
  setLoanParams,
  isCalculating
}: LoanParametersCardProps) {
  const handleAmountChange = (value: number) => {
    setLoanParams(prev => ({ ...prev, totalAmount: value }));
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLoanParams(prev => ({ ...prev, interestRate: isNaN(value) ? 0 : value }));
  };

  const handleTermMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLoanParams(prev => ({ ...prev, termMonths: isNaN(value) ? 0 : value }));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setLoanParams(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleFrequencyChange = (value: string) => {
    setLoanParams(prev => ({ 
      ...prev, 
      paymentFrequency: value as "monthly" | "quarterly" | "semi-annual" | "annual"
    }));
  };

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <h2 className="text-lg font-bold mb-4 text-foreground">Loan Parameters</h2>
        
        <div className="space-y-4">
          <div className="form-group">
            <Label htmlFor="total-amount" className="mb-1">
              Total Loan Amount
              <span className="text-destructive ml-1">*</span>
            </Label>
            <CurrencyInput
              id="total-amount"
              name="total-amount"
              value={loanParams.totalAmount}
              onChange={handleAmountChange}
              min={1000}
              disabled={isCalculating}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum required amount: $1,000</p>
          </div>

          <div className="form-group">
            <Label htmlFor="interest-rate" className="mb-1">
              Annual Interest Rate (%)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="relative">
              <Input 
                id="interest-rate"
                name="interest-rate"
                type="number"
                value={loanParams.interestRate.toString()}
                onChange={handleInterestRateChange}
                min={0}
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
          </div>

          <div className="form-group">
            <Label htmlFor="loan-term" className="mb-1">
              Loan Term (Months)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="loan-term"
              name="loan-term"
              type="number"
              value={loanParams.termMonths.toString()}
              onChange={handleTermMonthsChange}
              min={1}
              max={360}
              placeholder="Enter loan term in months"
              disabled={isCalculating}
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="start-date" className="mb-1">
              Start Date
              <span className="text-destructive ml-1">*</span>
            </Label>
            <DatePicker
              date={loanParams.startDate}
              setDate={handleStartDateChange}
              disabled={isCalculating}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="payment-frequency" className="mb-1">
              Payment Frequency
            </Label>
            <Select 
              value={loanParams.paymentFrequency} 
              onValueChange={handleFrequencyChange}
              disabled={isCalculating}
            >
              <SelectTrigger id="payment-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
