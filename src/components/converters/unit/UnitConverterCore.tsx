'use client';

import React, { useState, useMemo } from 'react';
import {
  UNIT_CATEGORIES,
  UnitCategory,
  UnitDefinition,
  formatUnitNumber,
  generateConversionTableData,
} from './unit-definitions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeftRight, Copy, Check, Sparkles, RefreshCw, Calculator } from 'lucide-react';
import { ConversionTable } from '@/components/layout/ConversionTable';

export interface UnitConverterCoreProps {
  defaultCategoryId?: string;
  defaultFromUnit?: string;
  defaultToUnit?: string;
  showCategorySelector?: boolean;
  showQuickTable?: boolean;
  className?: string;
}

export const UnitConverterCore: React.FC<UnitConverterCoreProps> = ({
  defaultCategoryId = 'length',
  defaultFromUnit,
  defaultToUnit,
  showCategorySelector = true,
  showQuickTable = true,
  className = '',
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    UNIT_CATEGORIES[defaultCategoryId] ? defaultCategoryId : 'length'
  );

  const activeCategory: UnitCategory = useMemo(() => {
    return UNIT_CATEGORIES[selectedCategoryId] || UNIT_CATEGORIES.length;
  }, [selectedCategoryId]);

  const unitKeys = useMemo(() => Object.keys(activeCategory.units), [activeCategory]);

  const [fromUnitKey, setFromUnitKey] = useState<string>(() => {
    if (defaultFromUnit && activeCategory.units[defaultFromUnit]) return defaultFromUnit;
    return unitKeys[0] || '';
  });

  const [toUnitKey, setToUnitKey] = useState<string>(() => {
    if (defaultToUnit && activeCategory.units[defaultToUnit]) return defaultToUnit;
    return unitKeys[1] || unitKeys[0] || '';
  });

  const [inputValue, setInputValue] = useState<string>('1');
  const [precision, setPrecision] = useState<number>(4);
  const [useScientific, setUseScientific] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // When category changes, reset from/to units if needed
  const handleCategoryChange = (newCatId: string) => {
    setSelectedCategoryId(newCatId);
    const cat = UNIT_CATEGORIES[newCatId];
    if (cat) {
      const keys = Object.keys(cat.units);
      setFromUnitKey(keys[0] || '');
      setToUnitKey(keys[1] || keys[0] || '');
    }
  };

  const fromUnit: UnitDefinition | undefined = activeCategory.units[fromUnitKey];
  const toUnit: UnitDefinition | undefined = activeCategory.units[toUnitKey];

  // Bidirectional calculation
  const numericInput = parseFloat(inputValue);
  const calculatedValue = useMemo(() => {
    if (isNaN(numericInput) || !fromUnit || !toUnit) return 0;
    const baseValue = fromUnit.toBase(numericInput);
    return toUnit.fromBase(baseValue);
  }, [numericInput, fromUnit, toUnit]);

  // Formatted output
  const formattedOutput = useMemo(() => {
    if (isNaN(numericInput) || !fromUnit || !toUnit) return '—';
    if (useScientific) {
      return calculatedValue.toExponential(precision);
    }
    return formatUnitNumber(calculatedValue, precision);
  }, [calculatedValue, numericInput, fromUnit, toUnit, precision, useScientific]);

  // Handle swap
  const handleSwap = () => {
    setFromUnitKey(toUnitKey);
    setToUnitKey(fromUnitKey);
  };

  // Copy result
  const handleCopy = () => {
    if (!toUnit) return;
    const textToCopy = `${formattedOutput} ${toUnit.symbol}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preset values
  const presets = [1, 5, 10, 25, 50, 100, 500, 1000];

  // Formula details
  const formulaInfo = useMemo(() => {
    if (!fromUnit || !toUnit) return null;
    return activeCategory.formulaTemplate(fromUnit.name, toUnit.name);
  }, [activeCategory, fromUnit, toUnit]);

  // Live quick table for active pair
  const quickTableData = useMemo(() => {
    if (!fromUnit || !toUnit) return null;
    return generateConversionTableData(activeCategory, fromUnitKey, toUnitKey, [
      1, 2, 5, 10, 20, 50, 100, 250, 500, 1000,
    ]);
  }, [activeCategory, fromUnitKey, toUnitKey, fromUnit, toUnit]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Pills (if enabled) */}
      {showCategorySelector && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {Object.values(UNIT_CATEGORIES).map((category) => {
            const isActive = category.id === selectedCategoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-indigo-500'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {category.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Conversion Control Board */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr,auto,1fr]">
          {/* FROM COLUMN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                From ({fromUnit?.symbol || ''})
              </label>
              <select
                value={fromUnitKey}
                onChange={(e) => setFromUnitKey(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {unitKeys.map((key) => {
                  const unit = activeCategory.units[key];
                  return (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  );
                })}
              </select>
            </div>

            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0"
              className="text-lg font-bold text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{fromUnit?.plural || fromUnit?.name}</span>
              <span className="font-mono">SI base: {activeCategory.baseUnit}</span>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap units"
              className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition-all hover:scale-105 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50"
            >
              <ArrowLeftRight className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
            </button>
          </div>

          {/* TO COLUMN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                To ({toUnit?.symbol || ''})
              </label>
              <select
                value={toUnitKey}
                onChange={(e) => setToUnitKey(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {unitKeys.map((key) => {
                  const unit = activeCategory.units[key];
                  return (
                    <option key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="relative">
              <Input
                type="text"
                readOnly
                value={formattedOutput}
                className="bg-indigo-50/50 text-lg font-extrabold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 pr-12"
              />
              <button
                type="button"
                onClick={handleCopy}
                title="Copy result"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{toUnit?.plural || toUnit?.name}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {copied ? 'Copied to clipboard!' : 'Live calculated'}
              </span>
            </div>
          </div>
        </div>

        {/* Numeric Presets & Quick Buttons */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInputValue(val.toString())}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition ${
                    inputValue === val.toString()
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Precision & Scientific Settings */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span>Decimals:</span>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setUseScientific(!useScientific)}
                className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium transition ${
                  useScientific
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Sci Exp (1eX)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Formula Breakdown Card */}
      {formulaInfo && fromUnit && toUnit && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs dark:border-slate-800/80 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Calculator className="h-4 w-4 text-indigo-500" />
            <span>Calculation Summary</span>
          </div>
          <p className="mt-1 font-mono text-indigo-600 dark:text-indigo-400">
            {inputValue || '0'} {fromUnit.symbol} = {formattedOutput} {toUnit.symbol}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {formulaInfo.example}
          </p>
        </div>
      )}

      {/* Dynamic Quick Conversion Table */}
      {showQuickTable && quickTableData && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Quick Reference Matrix
            </h4>
            <span className="text-[11px] text-slate-400">Instant lookup</span>
          </div>
          <ConversionTable
            headers={quickTableData.headers}
            rows={quickTableData.rows}
            caption={quickTableData.caption}
          />
        </div>
      )}
    </div>
  );
};
