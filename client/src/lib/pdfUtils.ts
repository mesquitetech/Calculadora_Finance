import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { 
  formatCurrency, 
  formatDate,
  formatPercentage,
  PaymentScheduleEntry,
  InvestorReturn 
} from './finance';

// Define AutoTableStatic interface first
interface AutoTableStatic {
  previous?: {
    finalY: number;
  };
}

// Declare module augmentation for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: AutoTableStatic & ((options: any) => jsPDF);
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      getNumberOfPages: () => number;
    };
  }
}

// Function to generate loan holder payment report
export const generatePaymentReport = (
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  paymentSchedule: PaymentScheduleEntry[],
  monthlyPayment: number,
  totalInterest: number
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
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
  doc.text('Payment Schedule', 14, doc.autoTable.previous.finalY + 10);
  
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
    startY: doc.autoTable.previous.finalY + 15,
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
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
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
};

// Function to generate investor report
export const generateInvestorReport = (
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
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
  
  // Add loan overview section
  doc.setFontSize(12);
  doc.text('Loan Overview', 14, doc.autoTable.previous.finalY + 10);
  
  // Create loan details table
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Property', 'Value']],
    body: [
      ['Total Loan Amount', formatCurrency(loanAmount)],
      ['Interest Rate', `${interestRate.toFixed(2)}%`],
      ['Term Length', `${termMonths} months`],
      ['Monthly Payment', formatCurrency(monthlyPayment)],
      ['Start Date', formatDate(startDate)],
      ['Maturity Date', formatDate(endDate)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    margin: { top: doc.autoTable.previous.finalY + 15 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 
      0: { cellWidth: 80 },
      1: { cellWidth: 70 }
    }
  });
  
  // Add monthly returns section
  doc.setFontSize(12);
  doc.text('Monthly Returns', 14, doc.autoTable.previous.finalY + 10);
  
  // Prepare monthly returns data - show first 12 months and then yearly after that
  let returnsData = [];
  let cumulativeReturn = 0;
  
  // First 12 months in detail
  const initialMonths = Math.min(12, investor.monthlyReturns.length);
  for (let i = 0; i < initialMonths; i++) {
    cumulativeReturn += investor.monthlyReturns[i];
    returnsData.push([
      `Month ${i + 1}`,
      formatCurrency(investor.monthlyReturns[i]),
      formatCurrency(cumulativeReturn)
    ]);
  }
  
  // Remaining returns by year (if term > 12 months)
  if (investor.monthlyReturns.length > 12) {
    let yearlyReturns = [];
    for (let i = 12; i < investor.monthlyReturns.length; i += 12) {
      let yearReturn = 0;
      for (let j = 0; j < 12 && (i + j) < investor.monthlyReturns.length; j++) {
        yearReturn += investor.monthlyReturns[i + j];
      }
      const yearNumber = Math.floor(i / 12) + 1;
      cumulativeReturn += yearReturn;
      yearlyReturns.push([
        `Year ${yearNumber}`,
        formatCurrency(yearReturn),
        formatCurrency(cumulativeReturn)
      ]);
    }
    
    // Add separator between monthly and yearly data
    if (yearlyReturns.length > 0) {
      returnsData.push(['...', '...', '...']);
      returnsData = returnsData.concat(yearlyReturns);
    }
  }
  
  // Create monthly returns table
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Period', 'Return', 'Cumulative Return']],
    body: returnsData,
    theme: 'grid',
    headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    margin: { top: doc.autoTable.previous.finalY + 15 },
    columnStyles: { 
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' }
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
};

// Function to generate project summary report
export const generateProjectSummaryReport = (
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number,
  investors: InvestorReturn[]
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
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
  
  // Add investors summary section
  doc.setFontSize(12);
  doc.text('Investors Summary', 14, doc.autoTable.previous.finalY + 10);
  
  // Prepare investors data
  const investorsData = investors.map(investor => [
    investor.name,
    formatCurrency(investor.investmentAmount),
    formatPercentage(investor.share * 100),
    formatCurrency(investor.totalReturn),
    formatCurrency(investor.totalInterest),
    `${investor.roi.toFixed(2)}%`
  ]);
  
  // Create investors summary table
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Investor', 'Investment', 'Share', 'Return', 'Interest', 'ROI']],
    body: investorsData,
    theme: 'grid',
    headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    columnStyles: { 
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });
  
  // Add performance metrics section
  doc.setFontSize(12);
  doc.text('Performance Metrics', 14, doc.autoTable.previous.finalY + 10);
  
  // Calculate average ROI and other metrics
  const avgROI = investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length;
  const highestROI = Math.max(...investors.map(inv => inv.roi));
  const lowestROI = Math.min(...investors.map(inv => inv.roi));
  
  // Create performance metrics table
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Metric', 'Value']],
    body: [
      ['Average Return on Investment', `${avgROI.toFixed(2)}%`],
      ['Highest Return on Investment', `${highestROI.toFixed(2)}%`],
      ['Lowest Return on Investment', `${lowestROI.toFixed(2)}%`],
      ['Total Interest Generated', formatCurrency(totalInterest)],
      ['Interest to Principal Ratio', `${((totalInterest / loanAmount) * 100).toFixed(2)}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    margin: { top: doc.autoTable.previous.finalY + 15 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 
      0: { cellWidth: 80 },
      1: { cellWidth: 70 }
    }
  });
  
  // Add payment distribution section
  doc.setFontSize(12);
  doc.text('Payment Distribution', 14, doc.autoTable.previous.finalY + 10);
  
  // Create payment distribution table
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 15,
    head: [['Category', 'Amount', 'Percentage']],
    body: [
      ['Principal', formatCurrency(loanAmount), '100%'],
      ['Interest', formatCurrency(totalInterest), `${((totalInterest / loanAmount) * 100).toFixed(2)}%`],
      ['Total Payments', formatCurrency(loanAmount + totalInterest), `${((loanAmount + totalInterest) / loanAmount * 100).toFixed(2)}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 86, 219], textColor: 255 },
    margin: { top: doc.autoTable.previous.finalY + 15 }
  });
  
  // Add notes section
  doc.setFontSize(12);
  doc.text('Notes', 14, doc.autoTable.previous.finalY + 10);
  
  doc.setFontSize(10);
  doc.text(
    'This report provides a summary of the financing project and investor performance. ' +
    'Individual investor reports should be consulted for detailed returns information.',
    14,
    doc.autoTable.previous.finalY + 15,
    { maxWidth: 180 }
  );
  
  // Add legal notice
  doc.setFontSize(8);
  doc.text(
    'This document is a computer-generated report and does not require a signature.',
    14,
    doc.internal.pageSize.height - 20
  );
  
  doc.text(
    'For internal use by the managing company only.',
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
};

