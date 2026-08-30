import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import * as toml from 'smol-toml';

export type SupportedFormat = 'yaml' | 'json' | 'toml';

export interface ConvertOptions {
  indent: number;
  sortKeys: boolean;
  minifyJson?: boolean;
}

export interface StructuredConversionResult {
  output: string;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
  parsedObject?: any;
}

/**
 * Intelligent automatic format detector based on input heuristics
 */
export function detectFormat(input: string): SupportedFormat {
  const trimmed = input.trim();
  if (!trimmed) return 'json';

  // 1. Check JSON: starts with { or [ and ends with } or ]
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Continue to check other formats
    }
  }

  // 2. Check TOML: key-value assignment or table headers [section]
  if (/^\s*\[[a-zA-Z0-9_.-]+\]\s*$/m.test(trimmed) || /^[a-zA-Z0-9_-]+\s*=\s*.+$/m.test(trimmed)) {
    try {
      toml.parse(trimmed);
      return 'toml';
    } catch {
      // Fallback
    }
  }

  // 3. Fallback to YAML
  return 'yaml';
}

/**
 * Recursive object key sorter for consistent serialization
 */
export function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce((result: Record<string, any>, key: string) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

/**
 * Converts structured data between YAML, JSON, and TOML with full error diagnostics
 */
export function convertStructuredData(
  input: string,
  fromFormat: SupportedFormat,
  toFormat: SupportedFormat,
  options: ConvertOptions = { indent: 2, sortKeys: false }
): StructuredConversionResult {
  if (!input.trim()) {
    return { output: '' };
  }

  try {
    // Step 1: Parse input string into JavaScript object
    let parsed: any;

    if (fromFormat === 'json') {
      parsed = JSON.parse(input);
    } else if (fromFormat === 'yaml') {
      parsed = yamlLoad(input, { json: true });
    } else if (fromFormat === 'toml') {
      parsed = toml.parse(input);
    }

    if (parsed === undefined || parsed === null) {
      return { output: '', error: 'Input parsed as empty or null' };
    }

    // Step 2: Sort keys if option is active
    if (options.sortKeys && typeof parsed === 'object') {
      parsed = sortObjectKeys(parsed);
    }

    // Step 3: Serialize to target format
    let output = '';

    if (toFormat === 'json') {
      output = options.minifyJson
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, options.indent);
    } else if (toFormat === 'yaml') {
      output = yamlDump(parsed, {
        indent: options.indent,
        sortKeys: options.sortKeys,
        noRefs: true,
        lineWidth: 120,
      });
    } else if (toFormat === 'toml') {
      if (Array.isArray(parsed)) {
        throw new Error('TOML root element must be a table (key-value object), not a top-level array. Wrap your array in an object key.');
      }
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('TOML root element must be a table (key-value object).');
      }
      output = toml.stringify(parsed);
    }

    return { output, parsedObject: parsed };
  } catch (err: any) {
    let errorMsg = err.message || 'Syntax parsing error';
    let errorLine: number | undefined;
    let errorColumn: number | undefined;

    // Extract line/column information from parser errors
    if (err.mark) {
      // js-yaml YAMLException mark
      errorLine = err.mark.line + 1;
      errorColumn = err.mark.column + 1;
    } else if (err.line !== undefined) {
      errorLine = err.line;
      errorColumn = err.column;
    } else {
      const match = errorMsg.match(/line (\d+) column (\d+)/i) || errorMsg.match(/position (\d+)/i);
      if (match && match[1] && match[2]) {
        errorLine = parseInt(match[1], 10);
        errorColumn = parseInt(match[2], 10);
      }
    }

    return {
      output: '',
      error: errorMsg,
      errorLine,
      errorColumn,
    };
  }
}
