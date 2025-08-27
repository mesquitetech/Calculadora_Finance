import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { 
  Calculator, 
  DollarSign,
  Building2,
  Settings,
  Car,
  Users,
  FileText
} from "lucide-react";

interface LoanParameters {
  loanName: string;
  totalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
}

interface Investor {
  id: number;
  name: string;
  investmentAmount: number;
}

interface BusinessParameters {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  lessorProfitMarginPct: number;
  fixedMonthlyFee: number;
  adminCommissionPct: number;
  securityDepositMonths: number;
  deliveryCosts: number;
  residualValueRate: number;
  discountRate: number;
}

interface LeasingInputs {
  clientName: string;
  vehicleInfo: string;
  promoter: string;
  phone: string;
  folio: string;
  city: string;
  assetValue: number;
  downPayment: number;
  termMonths: number;
  clientAnnualInterestRate: number;
  residualValuePercentage: number;
  investorLoanAmount: number;
  investorAnnualInterestRate: number;
  firstYearInsurance: number;
  openingCommission: number;
  adminExpenses: number;
}

interface UnifiedSetupProps {
  initialLoanParams: LoanParameters;
  initialInvestors: Investor[];
  initialBusinessParams: BusinessParameters;
  initialLeasingInputs: LeasingInputs;
  onSaveInvestorLoan: (data: { loanParams: LoanParameters; investors: Investor[]; businessParams: BusinessParameters }) => void;
  onSaveLeasing: (inputs: LeasingInputs) => void;
  isSubmittingLoan: boolean;
  isSubmittingLeasing: boolean;
  leasingResults?: any;
  onGenerateLeasingPDF: () => void;
}

