
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Percent, Calendar, Truck } from "lucide-react";

export interface BusinessParameters {
  // Existing basic variables
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  
  // New variables for pure leasing
  lessorProfitMarginPct: number; // Operator profit margin (%)
  fixedMonthlyFee: number; // Fixed administrative fee
  adminCommissionPct: number; // Opening commission (%)
  securityDepositMonths: number; // Security deposit months
  deliveryCosts: number; // Processing and delivery costs
  residualValueRate: number; // Residual value (%)
  discountRate: number; // Discount rate for NPV (%)
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

  const handleLessorProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, lessorProfitMarginPct: value }));
  };

  const handleFixedMonthlyFeeChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }));
  };

  

  const handleDeliveryCostsChange = (value: number) => {
    setBusinessParams(prev => ({ ...prev, deliveryCosts: value }));
  };

  const handleResidualValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, residualValueRate: value }));
  };

  const handleDiscountRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, discountRate: value }));
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Leasing Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Section: Asset Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Asset Information</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="asset-cost">Asset Cost (without VAT)</Label>
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
                  onChange={handleResidualValueChange}
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
                  onChange={handleDiscountRateChange}
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

        {/* Section: Profitability Structure */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">Profitability Structure</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="lessor-margin">Profit Margin (%)</Label>
            <div className="relative">
              <Input
                id="lessor-margin"
                type="number"
                value={businessParams.lessorProfitMarginPct}
                onChange={handleLessorProfitMarginChange}
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
              name="fixed-fee"
              value={businessParams.fixedMonthlyFee}
              onChange={handleFixedMonthlyFeeChange}
              min={0}
              max={10000}
              disabled={isCalculating}
            />
          </div>
        </div>

        <Separator />

        {/* Section: Initial Payment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Initial Payment Configuration</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="delivery-costs">Processing and Delivery Costs</Label>
            <CurrencyInput
              id="delivery-costs"
              name="delivery-costs"
              value={businessParams.deliveryCosts}
              onChange={handleDeliveryCostsChange}
              min={0}
              max={50000}
              disabled={isCalculating}
            />
          </div>
        </div>

        <Separator />

        {/* Section: Operating Expenses */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-sm">Operating Expenses</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="other-expenses">Other Initial Expenses</Label>
            <CurrencyInput
              id="other-expenses"
              name="other-expenses"
              value={businessParams.otherExpenses}
              onChange={handleOtherExpensesChange}
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
              name="monthly-expenses"
              value={businessParams.monthlyExpenses}
              onChange={handleMonthlyExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Insurance, maintenance, recurring operating expenses</p>
          </div>
        </div>

        {/* Configuration Indicator */}
        <div className="pt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Pure Leasing Configuration Complete
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
