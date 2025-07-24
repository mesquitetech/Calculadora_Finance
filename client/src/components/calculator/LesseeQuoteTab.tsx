
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  Download, 
  Car, 
  CreditCard, 
  Calendar,
  DollarSign,
  Shield
} from "lucide-react";
import { 
  calculateLeasingFinancials, 
  LeasingInputs, 
  formatCurrency,
  formatPercentage 
} from "@/lib/leasingCalculations";

interface LesseeQuoteTabProps {
  leasingInputs: LeasingInputs;
  startDate: Date;
  onExportQuote: () => void;
}

export function LesseeQuoteTab({
  leasingInputs,
  startDate,
  onExportQuote
}: LesseeQuoteTabProps) {
  const results = calculateLeasingFinancials(leasingInputs, startDate);
  
  // Calculate VAT (16%)
  const vat_rate = 0.16;
  const monthly_rent_with_vat = results.total_monthly_rent_sans_iva * (1 + vat_rate);
  const initial_payment_with_vat = (results.initial_admin_commission + leasingInputs.delivery_costs) * (1 + vat_rate) + results.initial_security_deposit;
  
  const total_contract_value = (monthly_rent_with_vat * leasingInputs.lease_term_months) + initial_payment_with_vat;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            Leasing Quote
          </h2>
          <p className="text-muted-foreground mt-1">
            Professional proposal for the end client
          </p>
        </div>
        <Button onClick={onExportQuote} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Quote
        </Button>
      </div>

      {/* Main Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Proposal Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(monthly_rent_with_vat)}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Rent (with VAT)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(initial_payment_with_vat)}
              </div>
              <div className="text-sm text-muted-foreground">Initial Payment (with VAT)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                {leasingInputs.lease_term_months} months
              </div>
              <div className="text-sm text-muted-foreground">Contract Term</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Initial Payment Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Opening Commission:</span>
              <span className="font-medium">
                {formatCurrency(results.initial_admin_commission)} + VAT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Processing Costs:</span>
              <span className="font-medium">
                {formatCurrency(leasingInputs.delivery_costs)} + VAT
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm">Subtotal (taxable):</span>
              <span className="font-medium">
                {formatCurrency(results.initial_admin_commission + leasingInputs.delivery_costs)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">VAT (16%):</span>
              <span className="font-medium">
                {formatCurrency((results.initial_admin_commission + leasingInputs.delivery_costs) * vat_rate)}
              </span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Security Deposit:
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {formatCurrency(results.initial_security_deposit)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                * The security deposit is returned at the end of the contract
              </p>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Initial Payment:</span>
                <span className="text-green-600">
                  {formatCurrency(initial_payment_with_vat)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Rent Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Asset Amortization:</span>
              <span className="font-medium">
                {formatCurrency(results.base_rent_amortization)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Financial Margin:</span>
              <span className="font-medium">
                {formatCurrency(results.lessor_monthly_profit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Administrative Fee:</span>
              <span className="font-medium">
                {formatCurrency(leasingInputs.fixed_monthly_fee)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(results.total_monthly_rent_sans_iva)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">VAT (16%):</span>
              <span className="font-medium">
                {formatCurrency(results.total_monthly_rent_sans_iva * vat_rate)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Monthly Rent:</span>
                <span className="text-blue-600">
                  {formatCurrency(monthly_rent_with_vat)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(leasingInputs.asset_cost_sans_iva)}
              </div>
              <div className="text-sm text-muted-foreground">Asset Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(total_contract_value)}
              </div>
              <div className="text-sm text-muted-foreground">Total Contract Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(results.residual_value_amount)}
              </div>
              <div className="text-sm text-muted-foreground">Estimated Residual Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(leasingInputs.lessor_profit_margin_pct)}
              </div>
              <div className="text-sm text-muted-foreground">Applied Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Main Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Payment Conditions:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Initial payment upon delivery</li>
                <li>• Monthly rents payable in advance</li>
                <li>• Deposit return at contract end</li>
                <li>• All payments include VAT where applicable</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Client Responsibilities:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Preventive vehicle maintenance</li>
                <li>• Valid third-party liability insurance</li>
                <li>• Compliance with all tax obligations</li>
                <li>• Return in agreed conditions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
