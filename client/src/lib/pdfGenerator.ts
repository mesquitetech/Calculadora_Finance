import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PaymentScheduleEntry, InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';

// We need to make TypeScript aware that jsPDF has the autotable method added by the plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: {
      (options: any): jsPDF;
      previous?: { finalY: number };
    };
  }
}

/**
 * Generate a payment schedule report PDF with business projections
 */
export function generatePaymentReport(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  paymentSchedule: PaymentScheduleEntry[],
  monthlyPayment: number,
  totalInterest: number
): jsPDF {
  try {
    console.log("Starting payment report generation");
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
    
    // Add loan projection details (business performance)
    doc.setFontSize(14);
    const projectionY = doc.autoTable.previous.finalY + 15;
    doc.text('Business Performance Projections', 105, projectionY, { align: 'center' });
    
    // Calculate some projection metrics
    const totalPayments = monthlyPayment * termMonths;
    const roi = (totalInterest / loanAmount) * 100;
    const annualizedReturn = roi / (termMonths / 12);
    
    doc.setFontSize(10);
    doc.text(`Annual Return Rate: ${annualizedReturn.toFixed(2)}%`, 14, projectionY + 10);
    doc.text(`Return on Investment: ${roi.toFixed(2)}%`, 14, projectionY + 17);
    doc.text(`Total Payments Over Term: ${formatCurrency(totalPayments)}`, 14, projectionY + 24);
    
    // Add quarterly projection table
    const quarters = Math.ceil(termMonths / 3);
    const quarterlyData = [];
    
    for (let i = 0; i < quarters; i++) {
      const quarterNumber = i + 1;
      const startMonth = i * 3;
      const endMonth = Math.min(startMonth + 2, termMonths - 1);
      
      if (startMonth >= paymentSchedule.length) break;
      
      const quarterPayments = paymentSchedule.slice(startMonth, endMonth + 1);
      const totalPrincipal = quarterPayments.reduce((sum, payment) => sum + payment.principal, 0);
      const totalInterestPaid = quarterPayments.reduce((sum, payment) => sum + payment.interest, 0);
      const endBalance = quarterPayments[quarterPayments.length - 1].balance;
      
      quarterlyData.push([
        `Q${quarterNumber}`,
        formatCurrency(totalPrincipal),
        formatCurrency(totalInterestPaid),
        formatCurrency(endBalance)
      ]);
    }
    
    doc.autoTable({
      startY: projectionY + 30,
      head: [['Quarter', 'Principal Paid', 'Interest Paid', 'Remaining Balance']],
      body: quarterlyData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      columnStyles: { 
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating payment report:", error);
    
    // Create emergency fallback PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Payment Report', 105, 20, { align: 'center' });
    errorDoc.setFontSize(10);
    errorDoc.text('An error occurred while generating the report.', 14, 35);
    errorDoc.text('Please check the console for detailed error information.', 14, 45);
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 55);
    }
    return errorDoc;
  }
}

/**
 * Generate an investor report PDF with quarterly projections
 */
export function generateInvestorReport(
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number
): jsPDF {
  try {
    console.log("Starting investor report generation");
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
    
    // Add investor projection section
    const projectionY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(14);
    doc.text('Investor Performance Projections', 105, projectionY, { align: 'center' });
    
    // Calculate quarterly projections
    const quarters = Math.ceil(termMonths / 3);
    const quarterlyData = [];
    let cumulativeReturn = 0;
    
    for (let i = 0; i < quarters; i++) {
      const quarterNumber = i + 1;
      const startMonth = i * 3;
      const endMonth = Math.min(startMonth + 2, termMonths - 1);
      
      if (startMonth >= investor.monthlyReturns.length) break;
      
      // Sum returns for this quarter
      let quarterlyReturn = 0;
      for (let j = startMonth; j <= endMonth && j < investor.monthlyReturns.length; j++) {
        quarterlyReturn += investor.monthlyReturns[j];
      }
      
      cumulativeReturn += quarterlyReturn;
      
      // Calculate key metrics
      const quarterlyRoi = quarterlyReturn / investor.investmentAmount * 100;
      
      quarterlyData.push([
        `Q${quarterNumber}`,
        formatCurrency(quarterlyReturn),
        formatCurrency(cumulativeReturn),
        `${quarterlyRoi.toFixed(2)}%`
      ]);
    }
    
    doc.autoTable({
      startY: projectionY + 10,
      head: [['Quarter', 'Return', 'Cumulative', 'Quarterly ROI']],
      body: quarterlyData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      columnStyles: { 
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating investor report:", error);
    
    // Create emergency fallback PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Investor Report', 105, 20, { align: 'center' });
    errorDoc.setFontSize(10);
    errorDoc.text('An error occurred while generating the report.', 14, 35);
    errorDoc.text('Please check the console for detailed error information.', 14, 45);
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 55);
    }
    return errorDoc;
  }
}

/**
 * Generate a project summary report PDF with business performance metrics
 */
export function generateProjectSummaryReport(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number,
  totalInterest: number,
  investors: InvestorReturn[]
): jsPDF {
  try {
    console.log("Starting project summary report generation");
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
    
    // Add investors table
    const investorsY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(12);
    doc.text('Investors Summary', 14, investorsY);
    
    const investorsData = investors.map(inv => [
      inv.name,
      formatCurrency(inv.investmentAmount),
      formatPercentage(inv.share * 100),
      formatCurrency(inv.totalReturn),
      `${inv.roi.toFixed(2)}%`
    ]);
    
    doc.autoTable({
      startY: investorsY + 5,
      head: [['Investor', 'Investment', 'Share', 'Total Return', 'ROI']],
      body: investorsData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      columnStyles: { 
        0: { cellWidth: 40 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Add business forecasting section
    const forecastY = doc.autoTable.previous.finalY + 15;
    doc.setFontSize(14);
    doc.text('Business Cash Flow Projection', 105, forecastY, { align: 'center' });
    
    // Calculate yearly projections
    const years = Math.ceil(termMonths / 12);
    const yearlyData = [];
    
    for (let i = 0; i < years; i++) {
      const yearNumber = i + 1;
      const startMonth = i * 12;
      const endMonth = Math.min(startMonth + 11, termMonths - 1);
      
      // Calculate yearly metrics
      let yearlyPayments = 0;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let m = startMonth; m <= endMonth && m < termMonths; m++) {
        yearlyPayments += monthlyPayment;
        yearlyPrincipal += (loanAmount / termMonths);
        yearlyInterest += (monthlyPayment - (loanAmount / termMonths));
      }
      
      // Calculate investor distributions for this year
      let investorDistributions = 0;
      investors.forEach(investor => {
        for (let m = startMonth; m <= endMonth && m < investor.monthlyReturns.length; m++) {
          investorDistributions += investor.monthlyReturns[m];
        }
      });
      
      // Calculate retained earnings (what's left after investor payments)
      const retainedEarnings = yearlyPayments - investorDistributions;
      
      yearlyData.push([
        `Year ${yearNumber}`,
        formatCurrency(yearlyPayments),
        formatCurrency(investorDistributions),
        formatCurrency(retainedEarnings),
        `${((retainedEarnings / yearlyPayments) * 100).toFixed(1)}%`
      ]);
    }
    
    doc.autoTable({
      startY: forecastY + 10,
      head: [['Period', 'Cash Flow In', 'Investor Payouts', 'Net Retained', 'Retention %']],
      body: yearlyData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219], textColor: 255 },
      columnStyles: { 
        0: { cellWidth: 30, halign: 'center' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    return doc;
  } catch (error) {
    console.error("Error generating project summary report:", error);
    
    // Create emergency fallback PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Project Summary Report', 105, 20, { align: 'center' });
    errorDoc.setFontSize(10);
    errorDoc.text('An error occurred while generating the report.', 14, 35);
    errorDoc.text('Please check the console for detailed error information.', 14, 45);
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 55);
    }
    return errorDoc;
  }
}

/**
 * Generate a loan contract PDF
 */
export function generateLoanContract(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number
): jsPDF {
  try {
    console.log("Starting loan contract generation");
    const doc = new jsPDF();
    
    // Basic content
    doc.setFontSize(20);
    doc.text('Loan Agreement', 105, 15, { align: 'center' });
    
    // Generate a contract number
    const contractNumber = `LOAN-${Date.now().toString().substring(4)}`;
    doc.setFontSize(10);
    doc.text(`Contract #: ${contractNumber}`, 105, 22, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 28, { align: 'center' });
    
    // Add contract content
    doc.setFontSize(12);
    doc.text('Loan Terms and Conditions', 14, 40);
    doc.setFontSize(10);
    doc.text(`Principal Amount: ${formatCurrency(loanAmount)}`, 14, 50);
    doc.text(`Interest Rate: ${interestRate.toFixed(2)}% per annum`, 14, 57);
    doc.text(`Loan Term: ${termMonths} months from ${formatDate(startDate)} to ${formatDate(endDate)}`, 14, 64);
    doc.text(`Monthly Payment: ${formatCurrency(monthlyPayment)}`, 14, 71);
    
    return doc;
  } catch (error) {
    console.error("Error generating loan contract:", error);
    
    // Create emergency fallback PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Loan Contract', 105, 20, { align: 'center' });
    errorDoc.setFontSize(10);
    errorDoc.text('An error occurred while generating the contract.', 14, 35);
    errorDoc.text('Please check the console for detailed error information.', 14, 45);
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 55);
    }
    return errorDoc;
  }
}

/**
 * Generate an investor promissory note PDF
 */
export function generateInvestorPromissoryNote(
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date
): jsPDF {
  try {
    console.log("Starting promissory note generation");
    const doc = new jsPDF();
    
    // Basic content
    doc.setFontSize(20);
    doc.text('Promissory Note', 105, 15, { align: 'center' });
    
    // Generate a note number
    const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
    doc.setFontSize(10);
    doc.text(`Note #: ${noteNumber}`, 105, 22, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 28, { align: 'center' });
    
    // Add note content
    doc.setFontSize(12);
    doc.text('Investment Terms', 14, 40);
    doc.setFontSize(10);
    doc.text(`Investor: ${investor.name}`, 14, 50);
    doc.text(`Investment Amount: ${formatCurrency(investor.investmentAmount)}`, 14, 57);
    doc.text(`Investment Share: ${formatPercentage(investor.share * 100)}`, 14, 64);
    doc.text(`Expected Return: ${formatCurrency(investor.totalReturn)}`, 14, 71);
    doc.text(`Expected ROI: ${investor.roi.toFixed(2)}%`, 14, 78);
    
    return doc;
  } catch (error) {
    console.error("Error generating promissory note:", error);
    
    // Create emergency fallback PDF
    const errorDoc = new jsPDF();
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Promissory Note', 105, 20, { align: 'center' });
    errorDoc.setFontSize(10);
    errorDoc.text('An error occurred while generating the note.', 14, 35);
    errorDoc.text('Please check the console for detailed error information.', 14, 45);
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 55);
    }
    return errorDoc;
  }
}