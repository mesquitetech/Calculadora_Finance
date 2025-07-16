import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";

export interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyRevenue: number;
}

interface BusinessParametersCardProps {
  businessParams: BusinessParameters;
  setBusinessParams: React.Dispatch<React.SetStateAction<BusinessParameters>>;
  isCalculating: boolean;
}

export function BusinessParametersCard({
  businessParams,
  setBusinessParams,
  isCalculating
}: BusinessParametersCardProps) {

  const handleAssetCostChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, assetCost: value }));
  };

  const handleOtherExpensesChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, otherExpenses: value }));
  };

  const handleMonthlyRevenueChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, monthlyRevenue: value }));
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
            />
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
            <p className="text-xs text-muted-foreground mt-1">Additional monthly operating expenses</p>
          </div>

          <div className="form-group">
            <Label htmlFor="monthly-revenue">Monthly Revenue</Label>
            <CurrencyInput
              id="monthly-revenue"
              name="monthly-revenue"
              value={businessParams.monthlyRevenue}
              onChange={handleMonthlyRevenueChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Expected monthly revenue from the business</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}