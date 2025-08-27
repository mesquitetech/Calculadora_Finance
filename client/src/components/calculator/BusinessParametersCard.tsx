
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Percent, Calendar, Truck, Building2 } from "lucide-react";

export interface BusinessParameters {
  // Existing basic variables (to maintain compatibility)
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number; // Keep for backward compatibility
  adminCommissionPct: number;
  securityDepositMonths: number;
  deliveryCosts: number;
  discountRate: number;
  
  // Simplified leasing variables
  profitMarginPesos: number; // Desired profit margin in pesos (replaces percentage)
  fixedMonthlyFee: number; // Monthly administration expenses
  residualValueRate: number; // Residual value percentage
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

  const handleProfitMarginPesosChange = (values: number[]) => {
    setBusinessParams(prev => ({ ...prev, profitMarginPesos: values[0] }));
  };

  const handleFixedMonthlyFeeChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }));
  };

  const calculatedLoanAmount = loanAmount || 0;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Financial Data (Internal for the Lessor)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Calculated Loan Amount Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Loan Amount to Investors:</span>
            <span className="text-2xl font-bold text-blue-700">
              ${calculatedLoanAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Capital to be financed internally (Car Value - Initial Payment)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="form-group">
              <Label htmlFor="profit-margin-pesos">Desired Financial Profit Margin (USD)</Label>
              <div className="space-y-3">
                <Slider
                  value={[businessParams.profitMarginPesos || 0]}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={handleProfitMarginPesosChange}
                  className="w-full"
                  disabled={isCalculating}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span className="font-medium text-blue-600">
                    ${(businessParams.profitMarginPesos || 0).toLocaleString()}
                  </span>
                  <span>$10,000</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                How much you want to earn from the rate difference (e.g., $500).
              </p>
            </div>

            <div className="form-group">
              <Label htmlFor="monthly-admin-fee">Monthly Administration Expenses (USD)</Label>
              <CurrencyInput
                id="monthly-admin-fee"
                name="monthly-admin-fee"
                value={businessParams.fixedMonthlyFee}
                onChange={handleFixedMonthlyFeeChange}
                min={0}
                max={10000}
                disabled={isCalculating}
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
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-bold">${calculatedLoanAmount.toLocaleString()}</span>
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
                  <span className="font-bold text-green-700">${(businessParams.profitMarginPesos || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Admin:</span>
                  <span className="font-medium">${businessParams.fixedMonthlyFee.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
