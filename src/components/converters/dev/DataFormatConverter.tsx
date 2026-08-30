'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

type DataFormat = 'csv' | 'json' | 'xml';

const SAMPLE_CSV = `id,name,role,department,salary
101,Ayesha Khan,Lead Engineer,Engineering,95000
102,Bilal Ahmed,Product Designer,Design,82000
103,Zainab Tariq,Data Scientist,Analytics,91000
104,Hamza Ali,DevOps Architect,Infrastructure,98000`;

export const DataFormatConverter: React.FC = () => {
  const [fromFormat, setFromFormat] = useState<DataFormat>('csv');
  const [toFormat, setToFormat] = useState<DataFormat>('json');
  const [inputText, setInputText] = useState<string>(SAMPLE_CSV);
  const [delimiter, setDelimiter] = useState<string>('auto');
  const [copied, setCopied] = useState<boolean>(false);

  // Auto detect delimiter
  const detectedDelimiter = useMemo(() => {
    if (delimiter !== 'auto') return delimiter;
    const firstLine = inputText.split('\n')[0] || '';
    if (firstLine.includes('\t')) return '\t';
    if (firstLine.includes(';')) return ';';
    if (firstLine.includes('|')) return '|';
    return ',';
  }, [delimiter, inputText]);

  // Robust CSV parser
  const parseCSV = (csv: string, delim: string): any[] => {
    const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Parse header row
    const headers = lines[0].split(delim).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(delim).map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        let val = values[idx] ?? '';
        // Try parsing number or boolean
        if (val !== '' && !isNaN(Number(val))) {
          obj[header] = Number(val);
        } else if (val.toLowerCase() === 'true') {
          obj[header] = true;
        } else if (val.toLowerCase() === 'false') {
          obj[header] = false;
        } else {
          obj[header] = val;
        }
      });
      results.push(obj);
    }
    return results;
  };

  // Convert JSON to CSV
  const jsonToCSV = (data: any, delim: string): string => {
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return '';

    // Collect all unique keys
    const keys = Array.from(
      new Set(
        arr.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : ['value']))
      )
    );

    const headerRow = keys.join(delim);
    const rows = arr.map((item) => {
      if (typeof item !== 'object' || item === null) return String(item);
      return keys
        .map((k) => {
          let val = item[k] ?? '';
          if (typeof val === 'object') val = JSON.stringify(val);
          const strVal = String(val);
          if (strVal.includes(delim) || strVal.includes('"') || strVal.includes('\n')) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        })
        .join(delim);
    });

    return [headerRow, ...rows].join('\n');
  };

  // Convert JSON/Obj to clean XML
  const jsonToXML = (data: any, rootName: string = 'root', itemName: string = 'item'): string => {
    const escapeXml = (unsafe: any) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const toXmlRecursive = (obj: any, tag: string, indent: string = '  '): string => {
      if (Array.isArray(obj)) {
        return obj.map((it) => toXmlRecursive(it, itemName, indent)).join('\n');
      }
      if (typeof obj === 'object' && obj !== null) {
        const children = Object.entries(obj)
          .map(([k, v]) => `${indent}  ${toXmlRecursive(v, k.replace(/[^a-zA-Z0-9_-]/g, '_'), indent + '  ')}`)
          .join('\n');
        return `${indent}<${tag}>\n${children}\n${indent}</${tag}>`;
      }
      return `<${tag}>${escapeXml(obj)}</${tag}>`;
    };

    if (Array.isArray(data)) {
      const items = data.map((it) => toXmlRecursive(it, itemName, '  ')).join('\n');
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${items}\n</${rootName}>`;
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>\n${toXmlRecursive(data, rootName, '')}`;
    }
  };

  // Basic XML Parser to JSON
  const xmlToJSON = (xmlStr: string): any => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error(parseError[0].textContent || 'Invalid XML structure');
    }

    const nodeToJson = (node: Element): any => {
      const children = Array.from(node.children);
      if (children.length === 0) {
        const text = node.textContent?.trim() ?? '';
        if (text !== '' && !isNaN(Number(text))) return Number(text);
        if (text.toLowerCase() === 'true') return true;
        if (text.toLowerCase() === 'false') return false;
        return text;
      }

      // Check if all children have same tag name (list)
      const firstChildTag = children[0].tagName;
      const isList = children.length > 1 && children.every((c) => c.tagName === firstChildTag);

      if (isList) {
        return children.map((c) => nodeToJson(c));
      }

      const obj: Record<string, any> = {};
      children.forEach((child) => {
        const name = child.tagName;
        if (obj[name]) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(nodeToJson(child));
        } else {
          obj[name] = nodeToJson(child);
        }
      });
      return obj;
    };

    const root = xmlDoc.documentElement;
    const res = nodeToJson(root);
    return Array.isArray(res) ? res : { [root.tagName]: res };
  };

  // Convert pipeline
  const conversionResult = useMemo(() => {
    if (!inputText.trim()) return { success: true, output: '', error: null };

    try {
      let intermediateJSON: any = null;

      // 1. Parse Input to Intermediate JSON
      if (fromFormat === 'csv') {
        intermediateJSON = parseCSV(inputText, detectedDelimiter);
      } else if (fromFormat === 'json') {
        intermediateJSON = JSON.parse(inputText);
      } else if (fromFormat === 'xml') {
        intermediateJSON = xmlToJSON(inputText);
      }

      // 2. Format Intermediate JSON to Target Format
      let finalOutput = '';
      if (toFormat === 'json') {
        finalOutput = JSON.stringify(intermediateJSON, null, 2);
      } else if (toFormat === 'csv') {
        finalOutput = jsonToCSV(intermediateJSON, detectedDelimiter);
      } else if (toFormat === 'xml') {
        finalOutput = jsonToXML(intermediateJSON);
      }

      return { success: true, output: finalOutput, error: null };
    } catch (err: any) {
      return { success: false, output: '', error: err.message || 'Conversion failed' };
    }
  }, [inputText, fromFormat, toFormat, detectedDelimiter]);

  // Swap formats
  const handleSwap = () => {
    const nextFrom = toFormat;
    const nextTo = fromFormat;
    setFromFormat(nextFrom);
    setToFormat(nextTo);
    if (conversionResult.success && conversionResult.output) {
      setInputText(conversionResult.output);
    }
  };

  // Copy output
  const handleCopy = () => {
    if (!conversionResult.output) return;
    navigator.clipboard.writeText(conversionResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download
  const handleDownload = () => {
    if (!conversionResult.output) return;
    const extensions: Record<DataFormat, string> = { csv: 'csv', json: 'json', xml: 'xml' };
    const mimeTypes: Record<DataFormat, string> = {
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
    };
    const blob = new Blob([conversionResult.output], { type: mimeTypes[toFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${extensions[toFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Format Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">From:</span>
            <select
              value={fromFormat}
              onChange={(e) => setFromFormat(e.target.value as DataFormat)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            title="Swap input and output format"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">To:</span>
            <select
              value={toFormat}
              onChange={(e) => setToFormat(e.target.value as DataFormat)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
          </div>
        </div>

        {/* Delimiter Selector for CSV */}
        {(fromFormat === 'csv' || toFormat === 'csv') && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="auto">Auto-Detect</option>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="	">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        )}
      </div>

      {/* Dual Column Editor & Output */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span>Input ({fromFormat.toUpperCase()})</span>
            <span className="text-[11px] font-normal text-slate-400">
              {inputText.length} chars
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste raw ${fromFormat.toUpperCase()} here...`}
            rows={12}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Output Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span>Converted Output ({toFormat.toUpperCase()})</span>
            <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400">
              {conversionResult.success ? 'Real-time updated' : 'Error'}
            </span>
          </div>
          <textarea
            readOnly
            value={
              conversionResult.success
                ? conversionResult.output
                : `Error: ${conversionResult.error}`
            }
            placeholder="Converted output will appear here..."
            rows={12}
            className={`w-full rounded-2xl border p-4 font-mono text-xs shadow-xs focus:outline-none ${
              conversionResult.success
                ? 'border-indigo-200 bg-indigo-50/40 text-slate-900 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-200'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <span className="text-xs text-slate-400">
          🔒 100% Client-Side Processing • No data leaves your browser
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            disabled={!conversionResult.success || !conversionResult.output}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download {toFormat.toUpperCase()}
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={handleCopy}
            disabled={!conversionResult.success || !conversionResult.output}
            leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? 'Copied!' : `Copy ${toFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
