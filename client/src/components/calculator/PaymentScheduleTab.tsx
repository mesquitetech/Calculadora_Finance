import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PaymentScheduleEntry, 
  formatCurrency, 
  formatDate 
} from "@/lib/finance";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentScheduleTabProps {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  paymentSchedule: PaymentScheduleEntry[];
}

export function PaymentScheduleTab({ 
  loanAmount, 
  monthlyPayment, 
  totalInterest, 
  paymentSchedule 
}: PaymentScheduleTabProps) {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(paymentSchedule.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, paymentSchedule.length);
  const currentItems = paymentSchedule.slice(startIndex, endIndex);
  
  // Pagination controls
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-neutral-lighter">
        <CardTitle>Payment Schedule</CardTitle>
        <CardDescription>
          Monthly payment breakdown over the loan term
        </CardDescription>
      </CardHeader>

      <div className="p-4 border-b border-neutral-lighter bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card shadow-sm">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Loan Amount</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(loanAmount)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Monthly Payment</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyPayment)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalInterest)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Payment #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((payment) => (
              <TableRow key={payment.paymentNumber}>
                <TableCell>{payment.paymentNumber}</TableCell>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell>{formatCurrency(payment.payment)}</TableCell>
                <TableCell>{formatCurrency(payment.principal)}</TableCell>
                <TableCell>{formatCurrency(payment.interest)}</TableCell>
                <TableCell>{formatCurrency(payment.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="px-6 py-4 bg-muted flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of{" "}
            <span className="font-medium">{paymentSchedule.length}</span> payments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
