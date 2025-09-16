import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Header } from "@/components/calculator/Header";
import { Footer } from "@/components/calculator/Footer";
import { useCalculation } from "@/contexts/CalculationContext";
import { leaseInputSchema, type LeaseInputType } from "@shared/schema";
import { calculateMonthlyPayment } from "@/lib/finance";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calculator } from "lucide-react";

export default function Home() {
  const { setLeaseInput, setLeaseResults, setCurrentStep } = useCalculation();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const form = useForm<LeaseInputType>({
    resolver: zodResolver(leaseInputSchema),
    defaultValues: {
      assetCost: 150000,
      downPayment: 30000,
      termMonths: 48,
      interestRate: 8.5,
      monthlyAdminFee: 150,
      residualValueRate: 20,
      startDate: todayDate,
    },
  });

  const onSubmit = (data: LeaseInputType) => {
    try {
      // Calculate the derived values
      const financedAmount = data.assetCost - data.downPayment;
      const monthlyPayment = calculateMonthlyPayment(
        financedAmount,
        data.interestRate / 100,
        data.termMonths
      );
      const totalInterest = (monthlyPayment * data.termMonths) - financedAmount;
      const residualValue = data.assetCost * (data.residualValueRate / 100);
      
      // Calculate end date
      const endDate = new Date(data.startDate);
      endDate.setMonth(endDate.getMonth() + data.termMonths);

      // Store lease input and results
      setLeaseInput(data);
      setLeaseResults({
        monthlyPayment,
        totalInterest,
        residualValue,
        endDate,
      });

      // Update current step and navigate
      setCurrentStep('lease-results');
      setLocation("/results");

      toast({
        title: "Lease Calculation Complete",
        description: `Monthly payment: $${monthlyPayment.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error calculating lease:', error);
      toast({
        title: "Calculation Error",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  };

  // Watch values for derived calculations
  const assetCost = form.watch("assetCost");
  const downPayment = form.watch("downPayment");
  const financedAmount = assetCost - downPayment;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Leasing Calculator</h1>
            <p className="text-xl text-muted-foreground">
              Enter your financing details to calculate lease payments
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Financing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Asset Cost */}
                    <FormField
                      control={form.control}
                      name="assetCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Cost</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              {...field}
                              data-testid="input-asset-cost"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Down Payment */}
                    <FormField
                      control={form.control}
                      name="downPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Down Payment</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              {...field}
                              data-testid="input-down-payment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Financed Amount (read-only display) */}
                    <div className="space-y-2">
                      <FormLabel>Financed Amount</FormLabel>
                      <div 
                        className="bg-gray-50 border rounded-md px-3 py-2 text-sm font-medium"
                        data-testid="text-financed-amount"
                      >
                        ${financedAmount.toLocaleString()}
                      </div>
                    </div>

                    {/* Term */}
                    <FormField
                      control={form.control}
                      name="termMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term (Months)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="120"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-term-months"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Interest Rate */}
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-interest-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monthly Admin Fee */}
                    <FormField
                      control={form.control}
                      name="monthlyAdminFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Admin Fee</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              {...field}
                              data-testid="input-monthly-admin-fee"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Residual Value Rate */}
                    <FormField
                      control={form.control}
                      name="residualValueRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residual Value Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-residual-value-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                      data-testid="button-calculate-lease"
                    >
                      Calculate Lease
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}