export function UnifiedSetup({
  initialLoanParams,
  initialInvestors,
  initialBusinessParams,
  initialLeasingInputs,
  onSaveInvestorLoan,
  onSaveLeasing,
  isSubmittingLoan,
  isSubmittingLeasing,
  leasingResults,
  onGenerateLeasingPDF,
}: UnifiedSetupProps) {
  // Combined state
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [businessParams, setBusinessParams] = useState<BusinessParameters>(initialBusinessParams);
  const [leasingInputs, setLeasingInputs] = useState<LeasingInputs>(initialLeasingInputs);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validation
  const validateLoan = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!loanParams.loanName || loanParams.loanName.length < 3) {
      newErrors.loanName = "Loan name must be at least 3 characters";
    }
    
    if (loanParams.totalAmount < 1000) {
      newErrors.totalAmount = "Total amount must be at least $1,000";
    }
    
    if (loanParams.interestRate <= 0 || loanParams.interestRate > 50) {
      newErrors.interestRate = "Interest rate must be between 0% and 50%";
    }
    
    if (loanParams.termMonths <= 0 || loanParams.termMonths > 360) {
      newErrors.termMonths = "Term must be between 1 and 360 months";
    }
    
    const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    if (Math.abs(totalInvestment - loanParams.totalAmount) > 0.01) {
      newErrors.investment = "Total investment must equal loan amount";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLeasing = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!leasingInputs.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    
    if (!leasingInputs.vehicleInfo.trim()) {
      newErrors.vehicleInfo = "Vehicle information is required";
    }
    
    if (leasingInputs.assetValue <= 0) {
      newErrors.assetValue = "Asset value must be greater than 0";
    }
    
    if (leasingInputs.downPayment >= leasingInputs.assetValue) {
      newErrors.downPayment = "Down payment must be less than asset value";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculateInvestorLoan = () => {
    if (validateLoan()) {
      onSaveInvestorLoan({ loanParams, investors, businessParams });
    }
  };

  const handleCalculateLeasing = () => {
    if (validateLeasing()) {
      onSaveLeasing(leasingInputs);
    }
  };

  const addInvestor = () => {
    const newId = Math.max(...investors.map(inv => inv.id), 0) + 1;
    setInvestors([...investors, { id: newId, name: `Investor ${newId}`, investmentAmount: 0 }]);
  };

  const removeInvestor = (id: number) => {
    if (investors.length > 1) {
      setInvestors(investors.filter(inv => inv.id !== id));
    }
  };

  const updateInvestor = (id: number, field: keyof Investor, value: any) => {
    setInvestors(investors.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  return (
    <div className="space-y-6">
      {/* Asset & Leasing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Asset & Leasing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanName">Loan Name <span className="text-red-500">*</span></Label>
                <Input
                  id="loanName"
                  value={loanParams.loanName}
                  onChange={(e) => setLoanParams(prev => ({ ...prev, loanName: e.target.value }))}
                  placeholder="Equipment Leasing Project"
                  className={errors.loanName ? "border-red-500" : ""}
                />
                {errors.loanName && <p className="text-sm text-red-500 mt-1">{errors.loanName}</p>}
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Loan Amount <span className="text-red-500">*</span></Label>
                <CurrencyInput
                  id="totalAmount"
                  value={loanParams.totalAmount}
                  onChange={(value) => setLoanParams(prev => ({ ...prev, totalAmount: value }))}
                  placeholder="150,000.00"
                  className={errors.totalAmount ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: $1,000 Maximum: $100,000,000</p>
                {errors.totalAmount && <p className="text-sm text-red-500 mt-1">{errors.totalAmount}</p>}
              </div>
              <div>
                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={loanParams.startDate}
                  onChange={(e) => setLoanParams(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="termMonths">Term (Months) <span className="text-red-500">*</span></Label>
                <Input
                  id="termMonths"
                  type="number"
                  value={loanParams.termMonths}
                  onChange={(e) => setLoanParams(prev => ({ ...prev, termMonths: parseInt(e.target.value) || 0 }))}
                  placeholder="36"
                  min="1"
                  max="360"
                  className={errors.termMonths ? "border-red-500" : ""}
                />
                {errors.termMonths && <p className="text-sm text-red-500 mt-1">{errors.termMonths}</p>}
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%) <span className="text-red-500">*</span></Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={loanParams.interestRate}
                  onChange={(e) => setLoanParams(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="8.5"
                  min="0"
                  max="50"
                  className={errors.interestRate ? "border-red-500" : ""}
                />
                {errors.interestRate && <p className="text-sm text-red-500 mt-1">{errors.interestRate}</p>}
              </div>
            </div>
          </div>

          {/* Asset Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Asset Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="assetCost">Asset Cost (without VAT)</Label>
                <CurrencyInput
                  id="assetCost"
                  value={businessParams.assetCost}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, assetCost: value }))}
                  placeholder="150,000.00"
                />
              </div>
              <div>
                <Label htmlFor="residualValue">Residual Value (%)</Label>
                <Input
                  id="residualValue"
                  type="number"
                  step="0.1"
                  value={businessParams.residualValueRate}
                  onChange={(e) => setBusinessParams(prev => ({ ...prev, residualValueRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="25"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="discountRate">Discount Rate (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  step="0.1"
                  value={businessParams.discountRate}
                  onChange={(e) => setBusinessParams(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="4"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Leasing Parameters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Leasing Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  step="0.1"
                  value={businessParams.lessorProfitMarginPct}
                  onChange={(e) => setBusinessParams(prev => ({ ...prev, lessorProfitMarginPct: parseFloat(e.target.value) || 0 }))}
                  placeholder="10"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="monthlyFee">Monthly Administrative Fee</Label>
                <CurrencyInput
                  id="monthlyFee"
                  value={businessParams.fixedMonthlyFee}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }))}
                  placeholder="700.00"
                />
              </div>
              <div>
                <Label htmlFor="openingCommission">Opening Commission (%)</Label>
                <Input
                  id="openingCommission"
                  type="number"
                  step="0.1"
                  value={businessParams.adminCommissionPct}
                  onChange={(e) => setBusinessParams(prev => ({ ...prev, adminCommissionPct: parseFloat(e.target.value) || 0 }))}
                  placeholder="1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="depositMonths">Deposit (months)</Label>
                <Input
                  id="depositMonths"
                  type="number"
                  value={businessParams.securityDepositMonths}
                  onChange={(e) => setBusinessParams(prev => ({ ...prev, securityDepositMonths: parseInt(e.target.value) || 0 }))}
                  placeholder="1"
                  min="0"
                  max="12"
                />
              </div>
              <div>
                <Label htmlFor="deliveryCosts">Processing and Delivery Costs</Label>
                <CurrencyInput
                  id="deliveryCosts"
                  value={businessParams.deliveryCosts}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, deliveryCosts: value }))}
                  placeholder="6,191.00"
                />
              </div>
              <div>
                <Label htmlFor="otherExpenses">Other Initial Expenses</Label>
                <CurrencyInput
                  id="otherExpenses"
                  value={businessParams.otherExpenses}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, otherExpenses: value }))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Additional one-time expenses (setup, etc.)</p>
              </div>
              <div>
                <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
                <CurrencyInput
                  id="monthlyExpenses"
                  value={businessParams.monthlyExpenses}
                  onChange={(value) => setBusinessParams(prev => ({ ...prev, monthlyExpenses: value }))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Insurance, maintenance, recurring operating expenses</p>
              </div>
            </div>
          </div>

          {/* Client Information for Leasing */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Client Information (for Leasing PDF)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={leasingInputs.clientName}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="MIGUEL GARCIA"
                  className={errors.clientName ? "border-red-500" : ""}
                />
                {errors.clientName && <p className="text-sm text-red-500 mt-1">{errors.clientName}</p>}
              </div>
              <div>
                <Label htmlFor="vehicleInfo">Vehicle Information</Label>
                <Input
                  id="vehicleInfo"
                  value={leasingInputs.vehicleInfo}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                  placeholder="Lincoln AVIATOR 2025"
                  className={errors.vehicleInfo ? "border-red-500" : ""}
                />
                {errors.vehicleInfo && <p className="text-sm text-red-500 mt-1">{errors.vehicleInfo}</p>}
              </div>
              <div>
                <Label htmlFor="promoter">Promoter</Label>
                <Input
                  id="promoter"
                  value={leasingInputs.promoter}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, promoter: e.target.value }))}
                  placeholder="Sergio Rodriguez"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={leasingInputs.phone}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="8125138065"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={leasingInputs.city}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Guadalajara, Jalisco"
                />
              </div>
              <div>
                <Label htmlFor="folio">Folio</Label>
                <Input
                  id="folio"
                  value={leasingInputs.folio}
                  onChange={(e) => setLeasingInputs(prev => ({ ...prev, folio: e.target.value }))}
                  placeholder="Auto-generated"
                />
              </div>
            </div>
          </div>

          {/* Investors Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Financing & Investors
            </h3>
            <div className="space-y-4">
              {investors.map((investor, index) => (
                <div key={investor.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`investor-name-${investor.id}`}>Investor Name</Label>
                    <Input
                      id={`investor-name-${investor.id}`}
                      value={investor.name}
                      onChange={(e) => updateInvestor(investor.id, 'name', e.target.value)}
                      placeholder={`Investor ${index + 1}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`investor-amount-${investor.id}`}>Investment Amount</Label>
                    <CurrencyInput
                      id={`investor-amount-${investor.id}`}
                      value={investor.investmentAmount}
                      onChange={(value) => updateInvestor(investor.id, 'investmentAmount', value)}
                      placeholder="50,000.00"
                    />
                  </div>
                  <div className="flex items-end">
                    {investors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeInvestor(investor.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addInvestor}
                className="w-full"
              >
                Add Investor
              </Button>
              
              {errors.investment && (
                <p className="text-sm text-red-500">{errors.investment}</p>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">
                  <strong>Total Investment:</strong> ${investors.reduce((sum, inv) => sum + inv.investmentAmount, 0).toLocaleString()} / 
                  <strong> Loan Amount:</strong> ${loanParams.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={handleCalculateInvestorLoan}
              disabled={isSubmittingLoan}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isSubmittingLoan ? "Calculating..." : "Calculate Investment Loan"}
            </Button>
            
            <Button
              onClick={handleCalculateLeasing}
              disabled={isSubmittingLeasing}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Car className="w-4 h-4 mr-2" />
              {isSubmittingLeasing ? "Calculating..." : "Calculate Leasing"}
            </Button>
            
            {leasingResults && (
              <Button
                onClick={onGenerateLeasingPDF}
                variant="secondary"
                size="lg"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate PDF
              </Button>
            )}
          </div>

          {/* Leasing Results Display */}
          {leasingResults && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Leasing Calculation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Monthly Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${leasingResults.models?.clientQuotation?.monthlyPayment?.toLocaleString() || '0'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lessor Monthly Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ${leasingResults.models?.lessorCost?.monthlyPayment?.toLocaleString() || '0'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gross Monthly Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      ${leasingResults.models?.profitability?.grossMonthlyMargin?.toLocaleString() || '0'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${leasingResults.models?.profitability?.totalProfit?.toLocaleString() || '0'}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profit Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {leasingResults.models?.profitability?.profitMarginPercentage?.toFixed(2) || '0'}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}