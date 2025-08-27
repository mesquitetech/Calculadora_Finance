/**
 * Generador de PDF de Cotización de Arrendamiento
 * Replica exactamente el formato del PDF de ejemplo ABCLEASING202585849530.pdf
 */

import jsPDF from 'jspdf';
import { LeasingModels } from './leasingCalculations';

export function generateLeasingQuotePDF(models: LeasingModels): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Configurar fuentes
  doc.setFont('helvetica');
  
  // Datos del modelo para fácil acceso
  const { pdfData } = models;
  const inputs = pdfData.inputs;
  const currentDate = new Date();
  
  // ===== HEADER =====
  // Título principal (derecha)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Cotización de Arrendamiento', pageWidth - 15, 20, { align: 'right' });
  
  // Folio
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio: ${inputs.folio}`, pageWidth - 15, 30, { align: 'right' });
  
  // Fecha y lugar
  const dateString = currentDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`${inputs.city} a ${dateString.replace(' de ', '/')}`, pageWidth - 15, 40, { align: 'right' });
  
  // ===== INFORMACIÓN DEL CLIENTE Y VEHÍCULO =====
  let yPos = 60;
  
  // Cliente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nombre del Cliente: ${inputs.clientName}`, 15, yPos);
  
  // Información del vehículo (derecha)
  doc.setFont('helvetica', 'bold');
  doc.text(inputs.vehicleInfo, pageWidth - 15, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Promotor: ${inputs.promoter}`, 15, yPos);
  
  yPos += 8;
  doc.text(`Teléfono: ${inputs.phone}`, 15, yPos);
  
  // Valor del vehículo (derecha)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(inputs.assetValue), pageWidth - 15, yPos, { align: 'right' });
  
  // Plazo en meses (derecha)
  yPos += 15;
  doc.setFontSize(12);
  doc.text(`${inputs.termMonths} Meses`, pageWidth - 15, yPos, { align: 'right' });
  
  // ===== CONCEPTOS FINANCIADOS =====
  yPos += 25;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Conceptos Financiados (incluye IVA)', 15, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Tabla de conceptos financiados
  const conceptosData = [
    ['Valor de la Unidad', formatCurrency(inputs.assetValue)],
    ['(-menos) Anticipo', formatCurrency(inputs.downPayment)],
    ['Monto Total Financiado', formatCurrency(pdfData.financedAmount)]
  ];
  
  conceptosData.forEach(([concept, amount]) => {
    doc.text(concept, 20, yPos);
    doc.text(amount, pageWidth - 15, yPos, { align: 'right' });
    yPos += 12;
  });
  
  // ===== PAGO INICIAL =====
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Pago Inicial', 15, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Calcular valores del pago inicial
  const anticipoSinIVA = inputs.downPayment / 1.16; // Descontar IVA para mostrar base
  
  const pagoInicialData = [
    ['Anticipo', formatCurrency(anticipoSinIVA)],
    ['Seguro primer año', formatCurrency(inputs.firstYearInsurance)],
    ['Comisión por apertura', formatCurrency(inputs.openingCommission)],
    ['Subtotal Pago inicial', formatCurrency(pdfData.initialPaymentSubtotal)],
    ['Impuesto al Valor Agregado', formatCurrency(pdfData.initialPaymentTax)],
    ['Total Pago Inicial', formatCurrency(pdfData.initialPaymentTotal)]
  ];
  
  pagoInicialData.forEach(([concept, amount], index) => {
    // Negrita para el total
    if (index === pagoInicialData.length - 1) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(concept, 20, yPos);
    doc.text(amount, pageWidth - 15, yPos, { align: 'right' });
    yPos += 12;
  });
  
  // ===== RENTA MENSUAL =====
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Renta Mensual (no incluye IVA)', 15, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const rentaMensualData = [
    ['Renta básica', formatCurrency(pdfData.monthlyRentBasic)],
    ['Gastos administración', formatCurrency(pdfData.monthlyRentAdmin)],
    ['Total Pago Mensual', formatCurrency(pdfData.monthlyRentTotal)]
  ];
  
  rentaMensualData.forEach(([concept, amount], index) => {
    // Negrita para el total
    if (index === rentaMensualData.length - 1) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(concept, 20, yPos);
    doc.text(amount, pageWidth - 15, yPos, { align: 'right' });
    yPos += 12;
  });
  
  // ===== VALOR RESIDUAL =====
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Residual (no incluye IVA)', 15, yPos);
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Valor Residual', 20, yPos);
  doc.text(formatCurrency(pdfData.residualValue), pageWidth - 15, yPos, { align: 'right' });
  
  // ===== TÉRMINOS Y CONDICIONES =====
  yPos += 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const terminos = [
    `1. La presente cotización estará vigente hasta el ${getValidityDate(currentDate)}`,
    '2. El pago inicial no incluye impuestos locales como tenencia, costo de placas y gastos de gestoría, los importes originados por estos conceptos serán cargados',
    'a la cuenta domiciliada una vez que se hayan realizado los trámites correspondientes.',
    '3. Recuerde que, en automóviles utilitarios el límite de deducibilidad mensual establecido por la Ley de Impuesto Sobre la Renta es de $6,000.00 mensuales',
    '(sin incluir IVA ni gastos de arrendamiento). Este límite no aplica para vehículos de trabajo tales como pickups y camiones de carga ligera.',
    '4. Cualquier cambio respecto a las condiciones establecidas dentro del proceso de aprobación de crédito correspondiente invalida la presente propuesta, misma que',
    'únicamente será posible ejercer durante su vigencia.',
    '5. Nota importante: Bajo la opción de pago de la prima de seguro anual de contado, es posible que las anualidades siguientes puedan sufrir incrementos,',
    'dependiendo de la siniestralidad del vehículo o por cambios en las políticas de precio de la aseguradora, por lo que bajo esta modalidad se acepta',
    'que dicha prima pudiera incrementarse en las anualidades subsecuentes.',
    '6. El límite de kilometraje es de manera anual, si el usuario excede la cantidad de kilómetros establecidos, no existirá ningún costo siempre y cuando',
    'se pague el valor residual, de lo contrario cada KM extra tendrá un costo.',
    '7. Esta cotización está sujeta a cambios sin previo aviso hasta la aceptación y firma del contrato.'
  ];
  
  let lineHeight = 10;
  terminos.forEach((termino) => {
    const splitText = doc.splitTextToSize(termino, pageWidth - 30);
    splitText.forEach((line: string) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 15, yPos);
      yPos += lineHeight;
    });
  });
  
  // ===== FOOTER =====
  yPos += 10;
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const footerInfo = [
    'Calle 56-B No. 452 x 11 y 13',
    'Colonia Itzimná',
    'Mérida, Yucatán C.P. 97100',
    '(999) 940 6778, (999) 940 6779'
  ];
  
  footerInfo.forEach((info) => {
    doc.text(info, 15, yPos);
    yPos += 12;
  });
  
  return doc;
}

// ===== FUNCIONES AUXILIARES =====

function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getValidityDate(currentDate: Date): string {
  const validityDate = new Date(currentDate);
  validityDate.setDate(validityDate.getDate() + 30); // 30 días de vigencia
  
  return validityDate.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Función principal para exportar el PDF
 */
export function exportLeasingQuotePDF(models: LeasingModels, filename?: string): void {
  const doc = generateLeasingQuotePDF(models);
  const defaultFilename = `cotizacion_${models.pdfData.inputs.folio}.pdf`;
  doc.save(filename || defaultFilename);
}