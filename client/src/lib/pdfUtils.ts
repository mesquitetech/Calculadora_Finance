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

// Helper function to safely get final Y position
function getLastTableEndY(doc: jsPDF): number {
  return doc.autoTable.previous?.finalY || 60;
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
      // Additional properties to match expected type
      events?: any;
      scaleFactor?: number;
      pages?: any[];
      getEncryptor?: ((objectId: number) => (data: string) => string);
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
  try {
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
        const pageNum = doc.internal.getNumberOfPages?.() || 1;
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
  try {
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
    doc.text('Loan Overview', 14, getLastTableEndY(doc) + 10);
    
    // Create loan details table
    doc.autoTable({
      startY: getLastTableEndY(doc) + 15,
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
      margin: { top: getLastTableEndY(doc) + 15 },
      styles: { overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      }
    });
    
    // Add monthly returns section
    doc.setFontSize(12);
    doc.text('Monthly Returns', 14, getLastTableEndY(doc) + 10);
    
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
      startY: getLastTableEndY(doc) + 15,
      head: [['Period', 'Return', 'Cumulative Return']],
      body: returnsData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      margin: { top: getLastTableEndY(doc) + 15 },
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
  } catch (error) {
    console.error("Error generating investor report:", error);
    throw error;
  }
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
  try {
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
    doc.text('Investors Summary', 14, getLastTableEndY(doc) + 10);
    
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
      startY: getLastTableEndY(doc) + 15,
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
    doc.text('Performance Metrics', 14, getLastTableEndY(doc) + 10);
    
    // Calculate average ROI and other metrics
    const avgROI = investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length;
    const highestROI = Math.max(...investors.map(inv => inv.roi));
    const lowestROI = Math.min(...investors.map(inv => inv.roi));
    
    // Create performance metrics table
    doc.autoTable({
      startY: getLastTableEndY(doc) + 15,
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
      margin: { top: getLastTableEndY(doc) + 15 },
      styles: { overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      }
    });
    
    // Add payment distribution section
    doc.setFontSize(12);
    doc.text('Payment Distribution', 14, getLastTableEndY(doc) + 10);
    
    // Create payment distribution table
    doc.autoTable({
      startY: getLastTableEndY(doc) + 15,
      head: [['Category', 'Amount', 'Percentage']],
      body: [
        ['Principal', formatCurrency(loanAmount), '100%'],
        ['Interest', formatCurrency(totalInterest), `${((totalInterest / loanAmount) * 100).toFixed(2)}%`],
        ['Total Payments', formatCurrency(loanAmount + totalInterest), `${((loanAmount + totalInterest) / loanAmount * 100).toFixed(2)}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      margin: { top: getLastTableEndY(doc) + 15 }
    });
    
    // Add notes section
    doc.setFontSize(12);
    doc.text('Notes', 14, getLastTableEndY(doc) + 10);
    
    doc.setFontSize(10);
    doc.text(
      'This report provides a summary of the financing project and investor performance. ' +
      'Individual investor reports should be consulted for detailed returns information.',
      14,
      getLastTableEndY(doc) + 15,
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
  } catch (error) {
    console.error("Error generating project summary report:", error);
    throw error;
  }
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
  try {
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
    
    // Add legal clauses and terms
    doc.addPage();
    doc.setFontSize(12);
    doc.text('AGREEMENT TERMS AND CONDITIONS', 105, 20, { align: 'center' });
    
    const legalTerms = [
      "5. LATE PAYMENT: If any installment payment is not received within 10 days of its due date, Borrower shall pay a late charge equal to 5% of the payment due.",
      "6. PREPAYMENT: Borrower may prepay all or any part of the Principal without penalty. Prepayments shall be applied first to accrued interest and then to Principal.",
      "7. DEFAULT: The occurrence of any of the following shall constitute an event of default: (a) Borrower fails to make any payment when due; (b) Borrower breaks any promise made in this Agreement; (c) Borrower provides any materially false information.",
      "8. REMEDIES: Upon default, Lender may: (a) Declare the entire unpaid Principal balance and accrued interest immediately due; (b) Pursue any other remedy available at law or in equity.",
      "9. GOVERNING LAW: This Agreement shall be governed by the laws of the state of [STATE], without regard to conflict of law principles.",
      "10. AMENDMENTS: This Agreement may be modified only by a written instrument executed by both parties.",
      "11. NOTICES: Any notice required by this Agreement shall be given in writing and shall be deemed effectively given upon personal delivery or when sent by certified mail.",
      "12. SEVERABILITY: If any provision of this Agreement is determined to be invalid or unenforceable, the remainder shall be enforceable to the maximum extent permitted by law.",
      "13. ASSIGNMENT: This Agreement shall bind and benefit the parties and their respective heirs, legal representatives, successors, and assigns. Borrower may not assign this Agreement without Lender's prior written consent.",
      "14. ENTIRE AGREEMENT: This Agreement constitutes the entire agreement between the parties and supersedes all prior or contemporaneous communications, representations, or agreements, whether oral or written."
    ];
    
    let yPosition = 35;
    legalTerms.forEach(term => {
      if (yPosition > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(term, 14, yPosition, { maxWidth: 180 });
      yPosition += Math.ceil(doc.getTextDimensions(term, { maxWidth: 180 }).h) + 10;
    });
    
    // Add signature block
    const signatureY = Math.max(yPosition + 20, doc.internal.pageSize.height - 80);
    if (signatureY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = signatureY;
    }
    
    doc.setFontSize(12);
    doc.text('SIGNATURES', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.line(14, yPosition + 20, 95, yPosition + 20); // Lender signature line
    doc.line(115, yPosition + 20, 196, yPosition + 20); // Borrower signature line
    
    doc.setFontSize(10);
    doc.text('Lender Signature', 55, yPosition + 30, { align: 'center' });
    doc.text('Borrower Signature', 155, yPosition + 30, { align: 'center' });
    
    doc.text('Name: ____________________', 55, yPosition + 40, { align: 'center' });
    doc.text('Name: ____________________', 155, yPosition + 40, { align: 'center' });
    
    doc.text('Date: _____________________', 55, yPosition + 50, { align: 'center' });
    doc.text('Date: _____________________', 155, yPosition + 50, { align: 'center' });
    
    // Add document footer
    doc.setFontSize(8);
    doc.text(
      'Investment Financing Calculator © ' + new Date().getFullYear(),
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages?.() || 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    return doc;
  } catch (error) {
    console.error("Error generating loan contract:", error);
    throw error;
  }
};

// Function to generate a promissory note for an investor
export const generateInvestorPromissoryNote = (
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date
): jsPDF => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(18);
    doc.text('PROMISSORY NOTE', 105, 20, { align: 'center' });
    
    // Add note number, date and amount
    const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
    doc.setFontSize(10);
    doc.text(`Note No: ${noteNumber}`, 14, 30);
    doc.text(`Date: ${formatDate(new Date())}`, 14, 35);
    doc.text(`Principal Amount: ${formatCurrency(investor.investmentAmount)}`, 14, 40);
    
    // Add introductory paragraph
    doc.setFontSize(10);
    doc.text(
      `FOR VALUE RECEIVED, the undersigned ("Borrower") promises to pay to the order of ${investor.name} ("Lender") ` +
      `the principal sum of ${formatCurrency(investor.investmentAmount)}, together with interest accrued at the rate of ` +
      `${interestRate.toFixed(2)}% per annum on the unpaid principal balance from the date of this Note until paid in full.`,
      14,
      55,
      { maxWidth: 180 }
    );
    
    // Add repayment terms
    doc.setFontSize(12);
    doc.text('REPAYMENT TERMS', 14, 75);
    
    doc.setFontSize(10);
    doc.text(
      `1. This Note represents ${formatPercentage(investor.share * 100)} of a total financing agreement in the amount of ` +
      `${formatCurrency(loanAmount)} dated ${formatDate(startDate)}.`,
      14,
      85,
      { maxWidth: 180 }
    );
    
    doc.text(
      `2. Repayment shall be made in ${termMonths} monthly installments, with each payment representing ` +
      `the Lender's proportional share of the total monthly payment collected from the underlying borrower.`,
      14,
      100,
      { maxWidth: 180 }
    );
    
    doc.text(
      `3. The projected total return to Lender over the term of this Note is ${formatCurrency(investor.totalReturn)}, ` +
      `which includes principal and interest.`,
      14,
      115,
      { maxWidth: 180 }
    );
    
    doc.text(
      `4. Term: The term of this Note shall be ${termMonths} months, commencing on ${formatDate(startDate)} ` +
      `and ending on ${formatDate(endDate)} (the "Maturity Date").`,
      14,
      130,
      { maxWidth: 180 }
    );
    
    doc.text(
      `5. All payments due under this Note shall be made to Lender at the following address or to such other place as the ` +
      `Lender may designate in writing: _________________________________________________`,
      14,
      145,
      { maxWidth: 180 }
    );
    
    // Add legal terms
    doc.setFontSize(12);
    doc.text('LEGAL TERMS AND CONDITIONS', 14, 165);
    
    const legalTerms = [
      "6. DEFAULT: If any installment payment due under this Note is not received by Lender within 15 days of its due date, Borrower shall be in default.",
      "7. ACCELERATION: Upon default, Lender may declare the entire unpaid principal balance under this Note and all accrued unpaid interest immediately due.",
      "8. PREPAYMENT: Borrower may prepay all or any part of the principal without penalty. Prepayments shall be applied first to accrued interest and then to principal.",
      "9. COLLECTION COSTS: If this Note is placed with an attorney for collection, Borrower agrees to pay reasonable attorney's fees and costs of collection.",
      "10. WAIVER: Borrower waives presentment, demand for payment, protest, and notice of dishonor.",
      "11. GOVERNING LAW: This Note shall be governed by the laws of the state of [STATE], without regard to conflict of law principles.",
      "12. SEVERABILITY: If any provision of this Note is determined to be invalid or unenforceable, the remainder shall be enforceable to the maximum extent permitted by law."
    ];
    
    let yPosition = 175;
    legalTerms.forEach(term => {
      if (yPosition > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(term, 14, yPosition, { maxWidth: 180 });
      yPosition += Math.ceil(doc.getTextDimensions(term, { maxWidth: 180 }).h) + 10;
    });
    
    // Add signature block
    const signatureY = Math.max(yPosition + 20, doc.internal.pageSize.height - 80);
    if (signatureY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = signatureY;
    }
    
    doc.setFontSize(12);
    doc.text('SIGNATURES', 105, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.line(14, yPosition + 20, 95, yPosition + 20); // Borrower signature line
    doc.line(115, yPosition + 20, 196, yPosition + 20); // Lender signature line
    
    doc.setFontSize(10);
    doc.text('Borrower Signature', 55, yPosition + 30, { align: 'center' });
    doc.text('Lender Signature', 155, yPosition + 30, { align: 'center' });
    
    doc.text('Name: ____________________', 55, yPosition + 40, { align: 'center' });
    doc.text(`Name: ${investor.name}`, 155, yPosition + 40, { align: 'center' });
    
    doc.text('Date: _____________________', 55, yPosition + 50, { align: 'center' });
    doc.text('Date: _____________________', 155, yPosition + 50, { align: 'center' });
    
    // Add document footer
    doc.setFontSize(8);
    doc.text(
      'Investment Financing Calculator © ' + new Date().getFullYear(),
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages?.() || 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    return doc;
  } catch (error) {
    console.error("Error generating promissory note:", error);
    throw error;
  }
};

// Helper function to capture an element as an image
export const captureElementAsImage = async (elementId: string): Promise<HTMLCanvasElement> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found.`);
  }
  
  return await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null
  });
};

// Helper function to export an element to PDF
export const exportElementToPDF = async (
  elementId: string, 
  filename: string = 'export.pdf',
  orientation: 'portrait' | 'landscape' = 'portrait',
  title: string = ''
): Promise<void> => {
  try {
    const canvas = await captureElementAsImage(elementId);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    
    const imgX = (pageWidth - imgWidth * ratio) / 2;
    const imgY = 20;
    
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, pageWidth / 2, 10, { align: 'center' });
    }
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting element to PDF:", error);
    throw error;
  }
};