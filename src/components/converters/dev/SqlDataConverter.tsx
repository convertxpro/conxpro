'use client';

import React, { useState, useMemo } from 'react';
import {
  jsonToSqlInsert,
  csvToSqlInsert,
  sqlInsertToJson,
  SqlDialect,
  JsonToSqlOptions,
  SqlConversionResult,
  SqlParseResult,
} from '@/lib/converters/dev/sql-converter';
import { DualPaneEditor } from '@/components/converters/common/DualPaneEditor';
import { PresetItem } from '@/components/converters/common/PresetsSelector';
import { Button } from '@/components/ui/Button';
import {
  Database,
  FileSpreadsheet,
  FileCode,
  Table,
  Sliders,
  Settings,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

export interface SqlDataConverterProps {
  tool?: ToolMetadata;
  initialTab?: 'sql-to-json' | 'json-to-sql' | 'csv-to-sql';
}

const PRESETS: Record<string, { label: string; mode: 'json-to-sql' | 'csv-to-sql' | 'sql-to-json'; content: string }> = {
  'users-json': {
    label: 'Sample Users JSON (5 rows)',
    mode: 'json-to-sql',
    content: `[
  {
    "id": 1,
    "name": "Muddasir Khan",
    "email": "muddasir@example.com",
    "city": "Lahore",
    "is_active": true,
    "balance": 15420.50,
    "created_at": "2026-08-30T14:30:00Z"
  },
  {
    "id": 2,
    "name": "Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "city": "Karachi",
    "is_active": true,
    "balance": 89200.00,
    "created_at": "2026-08-29T10:15:00Z"
  },
  {
    "id": 3,
    "name": "Bilal Tariq",
    "email": "bilal@example.com",
    "city": "Islamabad",
    "is_active": false,
    "balance": 0.00,
    "created_at": "2026-08-28T18:45:00Z"
  },
  {
    "id": 4,
    "name": "Fatima Noor",
    "email": "fatima@example.com",
    "city": "Faisalabad",
    "is_active": true,
    "balance": 45000.75,
    "created_at": "2026-08-27T12:00:00Z"
  },
  {
    "id": 5,
    "name": "Usman Ali",
    "email": "usman@example.com",
    "city": "Rawalpindi",
    "is_active": true,
    "balance": 27800.00,
    "created_at": "2026-08-26T09:30:00Z"
  }
]`,
  },
  'products-csv': {
    label: 'Sample Products CSV (5 items)',
    mode: 'csv-to-sql',
    content: `sku,title,category,price_pkr,stock_qty,is_featured
LAP-001,MacBook Pro M3 Max,Electronics,850000,12,true
PHN-002,Samsung Galaxy S26 Ultra,Mobile Phones,420000,25,true
ACC-003,Sony WH-1000XM5 Headphones,Audio,95000,40,false
WCH-004,Apple Watch Series 11,Wearables,135000,18,true
TAB-005,iPad Pro 13-inch OLED,Tablets,360000,15,false`,
  },
  'orders-sql': {
    label: 'Sample E-commerce Orders SQL',
    mode: 'sql-to-json',
    content: `INSERT INTO "orders" ("order_id", "customer_name", "total_amount", "currency", "order_status", "is_paid")
VALUES
  (1001, 'Hamza Malik', 4500.00, 'PKR', 'completed', TRUE),
  (1002, 'Ayesha Siddiqui', 12800.50, 'PKR', 'shipped', TRUE),
  (1003, 'Zainab Bibi', 3200.00, 'PKR', 'pending', FALSE),
  (1004, 'Farhan Saeed', 95000.00, 'PKR', 'processing', TRUE),
  (1005, 'Omer Butt', 1850.00, 'PKR', 'completed', TRUE);`,
  },
};

export const SqlDataConverter: React.FC<SqlDataConverterProps> = ({
  initialTab = 'json-to-sql',
}) => {
  const [activeTab, setActiveTab] = useState<'json-to-sql' | 'csv-to-sql' | 'sql-to-json'>(initialTab);
  const [tableName, setTableName] = useState<string>('users');
  const [dialect, setDialect] = useState<SqlDialect>('postgresql');
  const [batchSize, setBatchSize] = useState<number>(500);
  const [includeCreateTable, setIncludeCreateTable] = useState<boolean>(true);
  const [insertOrReplace, setInsertOrReplace] = useState<boolean>(false);
  const [formatOutput, setFormatOutput] = useState<boolean>(true);
  const [sqlViewFormat, setSqlViewFormat] = useState<'json' | 'csv'>('json');
  const [activePresetId, setActivePresetId] = useState<string>(() => {
    if (initialTab === 'csv-to-sql') return 'products-csv';
    if (initialTab === 'sql-to-json') return 'orders-sql';
    return 'users-json';
  });

  // Input states
  const [inputValue, setInputValue] = useState<string>(() => {
    if (initialTab === 'csv-to-sql') return PRESETS['products-csv'].content;
    if (initialTab === 'sql-to-json') return PRESETS['orders-sql'].content;
    return PRESETS['users-json'].content;
  });

  // Execution
  const options: JsonToSqlOptions = useMemo(() => ({
    tableName,
    dialect,
    batchSize,
    includeCreateTable,
    insertOrReplace,
    formatOutput,
  }), [tableName, dialect, batchSize, includeCreateTable, insertOrReplace, formatOutput]);

  const conversionResult = useMemo(() => {
    if (activeTab === 'json-to-sql') {
      return jsonToSqlInsert(inputValue, options);
    } else if (activeTab === 'csv-to-sql') {
      return csvToSqlInsert(inputValue, options);
    } else {
      const parsed = sqlInsertToJson(inputValue);
      return {
        sql: sqlViewFormat === 'json' ? parsed.json : parsed.csv,
        error: parsed.error,
        rowCount: parsed.rowCount,
        columnCount: parsed.columnCount,
      };
    }
  }, [activeTab, inputValue, options, sqlViewFormat]);

  // Presets mapping
  const presetItems: PresetItem[] = useMemo(() => {
    return Object.entries(PRESETS).map(([id, item]) => ({
      id,
      label: item.label,
      data: item.content,
      description: item.mode.toUpperCase().replace(/-/g, ' → '),
    }));
  }, []);

  const handleSelectPreset = (preset: PresetItem) => {
    setActivePresetId(preset.id);
    const selected = PRESETS[preset.id];
    if (selected) {
      setActiveTab(selected.mode);
      setInputValue(selected.content);
      if (selected.mode === 'json-to-sql') setTableName('users');
      if (selected.mode === 'csv-to-sql') setTableName('products');
      if (selected.mode === 'sql-to-json') setTableName('orders');
    }
  };

  // Switch tab helper
  const handleTabChange = (newTab: 'json-to-sql' | 'csv-to-sql' | 'sql-to-json') => {
    setActiveTab(newTab);
    if (newTab === 'json-to-sql') {
      setInputValue(PRESETS['users-json'].content);
      setActivePresetId('users-json');
      setTableName('users');
    } else if (newTab === 'csv-to-sql') {
      setInputValue(PRESETS['products-csv'].content);
      setActivePresetId('products-csv');
      setTableName('products');
    } else {
      setInputValue(PRESETS['orders-sql'].content);
      setActivePresetId('orders-sql');
      setTableName('orders');
    }
  };

  // Top Controls Toolbar
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => handleTabChange('json-to-sql')}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            activeTab === 'json-to-sql'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          JSON → SQL
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('csv-to-sql')}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            activeTab === 'csv-to-sql'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          CSV → SQL
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('sql-to-json')}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
            activeTab === 'sql-to-json'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          SQL → JSON/CSV
        </button>
      </div>

      {/* SQL Options (when generating SQL) */}
      {activeTab !== 'sql-to-json' ? (
        <>
          {/* Table Name Input */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-[11px] font-medium text-slate-500">Table:</span>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="table_name"
              className="w-24 bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
            />
          </div>

          {/* Dialect Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-[11px] font-medium text-slate-500">Dialect:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SqlDialect)}
              className="rounded bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="sqlserver">SQL Server</option>
            </select>
          </div>

          {/* Batch Size Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-[11px] font-medium text-slate-500">Batch:</span>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="rounded bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
            >
              <option value={100}>100 rows</option>
              <option value={500}>500 rows</option>
              <option value={1000}>1000 rows</option>
            </select>
          </div>

          {/* Include CREATE TABLE toggle */}
          <button
            type="button"
            onClick={() => setIncludeCreateTable((p) => !p)}
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-medium transition ${
              includeCreateTable
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
            }`}
          >
            <span>CREATE TABLE {includeCreateTable && '✓'}</span>
          </button>
        </>
      ) : (
        /* SQL to JSON / CSV output format toggle */
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setSqlViewFormat('json')}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
              sqlViewFormat === 'json'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Output JSON
          </button>
          <button
            type="button"
            onClick={() => setSqlViewFormat('csv')}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
              sqlViewFormat === 'csv'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Output CSV
          </button>
        </div>
      )}
    </div>
  );

  const inLang = activeTab === 'json-to-sql' ? 'json' : activeTab === 'csv-to-sql' ? 'text' : 'sql';
  const outLang = activeTab === 'sql-to-json' ? (sqlViewFormat === 'json' ? 'json' : 'text') : 'sql';
  const inTitle =
    activeTab === 'json-to-sql'
      ? 'JSON Records Input'
      : activeTab === 'csv-to-sql'
      ? 'CSV Table Input'
      : 'SQL INSERT Statements Input';
  const outTitle =
    activeTab === 'sql-to-json'
      ? sqlViewFormat === 'json'
        ? 'JSON Array Output'
        : 'CSV Table Output'
      : `${dialect.toUpperCase()} INSERT Statements Output`;
  const outFilename = `${tableName || 'records'}-converted`;
  const outExt = activeTab === 'sql-to-json' ? (sqlViewFormat === 'json' ? 'json' : 'csv') : 'sql';

  return (
    <DualPaneEditor
      inputTitle={inTitle}
      outputTitle={outTitle}
      inputLanguage={inLang as any}
      outputLanguage={outLang as any}
      inputValue={inputValue}
      outputValue={conversionResult.sql || ''}
      onInputChange={(val) => setInputValue(val)}
      error={conversionResult.error}
      presets={presetItems}
      activePresetId={activePresetId}
      onSelectPreset={handleSelectPreset}
      outputFilename={outFilename}
      outputFileExt={outExt}
      acceptedFileTypes={activeTab === 'json-to-sql' ? '.json,.txt' : activeTab === 'csv-to-sql' ? '.csv,.txt' : '.sql,.txt'}
      controls={controls}
      showPrivacyBanner={true}
    />
  );
};
