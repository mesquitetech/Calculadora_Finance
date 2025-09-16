import { useLocation, Link } from "wouter";
import { useCalculation } from "@/contexts/CalculationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";

export default function LeasingResults() {
  const { leaseInput, leaseResults, setCurrentStep } = useCalculation();
  const [_, setLocation] = useLocation();

  if (!leaseInput || !leaseResults) {
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

  const handleNextToCredit = () => {
    setCurrentStep('credit');
    setLocation("/credit");
  };

  const handleToInvestors = () => {
    setCurrentStep('investors');
    setLocation("/investors");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Leasing Results</h1>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-to-form">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
            </Link>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-monthly-payment">
                  ${leaseResults.monthlyPayment.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Interest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-interest">
                  ${leaseResults.totalInterest.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-amount">
                  ${leaseResults.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Residual Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-residual-value">
                  ${leaseResults.residualValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Details */}
          <Card>
            <CardHeader>
              <CardTitle>Lease Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset Cost:</span>
                <span className="font-medium" data-testid="text-asset-cost">
                  ${leaseInput.assetCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down Payment:</span>
                <span className="font-medium" data-testid="text-down-payment">
                  ${leaseInput.downPayment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Financed Amount:</span>
                <span className="font-medium" data-testid="text-financed-amount">
                  ${leaseInput.financedAmount.toLocaleString()}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Residual Value Rate:</span>
                <span className="font-medium" data-testid="text-residual-rate">
                  {leaseInput.residualValueRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleNextToCredit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              data-testid="button-next-credit"
            >
              Next: Credit Simulation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={handleToInvestors}
              className="px-8 py-3"
              data-testid="button-to-investors"
            >
              View Investor Results
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}