import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/finance";

interface InvestorReturn {
  investorId: number;
  name: string;
  investmentAmount: number;
  share: number;
  monthlyReturns: number[];
  totalReturn: number;
  totalInterest: number;
  roi: number;
}

interface PaymentScheduleEntry {
  id: number;
  paymentNumber: number;
  date: string;
  amount: string;
  principal: string;
  interest: string;
  balance: string;
}

interface CalculationDetails {
  loanId: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  paymentFrequency: string;
  monthlyPayment: number;
  totalInterest: number;
  paymentSchedule: PaymentScheduleEntry[];
  investorReturns: InvestorReturn[];
  endDate: string;
}

export default function CalculationDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<CalculationDetails>({
    queryKey: [`/api/calculations/${id}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/saved-calculations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            <Skeleton className="h-8 w-48" />
          </h1>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-96 w-full rounded-md" />
      </div>
    );
  }

  if (error || !data) {
    toast({
      title: "Error",
      description: "Failed to load calculation details",
      variant: "destructive",
    });

    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/saved-calculations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Calculation Details</h1>
        </div>

        <Card>
          <CardContent className="py-10">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Unable to load calculation</h2>
              <p className="text-muted-foreground">
                There was a problem loading the calculation details.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Button onClick={() => setLocation("/saved-calculations")}>
                  Back to Saved Calculations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  // Format payment schedule
  const formattedPaymentSchedule = data.paymentSchedule.map(entry => ({
    ...entry,
    date: new Date(entry.date),
    payment: Number(entry.amount),
    principal: Number(entry.principal),
    interest: Number(entry.interest),
    balance: Number(entry.balance)
  }));

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/saved-calculations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Loan #{data.loanId} Details</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setLocation("/")} variant="outline">Calculator</Button>
          <Button onClick={() => setLocation("/saved-calculations")}>View All Calculations</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Parameters</CardTitle>
          <CardDescription>Key details about this loan calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Principal Amount:</span>
              <span className="font-medium">{formatCurrency(data.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-medium">{formatPercentage(data.interestRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Term:</span>
              <span className="font-medium">{data.termMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Frequency:</span>
              <span className="font-medium capitalize">{data.paymentFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment:</span>
              <span className="font-medium">{formatCurrency(data.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Interest:</span>
              <span className="font-medium">{formatCurrency(data.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount Paid:</span>
              <span className="font-medium">{formatCurrency(data.amount + data.totalInterest)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
          <TabsTrigger value="investors">Investor Returns</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <PaymentScheduleTab
            loanAmount={data.amount}
            monthlyPayment={data.monthlyPayment}
            totalInterest={data.totalInterest}
            paymentSchedule={formattedPaymentSchedule}
          />
        </TabsContent>
        
        <TabsContent value="investors">
          <InvestorReturnsTab
            investorReturns={data.investorReturns}
            paymentSchedule={formattedPaymentSchedule} 
          />
        </TabsContent>
        
        <TabsContent value="summary">
          <SummaryTab
            loanAmount={data.amount}
            interestRate={data.interestRate}
            termMonths={data.termMonths}
            monthlyPayment={data.monthlyPayment}
            totalInterest={data.totalInterest}
            startDate={startDate}
            endDate={endDate}
            investors={data.investorReturns}
            paymentSchedule={formattedPaymentSchedule}
            onExport={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsTab
            loanAmount={data.amount}
            interestRate={data.interestRate}
            termMonths={data.termMonths}
            monthlyPayment={data.monthlyPayment}
            totalInterest={data.totalInterest}
            startDate={startDate}
            endDate={endDate}
            investors={data.investorReturns}
            paymentSchedule={formattedPaymentSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}