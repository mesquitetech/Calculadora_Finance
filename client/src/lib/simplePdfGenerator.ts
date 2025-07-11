import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentScheduleEntry, InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';

/**
 * Agrega un encabezado estándar de la compañía a los documentos PDF.
 */
function addCompanyHeader(doc: jsPDF): void {
  doc.setFontSize(16);
  doc.setTextColor(26, 86, 219); // Color Azul
  doc.setFont("helvetica", "bold");
  doc.text('MESQUITE FINANCIAL', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100); // Color Gris
  doc.setFont("helvetica", "normal");
  doc.text('Leasing and Financial Unit', 105, 22, { align: 'center' });
}

/**
 * Genera un reporte de resumen del proyecto en PDF.
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
    addCompanyHeader(doc);

    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Project Summary Report', 105, 35, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 42, { align: 'center' });

    autoTable(doc, {
      startY: 50,
      head: [['Project Overview', 'Details']],
      body: [
        ['Loan Amount:', formatCurrency(loanAmount)],
        ['Interest Rate:', `${interestRate.toFixed(2)}%`],
        ['Term Length:', `${termMonths} months`],
        ['Monthly Payment:', formatCurrency(monthlyPayment)],
        ['Total Interest:', formatCurrency(totalInterest)],
        ['Total Payments:', formatCurrency(loanAmount + totalInterest)],
        ['Start Date:', formatDate(startDate)],
        ['Maturity Date:', formatDate(endDate)],
        ['Number of Investors:', `${investors.length}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });

    if (investors.length > 0) {
      autoTable(doc, {
        head: [['Investor', 'Investment', 'Share', 'Total Return', 'ROI']],
        body: investors.map(inv => [
          inv.name,
          formatCurrency(inv.investmentAmount),
          formatPercentage(inv.share * 100),
          formatCurrency(inv.totalReturn),
          `${inv.roi.toFixed(2)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, finalY + 15, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating project summary report:", error);
    const errorDoc = new jsPDF();
    addCompanyHeader(errorDoc);
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Project Summary Report', 105, 35, { align: 'center' });
    if (error instanceof Error) {
      errorDoc.text(`Error: ${error.message}`, 14, 70);
    }
    return errorDoc;
  }
}

/**
 * Genera un reporte de calendario de pagos en PDF.
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
    const doc = new jsPDF();
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.text('Payment Schedule Report', 105, 35, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 42, { align: 'center' });

    autoTable(doc, {
        startY: 50,
        head: [['Loan Details', '']],
        body: [
            ['Loan Amount:', formatCurrency(loanAmount)],
            ['Interest Rate:', `${interestRate.toFixed(2)}%`],
            ['Term Length:', `${termMonths} months`],
            ['Monthly Payment:', formatCurrency(monthlyPayment)],
            ['Total Interest:', formatCurrency(totalInterest)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });

    autoTable(doc, {
        head: [['#', 'Date', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: paymentSchedule.map(p => [
            p.paymentNumber,
            formatDate(new Date(p.date)),
            formatCurrency(Number(p.amount)),
            formatCurrency(Number(p.principal)),
            formatCurrency(Number(p.interest)),
            formatCurrency(Number(p.balance))
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, finalY + 15, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating payment report:", error);
    const errorDoc = new jsPDF();
    addCompanyHeader(errorDoc);
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Payment Report', 105, 35, { align: 'center' });
    if (error instanceof Error) {
        errorDoc.text(`Error: ${error.message}`, 14, 70);
    }
    return errorDoc;
  }
}

/**
 * Genera un reporte de retorno de inversión para un inversor específico.
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
    const doc = new jsPDF();
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.text('Investor Return Report', 105, 35, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`For: ${investor.name}`, 105, 42, { align: 'center' });

    autoTable(doc, {
        startY: 50,
        head: [['Investment Details', '']],
        body: [
            ['Investment Amount:', formatCurrency(investor.investmentAmount)],
            ['Investment Share:', formatPercentage(investor.share * 100)],
            ['Total Expected Return:', formatCurrency(investor.totalReturn)],
            ['Total Interest Earned:', formatCurrency(investor.totalInterest)],
            ['Projected ROI:', `${investor.roi.toFixed(2)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });

    autoTable(doc, {
        head: [['Month #', 'Return Amount']],
        body: investor.monthlyReturns.map((monthlyReturn, index) => [
            index + 1,
            formatCurrency(monthlyReturn)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This is a projection and actual results may vary.', 105, finalY + 15, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating investor report:", error);
    const errorDoc = new jsPDF();
    addCompanyHeader(errorDoc);
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Investor Report', 105, 35, { align: 'center' });
    if (error instanceof Error) {
        errorDoc.text(`Error: ${error.message}`, 14, 70);
    }
    return errorDoc;
  }
}

/**
 * Genera un contrato de préstamo en PDF.
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
    const doc = new jsPDF();
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.text('Loan Agreement', 105, 35, { align: 'center' });
    const contractNumber = `LOAN-${Date.now().toString().substring(4)}`;
    doc.setFontSize(10);
    doc.text(`Contract #: ${contractNumber}`, 105, 42, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 48, { align: 'center' });

    let yPosition = 60;
    doc.setFontSize(12);
    doc.text('1. Loan Terms', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`- Principal Amount: ${formatCurrency(loanAmount)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Interest Rate: ${interestRate.toFixed(2)}% per annum`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Loan Term: ${termMonths} months from ${formatDate(startDate)} to ${formatDate(endDate)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Monthly Payment: ${formatCurrency(monthlyPayment)}`, 14, yPosition);
    yPosition += 12;

    doc.setFontSize(12);
    doc.text('2. Agreement Clauses', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text('The Borrower agrees to repay the Principal Amount plus Interest in monthly installments as specified above, with the first payment due one month from the loan date. The Borrower may prepay the loan in whole or in part without penalty. If the Borrower fails to make any payment within 10 days of the due date, the loan will be considered in default, and the entire unpaid balance may become immediately due.', 14, yPosition, { maxWidth: 180 });
    yPosition += 40;

    doc.text('Lender Signature: ________________________', 14, yPosition);
    yPosition += 20;
    doc.text('Borrower Signature: ________________________', 14, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a legal document. Please consult with legal counsel before signing.', 105, 280, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating loan contract:", error);
    const errorDoc = new jsPDF();
    addCompanyHeader(errorDoc);
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Loan Contract', 105, 35, { align: 'center' });
    if (error instanceof Error) {
        errorDoc.text(`Error: ${error.message}`, 14, 70);
    }
    return errorDoc;
  }
}

/**
 * Genera un pagaré para un inversor específico.
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
    const doc = new jsPDF();
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.text('Promissory Note', 105, 35, { align: 'center' });
    const noteNumber = `NOTE-${Date.now().toString().substring(4)}-${investor.investorId}`;
    doc.setFontSize(10);
    doc.text(`Note #: ${noteNumber}`, 105, 42, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date())}`, 105, 48, { align: 'center' });

    let yPosition = 60;
    doc.setFontSize(12);
    doc.text('1. Investment Terms', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`- Investor: ${investor.name}`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Investment Amount: ${formatCurrency(investor.investmentAmount)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Investment Share: ${formatPercentage(investor.share * 100)}`, 14, yPosition);
    yPosition += 7;
    doc.text(`- Expected Return: ${formatCurrency(investor.totalReturn)}`, 14, yPosition);
    yPosition += 12;

    doc.setFontSize(12);
    doc.text('2. Promissory Note Terms', 14, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text('The Issuer agrees to pay the Investor the returns on investment as calculated based on the payment schedule of the borrower and the investment share percentage. The Investor acknowledges that this investment carries risk, and returns are dependent on the borrower making timely payments on the underlying loan.', 14, yPosition, { maxWidth: 180 });
    yPosition += 40;

    doc.text('Issuer Signature: ________________________', 14, yPosition);
    yPosition += 20;
    doc.text('Investor Signature: ________________________', 14, yPosition);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a legal document. Please consult with legal counsel before signing.', 105, 280, { align: 'center' });

    return doc;
  } catch (error) {
    console.error("Error generating promissory note:", error);
    const errorDoc = new jsPDF();
    addCompanyHeader(errorDoc);
    errorDoc.setFontSize(18);
    errorDoc.text('Error Generating Promissory Note', 105, 35, { align: 'center' });
    if (error instanceof Error) {
        errorDoc.text(`Error: ${error.message}`, 14, 70);
    }
    return errorDoc;
  }
}
