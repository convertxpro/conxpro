'use client';

import React, { useState, useId } from 'react';
import {
  calculateLandUnits,
  calculatePlotDimensions,
  calculateLandValuation,
  RegionalStandard,
  REGIONAL_STANDARDS,
  LandUnitKey,
  EXTENDED_LAND_UNITS,
  REVENUE_TERMS_GLOSSARY,
} from '@/lib/converters/pakistan/land-units';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Building,
  Scale,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Info,
  Maximize2,
  DollarSign,
  Search,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface ExtendedLandConverterProps {
  initialValue?: string;
  initialUnit?: LandUnitKey;
  initialStandard?: RegionalStandard;
}

export const ExtendedLandConverterComponent: React.FC<ExtendedLandConverterProps> = ({
  initialValue = '1',
  initialUnit = 'murabba',
  initialStandard = 'punjab',
}) => {
  const [standard, setStandard] = useState<RegionalStandard>(initialStandard);
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [inputUnit, setInputUnit] = useState<LandUnitKey>(initialUnit);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'units' | 'plot_visualizer' | 'valuation' | 'glossary'>('units');

  // Plot Visualizer state
  const [plotWidth, setPlotWidth] = useState<string>('1100');
  const [plotLength, setPlotLength] = useState<string>('990');

  // Valuation state
  const [valuationPrice, setValuationPrice] = useState<string>('5000000');
  const [valuationBasis, setValuationBasis] = useState<LandUnitKey | 'total'>('acre');
  const [valuationArea, setValuationArea] = useState<string>('5');
  const [valuationAreaUnit, setValuationAreaUnit] = useState<LandUnitKey>('acre');

  // Glossary search state
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryFilter, setGlossaryFilter] = useState<string>('all');

  const landAreaInputId = useId();
  const plotWidthId = useId();
  const plotLengthId = useId();
  const valPriceId = useId();
  const valAreaId = useId();

  const matrix = calculateLandUnits(inputValue, inputUnit, standard);
  const plotResult = calculatePlotDimensions(plotWidth, plotLength, standard);
  const valResult = calculateLandValuation(valuationPrice, valuationBasis, valuationArea, valuationAreaUnit, standard);

  const stdInfo = REGIONAL_STANDARDS[standard];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePreset = (val: string, unit: LandUnitKey) => {
    setInputValue(val);
    setInputUnit(unit);
  };

  const PRESETS: { label: string; val: string; unit: LandUnitKey }[] = [
    { label: '1 Murabba (25 Acres)', val: '1', unit: 'murabba' },
    { label: '1 Acre / Qilla (8 Kanals)', val: '1', unit: 'acre' },
    { label: standard === 'sindh' ? '1 Bigha (2 Kanals)' : '1 Bigha (4 Kanals)', val: '1', unit: 'bigha' },
    { label: '1 Kanal (20 Marla)', val: '1', unit: 'kanal' },
    { label: '10 Marla', val: '10', unit: 'marla' },
    { label: '5 Marla Plot', val: '5', unit: 'marla' },
    { label: '10,000 Sq Ft', val: '10000', unit: 'sqFeet' },
  ];

  const PLOT_PRESETS = [
    { label: '1 Murabba Block (1100×990 ft)', w: '1100', l: '990' },
    { label: '1 Acre Field (220×198 ft / 40×36 Karam)', w: '220', l: '198' },
    { label: '1 Bigha Punjab (110×198 ft)', w: '110', l: '198' },
    { label: '1 Kanal Suburban (50×90 ft)', w: '50', l: '90' },
    { label: '10 Marla (35×65 ft)', w: '35', l: '65' },
    { label: '5 Marla (25×45 ft - 225)', w: '25', l: '45' },
    { label: '5 Marla Patwari (25×54.45 ft - 272)', w: '25', l: '54.45' },
  ];

  const filteredGlossary = REVENUE_TERMS_GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.urduTerm.includes(glossarySearch) ||
      item.meaning.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.urduMeaning.includes(glossarySearch);
    const matchesCategory = glossaryFilter === 'all' || item.category === glossaryFilter;
    return matchesSearch && matchesCategory;
  });

  // WhatsApp share payload
  const currentUnitName = EXTENDED_LAND_UNITS.find((u) => u.id === inputUnit)?.name || inputUnit;
  const whatsAppText =
    `🌾 *Pakistan Agricultural & Urban Land Calculation Summary*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📐 *Area:* ${inputValue} ${currentUnitName}\n` +
    `⚖️ *Standard:* ${stdInfo.name} (${stdInfo.sqFtPerMarla} sq ft / Marla)\n\n` +
    `📊 *Equivalent Breakdown:*\n` +
    `• *Murabba (مربع):* ${matrix.murabba} Murabba\n` +
    `• *Acre / Qilla (ایکڑ):* ${matrix.acre} Acre (Killa)\n` +
    `• *Bigha (بیگھہ):* ${matrix.bigha} Bigha\n` +
    `• *Kanal (کنال):* ${matrix.kanal} Kanal\n` +
    `• *Marla (مرلہ):* ${matrix.marla} Marla\n` +
    `• *Square Feet (مربع فٹ):* ${matrix.sqFeet.toLocaleString()} sq ft\n` +
    `• *Square Yards / Gazz (مربع گز):* ${matrix.sqGazz.toLocaleString()} Sq Yd\n` +
    `• *Square Meters (مربع میٹر):* ${matrix.sqMeters.toLocaleString()} m²\n\n` +
    `⚡ Computed via ApexTools.app Land Suite`;

  return (
    <div className="w-full space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Murabba, Bigha, Acre & Kanal Converter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agricultural Farmland & Revenue Measurement Suite for Punjab, Sindh & KPK
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'units'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Land Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plot_visualizer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'plot_visualizer'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Plot Visualizer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'valuation'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Land Valuation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'glossary'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Patwari Glossary
          </button>
        </div>
      </div>

      {/* Regional Standard Selection Bar */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Regional Standard / Authority:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(REGIONAL_STANDARDS) as RegionalStandard[]).map((key) => {
              const std = REGIONAL_STANDARDS[key];
              const isSelected = standard === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStandard(key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'
                      : 'bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  {std.id === 'punjab' && '🌾 Punjab Revenue (272.25)'}
                  {std.id === 'sindh' && '🌴 Sindh (2 Kanals/Bigha)'}
                  {std.id === 'urban' && '🏙️ Urban Housing (225)'}
                  {std.id === 'cda' && '🏛️ CDA Islamabad (250)'}
                  {std.id === 'patwari' && '📜 Patwari Record'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Active Specification: </span>
          {stdInfo.description}
        </div>
      </div>

      {/* TAB 1: MULTI-UNIT LAND MATRIX */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          {/* Main Input Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-8">
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor={landAreaInputId}
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                  >
                    Enter Land Area Value
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setInputValue('1');
                      setInputUnit('murabba');
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
                <Input
                  id={landAreaInputId}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 1 or 25"
                  className="h-12 text-lg font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Unit
                </label>
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as LandUnitKey)}
                  aria-label="Select Land Unit"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  {EXTENDED_LAND_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Presets:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePreset(p.val, p.unit)}
                  className="rounded-lg border border-slate-200/80 bg-slate-100/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Agricultural Units Cards */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Agricultural & Revenue Units
              </h3>
              <WhatsAppShareButton shareText={whatsAppText} title="Share Result" className="h-8 text-xs" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Murabba */}
              <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-4 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Murabba (مربع)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${matrix.murabba} Murabba`, 'murabba')}
                    className="text-slate-400 hover:text-emerald-600"
                    title="Copy Murabba"
                  >
                    {copiedKey === 'murabba' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {matrix.murabba} <span className="text-xs font-semibold text-emerald-600">Murabba</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  = 25 Acres = 200 Kanals
                </div>
              </div>

              {/* Acre / Qilla */}
              <div className="relative rounded-2xl border border-teal-500/30 bg-teal-50/40 p-4 shadow-sm dark:border-teal-500/30 dark:bg-teal-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Acre / Qilla (ایکڑ / قلعہ)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${matrix.acre} Acre`, 'acre')}
                    className="text-slate-400 hover:text-teal-600"
                    title="Copy Acre"
                  >
                    {copiedKey === 'acre' ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {matrix.acre} <span className="text-xs font-semibold text-teal-600">Acre</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  = 8 Kanals = 160 Marlas
                </div>
              </div>

              {/* Bigha */}
              <div className="relative rounded-2xl border border-indigo-500/30 bg-indigo-50/40 p-4 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                    Bigha (بیگھہ)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${matrix.bigha} Bigha`, 'bigha')}
                    className="text-slate-400 hover:text-indigo-600"
                    title="Copy Bigha"
                  >
                    {copiedKey === 'bigha' ? <Check className="h-3.5 w-3.5 text-indigo-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {matrix.bigha} <span className="text-xs font-semibold text-indigo-600">Bigha</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {standard === 'sindh' ? '= 2 Kanals (0.5 Acre)' : '= 4 Kanals (0.5 Acre)'}
                </div>
              </div>

              {/* Kanal */}
              <div className="relative rounded-2xl border border-sky-500/30 bg-sky-50/40 p-4 shadow-sm dark:border-sky-500/30 dark:bg-sky-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    Kanal (کنال)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${matrix.kanal} Kanal`, 'kanal')}
                    className="text-slate-400 hover:text-sky-600"
                    title="Copy Kanal"
                  >
                    {copiedKey === 'kanal' ? <Check className="h-3.5 w-3.5 text-sky-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {matrix.kanal} <span className="text-xs font-semibold text-sky-600">Kanal</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  = 20 Marlas = {(20 * stdInfo.sqFtPerMarla).toLocaleString()} Sq Ft
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Units Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Imperial, Traditional & Metric Breakdown
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* Marla */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marla (مرلہ)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.marla}</div>
                <div className="text-[10px] text-slate-500">{stdInfo.sqFtPerMarla} sq ft</div>
              </div>

              {/* Biswa */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Biswa (بسوہ)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.biswa}</div>
                <div className="text-[10px] text-slate-500">1/20th Bigha</div>
              </div>

              {/* Sarsahi */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sarsahi (سرسائی)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.sarsahi}</div>
                <div className="text-[10px] text-slate-500">9 Sarsahi = 1 Marla</div>
              </div>

              {/* Sq Gazz / Yards */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sq Gazz (مربع گز)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.sqGazz.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">Sq Yards</div>
              </div>

              {/* Sq Feet */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Square Feet (مربع فٹ)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.sqFeet.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">sq ft</div>
              </div>

              {/* Sq Meters */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Square Meters (مربع میٹر)</div>
                <div className="mt-1 text-base font-bold text-slate-900 dark:text-white">{matrix.sqMeters.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">m²</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLOT DIMENSION VISUALIZER */}
      {activeTab === 'plot_visualizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Dimensions Input */}
            <div className="sm:col-span-6 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enter Plot / Field Dimensions (Feet)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={plotWidthId}
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Width / Frontage (Feet)
                  </label>
                  <Input
                    id={plotWidthId}
                    type="number"
                    value={plotWidth}
                    onChange={(e) => setPlotWidth(e.target.value)}
                    placeholder="e.g. 1100"
                    className="h-10 text-sm font-bold"
                  />
                </div>
                <div>
                  <label
                    htmlFor={plotLengthId}
                    className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Length / Depth (Feet)
                  </label>
                  <Input
                    id={plotLengthId}
                    type="number"
                    value={plotLength}
                    onChange={(e) => setPlotLength(e.target.value)}
                    placeholder="e.g. 990"
                    className="h-10 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Standard Field & Plot Sizes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PLOT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setPlotWidth(p.w);
                        setPlotLength(p.l);
                      }}
                      className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Visualizer Box */}
            <div className="sm:col-span-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-teal-50/20 p-5 dark:border-emerald-500/30 dark:from-emerald-950/30 dark:to-slate-900">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Calculated Field & Plot Yield
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Aspect: {plotResult.aspectRatio}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Square Feet</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {plotResult.totalSqFt.toLocaleString()} sq ft
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Square Yards</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {plotResult.totalSqGazz.toLocaleString()} Sq Yd
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Marla Equivalent</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {plotResult.marla} Marla
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Kanal Equivalent</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {plotResult.kanal} Kanal
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Acre (Qilla) Yield</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {plotResult.acre} Acre
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Murabba Equivalent</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {plotResult.murabba} Murabba
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-emerald-500/20 pt-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold">Total Perimeter / Boundary Wall: </span>
                {plotResult.perimeterFt.toLocaleString()} Running Feet ({((plotResult.perimeterFt) / 3).toFixed(1)} Gaz / Yards)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAND VALUATION CALCULATOR */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
              Real Estate & Farmland Pricing Breakdown
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              {/* Price / Rate input */}
              <div className="sm:col-span-6">
                <label
                  htmlFor={valPriceId}
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Price / Rate Amount (PKR)
                </label>
                <Input
                  id={valPriceId}
                  type="text"
                  value={valuationPrice}
                  onChange={(e) => setValuationPrice(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="h-11 text-base font-bold"
                />
              </div>

              {/* Price Basis */}
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Price Rate Is Per:
                </label>
                <select
                  value={valuationBasis}
                  onChange={(e) => setValuationBasis(e.target.value as LandUnitKey | 'total')}
                  aria-label="Price Rate Basis"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="acre">Per Acre (فی ایکڑ)</option>
                  <option value="kanal">Per Kanal (فی کنال)</option>
                  <option value="marla">Per Marla (فی مرلہ)</option>
                  <option value="murabba">Per Murabba (فی مربع)</option>
                  <option value="bigha">Per Bigha (فی بیگھہ)</option>
                  <option value="sqFeet">Per Sq Foot (فی مربع فٹ)</option>
                  <option value="total">Total Lump-Sum Land Value (کل قیمت)</option>
                </select>
              </div>

              {/* Plot Area input */}
              <div className="sm:col-span-6">
                <label
                  htmlFor={valAreaId}
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Total Land Area Holding
                </label>
                <Input
                  id={valAreaId}
                  type="text"
                  value={valuationArea}
                  onChange={(e) => setValuationArea(e.target.value)}
                  placeholder="e.g. 5"
                  className="h-11 text-base font-bold"
                />
              </div>

              {/* Plot Area Unit */}
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Land Area Unit:
                </label>
                <select
                  value={valuationAreaUnit}
                  onChange={(e) => setValuationAreaUnit(e.target.value as LandUnitKey)}
                  aria-label="Land Area Unit"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value="acre">Acre / Qilla (ایکڑ)</option>
                  <option value="kanal">Kanal (کنال)</option>
                  <option value="marla">Marla (مرلہ)</option>
                  <option value="murabba">Murabba (مربع)</option>
                  <option value="bigha">Bigha (بیگھہ)</option>
                  <option value="sqFeet">Square Feet (مربع فٹ)</option>
                </select>
              </div>
            </div>

            {/* Total Valuation Card */}
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 dark:border-emerald-500/30 dark:bg-emerald-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Total Estimated Land Value (کل مالیت)
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                    Rs. {valResult.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {valResult.formattedTotalPrice} ({valResult.wordsTotalPrice})
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(`Rs. ${valResult.totalPrice.toLocaleString()} (${valResult.formattedTotalPrice})`, 'val_total')}
                  className="h-9 gap-1.5 border-emerald-500/40 text-xs font-bold"
                >
                  {copiedKey === 'val_total' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Value
                </Button>
              </div>

              {/* Rate Breakdown Table */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-emerald-500/20 pt-4 sm:grid-cols-4">
                <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Rate / Acre</div>
                  <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    Rs. {valResult.pricePerAcre.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Rate / Kanal</div>
                  <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    Rs. {valResult.pricePerKanal.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Rate / Marla</div>
                  <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    Rs. {valResult.pricePerMarla.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Rate / Sq Ft</div>
                  <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    Rs. {valResult.pricePerSqFt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVENUE & PATWARI GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Search & Filter Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Search revenue terms (e.g. Fard, Khasra, Bigha, Murabba)..."
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                {['all', 'Measurement', 'Document', 'Record'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGlossaryFilter(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      glossaryFilter === cat
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Terms' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary Term Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredGlossary.map((item) => (
                <div
                  key={item.term}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-emerald-500/30 hover:bg-white dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.term}
                      </h4>
                      <div dir="rtl" className="font-urdu text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {item.urduTerm}
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {item.category}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    {item.meaning}
                  </p>

                  <p dir="rtl" className="font-urdu mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.urduMeaning}
                  </p>

                  <div className="mt-2.5 rounded-lg bg-emerald-500/[0.06] p-2 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold">Legal Importance: </span>
                    {item.relevance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
