import Papa from 'papaparse';
import { format as formatSql } from 'sql-formatter';

export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver';

export interface JsonToSqlOptions {
  tableName: string;
  dialect: SqlDialect;
  batchSize: number;
  insertOrReplace?: boolean;
  includeCreateTable?: boolean;
  formatOutput?: boolean;
}

export interface SqlConversionResult {
  sql: string;
  createTableSql?: string;
  rowCount?: number;
  columnCount?: number;
  error?: string;
}

export interface SqlParseResult {
  json: string;
  csv: string;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  error?: string;
}

/**
 * Escapes identifier names based on SQL dialect
 */
export function escapeIdentifier(identifier: string, dialect: SqlDialect): string {
  const clean = identifier.replace(/[`"\[\]]/g, '');
  switch (dialect) {
    case 'mysql':
      return `\`${clean}\``;
    case 'sqlserver':
      return `[${clean}]`;
    case 'postgresql':
    case 'sqlite':
    default:
      return `"${clean}"`;
  }
}

/**
 * Infers SQL column data type for CREATE TABLE statement
 */
function inferSqlType(values: any[], dialect: SqlDialect): string {
  const nonNulls = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (nonNulls.length === 0) return 'VARCHAR(255)';

  const allNumbers = nonNulls.every((v) => typeof v === 'number' || (!isNaN(Number(v)) && typeof v !== 'boolean'));
  if (allNumbers) {
    const allInts = nonNulls.every((v) => Number.isInteger(typeof v === 'number' ? v : Number(v)));
    if (allInts) return dialect === 'postgresql' ? 'INTEGER' : dialect === 'sqlite' ? 'INTEGER' : 'INT';
    return dialect === 'postgresql' ? 'NUMERIC(15,2)' : dialect === 'mysql' ? 'DECIMAL(15,2)' : 'REAL';
  }

  const allBooleans = nonNulls.every((v) => typeof v === 'boolean' || v === 'true' || v === 'false');
  if (allBooleans) {
    if (dialect === 'sqlserver') return 'BIT';
    if (dialect === 'sqlite') return 'INTEGER';
    return 'BOOLEAN';
  }

  // Check if objects or JSON
  const hasObjects = nonNulls.some((v) => typeof v === 'object');
  if (hasObjects) {
    if (dialect === 'postgresql') return 'JSONB';
    if (dialect === 'mysql') return 'JSON';
    return 'TEXT';
  }

  // Check strings length
  const maxLen = Math.max(...nonNulls.map((v) => String(v).length));
  if (maxLen > 255) return 'TEXT';
  return `VARCHAR(${Math.max(64, Math.ceil(maxLen / 32) * 32)})`;
}

/**
 * Converts a JSON string or array of objects into SQL INSERT statements with dialect customization
 */
export function jsonToSqlInsert(jsonString: string, options: JsonToSqlOptions): SqlConversionResult {
  try {
    if (!jsonString.trim()) {
      return { sql: '', error: 'Input is empty' };
    }

    const rawData = JSON.parse(jsonString);
    const records: Record<string, any>[] = Array.isArray(rawData) ? rawData : [rawData];

    if (records.length === 0 || typeof records[0] !== 'object' || records[0] === null) {
      return { sql: '', error: 'JSON must be a non-empty array of objects or a single JSON object' };
    }

    // Extract all distinct column keys across all objects
    const columns = Array.from(new Set(records.flatMap((r) => (r && typeof r === 'object' ? Object.keys(r) : []))));
    if (columns.length === 0) {
      return { sql: '', error: 'No properties found in JSON objects' };
    }

    const tableName = options.tableName.trim() || 'data_records';
    const escapedTable = escapeIdentifier(tableName, options.dialect);
    const escapedCols = columns.map((c) => escapeIdentifier(c, options.dialect)).join(', ');

    // Optional CREATE TABLE generation
    let createTableSql = '';
    if (options.includeCreateTable) {
      const colDefs = columns.map((col) => {
        const colValues = records.map((r) => r[col]);
        const type = inferSqlType(colValues, options.dialect);
        return `  ${escapeIdentifier(col, options.dialect)} ${type}`;
      });

      createTableSql = `CREATE TABLE IF NOT EXISTS ${escapedTable} (\n${colDefs.join(',\n')}\n);`;
    }

    const statements: string[] = [];
    const batchSize = Math.max(1, Math.min(10000, options.batchSize || 500));

    // Determine insert verb based on replace option and dialect
    let insertVerb = 'INSERT INTO';
    if (options.insertOrReplace) {
      if (options.dialect === 'mysql' || options.dialect === 'sqlite') {
        insertVerb = 'INSERT OR REPLACE INTO';
      }
    }

    for (let i = 0; i < records.length; i += batchSize) {
      const chunk = records.slice(i, i + batchSize);
      const valuesRows = chunk.map((row) => {
        const rowValues = columns.map((col) => {
          const val = row ? row[col] : null;
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') {
            return Number.isFinite(val) ? val.toString() : 'NULL';
          }
          if (typeof val === 'boolean') {
            if (options.dialect === 'sqlserver') return val ? '1' : '0';
            return val ? 'TRUE' : 'FALSE';
          }
          if (typeof val === 'object') {
            return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          }
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `(${rowValues.join(', ')})`;
      });

      const statement = `${insertVerb} ${escapedTable} (${escapedCols})\nVALUES\n  ${valuesRows.join(',\n  ')};`;
      statements.push(statement);
    }

    let finalSql = statements.join('\n\n');
    if (createTableSql) {
      finalSql = `${createTableSql}\n\n${finalSql}`;
    }

    if (options.formatOutput) {
      try {
        finalSql = formatSql(finalSql, {
          language: options.dialect === 'sqlserver' ? 'tsql' : options.dialect,
          keywordCase: 'upper',
          indentStyle: 'standard',
        });
      } catch {
        // Fallback to unformatted if formatter fails on complex bulk inserts
      }
    }

    return {
      sql: finalSql,
      createTableSql,
      rowCount: records.length,
      columnCount: columns.length,
    };
  } catch (err: any) {
    return { sql: '', error: err.message || 'Invalid JSON syntax' };
  }
}

/**
 * Converts CSV string into SQL INSERT statements
 */
export function csvToSqlInsert(csvString: string, options: JsonToSqlOptions): SqlConversionResult {
  try {
    if (!csvString.trim()) {
      return { sql: '', error: 'CSV input is empty' };
    }

    const parsed = Papa.parse<Record<string, any>>(csvString, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
      return { sql: '', error: parsed.errors[0].message };
    }

    const jsonStr = JSON.stringify(parsed.data);
    return jsonToSqlInsert(jsonStr, options);
  } catch (err: any) {
    return { sql: '', error: err.message || 'Failed to parse CSV' };
  }
}

/**
 * Parses SQL INSERT statements into structured JSON arrays and CSV tables
 */
export function sqlInsertToJson(sqlString: string): SqlParseResult {
  try {
    if (!sqlString.trim()) {
      return { json: '', csv: '', error: 'SQL input is empty' };
    }

    // Remove single line comments -- and block comments /* */
    const cleanedSql = sqlString
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();

    // Match all INSERT INTO statements: INSERT INTO [table] ([cols]) VALUES ([values]), ([values]);
    const insertRegex = /INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+[`"\[]?(\w+)[`"\]]?\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+?)(?:;|$)/gi;
    let match: RegExpExecArray | null;
    const allRecords: Record<string, any>[] = [];
    let detectedCols: string[] = [];

    while ((match = insertRegex.exec(cleanedSql)) !== null) {
      const rawColsPart = match[2];
      const rawValuesBlock = match[3].trim();

      let cols: string[] = [];
      if (rawColsPart) {
        cols = rawColsPart.split(',').map((c) => c.replace(/[`"\[\]\s]/g, ''));
        if (detectedCols.length === 0) detectedCols = cols;
      }

      // Parse individual tuple rows: (val1, val2, ...), (val3, val4, ...)
      // Split values block by matching balanced parentheses
      const tupleRegex = /\(([^)]+)\)/g;
      let tupleMatch: RegExpExecArray | null;

      while ((tupleMatch = tupleRegex.exec(rawValuesBlock)) !== null) {
        // Split tuple items respecting quoted string literals with commas inside
        const rawVals = tupleMatch[1]
          .split(/,(?=(?:(?:[^']*'){2})*[^']*$)/)
          .map((v) => {
            const val = v.trim();
            if (val.toUpperCase() === 'NULL') return null;
            if (val.toUpperCase() === 'TRUE') return true;
            if (val.toUpperCase() === 'FALSE') return false;
            // Quoted string: unwrap and unescape single quotes '' -> '
            if (/^'[\s\S]*'$/.test(val)) {
              return val.slice(1, -1).replace(/''/g, "'");
            }
            if (!isNaN(Number(val)) && val !== '') {
              return Number(val);
            }
            return val;
          });

        // If no explicit column names were in the INSERT statement, generate default col1, col2, etc.
        const rowCols = cols.length > 0 ? cols : rawVals.map((_, idx) => `col_${idx + 1}`);
        if (detectedCols.length === 0) detectedCols = rowCols;

        const row: Record<string, any> = {};
        rowCols.forEach((col, idx) => {
          row[col] = rawVals[idx] !== undefined ? rawVals[idx] : null;
        });

        allRecords.push(row);
      }
    }

    if (allRecords.length === 0) {
      return {
        json: '',
        csv: '',
        error: 'Could not find valid standard "INSERT INTO table (cols) VALUES (...)" statements in input.',
      };
    }

    const jsonOutput = JSON.stringify(allRecords, null, 2);
    const csvOutput = Papa.unparse(allRecords);

    return {
      json: jsonOutput,
      csv: csvOutput,
      rowCount: allRecords.length,
      columnCount: detectedCols.length,
      columns: detectedCols,
    };
  } catch (err: any) {
    return { json: '', csv: '', error: err.message || 'Failed to parse SQL statements' };
  }
}
