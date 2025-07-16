import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Trash, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/finance";

export interface Investor {
  id: number;
  name: string;
  investmentAmount: number;
}

interface InvestorsCardProps {
  investors: Investor[];
  setInvestors: React.Dispatch<React.SetStateAction<Investor[]>>;
  totalRequired: number;
  isCalculating: boolean;
}

export function InvestorsCard({
  investors,
  setInvestors,
  totalRequired,
  isCalculating
}: InvestorsCardProps) {
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Calculate total investment whenever investors change
  useEffect(() => {
    const total = investors.reduce(
      (sum, investor) => sum + investor.investmentAmount,
      0
    );
    setTotalInvestment(total);

    // Clear error if investments match required amount
    if (Math.abs(total - totalRequired) < 0.01) {
      setError(null);
    } else if (investors.length > 0) {
      setError("Total investment amount must match the required loan amount.");
    }
  }, [investors, totalRequired]);

  // CORREGIDO: Se actualiza la función para asignar un nombre por defecto
  const addInvestor = () => {
    const newId = investors.length > 0
      ? Math.max(...investors.map(i => i.id)) + 1
      : 1;

    // El número del nuevo inversor será el tamaño actual de la lista + 1
    const newInvestorNumber = investors.length + 1;

    setInvestors([
      ...investors,
      // Se asigna el nombre por defecto, por ejemplo "Investor 4"
      { id: newId, name: `Investor ${newInvestorNumber}`, investmentAmount: 0 }
    ]);
  };

  // Handle removing an investor
  const removeInvestor = (id: number) => {
    setInvestors(investors.filter(investor => investor.id !== id));
  };

  // Handle updating investor data
  const updateInvestor = (id: number, field: keyof Investor, value: string | number) => {
    setInvestors(
      investors.map(investor => 
        investor.id === id ? { ...investor, [field]: value } : investor
      )
    );
  };

  // Check if we have at least 1 investor
  const hasMinInvestors = investors.length >= 1;

  // Format investment difference for display
  const investmentDifference = totalRequired - totalInvestment;

  return (
    <Card className="col-span-1 border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></div>
            Investors
          </h2>
          <div className="text-xs text-muted-foreground flex items-center bg-blue-50 px-2 py-1 rounded-full">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>1-20 allowed</span>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {investors.map((investor, index) => (
            <div 
              key={investor.id} 
              className="investor-entry rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">Investor {index + 1}</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvestor(investor.id)}
                    disabled={investors.length <= 1 || isCalculating}
                    className="text-muted-foreground hover:text-red-500 h-6 w-6 p-0 hover:bg-red-50"
                  >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <Input
                    value={investor.name}
                    onChange={(e) => updateInvestor(investor.id, 'name', e.target.value)}
                    placeholder={`Investor ${index + 1}`}
                    disabled={isCalculating}
                    required
                    className="text-sm h-9"
                  />
                </div>
                <div className="form-group">
                  <CurrencyInput
                    value={investor.investmentAmount}
                    onChange={(value) => updateInvestor(investor.id, 'investmentAmount', value)}
                    min={0}
                    disabled={isCalculating}
                    required
                    className="text-sm h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <Button
            onClick={addInvestor}
            variant="secondary"
            size="sm"
            disabled={isCalculating}
            className="w-full h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>

          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-200">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Investment:</span>
                <span className={`font-bold text-lg ${
                  Math.abs(investmentDifference) < 0.01 ? "text-green-600" : "text-gray-900"
                }`}>
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Required:</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(totalRequired)}
                </span>
              </div>
              {Math.abs(investmentDifference) >= 0.01 && (
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="font-medium text-orange-600">Difference:</span>
                  <span className="font-bold text-orange-600">
                    {investmentDifference > 0 ? "+" : ""}{formatCurrency(investmentDifference)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-2 py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {!hasMinInvestors && (
          <Alert className="mt-2 py-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">Please add at least 1 investor.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}