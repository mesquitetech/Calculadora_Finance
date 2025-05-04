import jsPDF from 'jspdf';
import { PaymentScheduleEntry, InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';

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
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Schedule Report', 105, 15, { align: 'center' });
    
    // Add report date
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add loan details section
    doc.setFontSize(14);
    doc.text('Loan Details', 14, 30);
    
    // Create loan details section
    doc.setFontSize(10);
    doc.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 14, 38);
    doc.text(`Interest Rate: ${interestRate.toFixed(2)}%`, 14, 46);
    doc.text(`Term Length: ${termMonths} months`, 14, 54);
    doc.text(`Monthly Payment: ${formatCurrency(monthlyPayment)}`, 14, 62);
    doc.text(`Total Interest: ${formatCurrency(totalInterest)}`, 14, 70);
    doc.text(`Total Payments: ${formatCurrency(loanAmount + totalInterest)}`, 14, 78);
    doc.text(`Start Date: ${formatDate(startDate)}`, 14, 86);
    doc.text(`Maturity Date: ${formatDate(endDate)}`, 14, 94);
    
    // Add business projections section
    doc.setFontSize(14);
    doc.text('Business Performance Projections', 105, 110, { align: 'center' });
    
    // Calculate some projection metrics
    const totalPayments = monthlyPayment * termMonths;
    const roi = (totalInterest / loanAmount) * 100;
    const annualizedReturn = roi / (termMonths / 12);
    
    doc.setFontSize(10);
    doc.text(`Annual Return Rate: ${annualizedReturn.toFixed(2)}%`, 14, 120);
    doc.text(`Return on Investment: ${roi.toFixed(2)}%`, 14, 128);
    doc.text(`Total Payments Over Term: ${formatCurrency(totalPayments)}`, 14, 136);
    
    // Add quarterly projection section
    doc.setFontSize(12);
    doc.text('Quarterly Projections', 14, 150);
    
    // Headers for the table
    doc.setFontSize(8);
    doc.text('Quarter', 20, 158);
    doc.text('Principal Paid', 60, 158);
    doc.text('Interest Paid', 100, 158);
    doc.text('Remaining Balance', 140, 158);
    
    // Draw a line under the headers
    doc.setDrawColor(0);
    doc.line(20, 160, 190, 160);
    
    // Calculate and display quarterly data
    const quarters = Math.min(Math.ceil(termMonths / 3), 4); // Limit to 4 quarters for space
    let yPosition = 168;
    
    for (let i = 0; i < quarters; i++) {
      const quarterNumber = i + 1;
      const startMonth = i * 3;
      const endMonth = Math.min(startMonth + 2, termMonths - 1);
      
      if (startMonth >= paymentSchedule.length) break;
      
      const quarterPayments = paymentSchedule.slice(startMonth, endMonth + 1);
      const totalPrincipal = quarterPayments.reduce((sum, payment) => sum + payment.principal, 0);
      const totalInterestPaid = quarterPayments.reduce((sum, payment) => sum + payment.interest, 0);
      const endBalance = quarterPayments[quarterPayments.length - 1].balance;
      
      doc.text(`Q${quarterNumber}`, 20, yPosition);
      doc.text(formatCurrency(totalPrincipal), 60, yPosition);
      doc.text(formatCurrency(totalInterestPaid), 100, yPosition);
      doc.text(formatCurrency(endBalance), 140, yPosition);
      
      yPosition += 8;
    }
    
    // Add a note at the bottom
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, 280, { align: 'center' });
    
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
    doc.setTextColor(0, 0, 0);
    doc.text('Investor Return Report', 105, 15, { align: 'center' });
    
    // Add report date and investor name
    doc.setFontSize(12);
    doc.text(`Investor: ${investor.name}`, 14, 25);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add investment details section
    doc.setFontSize(14);
    doc.text('Investment Details', 14, 35);
    
    // Create investment details section
    doc.setFontSize(10);
    doc.text(`Investment Amount: ${formatCurrency(investor.investmentAmount)}`, 14, 45);
    doc.text(`Investment Share: ${formatPercentage(investor.share * 100)}`, 14, 53);
    doc.text(`Total Return: ${formatCurrency(investor.totalReturn)}`, 14, 61);
    doc.text(`Total Interest Earned: ${formatCurrency(investor.totalInterest)}`, 14, 69);
    doc.text(`Return on Investment: ${investor.roi.toFixed(2)}%`, 14, 77);
    
    // Add investor performance projections section
    doc.setFontSize(14);
    doc.text('Investor Performance Projections', 105, 95, { align: 'center' });
    
    // Headers for the table
    doc.setFontSize(8);
    doc.text('Quarter', 20, 105);
    doc.text('Return', 60, 105);
    doc.text('Cumulative', 100, 105);
    doc.text('Quarterly ROI', 140, 105);
    
    // Draw a line under the headers
    doc.setDrawColor(0);
    doc.line(20, 107, 190, 107);
    
    // Calculate and display quarterly projection data
    const quarters = Math.min(Math.ceil(termMonths / 3), 4); // Limit to 4 quarters for space
    let yPosition = 115;
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
      const quarterlyRoi = (quarterlyReturn / investor.investmentAmount) * 100;
      
      doc.text(`Q${quarterNumber}`, 20, yPosition);
      doc.text(formatCurrency(quarterlyReturn), 60, yPosition);
      doc.text(formatCurrency(cumulativeReturn), 100, yPosition);
      doc.text(`${quarterlyRoi.toFixed(2)}%`, 140, yPosition);
      
      yPosition += 8;
    }
    
    // Add a note at the bottom
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, 280, { align: 'center' });
    
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
    doc.setTextColor(0, 0, 0);
    doc.text('Project Summary Report', 105, 15, { align: 'center' });
    
    // Add report date
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 22, { align: 'center' });
    
    // Add project overview section
    doc.setFontSize(14);
    doc.text('Project Overview', 14, 35);
    
    // Create project overview section
    doc.setFontSize(10);
    doc.text(`Loan Amount: ${formatCurrency(loanAmount)}`, 14, 45);
    doc.text(`Interest Rate: ${interestRate.toFixed(2)}%`, 14, 53);
    doc.text(`Term Length: ${termMonths} months`, 14, 61);
    doc.text(`Monthly Payment: ${formatCurrency(monthlyPayment)}`, 14, 69);
    doc.text(`Total Interest: ${formatCurrency(totalInterest)}`, 14, 77);
    doc.text(`Total Payments: ${formatCurrency(loanAmount + totalInterest)}`, 14, 85);
    doc.text(`Start Date: ${formatDate(startDate)}`, 14, 93);
    doc.text(`Maturity Date: ${formatDate(endDate)}`, 14, 101);
    doc.text(`Number of Investors: ${investors.length}`, 14, 109);
    
    // Add investors summary section if there are investors
    if (investors.length > 0) {
      doc.setFontSize(14);
      doc.text('Investors Summary', 14, 125);
      
      // Header for investors table
      doc.setFontSize(8);
      doc.text('Investor', 15, 135);
      doc.text('Investment', 50, 135);
      doc.text('Share', 85, 135);
      doc.text('Return', 120, 135);
      doc.text('ROI', 155, 135);
      
      // Draw a line under the headers
      doc.setDrawColor(0);
      doc.line(15, 137, 180, 137);
      
      // Display investors data
      let yPosition = 145;
      
      for (const inv of investors) {
        doc.text(inv.name, 15, yPosition);
        doc.text(formatCurrency(inv.investmentAmount), 50, yPosition);
        doc.text(formatPercentage(inv.share * 100), 85, yPosition);
        doc.text(formatCurrency(inv.totalReturn), 120, yPosition);
        doc.text(`${inv.roi.toFixed(2)}%`, 155, yPosition);
        
        yPosition += 8;
        
        // Add a page break if needed
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      }
      
      // Add business cash flow projection section
      doc.setFontSize(14);
      doc.text('Business Cash Flow Projection', 105, yPosition + 15, { align: 'center' });
      
      // Header for cash flow table
      doc.setFontSize(8);
      yPosition += 25;
      doc.text('Period', 15, yPosition);
      doc.text('Cash Flow In', 50, yPosition);
      doc.text('Investor Payouts', 85, yPosition);
      doc.text('Net Retained', 120, yPosition);
      doc.text('Retention %', 155, yPosition);
      
      // Draw a line under the headers
      doc.line(15, yPosition + 2, 180, yPosition + 2);
      
      // Calculate yearly projections
      const years = Math.min(Math.ceil(termMonths / 12), 3); // Limit to 3 years for space
      yPosition += 10;
      
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
        const retentionPercentage = (retainedEarnings / yearlyPayments) * 100;
        
        doc.text(`Year ${yearNumber}`, 15, yPosition);
        doc.text(formatCurrency(yearlyPayments), 50, yPosition);
        doc.text(formatCurrency(investorDistributions), 85, yPosition);
        doc.text(formatCurrency(retainedEarnings), 120, yPosition);
        doc.text(`${retentionPercentage.toFixed(1)}%`, 155, yPosition);
        
        yPosition += 8;
      }
    }
    
    // Add a note at the bottom
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, 280, { align: 'center' });
    
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
    doc.setTextColor(0, 0, 0);
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
    
    // Add agreement clauses
    doc.setFontSize(12);
    doc.text('Agreement Clauses', 14, 90);
    
    doc.setFontSize(10);
    doc.text('1. Parties:', 14, 100);
    doc.text('This agreement is made between the Lender and the Borrower as specified above.', 25, 107);
    
    doc.text('2. Repayment:', 14, 120);
    doc.text('The Borrower agrees to repay the Principal Amount plus Interest in monthly installments', 25, 127);
    doc.text('as specified above, with the first payment due one month from the loan date.', 25, 134);
    
    doc.text('3. Prepayment:', 14, 147);
    doc.text('The Borrower may prepay the loan in whole or in part without penalty.', 25, 154);
    
    doc.text('4. Default:', 14, 167);
    doc.text('If the Borrower fails to make any payment within 10 days of the due date, the loan will be', 25, 174);
    doc.text('considered in default, and the entire unpaid balance may become immediately due.', 25, 181);
    
    // Signature lines
    doc.setFontSize(10);
    doc.text('Lender Signature: ________________________', 14, 230);
    doc.text('Borrower Signature: ________________________', 14, 250);
    
    // Add a note at the bottom
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a legal document. Please consult with legal counsel before signing.', 105, 280, { align: 'center' });
    
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
    doc.setTextColor(0, 0, 0);
    doc.text('Promissory Note', 105, 15, { align: 'center' });
    
    // Generate a note number
    const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
    doc.setFontSize(10);
    doc.text(`Note #: ${noteNumber}`, 105, 22, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 28, { align: 'center' });
    
    // Add investor details
    doc.setFontSize(12);
    doc.text('Investment Terms', 14, 40);
    doc.setFontSize(10);
    doc.text(`Investor: ${investor.name}`, 14, 50);
    doc.text(`Investment Amount: ${formatCurrency(investor.investmentAmount)}`, 14, 57);
    doc.text(`Investment Share: ${formatPercentage(investor.share * 100)}`, 14, 64);
    doc.text(`Expected Return: ${formatCurrency(investor.totalReturn)}`, 14, 71);
    doc.text(`Expected ROI: ${investor.roi.toFixed(2)}%`, 14, 78);
    doc.text(`Investment Term: ${termMonths} months from ${formatDate(startDate)} to ${formatDate(endDate)}`, 14, 85);
    
    // Add promissory note clauses
    doc.setFontSize(12);
    doc.text('Promissory Note Terms', 14, 105);
    
    doc.setFontSize(10);
    doc.text('1. Parties:', 14, 115);
    doc.text(`This promissory note is issued to ${investor.name} (the "Investor") for the benefit of the`, 25, 122);
    doc.text('investment in the financing project described herein.', 25, 129);
    
    doc.text('2. Payment:', 14, 142);
    doc.text('The Issuer agrees to pay the Investor the returns on investment as calculated based on', 25, 149);
    doc.text('the payment schedule of the borrower and the investment share percentage.', 25, 156);
    
    doc.text('3. Risk Acknowledgment:', 14, 169);
    doc.text('The Investor acknowledges that this investment carries risk, and returns are dependent', 25, 176);
    doc.text('on the borrower making timely payments on the underlying loan.', 25, 183);
    
    doc.text('4. Assignment:', 14, 196);
    doc.text('This promissory note may not be assigned or transferred without written consent.', 25, 203);
    
    // Signature lines
    doc.setFontSize(10);
    doc.text('Issuer Signature: ________________________', 14, 230);
    doc.text('Investor Signature: ________________________', 14, 250);
    
    // Add a note at the bottom
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a legal document. Please consult with legal counsel before signing.', 105, 280, { align: 'center' });
    
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