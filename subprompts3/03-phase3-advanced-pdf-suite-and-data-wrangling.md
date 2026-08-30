# SUB-PROMPT 03: Advanced PDF Power Suite & Data Wrangling (Phase 3)

## 1. Context & Objective
This sub-prompt guides the complete implementation of **Phase 3** from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md).
This phase upgrades ConvertHub’s PDF and document capabilities into a professional browser-based document workstation using `pdf-lib`, `pdfjs-dist`, `@hello-pangea/dnd`, and `papaparse`.

---

## 2. Tools in Scope

1. **Tool 3.1: Visual PDF Page Organizer (`organize-pdf`)**
   - Interactive drag-and-drop page thumbnail grid using `@hello-pangea/dnd`.
   - Actions per page: Rotate 90° CW/CCW, Duplicate, Delete (with undo), and Insert Blank Page.
   - Selective page extraction into a brand-new PDF.
   - Client-side compilation and immediate download using `pdf-lib`.
2. **Tool 3.2: PDF Redaction & Privacy Blackout Tool (`redact-pdf`)**
   - Visual rectangle blackout tool on rendered PDF canvas.
   - Redaction styles: Solid Black Box, Whiteout Mask, or "REDACTED" stamped label.
   - Flattens the canvas to eliminate underlying text layers and strips document metadata (Author, Producer, Creation Date) for guaranteed privacy.
3. **Tool 3.3: Digital PDF Signer & Stamp Applier (`sign-pdf`)**
   - 3 Signature input modes:
     1. **Draw:** Touch/mouse signature pad with stroke thickness & color.
     2. **Type:** Type name with cursive typography fonts (Great Vibes, Dancing Script, Sacramento).
     3. **Upload:** Upload PNG signature with background cleanup.
   - Draggable & resizable signature placement on any page with optional timestamp verification stamp.
4. **Tool 3.4: CSV & Excel Deduplicator, Filter & Chunk Splitter (`csv-deduplicator-splitter`)**
   - In-browser parsing of large CSV/XLSX files (tested up to 500,000+ rows).
   - Mode A: **Deduplication:** Match by specific primary key columns or entire rows, with choice of retention strategy (keep first, keep last, remove all duplicates).
   - Mode B: **Chunk Splitter:** Split large datasets into chunks by row count (e.g. 5,000 rows/file) or file size (10MB/file), packaged into a single ZIP.

---

## 3. Metadata Registration (`src/config/categories.ts`)

Add the following tool metadata entries under `document` and `developer` categories:

```typescript
// Add to document & developer categories in src/config/categories.ts:
{
  id: 'organize-pdf',
  name: 'Visual PDF Page Organizer',
  slug: 'organize-pdf',
  categorySlug: 'document',
  categoryName: 'Document & PDF Converters',
  description: 'Rearrange, rotate, delete, duplicate, and extract PDF pages visually with drag-and-drop thumbnail previews 100% in your browser.',
  iconName: 'LayoutGrid',
  popular: true,
  badge: 'Drag & Drop',
},
{
  id: 'redact-pdf',
  name: 'PDF Redaction & Blackout Tool',
  slug: 'redact-pdf',
  categorySlug: 'document',
  categoryName: 'Document & PDF Converters',
  description: 'Permanently blackout sensitive text, CNIC numbers, signatures, and private data from PDF documents with text flattening.',
  iconName: 'ShieldAlert',
  popular: true,
  badge: '100% Secure',
},
{
  id: 'sign-pdf',
  name: 'Digital PDF Signer & Stamp',
  slug: 'sign-pdf',
  categorySlug: 'document',
  categoryName: 'Document & PDF Converters',
  description: 'Draw, type, or upload digital signatures and place verifiable stamps onto PDF contracts and forms in seconds.',
  iconName: 'PenTool',
  popular: true,
},
{
  id: 'csv-deduplicator-splitter',
  name: 'CSV & Excel Deduplicator & Splitter',
  slug: 'csv-deduplicator-splitter',
  categorySlug: 'developer',
  categoryName: 'Developer & Data Utilities',
  description: 'Remove duplicate rows from massive CSV/Excel sheets and split large files into smaller chunks with zero server uploads.',
  iconName: 'FileSpreadsheet',
  popular: true,
},
```

