import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class PdfService {
  async generateReceipt(payment: Payment): Promise<Buffer> {
    try {
      const content = `Receipt for Payment ID: ${payment.id}\nAmount: ${payment.amount}\nDate: ${payment.createdAt}`;
      return await this.createPdf('Payment Receipt', content);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate receipt.');
    }
  }

  async createPdf(title: string, content: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      page.drawText(title, {
        x: 50,
        y: height - 80,
        size: 24,
        font: helveticaFont,
        color: rgb(0, 0, 0.8),
      });

      page.drawText(content, {
        x: 50,
        y: height - 120,
        size: 14,
        font: helveticaFont,
        color: rgb(0, 0, 0),
        maxWidth: width - 100,
      });

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new InternalServerErrorException(`Failed to create PDF: ${err.message}`);
    }
  }
}
