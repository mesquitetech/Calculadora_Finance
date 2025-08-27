
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './finance';

// Define AutoTableStatic interface
interface AutoTableStatic {
  previous?: {
    finalY: number;
  };
}

// Define jsPDF type with proper structure
type ExtendedJsPDF = jsPDF & {
  autoTable: AutoTableStatic & ((options: any) => jsPDF);
};

// Helper function to safely get final Y position
function getLastTableEndY(doc: ExtendedJsPDF): number {
  return doc.autoTable.previous?.finalY || 60;
}

export interface CustomerQuoteData {
  loanName: string;
  assetCost: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
}

export const generateCustomerQuote = (quoteData: CustomerQuoteData): jsPDF => {
  try {
    const doc = new jsPDF() as ExtendedJsPDF;
    
    // Add company header
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.setFont("helvetica", "bold");
    doc.text('MESQUITE FINANCIAL', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text('Leasing and Financial Services', 105, 28, { align: 'center' });
    
    // Quote title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('FINANCING QUOTE', 105, 45, { align: 'center' });
    
    // Quote information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Quote Generated: ${formatDate(new Date())}`, 105, 55, { align: 'center' });
    
    // Client Information Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Client Information', 14, 70);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Project Name: ${quoteData.loanName}`, 14, 80);
    
    // Asset and Financing Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Asset and Financing Details', 14, 95);
    
    // Create financing details table
    doc.autoTable({
      startY: 105,
      head: [['Concept', 'Amount']],
      body: [
        ['Asset Cost', formatCurrency(quoteData.assetCost)],
        ['Down Payment', formatCurrency(quoteData.downPayment)],
        ['Financed Amount', formatCurrency(quoteData.loanAmount)],
        ['Annual Interest Rate', `${quoteData.interestRate.toFixed(2)}%`],
        ['Term', `${quoteData.termMonths} months`],
        ['Start Date', formatDate(quoteData.startDate)],
        ['Maturity Date', formatDate(quoteData.endDate)]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70, halign: 'right' }
      }
    });
    
    // Payment Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Payment Information', 14, getLastTableEndY(doc) + 15);
    
    // Create payment details table
    doc.autoTable({
      startY: getLastTableEndY(doc) + 25,
      head: [['Payment Details', 'Amount']],
      body: [
        ['Monthly Payment', formatCurrency(quoteData.monthlyPayment)],
        ['Total Interest', formatCurrency(quoteData.totalInterest)],
        ['Total Amount to Pay', formatCurrency(quoteData.totalAmount)]
      ],
      theme: 'striped',
      headStyles: { 
        fillColor: [22, 160, 133], 
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: { 
        0: { cellWidth: 80 },
        1: { cellWidth: 70, halign: 'right' }
      }
    });
    
    // Terms and Conditions
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Terms and Conditions', 14, getLastTableEndY(doc) + 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const terms = [
      '• This quote is valid for 30 days from the date of issue.',
      '• Interest rate is subject to credit approval and may vary.',
      '• All payments must be made on the due date to avoid late fees.',
      '• Early payment options are available without penalties.',
      '• This quote does not constitute a commitment to lend.',
      '• Final terms may vary based on credit evaluation and documentation.'
    ];
    
    let yPosition = getLastTableEndY(doc) + 30;
    terms.forEach(term => {
      doc.text(term, 14, yPosition, { maxWidth: 180 });
      yPosition += 7;
    });
    
    // Contact Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('Contact Information', 14, yPosition + 10);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('MESQUITE FINANCIAL', 14, yPosition + 20);
    doc.text('Email: info@mesquitefinancial.com', 14, yPosition + 27);
    doc.text('Phone: +1 (555) 123-4567', 14, yPosition + 34);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'This document is computer-generated and does not require a signature.',
      105,
      doc.internal.pageSize.height - 20,
      { align: 'center' }
    );
    
    doc.text(
      `© ${new Date().getFullYear()} Mesquite Financial. All rights reserved.`,
      105,
      doc.internal.pageSize.height - 12,
      { align: 'center' }
    );
    
    return doc;
  } catch (error) {
    console.error("Error generating customer quote:", error);
    throw error;
  }
};
