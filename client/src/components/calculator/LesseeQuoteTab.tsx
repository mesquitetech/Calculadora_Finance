import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Car, 
  FileText,
  Building2,
  Phone,
  Mail
} from "lucide-react";
import { 
  calculateLeasingFinancials, 
  LeasingInputs, 
  formatCurrency,
  formatDate 
} from "@/lib/leasingCalculations";
import { generateCustomerQuote, CustomerQuoteData } from '@/lib/customerQuoteGenerator';

interface LesseeQuoteTabProps {
  leasingInputs: LeasingInputs;
  startDate: Date;
  onExportQuote: () => void;
  loanName: string; 
}

export function LesseeQuoteTab({
  leasingInputs,
  startDate,
  onExportQuote,
  loanName
}: LesseeQuoteTabProps) {
  // Validate inputs before calculation - ensure we have meaningful defaults
  const validatedInputs = {
    asset_cost_sans_iva: Number(leasingInputs.asset_cost_sans_iva) || 100000,
    lease_term_months: Number(leasingInputs.lease_term_months) || 36,
    lessor_profit_margin_pct: Number(leasingInputs.lessor_profit_margin_pct) || 20,
    fixed_monthly_fee: Number(leasingInputs.fixed_monthly_fee) || 194,
    admin_commission_pct: Number(leasingInputs.admin_commission_pct) || 1,
    security_deposit_months: Number(leasingInputs.security_deposit_months) || 1,
    delivery_costs: Number(leasingInputs.delivery_costs) || 6320,
    loan_amount: Number(leasingInputs.loan_amount) || 100000,
    annual_interest_rate: Number(leasingInputs.annual_interest_rate) || 10,
    monthly_operational_expenses: Number(leasingInputs.monthly_operational_expenses) || 0,
    residual_value_rate: Number(leasingInputs.residual_value_rate) || 25,
    discount_rate: Number(leasingInputs.discount_rate) || 4,
  };

  const results = calculateLeasingFinancials(validatedInputs, startDate);

  // Calculate end date
  const endDate = new Date(startDate.getTime() + validatedInputs.lease_term_months * 30 * 24 * 60 * 60 * 1000);

  const handleExportQuote = () => {
    try {
      const quoteData: CustomerQuoteData = {
        loanName: loanName,
        assetCost: validatedInputs.asset_cost_sans_iva,
        downPayment: validatedInputs.asset_cost_sans_iva - validatedInputs.loan_amount,
        loanAmount: validatedInputs.loan_amount,
        interestRate: validatedInputs.annual_interest_rate,
        termMonths: validatedInputs.lease_term_months,
        monthlyPayment: results.monthly_payment,
        totalInterest: results.total_interest_cost,
        totalAmount: results.monthly_payment * validatedInputs.lease_term_months,
        startDate: startDate,
        endDate: endDate
      };

      const doc = generateCustomerQuote(quoteData);
      doc.save(`Customer_Quote_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating quote PDF:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            Customer Quote Preview
          </h2>
          <p className="text-muted-foreground mt-1">
            Preview of the PDF that will be generated for the client
          </p>
        </div>
        <Button onClick={handleExportQuote} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Export Quote
        </Button>
      </div>

      {/* PDF Preview Container */}
      <div className="bg-white border border-gray-200 shadow-lg p-8 space-y-8">

        {/* Company Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">MESQUITE FINANCIAL</h1>
          <p className="text-gray-600 mb-4">Leasing and Financial Services</p>
          <h2 className="text-xl font-bold text-gray-800">FINANCING QUOTE</h2>
          <p className="text-sm text-gray-500 mt-2">Quote Generated: {formatDate(new Date())}</p>
        </div>

        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            Client Information
          </h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">
              <span className="font-medium">Project Name:</span> {loanName}
            </p>
          </div>
        </div>

        {/* Asset and Financing Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            Asset and Financing Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Concept</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="py-3 px-4">Asset Cost</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(validatedInputs.asset_cost_sans_iva)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Down Payment</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(validatedInputs.asset_cost_sans_iva - validatedInputs.loan_amount)}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3 px-4">Financed Amount</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(validatedInputs.loan_amount)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Annual Interest Rate</td>
                    <td className="py-3 px-4 text-right font-medium">{validatedInputs.annual_interest_rate.toFixed(2)}%</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3 px-4">Term</td>
                    <td className="py-3 px-4 text-right font-medium">{validatedInputs.lease_term_months} months</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4">Start Date</td>
                    <td className="py-3 px-4 text-right font-medium">{formatDate(startDate)}</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3 px-4">Maturity Date</td>
                    <td className="py-3 px-4 text-right font-medium">{formatDate(endDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            Payment Information
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Payment Details</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-white">
                  <td className="py-3 px-4">Monthly Payment</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(results.monthly_payment)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4">Total Interest</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(results.total_interest_cost)}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-3 px-4">Total Amount to Pay</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(results.monthly_payment * validatedInputs.lease_term_months)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            Terms and Conditions
          </h3>
          <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
            <p>• This quote is valid for 30 days from the date of issue.</p>
            <p>• Interest rate is subject to credit approval and may vary.</p>
            <p>• All payments must be made on the due date to avoid late fees.</p>
            <p>• Early payment options are available without penalties.</p>
            <p>• This quote does not constitute a commitment to lend.</p>
            <p>• Final terms may vary based on credit evaluation and documentation.</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            Contact Information
          </h3>
          <div className="bg-blue-50 p-4 rounded space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="font-medium">MESQUITE FINANCIAL</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>info@mesquitefinancial.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-xs text-gray-500 space-y-1">
          <p>This document is computer-generated and does not require a signature.</p>
          <p>© {new Date().getFullYear()} Mesquite Financial. All rights reserved.</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center pt-4">
        <Button 
          onClick={handleExportQuote} 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          <Download className="h-5 w-5 mr-2" />
          Generate and Download PDF
        </Button>
      </div>
    </div>
  );
}