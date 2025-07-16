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
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground">Investors</h2>
          <div className="text-sm text-muted-foreground flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>1-20 investors allowed</span>
          </div>
        </div>

        <div className="space-y-4">
          {investors.map((investor, index) => (
            <div 
              key={investor.id} 
              className="investor-entry bg-muted rounded-md p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Investor {index + 1}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInvestor(investor.id)}
                    disabled={investors.length <= 1 || isCalculating}
                    className="text-muted-foreground hover:text-destructive"
                  >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="mb-1">
                    Investor Name
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    value={investor.name}
                    onChange={(e) => updateInvestor(investor.id, 'name', e.target.value)}
                    placeholder="Investor name"
                    disabled={isCalculating}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label className="mb-1">
                    Investment Amount ($)
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <CurrencyInput
                    value={investor.investmentAmount}
                    onChange={(value) => updateInvestor(investor.id, 'investmentAmount', value)}
                    min={0}
                    disabled={isCalculating}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-3 md:space-y-0">
          <Button
            onClick={addInvestor}
            variant="secondary"
            disabled={isCalculating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investor
          </Button>

          <div className="flex items-center text-sm">
            <div className="mr-4">
              <span className="font-medium">Total Investment:</span>
              <span className={`ml-1 font-bold ${
                Math.abs(investmentDifference) < 0.01 ? "text-green-600" : ""
              }`}>
                {formatCurrency(totalInvestment)}
              </span>
            </div>
            <div>
              <span className="font-medium">Required Amount:</span>
              <span className="ml-1 font-bold">
                {formatCurrency(totalRequired)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!hasMinInvestors && (
          <Alert className="mt-3 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please add at least 1 investor.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}