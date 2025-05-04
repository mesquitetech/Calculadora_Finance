import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PaymentScheduleEntry, InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';

// Create a simple wrapper for jsPDF with autoTable support
export function createPDF() {
  // @ts-ignore - we know jspdf-autotable adds the autoTable method
  return new jsPDF();
}

// Function to get the last table end Y position
export function getLastTableEndY(doc: any): number {
  return doc.autoTable?.previous?.finalY || 60;
}

// Function to generate payment report PDF
export function generatePaymentReport(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  paymentSchedule: PaymentScheduleEntry[],
  monthlyPayment: number,
  totalInterest: number
): any {
  try {
    // Create new PDF document
    const doc = createPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Payment Schedule Report', 105, 15, { align: 'center' });
    
    // Add report date
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add loan details section
    doc.setFontSize(12);
    doc.text('Loan Details', 14, 30);
    doc.setFontSize(10);
    
    // Create loan details table
    doc.autoTable({
      startY: 35,
      head: [['Property', 'Value']],
      body: [
        ['Loan Amount', formatCurrency(loanAmount)],
        ['Interest Rate', `${interestRate.toFixed(2)}%`],
        ['Term Length', `${termMonths} months`],
        ['Monthly Payment', formatCurrency(monthlyPayment)],
        ['Total Interest', formatCurrency(totalInterest)],
        ['Total Payments', formatCurrency(loanAmount + totalInterest)],
        ['Start Date', formatDate(startDate)],
        ['Maturity Date', formatDate(endDate)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      margin: { top: 35 },
      styles: { overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      }
    });
    
    // Add payment schedule section
    doc.setFontSize(12);
    doc.text('Payment Schedule', 14, getLastTableEndY(doc) + 10);
    
    // Prepare payment schedule data
    const scheduleData = paymentSchedule.map(entry => [
      entry.paymentNumber.toString(),
      formatDate(entry.date),
      formatCurrency(entry.payment),
      formatCurrency(entry.principal),
      formatCurrency(entry.interest),
      formatCurrency(entry.balance)
    ]);
    
    // Create payment schedule table
    doc.autoTable({
      startY: getLastTableEndY(doc) + 15,
      head: [['#', 'Date', 'Payment', 'Principal', 'Interest', 'Balance']],
      body: scheduleData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      columnStyles: { 
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      },
      didDrawPage: (data: any) => {
        // Add header to each page
        doc.setFontSize(10);
        doc.text('Payment Schedule Report', 105, 10, { align: 'center' });
        
        // Add footer with page numbers
        doc.setFontSize(8);
        // @ts-ignore
        const pageNum = doc.internal.getNumberOfPages() || 1;
        doc.text(
          `Page ${pageNum}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });
    
    // Add legal notice
    doc.setFontSize(8);
    doc.text(
      'This document is a computer-generated report and does not require a signature.',
      14,
      doc.internal.pageSize.height - 20
    );
    
    doc.text(
      'Please retain this document for your records.',
      14,
      doc.internal.pageSize.height - 15
    );
    
    // Add document footer
    doc.setFontSize(8);
    doc.text(
      'Investment Financing Calculator © ' + new Date().getFullYear(),
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    
    return doc;
  } catch (error) {
    console.error("Error generating payment report:", error);
    throw error;
  }
}

// Function to generate investor report
export function generateInvestorReport(
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number
): any {
  try {
    // Create new PDF document
    const doc = createPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Investor Return Report', 105, 15, { align: 'center' });
    
    // Add report date and investor name
    doc.setFontSize(12);
    doc.text(`Investor: ${investor.name}`, 14, 25);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add investment details section
    doc.setFontSize(12);
    doc.text('Investment Details', 14, 35);
    
    // Create investment details table
    doc.autoTable({
      startY: 40,
      head: [['Property', 'Value']],
      body: [
        ['Investment Amount', formatCurrency(investor.investmentAmount)],
        ['Investment Share', formatPercentage(investor.share * 100)],
        ['Total Return', formatCurrency(investor.totalReturn)],
        ['Total Interest Earned', formatCurrency(investor.totalInterest)],
        ['Return on Investment (ROI)', `${investor.roi.toFixed(2)}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      margin: { top: 40 },
      styles: { overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating investor report:", error);
    throw error;
  }
}

// Function to generate project summary report
export function generateProjectSummaryReport(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number,
  investors: InvestorReturn[]
): any {
  try {
    // Create new PDF document
    const doc = createPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Project Summary Report', 105, 15, { align: 'center' });
    
    // Add report date
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add project overview section
    doc.setFontSize(12);
    doc.text('Project Overview', 14, 30);
    
    // Create project overview table
    doc.autoTable({
      startY: 35,
      head: [['Property', 'Value']],
      body: [
        ['Loan Amount', formatCurrency(loanAmount)],
        ['Interest Rate', `${interestRate.toFixed(2)}%`],
        ['Term Length', `${termMonths} months`],
        ['Monthly Payment', formatCurrency(monthlyPayment)],
        ['Total Interest', formatCurrency(totalInterest)],
        ['Total Payments', formatCurrency(loanAmount + totalInterest)],
        ['Start Date', formatDate(startDate)],
        ['Maturity Date', formatDate(endDate)],
        ['Number of Investors', investors.length.toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      margin: { top: 35 },
      styles: { overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating project summary report:", error);
    throw error;
  }
}

// Function to generate loan contract
export function generateLoanContract(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number
): any {
  try {
    // Create new PDF document
    const doc = createPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Loan Agreement', 105, 15, { align: 'center' });
    
    // Generate a contract number
    const contractNumber = `LOAN-${Date.now().toString().substring(4)}`;
    doc.setFontSize(10);
    doc.text(`Contract #: ${contractNumber}`, 105, 22, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 28, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error("Error generating loan contract:", error);
    throw error;
  }
}

// Function to generate investor promissory note
export function generateInvestorPromissoryNote(
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date
): any {
  try {
    // Create new PDF document
    const doc = createPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Promissory Note', 105, 15, { align: 'center' });
    
    // Generate a note number
    const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
    doc.setFontSize(10);
    doc.text(`Note #: ${noteNumber}`, 105, 22, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 28, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error("Error generating promissory note:", error);
    throw error;
  }
}