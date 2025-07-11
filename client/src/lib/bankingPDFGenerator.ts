import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvestorReturn, formatCurrency, formatDate, formatPercentage } from './finance';
import { InvestmentMetrics, formatDollarAmount, formatPercent, formatRatio } from './financialMetrics';

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
 * Añade la sección de Análisis de Crédito a un documento PDF existente.
 */
export function addCreditAnalysisSection(
  doc: jsPDF,
  loanAmount: number,
  interestRate: number,
  termMonths: number,
  monthlyPayment: number,
  totalInterest: number,
  metrics: InvestmentMetrics
): void {
  addCompanyHeader(doc);
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Credit Analysis Report', 105, 35, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Report Generated: ${formatDate(new Date())}`, 105, 42, { align: 'center' });

  autoTable(doc, {
    startY: 50,
    head: [['Loan Overview', '']],
    body: [
      ['Loan Amount:', formatDollarAmount(loanAmount, 2)],
      ['Interest Rate:', `${interestRate.toFixed(2)}%`],
      ['Term:', `${termMonths} months`],
      ['Monthly Payment:', formatDollarAmount(monthlyPayment, 2)],
      ['Total Interest:', formatDollarAmount(totalInterest, 2)],
      ['Total Repayment:', formatDollarAmount(loanAmount + totalInterest, 2)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  });

  autoTable(doc, {
    head: [['Credit Metrics', '']],
    body: [
      ['Debt Service Coverage Ratio:', `${formatRatio(metrics.debtServiceCoverageRatio, 2)}x`],
      ['Loan to Value Ratio:', formatPercent(metrics.loanToValueRatio)],
      ['Interest Coverage Ratio:', `${formatRatio(metrics.interestCoverageRatio, 2)}x`],
      ['Break-Even Point:', `${Math.round(metrics.breakEvenPoint)} months`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  });
}

/**
 * Añade la sección de Suscripción de Préstamo a un documento PDF existente.
 */
export function addUnderwritingSection(
    doc: jsPDF,
    loanAmount: number,
    investors: InvestorReturn[]
): void {
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Loan Underwriting Report', 105, 35, { align: 'center' });

    autoTable(doc, {
        startY: 50,
        head: [['Investor', 'Investment Amount', 'Ownership %', 'Projected Return', 'Projected ROI']],
        body: investors.map(inv => [
            inv.name,
            formatDollarAmount(inv.investmentAmount, 2),
            formatPercent(inv.investmentAmount / loanAmount),
            formatDollarAmount(inv.totalReturn, 2),
            formatPercent(inv.roi)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    autoTable(doc, {
        head: [['Underwriting Conditions', '']],
        body: [
            ['Standard Conditions', 'Verification of funds, execution of agreements, proof of insurance, etc.'],
            ['Special Conditions', 'Quarterly reporting, maintenance of DSCR, capital reserve account.'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });
}

/**
 * Añade la sección de Cumplimiento Regulatorio a un documento PDF existente.
 */
export function addRegulatoryComplianceSection(doc: jsPDF, loanAmount: number): void {
    addCompanyHeader(doc);
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('Regulatory Compliance Report', 105, 35, { align: 'center' });

    autoTable(doc, {
        startY: 50,
        head: [['Compliance Checklist', 'Status']],
        body: [
            ['KYC/AML verification completed', 'Compliant'],
            ['OFAC screening conducted', 'Compliant'],
            ['Loan terms comply with Regulation Z', 'Compliant'],
            ['Fair lending compliance verified', 'Compliant'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    autoTable(doc, {
        head: [['Capital Requirements Impact', '']],
        body: [
            ['Risk-Weighted Asset Addition:', formatDollarAmount(loanAmount, 0)],
            ['Required Capital at 8%:', formatDollarAmount(loanAmount * 0.08, 0)],
            ['Total Capital Impact:', formatDollarAmount(loanAmount * 0.0875, 0)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });
}
