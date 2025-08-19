// src/modules/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Module({
  providers: [PdfService],            // 👷 Provide the PDF service
  exports: [PdfService],              // 🔁 Export to use in other modules like Payments
})
export class PdfModule {}
