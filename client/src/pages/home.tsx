import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Calculator, DollarSign, Users, Building2 } from "lucide-react";
import { LoanParametersCard } from "@/components/calculator/LoanParametersCard";
import { BusinessParametersCard } from "@/components/calculator/BusinessParametersCard";
import { InvestorsCard } from "@/components/calculator/InvestorsCard";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface LoanParams {
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  paymentFrequency: string;
}

interface BusinessParams {
  assetCost: number;
  otherExpenses: number;
  monthlyExpenses: number;
}

interface Investor {
  id: number;
  name: string;
  amount: number;
  percentage: number;
}

export default function Home() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loanParams, setLoanParams] = useState<LoanParams>({
    amount: 100000,
    interestRate: 5.5,
    termMonths: 24,
    startDate: new Date(),
    paymentFrequency: 'monthly'
  });
  const [businessParams, setBusinessParams] = useState<BusinessParams>({
    assetCost: 0,
    otherExpenses: 0,
    monthlyExpenses: 0
  });
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 1, name: 'Investor 1', amount: 40000, percentage: 40 },
    { id: 2, name: 'Investor 2', amount: 35000, percentage: 35 },
    { id: 3, name: 'Investor 3', amount: 25000, percentage: 25 }
  ]);

  const calculateMutation = useMutation({
    mutationFn: async (calculationData: any) => {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationData)
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Calculation Complete",
        description: "Your investment calculation has been processed successfully.",
      });
      setLocation(`/calculation/${data.calculationId}`);
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "There was an error processing your calculation.",
        variant: "destructive",
      });
    }
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = {
    1: "Parámetros del Préstamo",
    2: "Parámetros del Negocio", 
    3: "Añadir Inversores"
  };

  const stepIcons = {
    1: DollarSign,
    2: Building2,
    3: Users
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCalculate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculate = () => {
    const calculationData = {
      loanParams,
      businessParams,
      investors
    };
    calculateMutation.mutate(calculationData);
  };

  const StepIcon = stepIcons[currentStep as keyof typeof stepIcons];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Calculadora de Financiación de Inversiones
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Calcula retornos de inversión y genera reportes profesionales
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {currentStep} de {totalSteps}: {stepTitles[currentStep as keyof typeof stepTitles]}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% completado
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Main Wizard Card */}
          <Card className="bg-white shadow-lg border-0" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardHeader className="text-center pb-6" style={{ padding: '32px 32px 24px 32px' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <StepIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {stepTitles[currentStep as keyof typeof stepTitles]}
              </CardTitle>
            </CardHeader>

            <CardContent style={{ padding: '0 32px 32px 32px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 1 && (
                    <LoanParametersCard
                      loanParams={loanParams}
                      setLoanParams={setLoanParams}
                    />
                  )}

                  {currentStep === 2 && (
                    <BusinessParametersCard
                      businessParams={businessParams}
                      setBusinessParams={setBusinessParams}
                    />
                  )}

                  {currentStep === 3 && (
                    <InvestorsCard
                      investors={investors}
                      setInvestors={setInvestors}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                  style={{ 
                    borderRadius: '8px',
                    padding: '12px 24px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'transparent'
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i + 1}
                      className={`w-2 h-2 rounded-full ${
                        i + 1 === currentStep 
                          ? 'bg-blue-500' 
                          : i + 1 < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={calculateMutation.isPending}
                  className="flex items-center gap-2"
                  style={{ 
                    borderRadius: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#3B82F6',
                    border: 'none'
                  }}
                >
                  {currentStep === totalSteps ? (
                    <>
                      <Calculator className="h-4 w-4" />
                      {calculateMutation.isPending ? 'Calculando...' : 'Calcular Inversión'}
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <button
                onClick={() => setLocation('/saved-calculations')}
                className="hover:text-blue-600 transition-colors"
              >
                Ver Cálculos Guardados
              </button>
              <span>•</span>
              <a 
                href="#about" 
                className="hover:text-blue-600 transition-colors"
              >
                Acerca de la Calculadora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}