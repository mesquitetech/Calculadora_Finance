import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";

export interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
}

interface BusinessParametersCardProps {
  businessParams: BusinessParameters;
  setBusinessParams: React.Dispatch<React.SetStateAction<BusinessParameters>>;
  isCalculating: boolean;
  loanAmount?: number;
}

export function BusinessParametersCard({
  businessParams,
  setBusinessParams,
  isCalculating,
  loanAmount
}: BusinessParametersCardProps) {
  
  // Check if asset cost is less than loan amount
  const assetCostError = loanAmount && businessParams.assetCost >= 0 && businessParams.assetCost < loanAmount;
  
  const handleAssetCostChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, assetCost: value }));
  };

  const handleOtherExpensesChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, otherExpenses: value }));
  };

  const handleMonthlyExpensesChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, monthlyExpenses: value }));
  };

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <h2 className="text-lg font-bold mb-4 text-foreground">Business Parameters</h2>
        <div className="space-y-4">
          <div className="form-group">
            <Label htmlFor="asset-cost">Asset Cost</Label>
            <CurrencyInput
              id="asset-cost"
              name="asset-cost"
              value={businessParams.assetCost}
              onChange={handleAssetCostChange}
              min={0}
              max={100000000}
              disabled={isCalculating}
              className={assetCostError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {assetCostError && (
              <p className="text-xs text-red-500 mt-1">Asset cost cannot be less than the loan amount</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Initial cost of the asset or equipment</p>
          </div>

          <div className="form-group">
            <Label htmlFor="other-expenses">Other Expenses</Label>
            <CurrencyInput
              id="other-expenses"
              name="other-expenses"
              value={businessParams.otherExpenses}
              onChange={handleOtherExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">One-time additional expenses (fees, setup costs, etc.)</p>
          </div>

          <div className="form-group">
            <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
            <CurrencyInput
              id="monthly-expenses"
              name="monthly-expenses"
              value={businessParams.monthlyExpenses}
              onChange={handleMonthlyExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Recurring monthly operating expenses (maintenance, insurance, etc.)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}