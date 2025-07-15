import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useToast } from "@/hooks/use-toast";
import { Trash, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";

// Definir y EXPORTAR las interfaces necesarias para que otros componentes puedan importarlas.
interface LoanParams {
  id: number;
  loanName: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
}

interface Investor {
  id: number | string;
  name: string;
  investmentAmount: number;
}

export interface EditableData {
    loanParams: LoanParams;
    investors: Investor[];
}

interface EditCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculation: EditableData | null;
  onSave: (updatedData: EditableData) => void;
  isSaving: boolean;
}


export function EditCalculationModal({
  isOpen,
  onClose,
  calculation,
  onSave,
  isSaving,
}: EditCalculationModalProps) {
  const [editedData, setEditedData] = useState<EditableData | null>(null);
  const { toast } = useToast();

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. Añadir estados para todos los posibles errores de validación.
  const [loanNameError, setLoanNameError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [interestRateError, setInterestRateError] = useState('');
  const [termError, setTermError] = useState('');
  const [investorError, setInvestorError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  // --- FIN DE LA CORRECCIÓN ---

  useEffect(() => {
    if (calculation) {
      setEditedData(calculation);
    }
  }, [calculation]);

  // --- INICIO DE LA CORRECCIÓN ---
  // 2. Lógica de validación completa que se ejecuta cada vez que los datos cambian.
  useEffect(() => {
    if (!editedData) return;

    const { loanParams, investors } = editedData;
    let nameIsValid = false;
    let amountIsValid = false;
    let interestRateIsValid = false;
    let termIsValid = false;
    let investorsAreValid = false;

    // Validación del nombre del préstamo
    if (loanParams.loanName.length >= 3 && loanParams.loanName.length < 60) {
        setLoanNameError('');
        nameIsValid = true;
    } else {
        setLoanNameError('Loan name must be between 3 and 60 characters.');
        nameIsValid = false;
    }

    // Validación del monto del préstamo
    if (loanParams.amount >= 1000 && loanParams.amount <= 100000000) {
        setAmountError('');
        amountIsValid = true;
    } else {
        setAmountError('Amount must be between $1,000 and $100,000,000.');
        amountIsValid = false;
    }

    // Validación de la tasa de interés
    if (loanParams.interestRate >= 0 && loanParams.interestRate <= 999) {
        setInterestRateError('');
        interestRateIsValid = true;
    } else {
        setInterestRateError('Interest rate must be between 0% and 999%.');
        interestRateIsValid = false;
    }

    // Validación del plazo (ambas reglas)
    const monthsPerPeriod = { 'monthly': 1, 'quarterly': 3, 'semi-annual': 6, 'annual': 12 }[loanParams.paymentFrequency] || 1;
    if (loanParams.termMonths < 1 || loanParams.termMonths > 1200) {
        setTermError('Term must be between 1 and 1200 months.');
        termIsValid = false;
    } else if (loanParams.termMonths % monthsPerPeriod !== 0) {
        setTermError(`For ${loanParams.paymentFrequency} payments, term must be a multiple of ${monthsPerPeriod}.`);
        termIsValid = false;
    } else {
        setTermError('');
        termIsValid = true;
    }

    // Validación de inversores
    const totalInvestment = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    if (Math.abs(totalInvestment - loanParams.amount) < 0.01 && investors.length >= 3) {
        setInvestorError(null);
        investorsAreValid = true;
    } else {
        if (investors.length < 3) {
            setInvestorError("A minimum of 3 investors is required.");
        } else {
            setInvestorError("Total investment must match the loan amount.");
        }
        investorsAreValid = false;
    }

    // El formulario es válido si TODAS las validaciones pasan.
    setIsFormValid(nameIsValid && amountIsValid && interestRateIsValid && termIsValid && investorsAreValid);

  }, [editedData]);
  // --- FIN DE LA CORRECCIÓN ---

  const handleLoanParamChange = (field: keyof LoanParams, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        loanParams: { ...editedData.loanParams, [field]: value },
      });
    }
  };

  const handleInvestorChange = (id: number | string, field: keyof Investor, value: string | number) => {
    if (editedData) {
      const newInvestors = editedData.investors.map(inv =>
        inv.id === id ? { ...inv, [field]: value } : inv
      );
      setEditedData({ ...editedData, investors: newInvestors });
    }
  };

  const addInvestor = () => {
    if (editedData) {
      const newInvestor: Investor = {
        id: `new-${Date.now()}`,
        name: `Investor ${editedData.investors.length + 1}`,
        investmentAmount: 0,
      };
      setEditedData({ ...editedData, investors: [...editedData.investors, newInvestor] });
    }
  };

  const removeInvestor = (id: number | string) => {
    if (editedData && editedData.investors.length > 3) {
      setEditedData({ ...editedData, investors: editedData.investors.filter(inv => inv.id !== id) });
    } else {
      toast({ title: "Validation Error", description: "A minimum of 3 investors is required.", variant: "destructive" });
    }
  };

  const handleSave = () => {
    if (editedData && isFormValid) {
      onSave(editedData);
    } else {
        toast({ title: "Validation Error", description: "Please fix all errors before saving.", variant: "destructive" });
    }
  };

  if (!editedData) return null;

  const totalInvestment = editedData.investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Calculation</DialogTitle>
          <DialogDescription>
            Make changes to your calculation and investors. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Loan Parameters</legend>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="form-group col-span-2">
                        <Label htmlFor="loanName">Loan Name</Label>
                        <Input id="loanName" value={editedData.loanParams.loanName} onChange={(e) => handleLoanParamChange('loanName', e.target.value)} className={cn(loanNameError && "border-red-500")}/>
                        {loanNameError && <p className="text-xs text-red-500 mt-1">{loanNameError}</p>}
                    </div>
                     <div className="form-group">
                        <Label htmlFor="amount">Amount</Label>
                        <CurrencyInput id="amount" value={editedData.loanParams.amount} onChange={(value) => handleLoanParamChange('amount', value)} className={cn(amountError && "border-red-500")} />
                         {amountError && <p className="text-xs text-red-500 mt-1">{amountError}</p>}
                    </div>
                    <div className="form-group">
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input id="interestRate" type="number" value={editedData.loanParams.interestRate} onChange={(e) => handleLoanParamChange('interestRate', parseFloat(e.target.value))} className={cn(interestRateError && "border-red-500")} />
                        {interestRateError && <p className="text-xs text-red-500 mt-1">{interestRateError}</p>}
                    </div>
                    <div className="form-group">
                        <Label htmlFor="termMonths">Term (Months)</Label>
                        <Input id="termMonths" type="number" value={editedData.loanParams.termMonths} onChange={(e) => handleLoanParamChange('termMonths', parseInt(e.target.value, 10))} className={cn(termError && "border-red-500")} />
                        {termError && <p className="text-xs text-red-500 mt-1">{termError}</p>}
                    </div>
                    <div className="form-group">
                        <Label htmlFor="paymentFrequency">Frequency</Label>
                        <Select value={editedData.loanParams.paymentFrequency} onValueChange={(value) => handleLoanParamChange('paymentFrequency', value)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="form-group col-span-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <DatePicker date={new Date(editedData.loanParams.startDate)} setDate={(date) => date && handleLoanParamChange('startDate', date.toISOString())} />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Investors</legend>
                <div className="space-y-4 pt-2">
                    {editedData.investors.map((investor, index) => (
                        <div key={investor.id} className="investor-entry bg-muted rounded-md p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Investor {index + 1}</h3>
                                <Button variant="ghost" size="sm" onClick={() => removeInvestor(investor.id)} className="text-muted-foreground hover:text-destructive"><Trash className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={investor.name} onChange={(e) => handleInvestorChange(investor.id, 'name', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <CurrencyInput value={investor.investmentAmount} onChange={(value) => handleInvestorChange(investor.id, 'investmentAmount', value)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <Button onClick={addInvestor} variant="secondary"><Plus className="h-4 w-4 mr-2" />Add Investor</Button>
                    <div className="text-sm">
                        Total: <span className={cn("font-bold", investorError && "text-red-500")}>{formatCurrency(totalInvestment)}</span> / {formatCurrency(editedData.loanParams.amount)}
                    </div>
                </div>
                {investorError && <Alert variant="destructive" className="mt-3"><AlertCircle className="h-4 w-4" /><AlertDescription>{investorError}</AlertDescription></Alert>}
            </fieldset>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !isFormValid}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
