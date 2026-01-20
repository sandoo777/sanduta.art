import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  
  // Company info
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyVAT?: string;
  companyPhone?: string;
  companyEmail?: string;
  
  // Customer info
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  
  // Optional
  notes?: string;
  paymentMethod?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Invoice ${data.invoiceNumber}`,
          Author: data.companyName,
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#7C3AED'; // Purple
      const textColor = '#1F2937';
      const lightGray = '#F3F4F6';

      // Header with company info
      doc
        .fillColor(primaryColor)
        .fontSize(32)
        .font('Helvetica-Bold')
        .text(data.companyName, 50, 50);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(data.companyAddress, 50, 90)
        .text(`${data.companyCity}, ${data.companyCountry}`, 50, 105);

      if (data.companyVAT) {
        doc.text(`VAT: ${data.companyVAT}`, 50, 120);
      }
      if (data.companyPhone) {
        doc.text(`Phone: ${data.companyPhone}`, 50, 135);
      }
      if (data.companyEmail) {
        doc.text(`Email: ${data.companyEmail}`, 50, 150);
      }

      // Invoice title and number
      doc
        .fillColor(primaryColor)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('FACTURĂ / INVOICE', 350, 50, { align: 'right' });

      doc
        .fillColor(textColor)
        .fontSize(12)
        .font('Helvetica')
        .text(`#${data.invoiceNumber}`, 350, 85, { align: 'right' })
        .text(`Data: ${data.date}`, 350, 100, { align: 'right' });

      if (data.dueDate) {
        doc.text(`Scadență: ${data.dueDate}`, 350, 115, { align: 'right' });
      }

      // Customer info box
      const customerBoxTop = 200;
      doc
        .rect(50, customerBoxTop, 250, 100)
        .fillAndStroke(lightGray, textColor)
        .lineWidth(0.5);

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Facturat către:', 60, customerBoxTop + 10);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(data.customerName, 60, customerBoxTop + 30)
        .text(data.customerEmail || '', 60, customerBoxTop + 45);

      if (data.customerAddress) {
        doc.text(data.customerAddress, 60, customerBoxTop + 60);
      }
      if (data.customerCity && data.customerCountry) {
        doc.text(`${data.customerCity}, ${data.customerCountry}`, 60, customerBoxTop + 75);
      }

      // Items table
      const tableTop = 330;
      const tableHeaders = ['Descriere', 'Cantitate', 'Preț Unitar', 'Total'];
      const colPositions = [50, 320, 410, 490];

      // Table header
      doc
        .rect(50, tableTop, 495, 25)
        .fillAndStroke(primaryColor, primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(10)
        .font('Helvetica-Bold');

      tableHeaders.forEach((header, i) => {
        doc.text(header, colPositions[i], tableTop + 8, {
          width: i === 0 ? 250 : 80,
          align: i === 0 ? 'left' : 'right'
        });
      });

      // Table rows
      let currentY = tableTop + 35;
      doc.fillColor(textColor).font('Helvetica').fontSize(9);

      data.items.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, 495, 25).fill(lightGray);
        }

        doc
          .fillColor(textColor)
          .text(item.name, colPositions[0], currentY, { width: 250 })
          .text(item.quantity.toString(), colPositions[1], currentY, { width: 80, align: 'right' })
          .text(`${item.price.toFixed(2)} RON`, colPositions[2], currentY, { width: 70, align: 'right' })
          .text(`${item.total.toFixed(2)} RON`, colPositions[3], currentY, { width: 50, align: 'right' });

        currentY += 25;
      });

      // Totals
      currentY += 20;
      const totalsX = 380;

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', totalsX, currentY)
        .text(`${data.subtotal.toFixed(2)} RON`, totalsX + 100, currentY, { align: 'right' });

      currentY += 20;
      doc
        .text(`TVA (${data.taxRate}%):`, totalsX, currentY)
        .text(`${data.tax.toFixed(2)} RON`, totalsX + 100, currentY, { align: 'right' });

      currentY += 25;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text('TOTAL:', totalsX, currentY)
        .text(`${data.total.toFixed(2)} RON`, totalsX + 100, currentY, { align: 'right' });

      // Payment method
      if (data.paymentMethod) {
        currentY += 30;
        doc
          .fillColor(textColor)
          .fontSize(10)
          .font('Helvetica')
          .text(`Metodă de plată: ${data.paymentMethod}`, 50, currentY);
      }

      // Notes
      if (data.notes) {
        currentY += 30;
        doc
          .fontSize(9)
          .font('Helvetica-Oblique')
          .text(`Note: ${data.notes}`, 50, currentY, { width: 495 });
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text(
          'Mulțumim pentru comandă!',
          50,
          750,
          { align: 'center', width: 495 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper pentru conversie Buffer la Stream (util pentru download)
export function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}
