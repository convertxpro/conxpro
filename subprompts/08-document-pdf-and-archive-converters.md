# SUB-PROMPT 08: Document, PDF & Archive Conversion Engine with High-Authority SEO

## 1. Context & Objective
Document and PDF tools (like iLovePDF and Smallpdf) are among the most heavily trafficked utility websites globally. Users demand dependable conversions between Microsoft Office documents (Word, Excel, PowerPoint) and PDF, image-to-PDF compilation, PDF page manipulation (Merge, Split, Rotate, Compress, Password Protect/Unlock), and archive handling (ZIP, 7Z, RAR).

Your objective in this prompt is to:
1. Build the Document, PDF, and Archive conversion engine utilizing `pdf-lib`, `pdfjs-dist`, headless LibreOffice / cloud fallback bridges, and Node archive streams (`archiver`, `adm-zip`).
2. Construct **Programmatic Exact-Match Landing Pages** for all major PDF tools (`/convert/pdf-to-word`, `/convert/merge-pdf`, `/convert/compress-pdf`, etc.).
3. Embed compression benchmark reference tables, step-by-step How-To instructions, and Schema.org `HowTo` + `FAQPage` structured data.
4. Highlight privacy and security trust signals (*256-bit SSL encryption*, *zero data logging*, *automatic 2-hour file purge*) to maximize organic search conversion and dwell time.

---

## 2. Technical Stack & Dependencies

- **PDF Manipulation:** `pdf-lib`, `pdfjs-dist` (for PDF rendering/page extraction)
- **Office Document Processing:** LibreOffice headless (`libreoffice-convert` / child process execution) with cloud conversion API adapter fallback
- **Archive Utilities:** `archiver`, `adm-zip`, `node-7z`
- **SEO & Structured Data:** `schema-dts`, Next.js Dynamic Metadata

Install dependencies:
```bash
npm install pdf-lib pdfjs-dist libreoffice-convert archiver adm-zip schema-dts
npm install @types/archiver @types/adm-zip --save-dev
```

---

## 3. Architecture & Conversion Adapters

```
src/lib/converters/
├── pdf/
│   ├── pdf-manipulator.ts    # Merge, Split, Rotate, Password Protect & Unlock
│   ├── pdf-to-images.ts      # Convert PDF pages to JPG / PNG
│   ├── images-to-pdf.ts      # Compile multiple JPG/PNGs into single PDF
│   └── pdf-compressor.ts     # Downscale DPI & compress PDF streams
├── office/
│   ├── libreoffice-bridge.ts # Headless LibreOffice converter (DOCX/XLSX/PPTX ↔ PDF)
│   └── cloud-fallback.ts     # Graceful fallback adapter if local LibreOffice is unavailable
└── archive/
    ├── zip-creator.ts        # Bundle multiple files into ZIP
    └── archive-extractor.ts  # Extract & inspect ZIP/7Z/TAR files
```

---

## 4. Implementation Specifications

### 4.1 Headless LibreOffice Bridge (`src/lib/converters/office/libreoffice-bridge.ts`)
Converts Office documents (`.docx`, `.xlsx`, `.pptx`, `.txt`, `.html`, `.epub`) to `.pdf` and vice versa:

```typescript
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const libreConvert = promisify(libre.convert);

export type OfficeTargetFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'html';

export async function convertOfficeDocument(
  inputBuffer: Buffer,
  targetFormat: OfficeTargetFormat
): Promise<Buffer> {
  try {
    const outputBuffer = await libreConvert(inputBuffer, `.${targetFormat}`, undefined);
    return outputBuffer;
  } catch (error) {
    console.error('Local LibreOffice conversion error, attempting fallback:', error);
    throw new Error(`Document conversion to ${targetFormat} failed. Please ensure LibreOffice is installed.`);
  }
}
```

---

### 4.2 PDF Manipulation Engine (`src/lib/converters/pdf/pdf-manipulator.ts`)

1. **Merge PDFs:** Combine an array of uploaded PDF buffers in sequential order into a single unified PDF document.
2. **Split PDF:** Extract specific page numbers (e.g. `1, 3-5, 8`) or split all pages into separate downloadable PDFs bundled as a ZIP.
3. **Rotate PDF:** Rotate selected or all pages by 90°, 180°, or 270° clockwise.
4. **Password Protect PDF:** Encrypt PDF with user-supplied password using 128-bit / 256-bit AES encryption.
5. **Unlock PDF:** Decrypt password-protected PDF when user provides valid password.

#### Merge PDFs Blueprint (`pdf-manipulator.ts`):
```typescript
import { PDFDocument, degrees } from 'pdf-lib';

export async function mergePdfBuffers(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const srcPdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes);
}

export async function rotatePdfPages(pdfBuffer: Buffer, rotationAngle: 90 | 180 | 270): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
  });
  return Buffer.from(await pdfDoc.save());
}
```

---

## 5. Programmatic PDF Landing Pages & Technical SEO Features

### 5.1 Programmatic Document Tool URLs
- `/convert/pdf-to-word`, `/convert/word-to-pdf`
- `/convert/pdf-to-excel`, `/convert/excel-to-pdf`
- `/convert/pdf-to-powerpoint`, `/convert/powerpoint-to-pdf`
- `/convert/jpg-to-pdf`, `/convert/pdf-to-jpg`
- `/convert/merge-pdf`, `/convert/split-pdf`, `/convert/compress-pdf`, `/convert/rotate-pdf`
- `/convert/protect-pdf`, `/convert/unlock-pdf`
- `/convert/create-zip`, `/convert/extract-zip`

### 5.2 PDF Compression Benchmark Reference Table
Every PDF compressor page renders a technical benchmark table:

| Compression Level | Estimated Size Reduction | Text Clarity | Image DPI | Best Use Case |
|---|---|---|---|---|
| **Extreme Compression** | Up to 80% reduction | Clear | 72 DPI | Email attachments, Discord uploads |
| **Recommended Compression** | 50–65% reduction | Sharp | 150 DPI | Web sharing, job applications |
| **Less Compression** | 20–30% reduction | High definition | 300 DPI | High quality printing, archival |

### 5.3 Google FAQ Schema
- *"How do I convert PDF to editable Word document without losing formatting?"*
- *"Is it safe to upload confidential legal documents to ConvertHub?"*
- *"How many PDF files can I merge together for free?"*

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] Office documents (DOCX/XLSX/PPTX) successfully convert to PDF with formatting intact.
- [ ] Merge PDF accurately concatenates multiple PDF files into one.
- [ ] Split PDF cleanly extracts specified page ranges.
- [ ] Rotate PDF correctly alters orientation across 90°, 180°, and 270°.
- [ ] All PDF tools render with `<ToolLayout />` and include compression reference tables and FAQ accordions.
- [ ] Valid `HowTo`, `SoftwareApplication`, and `FAQPage` JSON-LD structured data is injected on all routes.
- [ ] Auto-purge cron guarantees deleted temporary files after 2 hours.