// Function to generate a legal contract for the loan holder
export const generateLoanContract = (
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number,
  paymentSchedule: PaymentScheduleEntry[]
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text('FINANCING AGREEMENT', 105, 20, { align: 'center' });
  
  // Add contract number and date
  const contractNumber = `LOAN-${Date.now().toString().substring(4)}`;
  doc.setFontSize(10);
  doc.text(`Contract No: ${contractNumber}`, 14, 30);
  doc.text(`Contract Date: ${formatDate(new Date())}`, 14, 35);
  
  // Add parties section
  doc.setFontSize(12);
  doc.text('PARTIES TO THE AGREEMENT', 14, 45);
  doc.setFontSize(10);
  doc.text(
    'This Financing Agreement (the "Agreement") is entered into as of the date stated above by and between:',
    14,
    55,
    { maxWidth: 180 }
  );
  
  doc.text(
    'LENDER: _______________________________________________, with its principal place of business at ' +
    '_____________________________________________________ ("Lender")',
    14,
    65,
    { maxWidth: 180 }
  );
  
  doc.text(
    'BORROWER: _____________________________________________, with its principal place of business at ' +
    '_____________________________________________________ ("Borrower")',
    14,
    80,
    { maxWidth: 180 }
  );
  
  // Add loan terms section
  doc.setFontSize(12);
  doc.text('LOAN TERMS', 14, 100);
  doc.setFontSize(10);
  
  doc.text(
    `1. Principal Amount: The Lender agrees to lend to the Borrower the sum of ${formatCurrency(loanAmount)} (the "Principal").`,
    14,
    110,
    { maxWidth: 180 }
  );
  
  doc.text(
    `2. Interest Rate: The loan shall bear interest at a fixed rate of ${interestRate.toFixed(2)}% per annum.`,
    14,
    120,
    { maxWidth: 180 }
  );
  
  doc.text(
    `3. Term: The term of the loan shall be ${termMonths} months, commencing on ${formatDate(startDate)} ` +
    `and ending on ${formatDate(endDate)} (the "Maturity Date").`,
    14,
    130,
    { maxWidth: 180 }
  );
  
  doc.text(
    `4. Repayment: The Borrower shall repay the Principal plus interest in equal monthly installments of ` +
    `${formatCurrency(monthlyPayment)} on the same day of each month until the Maturity Date. The total amount ` +
    `repayable over the term of the loan is ${formatCurrency(loanAmount + totalInterest)}, which includes Principal ` +
    `and interest.`,
    14,
    140,
    { maxWidth: 180 }
  );
  
  doc.text(
    '5. Payment Method: All payments shall be made by electronic transfer to the account designated by the Lender.',
    14,
    160,
    { maxWidth: 180 }
  );
  
  // Add new page for additional terms
  doc.addPage();
  
  // Add header to new page
  doc.setFontSize(12);
  doc.text('ADDITIONAL TERMS AND CONDITIONS', 14, 20);
  doc.setFontSize(10);
  
  doc.text(
    '6. Prepayment: The Borrower may prepay the loan in whole or in part at any time without penalty. Any partial ' +
    'prepayment shall be applied to reduce future installments of Principal and interest in the order of their maturity.',
    14,
    30,
    { maxWidth: 180 }
  );
  
  doc.text(
    '7. Late Payment: If any payment is not received within five (5) days of its due date, the Borrower shall pay a ' +
    'late fee equal to 5% of the overdue amount. Additionally, any overdue amount shall bear interest at the rate of ' +
    '1.5% per month from the due date until paid in full.',
    14,
    50,
    { maxWidth: 180 }
  );
  
  doc.text(
    '8. Events of Default: The following shall constitute events of default under this Agreement:',
    14,
    70,
    { maxWidth: 180 }
  );
  
  doc.text(
    'a) Failure of the Borrower to make any payment when due;',
    24,
    80,
    { maxWidth: 170 }
  );
  
  doc.text(
    'b) Breach by the Borrower of any provision of this Agreement;',
    24,
    90,
    { maxWidth: 170 }
  );
  
  doc.text(
    'c) Insolvency, bankruptcy, or similar proceedings involving the Borrower;',
    24,
    100,
    { maxWidth: 170 }
  );
  
  doc.text(
    'd) Any material adverse change in the financial condition of the Borrower.',
    24,
    110,
    { maxWidth: 170 }
  );
  
  doc.text(
    '9. Remedies: Upon the occurrence of an event of default, the Lender may:',
    14,
    120,
    { maxWidth: 180 }
  );
  
  doc.text(
    'a) Accelerate the loan, making all outstanding Principal and interest immediately due and payable;',
    24,
    130,
    { maxWidth: 170 }
  );
  
  doc.text(
    'b) Enforce its rights by legal proceedings;',
    24,
    140,
    { maxWidth: 170 }
  );
  
  doc.text(
    'c) Exercise any other rights and remedies available under applicable law.',
    24,
    150,
    { maxWidth: 170 }
  );
  
  doc.text(
    '10. Governing Law: This Agreement shall be governed by and construed in accordance with the laws of [State/Country].',
    14,
    160,
    { maxWidth: 180 }
  );
  
  doc.text(
    '11. Entire Agreement: This Agreement constitutes the entire understanding between the parties concerning the subject ' +
    'matter hereof and supersedes all prior negotiations, understandings, and agreements.',
    14,
    170,
    { maxWidth: 180 }
  );
  
  // Add new page for signatures
  doc.addPage();
  
  // Add signature section
  doc.setFontSize(12);
  doc.text('SIGNATURES', 14, 20);
  doc.setFontSize(10);
  
  doc.text(
    'IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.',
    14,
    30,
    { maxWidth: 180 }
  );
  
  doc.text('LENDER:', 14, 50);
  doc.text('Signature: ________________________________', 14, 60);
  doc.text('Name: _____________________________________', 14, 70);
  doc.text('Title: _____________________________________', 14, 80);
  doc.text('Date: _____________________________________', 14, 90);
  
  doc.text('BORROWER:', 14, 110);
  doc.text('Signature: ________________________________', 14, 120);
  doc.text('Name: _____________________________________', 14, 130);
  doc.text('Title: _____________________________________', 14, 140);
  doc.text('Date: _____________________________________', 14, 150);
  
  doc.text('WITNESS:', 14, 170);
  doc.text('Signature: ________________________________', 14, 180);
  doc.text('Name: _____________________________________', 14, 190);
  doc.text('Date: _____________________________________', 14, 200);
  
  // Add new page for payment schedule as annex
  doc.addPage();
  
  // Add payment schedule annex
  doc.setFontSize(12);
  doc.text('ANNEX A: PAYMENT SCHEDULE', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  
  doc.text(`Contract No: ${contractNumber}`, 14, 30);
  
  doc.text(
    'The following is the payment schedule for the loan, showing payment dates, amounts, and the breakdown ' +
    'of principal and interest for each payment:',
    14,
    40,
    { maxWidth: 180 }
  );
  
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
    startY: 50,
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
      if (data.pageNumber > 1) {
        doc.setFontSize(10);
        doc.text('ANNEX A: PAYMENT SCHEDULE (continued)', 105, 15, { align: 'center' });
      }
      
      // Add footer with page numbers
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });
  
  // Add document footer
  doc.setFontSize(8);
  doc.text(
    'Investment Financing Calculator © ' + new Date().getFullYear(),
    doc.internal.pageSize.width - 14,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );
  
  return doc;
};

