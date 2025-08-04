import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentScheduleTab } from "@/components/calculator/PaymentScheduleTab";
import { InvestorReturnsTab } from "@/components/calculator/InvestorReturnsTab";
import { SummaryTab } from "@/components/calculator/SummaryTab";
import { ProjectionsTab } from "@/components/calculator/ProjectionsTab";
import { ReportsTab } from "@/components/calculator/ReportsTab";
import { BankerReportsTab } from "@/components/calculator/BankerReportsTab";
import { RenterAnalysisTab } from "@/components/calculator/RenterAnalysisTab";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/finance";
import { generateProjectSummaryReport } from "@/lib/simplePdfGenerator";


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
  loanName: string;
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
  businessParams?: {
    assetCost: number;
    otherExpenses: number;
    monthlyExpenses: number;
  };
}

export default function CalculationDetails() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'lender' | 'renter'>('lender');
  const [activeRenterSubTab, setActiveRenterSubTab] = useState<'summary' | 'cashflow' | 'income'>('summary');
  const [interactiveRevenue, setInteractiveRevenue] = useState<number>(0);

  const { data, isLoading, error } = useQuery<CalculationDetails>({
    queryKey: [`/api/calculations/${id}`],
  });

  // Set break-even revenue when data becomes available
  useEffect(() => {
    if (data?.monthlyPayment && data?.businessParams?.monthlyExpenses) {
      const breakEvenRevenue = data.monthlyPayment + data.businessParams.monthlyExpenses;
      setInteractiveRevenue(breakEvenRevenue);
    }
  }, [data]);

  const handleExportSummary = () => {
    if (!data) {
      toast({
        title: "No Data Available",
        description: "Cannot export summary without calculation data.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Report...",
      description: "Your summary report is being created.",
    });

    try {
      const doc = generateProjectSummaryReport(
        data.amount,
        data.interestRate,
        data.termMonths,
        new Date(data.startDate),
        new Date(data.endDate),
        data.monthlyPayment,
        data.totalInterest,
        data.investorReturns
      );
      const safeLoanName = (data.loanName || `calculation_${data.loanId}`).replace(/\s+/g, '_');
      doc.save(`project_summary_${safeLoanName}.pdf`);
    } catch (e) {
      console.error("Failed to generate summary PDF", e);
      toast({
        title: "Export Failed",
        description: "There was an error generating the summary report.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8 px-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/saved-calculations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            <Skeleton className="h-8 w-64" />
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

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const formattedPaymentSchedule = data.paymentSchedule.map(entry => ({
    ...entry,
    date: new Date(entry.date),
    payment: Number(entry.payment || entry.amount), // Usar payment primero, luego amount como fallback
    principal: Number(entry.principal),
    interest: Number(entry.interest),
    balance: Number(entry.balance)
  }));

  return (
    <div className="container mx-auto py-8 space-y-8 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{data.loanName || `Calculation #${data.loanId}`}</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setLocation("/")} variant="outline">Home</Button>
          <Button onClick={() => setLocation("/saved-calculations")}>Back</Button>
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
            {data.businessParams && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Cost:</span>
                  <span className="font-medium">{formatCurrency(data.businessParams.assetCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Expenses:</span>
                  <span className="font-medium">{formatCurrency(data.businessParams.otherExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Expenses:</span>
                  <span className="font-medium">{formatCurrency(data.businessParams.monthlyExpenses)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="lender" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lender">Lender Analysis</TabsTrigger>
          <TabsTrigger value="renter">Renter Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="lender">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
              <TabsTrigger value="investors">Investor Returns</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

        <TabsContent value="schedule">
              {data && <PaymentScheduleTab
                loanAmount={data.amount}
                monthlyPayment={data.monthlyPayment}
                totalInterest={data.totalInterest}
                paymentSchedule={formattedPaymentSchedule}
              />}
            </TabsContent>

            <TabsContent value="investors">
              {data && <InvestorReturnsTab
                investorReturns={data.investorReturns}
                paymentSchedule={formattedPaymentSchedule} 
              />}
            </TabsContent>

            <TabsContent value="summary">
              {data && <SummaryTab
                loanAmount={data.amount}
                interestRate={data.interestRate}
                termMonths={data.termMonths}
                monthlyPayment={data.monthlyPayment}
                totalInterest={data.totalInterest}
                startDate={startDate}
                endDate={endDate}
                investors={data.investorReturns}
                paymentSchedule={formattedPaymentSchedule}
                onExport={handleExportSummary}
              />}
            </TabsContent>

            <TabsContent value="projections">
                {data && <ProjectionsTab
                    loanAmount={data.amount}
                    interestRate={data.interestRate}
                    termMonths={data.termMonths}
                    monthlyPayment={data.monthlyPayment}
                    startDate={startDate}
                />}
            </TabsContent>

            <TabsContent value="banking">
                {data && <BankerReportsTab
                    loanAmount={data.amount}
                    interestRate={data.interestRate}
                    termMonths={data.termMonths}
                    monthlyPayment={data.monthlyPayment}
                    totalInterest={data.totalInterest}
                    startDate={startDate}
                    endDate={endDate}
                    investors={data.investorReturns}
                />}
            </TabsContent>

            <TabsContent value="reports">
              {data && <ReportsTab
                loanAmount={data.amount}
                interestRate={data.interestRate}
                termMonths={data.termMonths}
                monthlyPayment={data.monthlyPayment}
                totalInterest={data.totalInterest}
                startDate={startDate}
                endDate={endDate}
                investors={data.investorReturns}
                paymentSchedule={formattedPaymentSchedule}
              />}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="renter">
          {data && data.businessParams ? (
            <RenterAnalysisTab
              businessParams={data.businessParams}
              loanParams={{
                loanName: data.name,
                totalAmount: data.amount,
                interestRate: data.interestRate,
                termMonths: data.termMonths,
                startDate: new Date(data.startDate),
                paymentFrequency: 'monthly'
              }}
              monthlyPayment={data.monthlyPayment}
              paymentSchedule={formattedPaymentSchedule}
              renterConfig={{
                discountRate: data.businessParams.discountRate || 6.0,
                residualValueRate: data.businessParams.residualValueRate || 20
              }}
              onExportReport={() => {
                toast({
                  title: "Reporte generado",
                  description: "El análisis del operador ha sido exportado exitosamente",
                });
              }}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">Business parameters not available for this calculation.</p>
              <p className="text-sm text-muted-foreground">Renter analysis requires business parameters to be configured.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}