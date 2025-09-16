import { useLocation } from "wouter";
import { useCalculation } from "@/contexts/CalculationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";

export default function CreditSimulation() {
  const { leaseInput, creditInput, creditResults, setCurrentStep } = useCalculation();
  const [_, setLocation] = useLocation();

  if (!leaseInput) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">No Lease Data Available</h2>
              <p className="text-muted-foreground mb-6">
                Please complete the leasing form first.
              </p>
              <Button 
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-back-to-leasing"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leasing Form
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBack = () => {
    setCurrentStep('lease-results');
    setLocation("/results");
  };

  const handleNextToInvestors = () => {
    setCurrentStep('investors');
    setLocation("/investors");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Credit Simulation</h1>
            <Button 
              variant="outline" 
              onClick={handleBack}
              data-testid="button-back-to-results"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </div>

          {/* Credit Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-4">Credit Simulation Form</h3>
                <p className="text-muted-foreground mb-6">
                  This page will contain the credit simulation form where users can specify
                  the loan amount (defaulting to asset cost of ${leaseInput.assetCost.toLocaleString()}).
                </p>
                <div className="space-y-4 max-w-md mx-auto text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Loan Amount:</span>
                    <span className="font-medium" data-testid="text-default-loan-amount">
                      ${leaseInput.assetCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-medium" data-testid="text-term">
                      {leaseInput.termMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium" data-testid="text-interest-rate">
                      {leaseInput.interestRate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Show Results if Available */}
          {creditResults && (
            <Card>
              <CardHeader>
                <CardTitle>Credit Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Payment:</span>
                    <span className="font-medium" data-testid="text-credit-monthly-payment">
                      ${creditResults.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interest:</span>
                    <span className="font-medium" data-testid="text-credit-total-interest">
                      ${creditResults.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium" data-testid="text-credit-end-date">
                      {creditResults.endDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={handleNextToInvestors}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              data-testid="button-next-investors"
            >
              Next: Investor Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}