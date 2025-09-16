import { useLocation } from "wouter";
import { useCalculation } from "@/contexts/CalculationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";

export default function InvestorResults() {
  const { leaseInput, creditInput, investors, investorReturns, setCurrentStep } = useCalculation();
  const [_, setLocation] = useLocation();

  if (!leaseInput) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">No Data Available</h2>
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
    if (creditInput) {
      setCurrentStep('credit');
      setLocation("/credit");
    } else {
      setCurrentStep('lease-results');
      setLocation("/results");
    }
  };

  const loanAmount = creditInput?.loanAmount || leaseInput.assetCost;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Investor Results</h1>
            <Button 
              variant="outline" 
              onClick={handleBack}
              data-testid="button-back-to-previous"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Loan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="font-medium" data-testid="text-total-investment">
                    ${loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term:</span>
                  <span className="font-medium" data-testid="text-investment-term">
                    {leaseInput.termMonths} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate:</span>
                  <span className="font-medium" data-testid="text-investment-rate">
                    {leaseInput.interestRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investor Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Investor Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-4">Investor Management</h3>
                <p className="text-muted-foreground mb-6">
                  This page will contain the investor configuration form where users can
                  add investors and configure their investment allocations.
                </p>
                
                {investors.length > 0 ? (
                  <div className="space-y-4 max-w-md mx-auto">
                    <h4 className="font-medium">Current Investors:</h4>
                    {investors.map((investor, index) => (
                      <div 
                        key={investor.id} 
                        className="flex justify-between p-3 bg-gray-50 rounded"
                        data-testid={`investor-item-${index}`}
                      >
                        <span>{investor.name}</span>
                        <div className="text-right">
                          <div className="font-medium">
                            ${investor.investmentAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {investor.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No investors configured yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Investment Returns */}
          {investorReturns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-4">Calculated Returns</h3>
                  <p className="text-muted-foreground mb-6">
                    Return calculations will be displayed here once the investor
                    configuration and calculations are complete.
                  </p>
                  <div className="text-sm text-muted-foreground" data-testid="text-returns-count">
                    {investorReturns.length} return calculations available
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/saved-calculations")}
              className="px-8 py-3"
              data-testid="button-view-saved"
            >
              View Saved Calculations
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}