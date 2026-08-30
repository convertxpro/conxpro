# SUB-PROMPT 02: Developer & Data Converters — YAML, JSON, TOML & SQL Suite

## 1. Context & Objective
Developer conversion utilities command massive organic search volume and high engagement from software engineers, DevOps specialists, and data analysts. These tools must run **100% client-side** with zero latency, complete privacy, syntax validation markers, indentation customization, and sample presets.

Your objective in this sub-prompt is to build:
1. **Tool A1: YAML ↔ JSON ↔ TOML Multi-Converter** (`yaml-to-json`, `json-to-yaml`, `toml-to-json`, `yaml-to-toml`).
2. **Tool A2: SQL Query ↔ JSON / CSV Converter** (`sql-to-json`, `json-to-sql`, `csv-to-sql`).
3. Dedicated interactive components under `src/components/converters/dev/` wired to `ConverterCanvas.tsx`.
4. High-ranking programmatic SEO pages with schema markup and developer FAQ items.

---

## 2. Technical Stack & Dependencies

- **YAML Parsing & Serialization:** `js-yaml` + `@types/js-yaml`
- **TOML Parsing & Serialization:** `@iarna/toml` or `smol-toml`
- **CSV & Data Manipulation:** `papaparse` + `@types/papaparse`
- **SQL Parser & Formatter:** `sql-formatter` and client-side SQL generator utilities

Install dependencies:
```bash
npm install js-yaml smol-toml papaparse sql-formatter
npm install @types/js-yaml @types/papaparse --save-dev
```

---

## 3. Tool A1: YAML ↔ JSON ↔ TOML Multi-Converter

### 3.1 Converter Engine (`src/lib/converters/dev/structured-data.ts`)
```typescript
import yaml from 'js-yaml';
import * as toml from 'smol-toml';

export type SupportedFormat = 'yaml' | 'json' | 'toml';

export interface ConvertOptions {
  indent: number;
  sortKeys: boolean;
  minifyJson?: boolean;
}

export function detectFormat(input: string): SupportedFormat {
  const trimmed = input.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return 'json';
  }
  // Check TOML key-value pairs or table syntax
  if (/^\s*\[[a-zA-Z0-9_.-]+\]\s*$/m.test(trimmed) || /^[a-zA-Z0-9_-]+\s*=\s*.+$/m.test(trimmed)) {
    try {
      toml.parse(trimmed);
      return 'toml';
    } catch {
      // Fallback
    }
  }
  return 'yaml';
}

export function convertStructuredData(
  input: string,
  fromFormat: SupportedFormat,
  toFormat: SupportedFormat,
  options: ConvertOptions = { indent: 2, sortKeys: false }
): { output: string; error?: string } {
  if (!input.trim()) return { output: '' };

  try {
    // 1. Parse input into native JS Object
    let parsed: any;
    if (fromFormat === 'json') {
      parsed = JSON.parse(input);
    } else if (fromFormat === 'yaml') {
      parsed = yaml.load(input);
    } else if (fromFormat === 'toml') {
      parsed = toml.parse(input);
    }

    if (parsed === undefined || parsed === null) {
      return { output: '', error: 'Input parsed as empty or null' };
    }

    // 2. Sort keys if requested
    if (options.sortKeys && typeof parsed === 'object' && !Array.isArray(parsed)) {
      parsed = sortObjectKeys(parsed);
    }

    // 3. Serialize to target format
    let output = '';
    if (toFormat === 'json') {
      output = options.minifyJson
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, options.indent);
    } else if (toFormat === 'yaml') {
      output = yaml.dump(parsed, {
        indent: options.indent,
        sortKeys: options.sortKeys,
        noRefs: true,
      });
    } else if (toFormat === 'toml') {
      if (Array.isArray(parsed)) {
        throw new Error('TOML root element must be a table (key-value map), not an array.');
      }
      output = toml.stringify(parsed);
    }

    return { output };
  } catch (err: any) {
    return { output: '', error: err.message || 'Syntax parsing error' };
  }
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {});
  }
  return obj;
}
```

### 3.2 UI Component (`src/components/converters/dev/StructuredDataConverter.tsx`)
- **Features:**
  - Dual Monaco/textarea view with synchronized line numbers.
  - Mode switcher dropdown: `YAML -> JSON`, `JSON -> YAML`, `TOML -> JSON`, `YAML -> TOML`, `JSON -> TOML`.
  - Preset loader buttons: "Sample Kubernetes Deployment YAML", "Sample Docker Compose", "Sample Cargo.toml", "Sample package.json".
  - Quick action toolbar: "Minify JSON", "Beautify (2 Spaces)", "Sort Object Keys", "Copy Result", "Download Output File".
  - Real-time syntax error bar with specific line & column diagnostics.

---

## 4. Tool A2: SQL Query ↔ JSON / CSV Converter

