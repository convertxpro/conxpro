'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  convertStructuredData,
  detectFormat,
  SupportedFormat,
  StructuredConversionResult,
} from '@/lib/converters/dev/structured-data';
import { DualPaneEditor } from '@/components/converters/common/DualPaneEditor';
import { PresetItem } from '@/components/converters/common/PresetsSelector';
import { Button } from '@/components/ui/Button';
import {
  ArrowRightLeft,
  Settings2,
  Sparkles,
  SlidersHorizontal,
  FileCode2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

export interface StructuredDataConverterProps {
  tool?: ToolMetadata;
  initialMode?:
    | 'yaml-to-json'
    | 'json-to-yaml'
    | 'toml-to-json'
    | 'yaml-to-toml'
    | 'json-to-toml'
    | 'toml-to-yaml';
}

const PRESETS: Record<string, { label: string; format: SupportedFormat; content: string }> = {
  'k8s-deployment': {
    label: 'Kubernetes Deployment YAML',
    format: 'yaml',
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: apextools-api
  labels:
    app: apextools
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apextools
  template:
    metadata:
      labels:
        app: apextools
    spec:
      containers:
      - name: api-server
        image: ghcr.io/apextools/engine:v2.4.0
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "1"
            memory: 1024Mi
          requests:
            cpu: 250m
            memory: 256Mi`,
  },
  'docker-compose': {
    label: 'Docker Compose YAML',
    format: 'yaml',
    content: `version: '3.8'
services:
  web:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./:/app
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
    depends_on:
      - redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`,
  },
  'cargo-toml': {
    label: 'Cargo.toml (Rust)',
    format: 'toml',
    content: `[package]
name = "apextools-core"
version = "0.2.1"
edition = "2021"
authors = ["ApexTools Team <dev@apextools.app>"]
description = "High performance client-side media and data conversion engine"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.35", features = ["full"] }

[profile.release]
opt-level = 3
lto = true
codegen-units = 1`,
  },
  'pyproject-toml': {
    label: 'pyproject.toml (Python)',
    format: 'toml',
    content: `[project]
name = "apextools-tools"
version = "1.0.0"
description = "Enterprise document and developer conversions"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "pydantic>=2.5.0",
    "fastapi>=0.109.0",
    "uvicorn>=0.27.0"
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"`,
  },
  'package-json': {
    label: 'package.json (Node.js)',
    format: 'json',
    content: `{
  "name": "apextools-app",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "js-yaml": "^4.1.0",
    "papaparse": "^5.4.1",
    "react": "^18.3.1",
    "smol-toml": "^1.3.1"
  }
}`,
  },
};

export const StructuredDataConverter: React.FC<StructuredDataConverterProps> = ({
  initialMode = 'yaml-to-json',
}) => {
  // Parse initial formats from initialMode
  const [fromFormat, setFromFormat] = useState<SupportedFormat>(() => {
    if (initialMode.startsWith('json-')) return 'json';
    if (initialMode.startsWith('toml-')) return 'toml';
    return 'yaml';
  });

  const [toFormat, setToFormat] = useState<SupportedFormat>(() => {
    if (initialMode.endsWith('-json')) return 'json';
    if (initialMode.endsWith('-toml')) return 'toml';
    return 'yaml';
  });

  const [indent, setIndent] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [minifyJson, setMinifyJson] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('k8s-deployment');

  // Input state
  const [inputCode, setInputCode] = useState<string>(() => {
    if (initialMode === 'json-to-yaml' || initialMode === 'json-to-toml') {
      return PRESETS['package-json'].content;
    }
    if (initialMode === 'toml-to-json' || initialMode === 'toml-to-yaml') {
      return PRESETS['cargo-toml'].content;
    }
    return PRESETS['k8s-deployment'].content;
  });

  // Derived output state
  const conversionResult: StructuredConversionResult = useMemo(() => {
    return convertStructuredData(inputCode, fromFormat, toFormat, {
      indent,
      sortKeys,
      minifyJson: toFormat === 'json' ? minifyJson : false,
    });
  }, [inputCode, fromFormat, toFormat, indent, sortKeys, minifyJson]);

  // Handle format swap
  const handleSwapFormats = () => {
    const nextFrom = toFormat;
    const nextTo = fromFormat;
    setFromFormat(nextFrom);
    setToFormat(nextTo);
    // If output is valid, use output as new input
    if (conversionResult.output && !conversionResult.error) {
      setInputCode(conversionResult.output);
    }
  };

  // Convert preset list for selector
  const presetItems: PresetItem[] = useMemo(() => {
    return Object.entries(PRESETS).map(([id, item]) => ({
      id,
      label: item.label,
      data: item.content,
      description: `${item.format.toUpperCase()} template`,
    }));
  }, []);

  const handleSelectPreset = (preset: PresetItem) => {
    setActivePreset(preset.id);
    const targetPreset = PRESETS[preset.id];
    if (targetPreset) {
      setFromFormat(targetPreset.format);
      setInputCode(targetPreset.content);
    }
  };

  // Custom Controls for Toolbar
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mode / Format Pair Selector */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        <select
          value={fromFormat}
          onChange={(e) => setFromFormat(e.target.value as SupportedFormat)}
          className="rounded-lg bg-transparent px-2 py-1 text-xs font-bold uppercase text-slate-800 outline-none dark:text-slate-200"
        >
          <option value="yaml">YAML</option>
          <option value="json">JSON</option>
          <option value="toml">TOML</option>
        </select>

        <button
          type="button"
          onClick={handleSwapFormats}
          title="Swap source and target formats"
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
        </button>

        <select
          value={toFormat}
          onChange={(e) => setToFormat(e.target.value as SupportedFormat)}
          className="rounded-lg bg-transparent px-2 py-1 text-xs font-bold uppercase text-slate-800 outline-none dark:text-slate-200"
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="toml">TOML</option>
        </select>
      </div>

      {/* Indentation Selector */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-950">
        <span className="text-[11px] font-medium text-slate-500">Indent:</span>
        <select
          value={indent}
          onChange={(e) => setIndent(Number(e.target.value))}
          className="rounded bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
        >
          <option value={2}>2 Spaces</option>
          <option value={4}>4 Spaces</option>
          <option value={8}>8 Spaces</option>
        </select>
      </div>

      {/* Sort Keys Toggle */}
      <button
        type="button"
        onClick={() => setSortKeys((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition ${
          sortKeys
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Sort Keys {sortKeys && '✓'}</span>
      </button>

      {/* Minify Toggle for JSON */}
      {toFormat === 'json' && (
        <button
          type="button"
          onClick={() => setMinifyJson((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition ${
            minifyJson
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
          }`}
        >
          <span>Minify {minifyJson && '✓'}</span>
        </button>
      )}
    </div>
  );

  return (
    <DualPaneEditor
      inputTitle={`${fromFormat.toUpperCase()} Input Code`}
      outputTitle={`${toFormat.toUpperCase()} Converted Output`}
      inputLanguage={fromFormat}
      outputLanguage={toFormat}
      inputValue={inputCode}
      outputValue={conversionResult.output}
      onInputChange={(val) => setInputCode(val)}
      error={conversionResult.error}
      presets={presetItems}
      activePresetId={activePreset}
      onSelectPreset={handleSelectPreset}
      onBeautify={() => {
        setMinifyJson(false);
        setIndent(2);
      }}
      onMinify={() => {
        if (toFormat === 'json') setMinifyJson(true);
      }}
      isMinified={minifyJson && toFormat === 'json'}
      outputFilename={`${fromFormat}-to-${toFormat}-converted`}
      outputFileExt={toFormat === 'yaml' ? 'yaml' : toFormat}
      acceptedFileTypes={`.${fromFormat},.json,.yaml,.yml,.toml,.txt`}
      controls={controls}
      showPrivacyBanner={true}
    />
  );
};