---

## 4. Component Construction Plan

### 4.1 Visual PDF Page Organizer (`src/components/converters/pdf/PdfOrganizerComponent.tsx`)
- Render all PDF pages into canvas thumbnails using `pdfjs-dist`:
  ```typescript
  import * as pdfjsLib from 'pdfjs-dist';
  import { PDFDocument, degrees } from 'pdf-lib';
  ```
- Grid layout with `@hello-pangea/dnd` (`DragDropContext`, `Droppable`, `Draggable`).
- Per-thumbnail controls:
  - Rotate button: updates local rotation angle state (`(angle + 90) % 360`).
  - Delete button: moves page to deleted set with toast notification "Page deleted (Undo)".
  - Duplicate button: inserts duplicate page index into current sequence.
- Save logic: reconstructs new `PDFDocument` with `copyPages` in target order and applies rotations, then triggers `pdfDoc.save()`.

### 4.2 PDF Redaction Tool (`src/components/converters/pdf/PdfRedactionComponent.tsx`)
- Interactive canvas overlay allowing users to click and drag to draw redaction rectangles.
- Style controls: Solid Black, Whiteout, or Redaction Box with customizable text label ("CONFIDENTIAL", "REDACTED").
- Flattening logic: rasterize redacted canvas pages back into the PDF using `pdf-lib` to ensure underlying searchable text is completely obliterated (preventing copy/paste extraction).
- Metadata cleaner: `pdfDoc.setTitle('')`, `pdfDoc.setAuthor('')`, `pdfDoc.setProducer('')`.

### 4.3 PDF Signer & Stamp Applier (`src/components/converters/pdf/PdfSignerComponent.tsx`)
- Tabbed Signature Creator:
  - **Draw Tab:** Canvas signature pad with line thickness (1px, 2px, 4px) and ink color (Blue, Black).
  - **Type Tab:** Text input with cursive font selection (`font-serif italic`, `cursive`).
  - **Upload Tab:** File picker for transparent PNG signatures.
- Draggable signature overlay on active page canvas with resize handles and rotation.
- Stamp option: "Signed on YYYY-MM-DD HH:mm:ss UTC via ConvertHub".
- Merge signature image into target page coordinates using `pdf-lib`'s `embedPng` and `drawImage`.

### 4.4 CSV & Excel Deduplicator & Splitter (`src/components/converters/dev/CsvDeduplicatorComponent.tsx`)
- Streaming parser using `papaparse` for high-performance in-browser handling.
- Column header selector checkboxes for multi-column deduplication (e.g. `[x] Email`, `[x] Phone`).
- Deduplication statistics badge: `Total Rows: X`, `Duplicates Removed: Y`, `Clean Rows: Z`.
- Splitter controls: "Split by Row Count (e.g. 10,000 rows/file)" or "Split by Size (e.g. 5 MB/file)".
- ZIP file generation using `adm-zip` or `jszip` containing all split chunks.

---

## 5. Canvas Integration & Routing (`src/components/converters/ConverterCanvas.tsx`)

Map the new slugs to their respective components:
```typescript
case 'organize-pdf':
  return <PdfOrganizerComponent tool={tool} />;
case 'redact-pdf':
  return <PdfRedactionComponent tool={tool} />;
case 'sign-pdf':
  return <PdfSignerComponent tool={tool} />;
case 'csv-deduplicator-splitter':
  return <CsvDeduplicatorComponent tool={tool} />;
```

---

## 6. Verification & Quality Checklist

- [ ] PDF Organizer supports reordering 20+ page PDF files smoothly via drag and drop and exports the reordered file accurately.
- [ ] PDF Redactor flattens blacked-out areas so that underlying text cannot be selected or extracted.
- [ ] PDF Signer places crisp signatures onto designated page coordinates with accurate scaling.
- [ ] CSV Deduplicator cleans a 50,000-row test dataset in under 2 seconds and generates a valid downloadable CSV.
- [ ] Run `npm run lint` and verify 0 TypeScript/ESLint errors.
- [ ] Run `npm run build` and ensure static generation compiles without errors.