### 4.1 SQL Generator & Parser Engine (`src/lib/converters/dev/sql-converter.ts`)
```typescript
import Papa from 'papaparse';
import { format as formatSql } from 'sql-formatter';

export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver';

export interface JsonToSqlOptions {
  tableName: string;
  dialect: SqlDialect;
  batchSize: number;
  insertOrReplace?: boolean;
}

export function jsonToSqlInsert(jsonString: string, options: JsonToSqlOptions): { sql: string; error?: string } {
  try {
    const rawData = JSON.parse(jsonString);
    const records = Array.isArray(rawData) ? rawData : [rawData];
    if (records.length === 0) return { sql: '', error: 'JSON array is empty' };

    // Extract all unique columns
    const columns = Array.from(new Set(records.flatMap(r => Object.keys(r))));
    const quoteChar = options.dialect === 'mysql' ? '`' : '"';
    const escapedTable = `${quoteChar}${options.tableName || 'data_table'}${quoteChar}`;
    const escapedCols = columns.map(c => `${quoteChar}${c}${quoteChar}`).join(', ');

    const statements: string[] = [];
    
    // Chunking into batches
    const batchSize = Math.max(1, options.batchSize || 500);
    for (let i = 0; i < records.length; i += batchSize) {
      const chunk = records.slice(i, i + batchSize);
      const valuesRows = chunk.map(row => {
        const rowValues = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return Number.isFinite(val) ? val.toString() : 'NULL';
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `(${rowValues.join(', ')})`;
      });

      const statement = `INSERT INTO ${escapedTable} (${escapedCols})\nVALUES\n  ${valuesRows.join(',\n  ')};`;
      statements.push(statement);
    }

    const unformatted = statements.join('\n\n');
    return { sql: unformatted };
  } catch (err: any) {
    return { sql: '', error: err.message || 'Invalid JSON input' };
  }
}

export function sqlInsertToJson(sqlString: string): { json: string; csv: string; error?: string } {
  try {
    // Regex parsing for standard INSERT INTO statements
    const match = sqlString.match(/INSERT\s+INTO\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?);/i);
    if (!match) {
      return { json: '', csv: '', error: 'Could not detect standard INSERT INTO statement' };
    }

    const rawCols = match[2].split(',').map(c => c.replace(/[`"\s]/g, ''));
    const rawValuesBlock = match[3].trim();

    // Parse value tuples (val1, val2), (val3, val4)
    const tupleRegex = /\(([^)]+)\)/g;
    let tupleMatch;
    const records: any[] = [];

    while ((tupleMatch = tupleRegex.exec(rawValuesBlock)) !== null) {
      const rawVals = tupleMatch[1].split(/,(?=(?:(?:[^']*'){2})*[^']*$)/).map(v => {
        let val = v.trim();
        if (val.toUpperCase() === 'NULL') return null;
        if (val.toUpperCase() === 'TRUE') return true;
        if (val.toUpperCase() === 'FALSE') return false;
        if (/^'[\s\S]*'$/.test(val)) return val.slice(1, -1).replace(/''/g, "'");
        if (!isNaN(Number(val))) return Number(val);
        return val;
      });

      const row: Record<string, any> = {};
      rawCols.forEach((col, idx) => {
        row[col] = rawVals[idx] !== undefined ? rawVals[idx] : null;
      });
      records.push(row);
    }

    return {
      json: JSON.stringify(records, null, 2),
      csv: Papa.unparse(records),
    };
  } catch (err: any) {
    return { json: '', csv: '', error: err.message || 'Failed to parse SQL' };
  }
}
```

### 4.2 UI Component (`src/components/converters/dev/SqlDataConverter.tsx`)
- **Features:**
  - Tab Switcher: "JSON/CSV to SQL INSERT" | "SQL INSERT to JSON/CSV".
  - Config parameters: Table Name, Dialect selection (PostgreSQL, MySQL, SQLite, MS SQL Server), Batch Size (100, 500, 1000 rows).
  - Presets: "Sample Users Table JSON (5 rows)", "Sample E-commerce Orders SQL".
  - Live CSV export and JSON file download.

---

## 5. Programmatic SEO & Structured Data

Add FAQ schemas and exact-match content in `src/lib/seo/faqData.ts`:
- *"How to convert YAML to JSON in browser without uploading sensitive keys?"*
- *"How to generate bulk SQL INSERT statements from a JSON array for Postgres or MySQL?"*
- *"Can I convert Cargo.toml or pyproject.toml to JSON?"*

Embed `SoftwareApplication` and `HowTo` JSON-LD schemas on `/convert/developer/yaml-to-json` and `/convert/developer/sql-to-json`.

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] YAML ↔ JSON ↔ TOML converter parses valid syntax accurately and reports line/column errors for invalid inputs.
- [ ] Sort keys, minification, and indentation customization work smoothly across all formats.
- [ ] JSON to SQL properly handles single quotes escape (`''`), NULL values, numbers, and boolean types.
- [ ] Batch chunking generates clean partitioned `INSERT INTO` statements for MySQL and Postgres dialects.
- [ ] 100% client-side computation with zero server requests.
