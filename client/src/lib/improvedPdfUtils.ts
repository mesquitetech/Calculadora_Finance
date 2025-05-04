import jsPDF from 'jspdf';
// For TypeScript compatibility with jspdf-autotable
// @ts-ignore
import * as autoTableModule from 'jspdf-autotable';
import { PaymentScheduleEntry, InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';

/**
 * This file contains improved PDF generation utilities with better error handling
 * and a more direct approach to using jsPDF with autoTable
 */

/**
 * Create detailed error messages with stack trace for debugging
 * @param error - The error object
 * @param context - The context where the error occurred
 * @returns - A detailed error message
 */
function createDetailedError(error: any, context: string): string {
  console.error(`PDF Generation Error in ${context}:`, error);
  
  let detailedMessage = `Error in ${context}: `;
  
  if (error instanceof Error) {
    detailedMessage += `${error.name}: ${error.message}`;
    if (error.stack) {
      detailedMessage += `\n\nStack Trace: ${error.stack}`;
    }
  } else {
    detailedMessage += String(error);
  }
  
  return detailedMessage;
}

/**
 * Generate a payment schedule report PDF with enhanced error reporting
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
): any {
  try {
    console.log("Starting payment report generation");
    const doc = new jsPDF();
    
    // Basic text - this should work even if autoTable fails
    doc.setFontSize(20);
    doc.text('Payment Schedule Report', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    try {
      // Import autoTable directly if not available on jsPDF prototype
      if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
        console.log("Using direct autoTable import");
        autoTableModule.default(doc, {
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
      } 
      else {
        console.log("Using autoTable from jsPDF prototype");
        // @ts-ignore - for TypeScript compatibility
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
      }
    } catch (tableError) {
      console.error("Failed to create table in payment report:", tableError);
      // At least add some basic info as text if table fails
      doc.setFontSize(12);
      doc.text('Loan Details', 14, 35);
      doc.setFontSize(10);
      doc.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 14, 45);
      doc.text(`Interest Rate: ${interestRate.toFixed(2)}%`, 14, 52);
      doc.text(`Term Length: ${termMonths} months`, 14, 59);
      doc.text(`Monthly Payment: ${formatCurrency(monthlyPayment)}`, 14, 66);
    }
    
    // Add loan projection details (new feature)
    try {
      doc.setFontSize(14);
      doc.text('Loan Projection & Business Performance', 105, 110, { align: 'center' });
      
      // Calculate some projection metrics
      const totalPayments = monthlyPayment * termMonths;
      const roi = (totalInterest / loanAmount) * 100;
      const annualizedReturn = roi / (termMonths / 12);
      
      doc.setFontSize(10);
      doc.text(`Annual Return Rate: ${annualizedReturn.toFixed(2)}%`, 14, 120);
      doc.text(`Return on Investment: ${roi.toFixed(2)}%`, 14, 127);
      doc.text(`Total Payments Over Term: ${formatCurrency(totalPayments)}`, 14, 134);
      
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
      
      try {
        if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
          autoTableModule.default(doc, {
            startY: 145,
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
        } else {
          // @ts-ignore
          doc.autoTable({
            startY: 145,
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
        }
      } catch (projectionTableError) {
        console.error("Failed to create projection table:", projectionTableError);
        doc.text('Quarterly projection data could not be displayed.', 14, 150);
        doc.text('Please check console for errors.', 14, 157);
      }
    } catch (projectionError) {
      console.error("Failed to add projections to report:", projectionError);
      doc.text('Business projections could not be generated.', 14, 120);
    }
    
    return doc;
  } catch (error) {
    const detailedError = createDetailedError(error, "generatePaymentReport");
    console.error(detailedError);
    
    // Create emergency fallback PDF
    try {
      const errorDoc = new jsPDF();
      errorDoc.setFontSize(18);
      errorDoc.text('Error Generating Payment Report', 105, 20, { align: 'center' });
      errorDoc.setFontSize(10);
      errorDoc.text('An error occurred while generating the report.', 14, 35);
      errorDoc.text('Please check the console for detailed error information.', 14, 45);
      return errorDoc;
    } catch (fallbackError) {
      console.error("Even the fallback PDF failed:", fallbackError);
      throw new Error(`PDF generation failed completely: ${detailedError}`);
    }
  }
}

/**
 * Generate an investor report PDF with enhanced error reporting
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
): any {
  try {
    console.log("Starting investor report generation");
    const doc = new jsPDF();
    
    // Basic text - this should work even if autoTable fails
    doc.setFontSize(20);
    doc.text('Investor Return Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Investor: ${investor.name}`, 14, 25);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    try {
      // Import autoTable directly if not available on jsPDF prototype
      if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
        console.log("Using direct autoTable import");
        autoTableModule.default(doc, {
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
      } 
      else {
        console.log("Using autoTable from jsPDF prototype");
        // @ts-ignore - for TypeScript compatibility
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
      }
    } catch (tableError) {
      console.error("Failed to create table in investor report:", tableError);
      // At least add some basic info as text if table fails
      doc.setFontSize(12);
      doc.text('Investment Details', 14, 40);
      doc.setFontSize(10);
      doc.text(`Investment Amount: ${formatCurrency(investor.investmentAmount)}`, 14, 50);
      doc.text(`Investment Share: ${formatPercentage(investor.share * 100)}`, 14, 57);
      doc.text(`Total Return: ${formatCurrency(investor.totalReturn)}`, 14, 64);
    }
    
    // Add investor projection section (new feature)
    try {
      const yPosition = 120; // Adjust as needed
      doc.setFontSize(14);
      doc.text('Investor Performance Projections', 105, yPosition, { align: 'center' });
      
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
      
      try {
        if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
          autoTableModule.default(doc, {
            startY: yPosition + 10,
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
        } else {
          // @ts-ignore
          doc.autoTable({
            startY: yPosition + 10,
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
        }
      } catch (projectionTableError) {
        console.error("Failed to create investor projection table:", projectionTableError);
        doc.text('Quarterly investor projection data could not be displayed.', 14, yPosition + 15);
      }
    } catch (projectionError) {
      console.error("Failed to add investor projections to report:", projectionError);
      doc.text('Investor projections could not be generated.', 14, 120);
    }
    
    return doc;
  } catch (error) {
    const detailedError = createDetailedError(error, "generateInvestorReport");
    console.error(detailedError);
    
    // Create emergency fallback PDF
    try {
      const errorDoc = new jsPDF();
      errorDoc.setFontSize(18);
      errorDoc.text('Error Generating Investor Report', 105, 20, { align: 'center' });
      errorDoc.setFontSize(10);
      errorDoc.text('An error occurred while generating the report.', 14, 35);
      errorDoc.text('Please check the console for detailed error information.', 14, 45);
      return errorDoc;
    } catch (fallbackError) {
      console.error("Even the fallback PDF failed:", fallbackError);
      throw new Error(`PDF generation failed completely: ${detailedError}`);
    }
  }
}

/**
 * Generate a project summary report PDF with enhanced error reporting
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
): any {
  try {
    console.log("Starting project summary report generation");
    const doc = new jsPDF();
    
    // Basic text - this should work even if autoTable fails
    doc.setFontSize(20);
    doc.text('Project Summary Report', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    try {
      // Import autoTable directly if not available on jsPDF prototype
      if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
        console.log("Using direct autoTable import");
        autoTableModule.default(doc, {
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
      } 
      else {
        console.log("Using autoTable from jsPDF prototype");
        // @ts-ignore - for TypeScript compatibility
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
      }
    } catch (tableError) {
      console.error("Failed to create table in project summary report:", tableError);
      // At least add some basic info as text if table fails
      doc.setFontSize(12);
      doc.text('Project Overview', 14, 35);
      doc.setFontSize(10);
      doc.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 14, 45);
      doc.text(`Interest Rate: ${interestRate.toFixed(2)}%`, 14, 52);
      doc.text(`Term Length: ${termMonths} months`, 14, 59);
    }
    
    // Add business forecasting section (new feature)
    try {
      const yPosition = 120; // Adjust as needed
      doc.setFontSize(14);
      doc.text('Business Performance & Cash Flow Projection', 105, yPosition, { align: 'center' });
      
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
          const monthPayment = monthlyPayment;
          const monthPrincipal = (loanAmount / termMonths);
          const monthInterest = monthPayment - monthPrincipal;
          
          yearlyPayments += monthPayment;
          yearlyPrincipal += monthPrincipal;
          yearlyInterest += monthInterest;
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
      
      try {
        if (typeof doc.autoTable !== 'function' && typeof autoTableModule.default === 'function') {
          autoTableModule.default(doc, {
            startY: yPosition + 10,
            head: [['Period', 'Cash Flow In', 'Investor Payouts', 'Net Retained', 'Retention %']],
            body: yearlyData,
            theme: 'grid',
            headStyles: { fillColor: [26, 86, 219], textColor: 255 },
            columnStyles: { 
              0: { halign: 'center' },
              1: { halign: 'right' },
              2: { halign: 'right' },
              3: { halign: 'right' },
              4: { halign: 'right' }
            }
          });
        } else {
          // @ts-ignore
          doc.autoTable({
            startY: yPosition + 10,
            head: [['Period', 'Cash Flow In', 'Investor Payouts', 'Net Retained', 'Retention %']],
            body: yearlyData,
            theme: 'grid',
            headStyles: { fillColor: [26, 86, 219], textColor: 255 },
            columnStyles: { 
              0: { halign: 'center' },
              1: { halign: 'right' },
              2: { halign: 'right' },
              3: { halign: 'right' },
              4: { halign: 'right' }
            }
          });
        }
      } catch (projectionTableError) {
        console.error("Failed to create business projection table:", projectionTableError);
        doc.text('Business projection data could not be displayed.', 14, yPosition + 15);
      }
    } catch (projectionError) {
      console.error("Failed to add business projections to report:", projectionError);
      doc.text('Business projections could not be generated.', 14, 120);
    }
    
    return doc;
  } catch (error) {
    const detailedError = createDetailedError(error, "generateProjectSummaryReport");
    console.error(detailedError);
    
    // Create emergency fallback PDF
    try {
      const errorDoc = new jsPDF();
      errorDoc.setFontSize(18);
      errorDoc.text('Error Generating Project Summary Report', 105, 20, { align: 'center' });
      errorDoc.setFontSize(10);
      errorDoc.text('An error occurred while generating the report.', 14, 35);
      errorDoc.text('Please check the console for detailed error information.', 14, 45);
      return errorDoc;
    } catch (fallbackError) {
      console.error("Even the fallback PDF failed:", fallbackError);
      throw new Error(`PDF generation failed completely: ${detailedError}`);
    }
  }
}

/**
 * Generate a loan contract PDF with enhanced error reporting
 */
export function generateLoanContract(
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date,
  monthlyPayment: number
): any {
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
    const detailedError = createDetailedError(error, "generateLoanContract");
    console.error(detailedError);
    
    // Create emergency fallback PDF
    try {
      const errorDoc = new jsPDF();
      errorDoc.setFontSize(18);
      errorDoc.text('Error Generating Loan Contract', 105, 20, { align: 'center' });
      errorDoc.setFontSize(10);
      errorDoc.text('An error occurred while generating the contract.', 14, 35);
      errorDoc.text('Please check the console for detailed error information.', 14, 45);
      return errorDoc;
    } catch (fallbackError) {
      console.error("Even the fallback PDF failed:", fallbackError);
      throw new Error(`PDF generation failed completely: ${detailedError}`);
    }
  }
}

/**
 * Generate an investor promissory note PDF with enhanced error reporting
 */
export function generateInvestorPromissoryNote(
  investor: InvestorReturn,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  endDate: Date
): any {
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
    const detailedError = createDetailedError(error, "generateInvestorPromissoryNote");
    console.error(detailedError);
    
    // Create emergency fallback PDF
    try {
      const errorDoc = new jsPDF();
      errorDoc.setFontSize(18);
      errorDoc.text('Error Generating Promissory Note', 105, 20, { align: 'center' });
      errorDoc.setFontSize(10);
      errorDoc.text('An error occurred while generating the note.', 14, 35);
      errorDoc.text('Please check the console for detailed error information.', 14, 45);
      return errorDoc;
    } catch (fallbackError) {
      console.error("Even the fallback PDF failed:", fallbackError);
      throw new Error(`PDF generation failed completely: ${detailedError}`);
    }
  }
}