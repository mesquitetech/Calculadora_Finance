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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DollarSign, Building2, Check } from "lucide-react";
import { LoanParameters } from "./LoanParametersCard";
import { Investor } from "./InvestorsCard";
import { BusinessParameters } from "./BusinessParametersCard";

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loanParams: LoanParameters, investors: Investor[], businessParams: BusinessParameters) => void;
  initialLoanParams: LoanParameters;
  initialInvestors: Investor[];
  initialBusinessParams: BusinessParameters;
}

type WizardStep = 'lease-data' | 'financial-data';

export function SetupWizard({
  isOpen,
  onClose,
  onSave,
  initialLoanParams,
  initialInvestors,
  initialBusinessParams,
}: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('lease-data');

  // State for loan parameters
  const [loanParams, setLoanParams] = useState<LoanParameters>(initialLoanParams);

  // State for business parameters
  const [businessParams, setBusinessParams] = useState<BusinessParameters>(initialBusinessParams);

  // State for investors (keeping same structure but simplified)
  const [investors, setInvestors] = useState<Investor[]>(
    initialInvestors.length > 0
      ? initialInvestors
      : [
          { id: 1, name: "Primary Investor", investmentAmount: 0, percentage: 100 }
        ]
  );

  // State for profit margin in pesos (new key field)
  const [profitMarginPesos, setProfitMarginPesos] = useState<number>(500);

  // Validation logic
  const isLoanNameValid = loanParams.loanName.length >= 3 && loanParams.loanName.length < 60;
  const isAssetCostValid = loanParams.assetCost >= 1000;
  const isInitialPaymentValid = loanParams.downPayment >= 0 && loanParams.downPayment <= loanParams.assetCost;
  const isTermValid = loanParams.termMonths > 0;
  const isResidualValueValid = businessParams.residualValueRate >= 0 && businessParams.residualValueRate <= 100;
  const isInterestRateValid = loanParams.interestRate > 0;

  // Calculate financed amount
  const financedAmount = loanParams.assetCost - loanParams.downPayment;

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep === 'lease-data' && isStep1Valid()) {
      setCurrentStep('financial-data');
    } else if (currentStep === 'financial-data') {
      handleSave();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'financial-data') {
      setCurrentStep('lease-data');
    }
  };

  const isStep1Valid = () => {
    return isLoanNameValid && isAssetCostValid && isInitialPaymentValid && isTermValid && isResidualValueValid;
  };

  const isStep2Valid = () => {
    return isInterestRateValid && profitMarginPesos >= 0 && businessParams.fixedMonthlyFee >= 0;
  };

  const handleSave = () => {
    // Update business parameters with profit margin in pesos
    const updatedBusinessParams = {
      ...businessParams,
      profitMarginPesos: profitMarginPesos,
      assetCost: loanParams.assetCost, // Sync asset cost
    };

    // Update investors with financed amount
    const updatedInvestors = investors.map(investor => ({
      ...investor,
      investmentAmount: financedAmount,
      percentage: 100
    }));

    onSave(loanParams, updatedInvestors, updatedBusinessParams);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'lease-data':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Datos del Arrendamiento (Para el Cliente)</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure los datos básicos del arrendamiento para el cliente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanName">Nombre del Arrendamiento</Label>
                  <Input
                    id="loanName"
                    value={loanParams.loanName}
                    onChange={(e) => setLoanParams(prev => ({ ...prev, loanName: e.target.value }))}
                    placeholder="ej., Proyecto de Arrendamiento Vehicular"
                    className={cn(!isLoanNameValid && loanParams.loanName.length > 0 && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {!isLoanNameValid && loanParams.loanName.length > 0 && (
                    <p className="text-sm text-red-500 mt-1">El nombre debe tener entre 3 y 60 caracteres.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetCost">Valor del Auto (sin IVA)</Label>
                  <CurrencyInput
                    id="asset-cost"
                    name="asset-cost"
                    value={loanParams.assetCost}
                    onChange={(value) => setLoanParams(prev => ({ ...prev, assetCost: value }))}
                    min={1000}
                    max={100000000}
                  />
                  <p className="text-sm text-muted-foreground">
                    El costo total del vehículo sin IVA.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment">Pago Inicial del Cliente</Label>
                  <CurrencyInput
                    id="down-payment"
                    name="down-payment"
                    value={loanParams.downPayment}
                    onChange={(value) => setLoanParams(prev => ({ ...prev, downPayment: value }))}
                    min={0}
                    max={loanParams.assetCost}
                  />
                  <p className="text-sm text-muted-foreground">
                    El monto del enganche del cliente.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="termMonths">Plazo (en Meses)</Label>
                  <Input
                    id="loan-term"
                    name="loan-term"
                    type="number"
                    value={loanParams.termMonths}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 360) {
                        setLoanParams(prev => ({ ...prev, termMonths: value }));
                      }
                    }}
                    min={1}
                    max={360}
                    placeholder="Ingrese el plazo en meses"
                  />
                  <p className="text-sm text-muted-foreground">
                    El número de meses del contrato.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residualValue">Porcentaje de Valor Residual (%)</Label>
                  <div className="relative">
                    <Input
                      id="residual-value"
                      name="residual-value"
                      type="number"
                      value={businessParams.residualValueRate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setBusinessParams(prev => ({ ...prev, residualValueRate: value }));
                      }}
                      min={0}
                      max={100}
                      step={0.1}
                      className="pr-12"
                      placeholder="Valor residual"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El porcentaje del valor del auto que quedará como adeudo al final.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Tasa de Interés Anual para Inversionistas (%)</Label>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      name="interest-rate"
                      type="number"
                      value={loanParams.interestRate}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 999) {
                          setLoanParams(prev => ({ ...prev, interestRate: value }));
                        }
                      }}
                      min={0}
                      max={999}
                      step={0.01}
                      className="pr-12"
                      placeholder="Tasa de interés"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu costo financiero real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'financial-data':
        return (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold text-center">Datos Financieros (Internos de la Arrendadora)</h2>
              <p className="text-muted-foreground text-center max-w-md mt-2">
                Configure sus parámetros financieros internos y márgenes de ganancia.
              </p>
            </div>

            <div className="space-y-6">
              {/* Monto del Préstamo Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monto del Préstamo a Inversionistas:</span>
                  <span className="text-2xl font-bold text-blue-700">
                    ${financedAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  El capital que se financiará internamente (Valor del Auto - Pago Inicial)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Margen de Ganancia Financiero Deseado (en pesos)</Label>
                    <div className="space-y-3">
                      <Slider
                        value={[profitMarginPesos]}
                        min={0}
                        max={10000}
                        step={100}
                        onValueChange={(values) => setProfitMarginPesos(values[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>$0</span>
                        <span className="font-medium text-blue-600">
                          ${profitMarginPesos.toLocaleString()}
                        </span>
                        <span>$10,000</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cuánto quieres ganar por la diferencia de tasas (ej. $500).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyAdmin">Gastos de Administración Mensuales (en pesos)</Label>
                    <CurrencyInput
                      id="monthly-admin"
                      name="monthly-admin"
                      value={businessParams.fixedMonthlyFee}
                      onChange={(value) => setBusinessParams(prev => ({ ...prev, fixedMonthlyFee: value }))}
                      min={0}
                      max={10000}
                    />
                    <p className="text-sm text-muted-foreground">
                      Tu segunda capa de utilidad, gastos administrativos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Resumen Financiero</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor del Auto (sin IVA):</span>
                    <span className="font-medium">${loanParams.assetCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pago Inicial del Cliente:</span>
                    <span className="font-medium">${loanParams.downPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Monto del Préstamo:</span>
                    <span className="font-bold">${financedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasa de Interés:</span>
                    <span className="font-medium">{loanParams.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plazo:</span>
                    <span className="font-medium">{loanParams.termMonths} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Residual:</span>
                    <span className="font-medium">{businessParams.residualValueRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 text-green-800">Configuración de Ganancia</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margen de Ganancia:</span>
                    <span className="font-bold text-green-700">${profitMarginPesos.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gastos Admin. Mensuales:</span>
                    <span className="font-medium">${businessParams.fixedMonthlyFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const steps = [
    { id: 'lease-data', label: 'Datos del Arrendamiento' },
    { id: 'financial-data', label: 'Datos Financieros' },
  ];

  const isNextDisabled = () => {
    switch (currentStep) {
      case 'lease-data':
        return !isStep1Valid();
      case 'financial-data':
        return !isStep2Valid();
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configuración del Arrendamiento</DialogTitle>
          <DialogDescription>
            Complete los pasos para configurar su cálculo de arrendamiento.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex justify-between mb-6 mt-4 px-2">
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'contents' }}>
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

              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep === step.id ? "bg-blue-600 text-white" :
                    steps.findIndex(s => s.id === currentStep) > index ? "bg-blue-600 text-white" :
                    "bg-gray-200 text-gray-600"
                  )}
                >
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs font-medium mt-2 text-center">{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-1">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={currentStep === 'lease-data'}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {currentStep === 'financial-data' ? (
              <Button 
                onClick={handleSave}
                disabled={isNextDisabled()}
                className="bg-green-600 hover:bg-green-700"
              >
                Completar Configuración
              </Button>
            ) : (
              <Button 
                onClick={goToNextStep}
                disabled={isNextDisabled()}
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SetupWizard;