// Function to generate investor promissory note
export const generateInvestorPromissoryNote = (
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text('INVESTOR PROMISSORY NOTE', 105, 20, { align: 'center' });
  
  // Add note number and date
  const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
  doc.setFontSize(10);
  doc.text(`Note No: ${noteNumber}`, 14, 30);
  doc.text(`Date: ${formatDate(new Date())}`, 14, 35);
  
  // Add parties section
  doc.setFontSize(12);
  doc.text('PARTIES', 14, 45);
  doc.setFontSize(10);
  doc.text(
    'This Promissory Note (the "Note") is issued as of the date stated above by:',
    14,
    55,
    { maxWidth: 180 }
  );
  
  doc.text(
    'MAKER: _______________________________________________, with its principal place of business at ' +
    '_____________________________________________________ ("Maker")',
    14,
    65,
    { maxWidth: 180 }
  );
  
  doc.text(
    `PAYEE: ${investor.name}, with address at ` +
    '_____________________________________________________ ("Investor")',
    14,
    80,
    { maxWidth: 180 }
  );
  
  // Add investment terms section
  doc.setFontSize(12);
  doc.text('INVESTMENT TERMS', 14, 100);
  doc.setFontSize(10);
  
  doc.text(
    `1. Investment Amount: The Investor has contributed the sum of ${formatCurrency(investor.investmentAmount)} ` +
    `(the "Investment Amount") to the financing project with total loan amount of ${formatCurrency(loanAmount)}.`,
    14,
    110,
    { maxWidth: 180 }
  );
  
  doc.text(
    `2. Investment Share: The Investor's contribution represents ${formatPercentage(investor.share * 100)} of the total loan amount.`,
    14,
    125,
    { maxWidth: 180 }
  );
  
  doc.text(
    `3. Project Interest Rate: The loan financing project bears interest at a fixed rate of ${interestRate.toFixed(2)}% per annum.`,
    14,
    135,
    { maxWidth: 180 }
  );
  
  doc.text(
    `4. Term: The term of the investment shall be ${termMonths} months, commencing on ${formatDate(startDate)} ` +
    `and ending on ${formatDate(endDate)} (the "Maturity Date").`,
    14,
    145,
    { maxWidth: 180 }
  );
  
  doc.text(
    `5. Expected Return: Based on the Investment Amount and project terms, the Investor is expected to receive ` +
    `a total return of ${formatCurrency(investor.totalReturn)} over the term of the investment, which includes ` +
    `the original Investment Amount plus interest of ${formatCurrency(investor.totalInterest)}.`,
    14,
    155,
    { maxWidth: 180 }
  );
  
  doc.text(
    `6. Return on Investment: The expected ROI for this investment is ${investor.roi.toFixed(2)}% over the term of the loan.`,
    14,
    170,
    { maxWidth: 180 }
  );
  
  // Add new page for payment terms
  doc.addPage();
  
  // Add payment terms section
  doc.setFontSize(12);
  doc.text('PAYMENT TERMS', 14, 20);
  doc.setFontSize(10);
  
  doc.text(
    '7. Payment Schedule: The Investor shall receive monthly payments representing their proportional share of the ' +
    'loan payments received from the Borrower. Payments shall be made within five (5) business days of receipt of ' +
    'the Borrower\'s monthly payment.',
    14,
    30,
    { maxWidth: 180 }
  );
  
  doc.text(
    '8. Payment Method: All payments to the Investor shall be made by electronic transfer to the account designated ' +
    'by the Investor in writing.',
    14,
    50,
    { maxWidth: 180 }
  );
  
  doc.text(
    '9. Borrower Default: In the event of a default by the Borrower, the Investor shall be entitled to receive their ' +
    'proportional share of any amounts recovered from the Borrower, after deduction of reasonable costs of collection.',
    14,
    65,
    { maxWidth: 180 }
  );
  
  // Add representations section
  doc.setFontSize(12);
  doc.text('REPRESENTATIONS AND AGREEMENTS', 14, 85);
  doc.setFontSize(10);
  
  doc.text(
    '10. Acknowledgment of Risk: The Investor acknowledges that this investment involves risk, including the possibility ' +
    'of loss of the entire Investment Amount if the Borrower defaults on the loan. The Investor has made their own ' +
    'independent assessment of the risks involved.',
    14,
    95,
    { maxWidth: 180 }
  );
  
  doc.text(
    '11. No Guarantee: The Maker does not guarantee any return on the investment or repayment of the Investment Amount. ' +
    'The Investor\'s return is dependent solely on the Borrower\'s performance under the loan agreement.',
    14,
    115,
    { maxWidth: 180 }
  );
  
  doc.text(
    '12. Transfer Restrictions: This Note may not be transferred or assigned without the prior written consent of the Maker.',
    14,
    135,
    { maxWidth: 180 }
  );
  
  doc.text(
    '13. Governing Law: This Note shall be governed by and construed in accordance with the laws of [State/Country].',
    14,
    150,
    { maxWidth: 180 }
  );
  
  doc.text(
    '14. Entire Agreement: This Note constitutes the entire understanding between the parties concerning the subject ' +
    'matter hereof and supersedes all prior negotiations, understandings, and agreements.',
    14,
    165,
    { maxWidth: 180 }
  );
  
  // Add new page for signatures
  doc.addPage();
  
  // Add signature section
  doc.setFontSize(12);
  doc.text('SIGNATURES', 14, 20);
  doc.setFontSize(10);
  
  doc.text(
    'IN WITNESS WHEREOF, the parties have executed this Promissory Note as of the date first written above.',
    14,
    30,
    { maxWidth: 180 }
  );
  
  doc.text('MAKER:', 14, 50);
  doc.text('Signature: ________________________________', 14, 60);
  doc.text('Name: _____________________________________', 14, 70);
  doc.text('Title: _____________________________________', 14, 80);
  doc.text('Date: _____________________________________', 14, 90);
  
  doc.text('INVESTOR:', 14, 110);
  doc.text('Signature: ________________________________', 14, 120);
  doc.text('Name: _____________________________________', 14, 130);
  doc.text('Date: _____________________________________', 14, 140);
  
  doc.text('WITNESS:', 14, 160);
  doc.text('Signature: ________________________________', 14, 170);
  doc.text('Name: _____________________________________', 14, 180);
  doc.text('Date: _____________________________________', 14, 190);
  
  // Add document footer
  doc.setFontSize(8);
  doc.text(
    'Investment Financing Calculator © ' + new Date().getFullYear(),
    doc.internal.pageSize.width - 14,
    doc.internal.pageSize.height - 10,
    { align: 'right' }
  );
  
  return doc;
};

// Function to capture an element as an image and return a canvas
export const captureElementAsImage = async (elementId: string): Promise<HTMLCanvasElement> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }
  
  return html2canvas(element);
};

// Function to export any HTML element to PDF
export const exportElementToPDF = async (
  elementId: string,
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<void> => {
  try {
    const canvas = await captureElementAsImage(elementId);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};