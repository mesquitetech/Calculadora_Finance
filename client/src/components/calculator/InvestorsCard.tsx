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
  percentage: number; // Make percentage required
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
  const [inputMode, setInputMode] = useState<'amount' | 'percentage'>('percentage');
  const [percentageInputs, setPercentageInputs] = useState<{[key: number]: string}>({});

  // Recalculate amounts when totalRequired changes (loan amount changes)
  useEffect(() => {
    if (totalRequired > 0) {
      const updatedInvestors = investors.map(investor => ({
        ...investor,
        investmentAmount: (investor.percentage / 100) * totalRequired
      }));
      setInvestors(updatedInvestors);
    }
  }, [totalRequired]);

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
      { id: newId, name: `Investor ${newInvestorNumber}`, investmentAmount: 0, percentage: 0 }
    ]);
  };

  // Handle removing an investor
  const removeInvestor = (id: number) => {
    setInvestors(investors.filter(investor => investor.id !== id));
    // Clean up percentage input state
    setPercentageInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
  };

  // Handle updating investor data
  const updateInvestor = (id: number, field: keyof Investor, value: string | number) => {
    setInvestors(
      investors.map(investor => {
        if (investor.id === id) {
          const updated = { ...investor, [field]: value };
          // If amount is updated, calculate new percentage
          if (field === 'investmentAmount' && totalRequired > 0) {
            updated.percentage = (Number(value) / totalRequired) * 100;
          }
          return updated;
        }
        return investor;
      })
    );
  };

  // Handle percentage input with local state for free typing
  const handlePercentageInputChange = (id: number, value: string) => {
    setPercentageInputs(prev => ({ ...prev, [id]: value }));
  };

  const handlePercentageInputBlur = (id: number) => {
    const value = percentageInputs[id];
    if (value !== undefined) {
      let percentage = parseFloat(value) || 0;
      
      // Validate percentage is between 0 and 100
      if (percentage < 0) {
        percentage = 0;
        setPercentageInputs(prev => ({ ...prev, [id]: '0' }));
      } else if (percentage > 100) {
        percentage = 100;
        setPercentageInputs(prev => ({ ...prev, [id]: '100' }));
      }
      
      const amount = (percentage / 100) * totalRequired;
      setInvestors(
        investors.map(investor => 
          investor.id === id ? { ...investor, investmentAmount: amount, percentage: percentage } : investor
        )
      );
    }
  };

  const handlePercentageInputKeyDown = (id: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePercentageInputBlur(id);
    }
  };

  // Get display value for percentage input
  const getPercentageDisplayValue = (investor: Investor) => {
    if (percentageInputs[investor.id] !== undefined) {
      return percentageInputs[investor.id];
    }
    return investor.percentage.toFixed(2);
  };

  // Check if we have at least 1 investor
  const hasMinInvestors = investors.length >= 1;

  // Format investment difference for display
  const investmentDifference = totalRequired - totalInvestment;

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Investors
          </h2>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">1-20 allowed</div>
            <div className="flex border rounded-md p-1">
              <button
                onClick={() => setInputMode('amount')}
                className={`px-2 py-1 text-xs rounded-sm ${inputMode === 'amount' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              >
                Amount
              </button>
              <button
                onClick={() => setInputMode('percentage')}
                className={`px-2 py-1 text-xs rounded-sm ${inputMode === 'percentage' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
              >
                %
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {investors.map((investor, index) => (
            <div 
              key={investor.id} 
              className="investor-entry rounded-lg p-3 border"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Investor {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInvestor(investor.id)}
                  disabled={investors.length <= 1 || isCalculating}
                  className="text-muted-foreground hover:text-red-500 h-6 w-6 p-0"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    value={investor.name}
                    onChange={(e) => updateInvestor(investor.id, 'name', e.target.value)}
                    placeholder={`Investor ${index + 1}`}
                    disabled={isCalculating}
                    className="text-sm h-9"
                  />
                </div>
                <div>
                  {inputMode === 'amount' ? (
                    <CurrencyInput
                      value={investor.investmentAmount}
                      onChange={(value) => updateInvestor(investor.id, 'investmentAmount', value)}
                      min={0}
                      disabled={isCalculating}
                      className="text-sm h-9"
                    />
                  ) : (
                    <div className="relative">
                      <Input
                        type="number"
                        value={getPercentageDisplayValue(investor)}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string for better UX during typing
                          if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                            handlePercentageInputChange(investor.id, value);
                          }
                        }}
                        onBlur={() => handlePercentageInputBlur(investor.id)}
                        onKeyDown={(e) => handlePercentageInputKeyDown(investor.id, e)}
                        min={0}
                        max={100}
                        step={0.01}
                        disabled={isCalculating}
                        className="text-sm h-9 pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  )}
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

          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Investment:</span>
                <span className={`font-bold ${
                  Math.abs(investmentDifference) < 0.01 ? "text-green-600" : "text-gray-900"
                }`}>
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Required:</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(totalRequired)}
                </span>
              </div>
              {Math.abs(investmentDifference) >= 0.01 && (
                <div className="flex justify-between items-center pt-1 border-t">
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