import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  FilePieChart, 
  Users, 
  User, 
  BookOpen, 
  FileCheck,
  ArrowDown,
  FileDown
} from "lucide-react";
import { 
  PaymentScheduleEntry, 
  InvestorReturn, 
  formatCurrency, 
  formatDate,
  formatPercentage
} from "@/lib/finance";
import { 
  generatePaymentReport, 
  generateInvestorReport,
  generateProjectSummaryReport,
  generateLoanContract,
  generateInvestorPromissoryNote
} from "@/lib/pdfUtils";
import { toast } from "@/hooks/use-toast";

interface ReportsTabProps {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  startDate: Date;
  endDate: Date;
  investors: InvestorReturn[];
  paymentSchedule: PaymentScheduleEntry[];
}

export function ReportsTab({
  loanAmount,
  interestRate,
  termMonths,
  monthlyPayment,
  totalInterest,
  startDate,
  endDate,
  investors,
  paymentSchedule
}: ReportsTabProps) {
  // PDF Generation Functions
  const handleGeneratePaymentReport = () => {
    try {
      toast({
        title: "Generating payment report",
        description: "Please wait while the report is being generated...",
      });
      
      const doc = generatePaymentReport(
        loanAmount,
        interestRate,
        termMonths,
        startDate,
        endDate,
        paymentSchedule,
        monthlyPayment,
        totalInterest
      );
      
      doc.save('payment_schedule_report.pdf');
      
      toast({
        title: "Report generated successfully",
        description: "Payment schedule report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating payment report:", error);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating the payment report",
        variant: "destructive",
      });
    }
  };
  
  const handleGenerateInvestorReport = (investor: InvestorReturn) => {
    try {
      toast({
        title: "Generating investor report",
        description: `Creating report for ${investor.name}...`,
      });
      
      const doc = generateInvestorReport(
        investor,
        loanAmount,
        interestRate,
        termMonths,
        startDate,
        endDate,
        monthlyPayment,
        totalInterest
      );
      
      doc.save(`investor_report_${investor.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      toast({
        title: "Report generated successfully",
        description: `Report for ${investor.name} has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating investor report:", error);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating the investor report",
        variant: "destructive",
      });
    }
  };
  
  const handleGenerateProjectReport = () => {
    try {
      toast({
        title: "Generating project summary report",
        description: "Please wait while the report is being generated...",
      });
      
      const doc = generateProjectSummaryReport(
        loanAmount,
        interestRate,
        termMonths,
        startDate,
        endDate,
        monthlyPayment,
        totalInterest,
        investors
      );
      
      doc.save('project_summary_report.pdf');
      
      toast({
        title: "Report generated successfully",
        description: "Project summary report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating project report:", error);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating the project report",
        variant: "destructive",
      });
    }
  };
  
  const handleGenerateLoanContract = () => {
    try {
      toast({
        title: "Generating loan contract",
        description: "Please wait while the contract is being generated...",
      });
      
      const doc = generateLoanContract(
        loanAmount,
        interestRate,
        termMonths,
        startDate,
        endDate,
        monthlyPayment,
        totalInterest,
        paymentSchedule
      );
      
      doc.save('financing_agreement.pdf');
      
      toast({
        title: "Contract generated successfully",
        description: "Financing agreement has been downloaded",
      });
    } catch (error) {
      console.error("Error generating loan contract:", error);
      toast({
        title: "Error generating contract",
        description: "An error occurred while generating the loan contract",
        variant: "destructive",
      });
    }
  };
  
  const handleGeneratePromissoryNote = (investor: InvestorReturn) => {
    try {
      toast({
        title: "Generating promissory note",
        description: `Creating note for ${investor.name}...`,
      });
      
      const doc = generateInvestorPromissoryNote(
        investor,
        loanAmount,
        interestRate,
        termMonths,
        startDate,
        endDate
      );
      
      doc.save(`promissory_note_${investor.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      toast({
        title: "Promissory note generated successfully",
        description: `Note for ${investor.name} has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating promissory note:", error);
      toast({
        title: "Error generating note",
        description: "An error occurred while generating the promissory note",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Tabs defaultValue="financial" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="financial" className="py-3">
          <FileText className="h-4 w-4 mr-2" />
          Financial Reports
        </TabsTrigger>
        <TabsTrigger value="legal" className="py-3">
          <BookOpen className="h-4 w-4 mr-2" />
          Legal Documents
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="financial" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Schedule Report */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Payment Schedule</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                  For Loan Holder
                </Badge>
              </div>
              <CardDescription>
                Monthly payment breakdown for the loan holder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded mr-2 mt-0.5">
                    <FilePieChart className="h-3 w-3 text-blue-700 dark:text-blue-100" />
                  </div>
                  <span className="text-sm">Complete payment schedule</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded mr-2 mt-0.5">
                    <FilePieChart className="h-3 w-3 text-blue-700 dark:text-blue-100" />
                  </div>
                  <span className="text-sm">Monthly principal and interest breakdown</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded mr-2 mt-0.5">
                    <FilePieChart className="h-3 w-3 text-blue-700 dark:text-blue-100" />
                  </div>
                  <span className="text-sm">Loan summary and statistics</span>
                </li>
              </ul>
              <Button
                onClick={handleGeneratePaymentReport}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download Payment Report
              </Button>
            </CardContent>
          </Card>
          
          {/* Investor Report */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Investor Returns</CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                  For Investors
                </Badge>
              </div>
              <CardDescription>
                Individual investor return reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-1 rounded mr-2 mt-0.5">
                    <User className="h-3 w-3 text-emerald-700 dark:text-emerald-100" />
                  </div>
                  <span className="text-sm">Investment amount and share percentage</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-1 rounded mr-2 mt-0.5">
                    <User className="h-3 w-3 text-emerald-700 dark:text-emerald-100" />
                  </div>
                  <span className="text-sm">Monthly and cumulative returns</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-1 rounded mr-2 mt-0.5">
                    <User className="h-3 w-3 text-emerald-700 dark:text-emerald-100" />
                  </div>
                  <span className="text-sm">Return on investment metrics</span>
                </li>
              </ul>
              
              {investors.map((investor) => (
                <Button
                  key={investor.investorId}
                  onClick={() => handleGenerateInvestorReport(investor)}
                  variant="outline"
                  className="w-full mb-2"
                >
                  <User className="h-4 w-4 mr-2" />
                  {investor.name}'s Report
                </Button>
              ))}
            </CardContent>
          </Card>
          
          {/* Project Summary Report */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Project Summary</CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                  For Management
                </Badge>
              </div>
              <CardDescription>
                Complete project summary and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded mr-2 mt-0.5">
                    <Users className="h-3 w-3 text-purple-700 dark:text-purple-100" />
                  </div>
                  <span className="text-sm">Overview of all investors and returns</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded mr-2 mt-0.5">
                    <Users className="h-3 w-3 text-purple-700 dark:text-purple-100" />
                  </div>
                  <span className="text-sm">Payment distribution analytics</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded mr-2 mt-0.5">
                    <Users className="h-3 w-3 text-purple-700 dark:text-purple-100" />
                  </div>
                  <span className="text-sm">Key performance metrics</span>
                </li>
              </ul>
              <Button
                onClick={handleGenerateProjectReport}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download Project Report
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2 flex items-center">
            <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />
            Report Features
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            All reports are generated as PDF documents and include the following features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Payment Schedule Report</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Loan details summary</li>
                <li>Payment schedule with dates</li>
                <li>Principal/interest breakdown</li>
                <li>Amortization details</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Investor Return Reports</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Investment amount and share</li>
                <li>Expected monthly returns</li>
                <li>Cumulative returns chart</li>
                <li>ROI and performance metrics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Project Summary Report</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Complete project overview</li>
                <li>All investors summary</li>
                <li>Comparative performance</li>
                <li>Interest distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="legal" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan Contract */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Financing Agreement</CardTitle>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100">
                  Legal Document
                </Badge>
              </div>
              <CardDescription>
                Legal financing agreement for the loan holder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md mb-4">
                <h4 className="font-medium text-sm mb-2">Contract Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-amber-700 dark:text-amber-100" />
                    </div>
                    <span className="text-sm">Complete financing terms and conditions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-amber-700 dark:text-amber-100" />
                    </div>
                    <span className="text-sm">Legal clauses for default, prepayment, and remedies</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-amber-700 dark:text-amber-100" />
                    </div>
                    <span className="text-sm">Signature fields for all parties</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-amber-700 dark:text-amber-100" />
                    </div>
                    <span className="text-sm">Payment schedule as annex</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm border-l-2 border-amber-300 pl-3 mb-4 italic text-muted-foreground">
                Note: This document should be reviewed by qualified legal counsel before being finalized and signed by the parties.
              </div>
              
              <Button
                onClick={handleGenerateLoanContract}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Generate Financing Agreement
              </Button>
            </CardContent>
          </Card>
          
          {/* Investor Promissory Notes */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Investor Promissory Notes</CardTitle>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-100">
                  Legal Document
                </Badge>
              </div>
              <CardDescription>
                Legal promissory notes for individual investors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md mb-4">
                <h4 className="font-medium text-sm mb-2">Note Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="bg-rose-100 dark:bg-rose-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-rose-700 dark:text-rose-100" />
                    </div>
                    <span className="text-sm">Investment amount and shares</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-rose-100 dark:bg-rose-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-rose-700 dark:text-rose-100" />
                    </div>
                    <span className="text-sm">Payment terms and conditions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-rose-100 dark:bg-rose-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-rose-700 dark:text-rose-100" />
                    </div>
                    <span className="text-sm">Risk acknowledgment clauses</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-rose-100 dark:bg-rose-900 p-1 rounded mr-2 mt-0.5">
                      <FileCheck className="h-3 w-3 text-rose-700 dark:text-rose-100" />
                    </div>
                    <span className="text-sm">Legal protections and representation</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm border-l-2 border-rose-300 pl-3 mb-4 italic text-muted-foreground">
                Note: These promissory notes are customized for each investor and should be reviewed by legal counsel before execution.
              </div>
              
              <div className="space-y-2">
                {investors.map((investor) => (
                  <Button
                    key={investor.investorId}
                    onClick={() => handleGeneratePromissoryNote(investor)}
                    variant="outline"
                    className="w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Generate Note for {investor.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Legal Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Document Purpose</h3>
                <p className="text-sm text-muted-foreground">
                  These documents are intended to formalize the financing arrangement between the lending entity, borrower, and investors. 
                  They establish the legally binding terms and conditions that govern the loan and investment relationships.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Legal Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  The generated documents are templates and should be reviewed and customized by qualified legal counsel in the relevant jurisdiction.
                  The specific terms, conditions, and legal requirements may vary based on local laws and regulations.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Required Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The following information needs to be added to finalize these documents:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Complete legal names of all parties</li>
                  <li>Business addresses</li>
                  <li>Authorized signatories</li>
                  <li>Governing jurisdiction</li>
                  <li>Witness information</li>
                  <li>Company registration details (if applicable)</li>
                  <li>Payment account information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};