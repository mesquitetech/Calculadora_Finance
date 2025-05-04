import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/finance";
import { useToast } from "@/hooks/use-toast";

interface Calculation {
  id: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
  createdAt: string;
}

export default function SavedCalculations() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: calculations, isLoading, error } = useQuery<Calculation[]>({
    queryKey: ["/api/calculations"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Saved Calculations</h1>
          <Button onClick={() => setLocation("/")}>New Calculation</Button>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/20">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-5/6 bg-muted rounded"></div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="h-8 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !calculations) {
    toast({
      title: "Error",
      description: "Failed to load saved calculations",
      variant: "destructive",
    });

    return (
      <div className="container mx-auto py-10 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Saved Calculations</h1>
          <Button onClick={() => setLocation("/")}>New Calculation</Button>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Unable to load calculations</h2>
              <p className="text-muted-foreground">
                There was a problem loading your saved calculations.
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Saved Calculations</h1>
        <div className="flex gap-3">
          <Button onClick={() => setLocation("/")} variant="outline">Calculator</Button>
          <Button onClick={() => setLocation("/")}>New Calculation</Button>
        </div>
      </div>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">No saved calculations</h2>
              <p className="text-muted-foreground">
                You haven't created any loan calculations yet.
              </p>
              <Button onClick={() => setLocation("/")}>Create New Calculation</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {calculations.map((calculation) => (
            <Card key={calculation.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>Loan {calculation.id}</CardTitle>
                <CardDescription>
                  Created on {new Date(calculation.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{formatCurrency(calculation.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium">{formatPercentage(calculation.interestRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-medium">{calculation.termMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{formatDate(new Date(calculation.startDate))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Frequency:</span>
                    <span className="font-medium capitalize">{calculation.paymentFrequency}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button
                  className="w-full"
                  onClick={() => setLocation(`/calculation/${calculation.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}