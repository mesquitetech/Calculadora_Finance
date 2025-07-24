import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Percent, Calendar, Truck } from "lucide-react";

export interface BusinessParameters {
  // Variables básicas existentes
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
  
  // Nuevas variables para arrendamiento puro
  lessorProfitMarginPct: number; // Margen de ganancia del operador (%)
  fixedMonthlyFee: number; // Cuota administrativa fija
  adminCommissionPct: number; // Comisión por apertura (%)
  securityDepositMonths: number; // Meses de depósito en garantía
  deliveryCosts: number; // Costos de trámites y entrega
  residualValueRate: number; // Valor residual (%)
  discountRate: number; // Tasa de descuento para NPV (%)
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

  const handleAdminCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, adminCommissionPct: value }));
  };

  const handleSecurityDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBusinessParams(prev => ({ ...prev, securityDepositMonths: value }));
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
          Parámetros de Arrendamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Sección: Información del Activo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Información del Activo</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="asset-cost">Costo del Activo (sin IVA)</Label>
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
              <p className="text-xs text-red-500 mt-1">El costo del activo no puede ser menor al monto del préstamo</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <Label htmlFor="residual-value">Valor Residual (%)</Label>
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
              <Label htmlFor="discount-rate">Tasa de Descuento (%)</Label>
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

        {/* Sección: Estructura de Rentabilidad */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">Estructura de Rentabilidad</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="lessor-margin">Margen de Ganancia (%)</Label>
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
            <Label htmlFor="fixed-fee">Cuota Administrativa Mensual</Label>
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

        {/* Sección: Pago Inicial */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Configuración del Pago Inicial</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <Label htmlFor="admin-commission">Comisión Apertura (%)</Label>
              <div className="relative">
                <Input
                  id="admin-commission"
                  type="number"
                  value={businessParams.adminCommissionPct}
                  onChange={handleAdminCommissionChange}
                  min={0}
                  max={10}
                  step={0.1}
                  disabled={isCalculating}
                  className="pr-8"
                />
                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="form-group">
              <Label htmlFor="security-deposit">Depósito (meses)</Label>
              <Input
                id="security-deposit"
                type="number"
                value={businessParams.securityDepositMonths}
                onChange={handleSecurityDepositChange}
                min={0}
                max={12}
                step={1}
                disabled={isCalculating}
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="delivery-costs">Costos de Trámites y Entrega</Label>
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

        {/* Sección: Gastos Operativos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-sm">Gastos Operativos</h3>
          </div>
          
          <div className="form-group">
            <Label htmlFor="other-expenses">Otros Gastos Iniciales</Label>
            <CurrencyInput
              id="other-expenses"
              name="other-expenses"
              value={businessParams.otherExpenses}
              onChange={handleOtherExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Gastos únicos adicionales (configuración, etc.)</p>
          </div>

          <div className="form-group">
            <Label htmlFor="monthly-expenses">Gastos Mensuales</Label>
            <CurrencyInput
              id="monthly-expenses"
              name="monthly-expenses"
              value={businessParams.monthlyExpenses}
              onChange={handleMonthlyExpensesChange}
              min={0}
              max={1000000}
              disabled={isCalculating}
            />
            <p className="text-xs text-muted-foreground mt-1">Seguros, mantenimiento, gastos operativos recurrentes</p>
          </div>
        </div>

        {/* Indicador de Configuración */}
        <div className="pt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Configuración de Arrendamiento Puro Completa
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}