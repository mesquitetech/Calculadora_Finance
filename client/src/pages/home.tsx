import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { AboutFooter } from "@/components/calculator/AboutFooter";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateLeasingModels, LeasingInputs, formatCurrency } from "@/lib/leasingCalculations";
import { exportLeasingQuotePDF } from "@/lib/leasingQuotePDF";
import { CalculatorIcon, FileText, Car, Users, DollarSign, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResults, setCalculationResults] = useState<any>(null);

  // Estado simplificado para el nuevo modelo de leasing
  const [leasingInputs, setLeasingInputs] = useState<LeasingInputs>({
    // Información del cliente
    clientName: "MIGUEL GARCIA",
    vehicleInfo: "Lincoln AVIATOR 2025",
    promoter: "Sergio Rodríguez",
    phone: "8125138065",
    folio: "ABCLEASING" + Date.now(),
    city: "Guadalajara, Jalisco",
    
    // Variables financieras principales
    assetValue: 1512000,
    downPayment: 226800,
    termMonths: 48,
    clientAnnualInterestRate: 12.0,
    residualValuePercentage: 13.0,
    
    // Variables del préstamo del inversionista
    investorLoanAmount: 1285200,
    investorAnnualInterestRate: 8.5,
    
    // Campos adicionales para el PDF
    firstYearInsurance: 32758.62,
    openingCommission: 22158.62,
    adminExpenses: 18168.60
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validación de campos
  const validateInputs = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!leasingInputs.clientName.trim()) {
      newErrors.clientName = "El nombre del cliente es requerido";
    }
    
    if (!leasingInputs.vehicleInfo.trim()) {
      newErrors.vehicleInfo = "La información del vehículo es requerida";
    }
    
    if (leasingInputs.assetValue <= 0) {
      newErrors.assetValue = "El valor del activo debe ser mayor a 0";
    }
    
    if (leasingInputs.downPayment < 0) {
      newErrors.downPayment = "El anticipo no puede ser negativo";
    }
    
    if (leasingInputs.downPayment >= leasingInputs.assetValue) {
      newErrors.downPayment = "El anticipo debe ser menor al valor del activo";
    }
    
    if (leasingInputs.termMonths <= 0 || leasingInputs.termMonths > 120) {
      newErrors.termMonths = "El plazo debe estar entre 1 y 120 meses";
    }
    
    if (leasingInputs.clientAnnualInterestRate <= 0 || leasingInputs.clientAnnualInterestRate > 50) {
      newErrors.clientAnnualInterestRate = "La tasa de interés debe estar entre 0% y 50%";
    }
    
    if (leasingInputs.residualValuePercentage < 0 || leasingInputs.residualValuePercentage > 100) {
      newErrors.residualValuePercentage = "El valor residual debe estar entre 0% y 100%";
    }
    
    if (leasingInputs.investorLoanAmount <= 0) {
      newErrors.investorLoanAmount = "El monto del préstamo del inversionista debe ser mayor a 0";
    }
    
    if (leasingInputs.investorAnnualInterestRate <= 0 || leasingInputs.investorAnnualInterestRate > 50) {
      newErrors.investorAnnualInterestRate = "La tasa del inversionista debe estar entre 0% y 50%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutación para cálculo
  const calculateMutation = useMutation({
    mutationFn: async () => {
      const results = generateLeasingModels(leasingInputs);
      
      // Guardar en el backend
      const response = await apiRequest("POST", "/api/leasing-calculate", {
        inputs: leasingInputs,
        results: results
      });
      
      return results;
    },
    onSuccess: (data) => {
      setCalculationResults(data);
      setIsCalculating(false);
      toast({
        title: "Cálculo Completado",
        description: "Los cálculos de leasing se han realizado exitosamente.",
      });
    },
    onError: (error) => {
      setIsCalculating(false);
      toast({
        title: "Error en el Cálculo",
        description: error.message || "Hubo un error al realizar los cálculos.",
        variant: "destructive",
      });
    }
  });

  const handleCalculate = () => {
    if (!validateInputs()) {
      toast({
        title: "Errores de Validación",
        description: "Por favor corrija los errores en el formulario.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    calculateMutation.mutate();
  };

  const handleGeneratePDF = () => {
    if (!calculationResults) {
      toast({
        title: "No hay datos para exportar",
        description: "Por favor calcule primero los resultados del leasing.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportLeasingQuotePDF(calculationResults);
      toast({
        title: "PDF Generado",
        description: "La cotización de arrendamiento se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un problema al crear la cotización.",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: keyof LeasingInputs, value: any) => {
    setLeasingInputs(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Título Principal */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Calculadora de Arrendamiento
            </h1>
            <p className="text-lg text-gray-600">
              Genere cotizaciones de leasing precisas y profesionales
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Formulario de Entrada */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Información del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    Información del Cliente y Vehículo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Nombre del Cliente <span className="text-red-500">*</span></Label>
                      <Input
                        id="clientName"
                        value={leasingInputs.clientName}
                        onChange={(e) => updateField('clientName', e.target.value)}
                        placeholder="Ej: MIGUEL GARCIA"
                        className={errors.clientName ? "border-red-500" : ""}
                      />
                      {errors.clientName && <p className="text-sm text-red-500 mt-1">{errors.clientName}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="vehicleInfo">Información del Vehículo <span className="text-red-500">*</span></Label>
                      <Input
                        id="vehicleInfo"
                        value={leasingInputs.vehicleInfo}
                        onChange={(e) => updateField('vehicleInfo', e.target.value)}
                        placeholder="Ej: Lincoln AVIATOR 2025"
                        className={errors.vehicleInfo ? "border-red-500" : ""}
                      />
                      {errors.vehicleInfo && <p className="text-sm text-red-500 mt-1">{errors.vehicleInfo}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="promoter">Promotor</Label>
                      <Input
                        id="promoter"
                        value={leasingInputs.promoter}
                        onChange={(e) => updateField('promoter', e.target.value)}
                        placeholder="Ej: Sergio Rodríguez"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={leasingInputs.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="Ej: 8125138065"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={leasingInputs.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Ej: Guadalajara, Jalisco"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="folio">Folio</Label>
                      <Input
                        id="folio"
                        value={leasingInputs.folio}
                        onChange={(e) => updateField('folio', e.target.value)}
                        placeholder="Se genera automáticamente"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parámetros Financieros Principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Parámetros Financieros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assetValue">Valor de la Unidad (sin IVA) <span className="text-red-500">*</span></Label>
                      <CurrencyInput
                        id="assetValue"
                        value={leasingInputs.assetValue}
                        onChange={(value) => updateField('assetValue', value)}
                        placeholder="1,512,000.00"
                        className={errors.assetValue ? "border-red-500" : ""}
                      />
                      {errors.assetValue && <p className="text-sm text-red-500 mt-1">{errors.assetValue}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="downPayment">Anticipo <span className="text-red-500">*</span></Label>
                      <CurrencyInput
                        id="downPayment"
                        value={leasingInputs.downPayment}
                        onChange={(value) => updateField('downPayment', value)}
                        placeholder="226,800.00"
                        className={errors.downPayment ? "border-red-500" : ""}
                      />
                      {errors.downPayment && <p className="text-sm text-red-500 mt-1">{errors.downPayment}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="termMonths">Plazo (meses) <span className="text-red-500">*</span></Label>
                      <Input
                        id="termMonths"
                        type="number"
                        value={leasingInputs.termMonths}
                        onChange={(e) => updateField('termMonths', parseInt(e.target.value) || 0)}
                        placeholder="48"
                        min="1"
                        max="120"
                        className={errors.termMonths ? "border-red-500" : ""}
                      />
                      {errors.termMonths && <p className="text-sm text-red-500 mt-1">{errors.termMonths}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="clientRate">Tasa Anual Cliente (%) <span className="text-red-500">*</span></Label>
                      <Input
                        id="clientRate"
                        type="number"
                        step="0.1"
                        value={leasingInputs.clientAnnualInterestRate}
                        onChange={(e) => updateField('clientAnnualInterestRate', parseFloat(e.target.value) || 0)}
                        placeholder="12.0"
                        min="0"
                        max="50"
                        className={errors.clientAnnualInterestRate ? "border-red-500" : ""}
                      />
                      {errors.clientAnnualInterestRate && <p className="text-sm text-red-500 mt-1">{errors.clientAnnualInterestRate}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="residualValue">Valor Residual (%) <span className="text-red-500">*</span></Label>
                      <Input
                        id="residualValue"
                        type="number"
                        step="0.1"
                        value={leasingInputs.residualValuePercentage}
                        onChange={(e) => updateField('residualValuePercentage', parseFloat(e.target.value) || 0)}
                        placeholder="13.0"
                        min="0"
                        max="100"
                        className={errors.residualValuePercentage ? "border-red-500" : ""}
                      />
                      {errors.residualValuePercentage && <p className="text-sm text-red-500 mt-1">{errors.residualValuePercentage}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financiamiento del Inversionista */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Financiamiento del Inversionista
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="investorAmount">Monto del Préstamo <span className="text-red-500">*</span></Label>
                      <CurrencyInput
                        id="investorAmount"
                        value={leasingInputs.investorLoanAmount}
                        onChange={(value) => updateField('investorLoanAmount', value)}
                        placeholder="1,285,200.00"
                        className={errors.investorLoanAmount ? "border-red-500" : ""}
                      />
                      {errors.investorLoanAmount && <p className="text-sm text-red-500 mt-1">{errors.investorLoanAmount}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="investorRate">Tasa Anual Inversionista (%) <span className="text-red-500">*</span></Label>
                      <Input
                        id="investorRate"
                        type="number"
                        step="0.1"
                        value={leasingInputs.investorAnnualInterestRate}
                        onChange={(e) => updateField('investorAnnualInterestRate', parseFloat(e.target.value) || 0)}
                        placeholder="8.5"
                        min="0"
                        max="50"
                        className={errors.investorAnnualInterestRate ? "border-red-500" : ""}
                      />
                      {errors.investorAnnualInterestRate && <p className="text-sm text-red-500 mt-1">{errors.investorAnnualInterestRate}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campos Adicionales para PDF */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Información Adicional para Cotización
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="insurance">Seguro Primer Año</Label>
                      <CurrencyInput
                        id="insurance"
                        value={leasingInputs.firstYearInsurance}
                        onChange={(value) => updateField('firstYearInsurance', value)}
                        placeholder="32,758.62"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="commission">Comisión por Apertura</Label>
                      <CurrencyInput
                        id="commission"
                        value={leasingInputs.openingCommission}
                        onChange={(value) => updateField('openingCommission', value)}
                        placeholder="22,158.62"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="adminExpenses">Gastos Administración (mensual)</Label>
                      <CurrencyInput
                        id="adminExpenses"
                        value={leasingInputs.adminExpenses}
                        onChange={(value) => updateField('adminExpenses', value)}
                        placeholder="18,168.60"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleCalculate}
                      disabled={isCalculating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <CalculatorIcon className="h-5 w-5 mr-2" />
                      {isCalculating ? "Calculando..." : "Calcular Leasing"}
                    </Button>
                    
                    <Button
                      onClick={handleGeneratePDF}
                      disabled={!calculationResults}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-5 w-5" />
                      Generar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel de Resultados */}
            <div className="space-y-6">
              {calculationResults ? (
                <>
                  {/* Resumen de Resultados */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Resultados del Cálculo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Renta Mensual Cliente:</span>
                          <span className="font-semibold">{formatCurrency(calculationResults.clientQuotation.monthlyPayment)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pago Mensual Inversionista:</span>
                          <span className="font-semibold">{formatCurrency(calculationResults.lessorCost.monthlyPayment)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Margen Mensual Bruto:</span>
                          <span className="font-bold text-green-600">{formatCurrency(calculationResults.profitability.grossMonthlyMargin)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ganancia Total:</span>
                          <span className="font-bold text-green-600">{formatCurrency(calculationResults.profitability.totalProfit)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Margen de Rentabilidad:</span>
                          <span className="font-bold text-green-600">{calculationResults.profitability.profitMarginPercentage.toFixed(2)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Datos del PDF */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Datos para Cotización PDF</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monto Financiado:</span>
                        <span className="font-medium">{formatCurrency(calculationResults.pdfData.financedAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pago Inicial Total:</span>
                        <span className="font-medium">{formatCurrency(calculationResults.pdfData.initialPaymentTotal)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Renta Mensual Total:</span>
                        <span className="font-medium">{formatCurrency(calculationResults.pdfData.monthlyRentTotal)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Residual:</span>
                        <span className="font-medium">{formatCurrency(calculationResults.pdfData.residualValue)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <CalculatorIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Complete el formulario y haga clic en "Calcular Leasing" para ver los resultados.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AboutFooter />
    </div>
  );
}