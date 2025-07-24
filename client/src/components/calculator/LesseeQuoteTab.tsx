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
  
  // Calcular IVA (16%)
  const iva_rate = 0.16;
  const monthly_rent_with_iva = results.total_monthly_rent_sans_iva * (1 + iva_rate);
  const initial_payment_with_iva = (results.initial_admin_commission + leasingInputs.delivery_costs) * (1 + iva_rate) + results.initial_security_deposit;
  
  const total_contract_value = (monthly_rent_with_iva * leasingInputs.lease_term_months) + initial_payment_with_iva;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            Cotización de Arrendamiento
          </h2>
          <p className="text-muted-foreground mt-1">
            Propuesta profesional para el cliente final
          </p>
        </div>
        <Button onClick={onExportQuote} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Cotización
        </Button>
      </div>

      {/* Resumen Principal */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Resumen de la Propuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(monthly_rent_with_iva)}
              </div>
              <div className="text-sm text-muted-foreground">Renta Mensual (con IVA)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(initial_payment_with_iva)}
              </div>
              <div className="text-sm text-muted-foreground">Pago Inicial (con IVA)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                {leasingInputs.lease_term_months} meses
              </div>
              <div className="text-sm text-muted-foreground">Plazo del Contrato</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desglose de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Desglose del Pago Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Comisión por Apertura:</span>
              <span className="font-medium">
                {formatCurrency(results.initial_admin_commission)} + IVA
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Gastos de Trámites:</span>
              <span className="font-medium">
                {formatCurrency(leasingInputs.delivery_costs)} + IVA
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm">Subtotal (gravado):</span>
              <span className="font-medium">
                {formatCurrency(results.initial_admin_commission + leasingInputs.delivery_costs)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">IVA (16%):</span>
              <span className="font-medium">
                {formatCurrency((results.initial_admin_commission + leasingInputs.delivery_costs) * iva_rate)}
              </span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Depósito en Garantía:
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {formatCurrency(results.initial_security_deposit)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                * El depósito en garantía se devuelve al final del contrato
              </p>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Pago Inicial:</span>
                <span className="text-green-600">
                  {formatCurrency(initial_payment_with_iva)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Desglose de la Renta Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Amortización del Activo:</span>
              <span className="font-medium">
                {formatCurrency(results.base_rent_amortization)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Margen Financiero:</span>
              <span className="font-medium">
                {formatCurrency(results.lessor_monthly_profit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cuota Administrativa:</span>
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
              <span className="text-sm">IVA (16%):</span>
              <span className="font-medium">
                {formatCurrency(results.total_monthly_rent_sans_iva * iva_rate)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Renta Mensual:</span>
                <span className="text-blue-600">
                  {formatCurrency(monthly_rent_with_iva)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(leasingInputs.asset_cost_sans_iva)}
              </div>
              <div className="text-sm text-muted-foreground">Valor del Activo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(total_contract_value)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Total del Contrato</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(results.residual_value_amount)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Residual Estimado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(leasingInputs.lessor_profit_margin_pct)}
              </div>
              <div className="text-sm text-muted-foreground">Margen Aplicado</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Términos y Condiciones */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Términos y Condiciones Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Condiciones de Pago:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Pago inicial al momento de la entrega</li>
                <li>• Rentas mensuales pagaderas por adelantado</li>
                <li>• Devolución del depósito al final del contrato</li>
                <li>• Todos los pagos incluyen IVA donde aplique</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Responsabilidades del Cliente:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mantenimiento preventivo del vehículo</li>
                <li>• Seguro de daños a terceros vigente</li>
                <li>• Cumplimiento de todas las obligaciones fiscales</li>
                <li>• Devolución en condiciones pactadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}