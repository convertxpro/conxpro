'use client';

import React, { useState, useEffect } from 'react';
import {
  HIJRI_MONTHS,
  ISLAMIC_ANNUAL_EVENTS,
  convertGregorianToHijri,
  convertHijriToGregorian,
  IslamicEvent,
} from '@/lib/converters/pakistan/hijri-engine';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Moon,
  Calendar,
  Sparkles,
  ArrowLeftRight,
  Clock,
  BookOpen,
  CalendarDays,
  Compass,
  Star,
} from 'lucide-react';
import moment from 'moment-hijri';

export const HijriConverter: React.FC = () => {
  // Mode: gregorian_to_hijri or hijri_to_gregorian
  const [mode, setMode] = useState<'gregorian_to_hijri' | 'hijri_to_gregorian'>('gregorian_to_hijri');
  const [moonOffset, setMoonOffset] = useState<number>(0);

  // Gregorian Input (Default today)
  const [gregorianDate, setGregorianDate] = useState<string>(() => {
    return moment().format('YYYY-MM-DD');
  });

  // Hijri Inputs
  const [hijriYear, setHijriYear] = useState<number>(1448);
  const [hijriMonth, setHijriMonth] = useState<number>(3);
  const [hijriDay, setHijriDay] = useState<number>(14);

  const [activeTab, setActiveTab] = useState<'converter' | 'events_calendar' | 'months_guide'>('converter');

  // Sync today's hijri date initially
  useEffect(() => {
    const todayRes = convertGregorianToHijri(moment().format('YYYY-MM-DD'), moonOffset);
    setHijriYear(todayRes.hijriYear);
    setHijriMonth(todayRes.hijriMonthIndex);
    setHijriDay(todayRes.hijriDay);
  }, [moonOffset]);

  // Today's Live Date Banner
  const todayHijri = convertGregorianToHijri(moment().format('YYYY-MM-DD'), moonOffset);

  // Conversion Results
  const gToHResult = convertGregorianToHijri(gregorianDate, moonOffset);
  const hToGResult = convertHijriToGregorian(hijriYear, hijriMonth, hijriDay, moonOffset);

  // WhatsApp Message Text
  const whatsAppDateMessage = mode === 'gregorian_to_hijri'
    ? `🌙 *Islamic Hijri Date Today (پاکستان اسلامی تاریخ)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Islamic Date:* ${gToHResult.formattedEn}\n` +
      `🇵🇰 *اردو:* ${gToHResult.formattedUrdu}\n` +
      `🕌 *عربی:* ${gToHResult.formattedArabic}\n` +
      `🗓️ *Gregorian Date:* ${moment(gregorianDate).format('dddd, MMMM D, YYYY')}\n` +
      `🌟 *Day:* ${gToHResult.dayOfWeek} (${gToHResult.dayOfWeekUrdu})\n` +
      (moonOffset !== 0 ? `⚖️ *Ruet-e-Hilal Sighting Offset:* ${moonOffset > 0 ? `+${moonOffset}` : moonOffset} Day(s)\n` : '') +
      `\n🔗 Convert accurately on ConvertHub`
    : `🌙 *Islamic to Gregorian Date Conversion*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Islamic Date:* ${hToGResult.hijriDateFormatted}\n` +
      `🗓️ *Gregorian Date:* ${hToGResult.gregorianFormatted} (${hToGResult.dayOfWeek})\n` +
      `🇵🇰 *اردو دن:* ${hToGResult.dayOfWeekUrdu}\n` +
      (moonOffset !== 0 ? `⚖️ *Ruet-e-Hilal Sighting Offset:* ${moonOffset > 0 ? `+${moonOffset}` : moonOffset} Day(s)\n` : '') +
      `\n🔗 Convert accurately on ConvertHub`;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: Today's Hijri & Gregorian Date */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 p-6 text-white shadow-xl dark:border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <Moon className="h-3.5 w-3.5 fill-current" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Today in Pakistan (پاکستان میں آج کی تاریخ)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              {todayHijri.formattedEn}
            </h2>
            <p className="text-sm font-medium text-emerald-200 font-urdu">
              {todayHijri.formattedUrdu} • {todayHijri.dayOfWeekUrdu}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 text-right backdrop-blur-sm">
            <span className="text-[11px] text-emerald-300 uppercase font-semibold">Gregorian (عیسوی)</span>
            <div className="text-base font-bold text-white">
              {moment().format('MMMM D, YYYY')}
            </div>
            <div className="text-xs text-emerald-200">
              {todayHijri.dayOfWeek}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'converter'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Date Converter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events_calendar')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'events_calendar'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            <span>Islamic Annual Events</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('months_guide')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'months_guide'
                ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>12 Islamic Months</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Umm al-Qura Astronomical Algorithm
          </span>
        </div>
      </div>

      {/* Moon Sighting Ruet-e-Hilal Offset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
            <Compass className="h-4 w-4" />
            <span>Pakistan Central Ruet-e-Hilal Moon Sighting Adjustment:</span>
          </label>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Adjust ±1 or ±2 days according to local physical crescent moon sightings announced in Pakistan.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {[-2, -1, 0, 1, 2].map((offset) => (
            <button
              key={offset}
              type="button"
              onClick={() => setMoonOffset(offset)}
              className={`h-8 min-w-[36px] rounded-lg text-xs font-bold transition ${
                moonOffset === offset
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {offset > 0 ? `+${offset}` : offset === 0 ? '0 (Exact)' : offset}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DATE CONVERTER */}
      {activeTab === 'converter' && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMode('gregorian_to_hijri')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  mode === 'gregorian_to_hijri'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Gregorian (عیسوی) → Hijri (ہجری)
              </button>
              <button
                type="button"
                onClick={() => setMode('hijri_to_gregorian')}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  mode === 'hijri_to_gregorian'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Hijri (ہجری) → Gregorian (عیسوی)
              </button>
            </div>
          </div>

          {/* Mode 1: Gregorian to Hijri */}
          {mode === 'gregorian_to_hijri' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Input Gregorian Date
                  </span>
                  <button
                    type="button"
                    onClick={() => setGregorianDate(moment().format('YYYY-MM-DD'))}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Set to Today
                  </button>
                </div>

                <Input
                  type="date"
                  value={gregorianDate}
                  onChange={(e) => setGregorianDate(e.target.value)}
                  className="text-lg font-bold"
                />

                <div className="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Selected Date:</span>{' '}
                  {moment(gregorianDate).format('dddd, MMMM D, YYYY')}
                </div>
              </div>

              {/* Output Hijri Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 p-6 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/20 shadow-xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Calculated Islamic Hijri Date
                  </span>

                  <div className="my-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
                      {gToHResult.formattedEn}
                    </h3>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-urdu mt-1">
                      {gToHResult.formattedUrdu}
                    </p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {gToHResult.formattedArabic}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-emerald-100 pt-3 dark:border-emerald-900/40 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Day of Week:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {gToHResult.dayOfWeek} ({gToHResult.dayOfWeekUrdu})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Islamic Month:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Month {gToHResult.hijriMonthIndex} of 12 ({gToHResult.hijriMonthName})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Hijri to Gregorian */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Input Hijri Date Parameters
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Day (1-30)</label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={hijriDay}
                      onChange={(e) => setHijriDay(parseInt(e.target.value) || 1)}
                      className="font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Month</label>
                    <select
                      value={hijriMonth}
                      onChange={(e) => setHijriMonth(parseInt(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-2 py-3 text-xs font-bold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {HIJRI_MONTHS.map((m) => (
                        <option key={m.index} value={m.index}>
                          {m.index}. {m.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Year AH</label>
                    <Input
                      type="number"
                      value={hijriYear}
                      onChange={(e) => setHijriYear(parseInt(e.target.value) || 1448)}
                      className="font-bold"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Selected Hijri Date:</span>{' '}
                  {hijriDay} {HIJRI_MONTHS[hijriMonth - 1]?.nameEn} {hijriYear} AH
                </div>
              </div>

              {/* Output Gregorian Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-purple-50/30 p-6 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-purple-950/20 shadow-xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Calculated Gregorian Solar Date
                  </span>

                  <div className="my-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif">
                      {hToGResult.gregorianFormatted}
                    </h3>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                      {hToGResult.dayOfWeek} ({hToGResult.dayOfWeekUrdu})
                    </p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-indigo-100 pt-3 dark:border-indigo-900/40 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>ISO Date:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {hToGResult.gregorianDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Islamic Greetings Share */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Share Islamic Date / Status
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send accurate Hijri date and Urdu greetings directly to WhatsApp status or family.
                </p>
              </div>
            </div>
            <WhatsAppShareButton
              shareText={whatsAppDateMessage}
              buttonText="Share Islamic Date on WhatsApp"
            />
          </div>
        </div>
      )}

      {/* TAB 2: ISLAMIC ANNUAL EVENTS */}
      {activeTab === 'events_calendar' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              Key Islamic Holidays & Commemorations ({todayHijri.hijriYear} AH)
            </h3>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-400/80">
              Calculated Gregorian equivalents for major religious observances in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {ISLAMIC_ANNUAL_EVENTS.map((event) => {
              const eventGregorian = convertHijriToGregorian(
                todayHijri.hijriYear,
                event.hijriMonth,
                event.hijriDay,
                moonOffset
              );

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {event.nameEn}
                      </h4>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-urdu shrink-0">
                        {event.nameUrdu}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {event.hijriDay} {event.hijriMonthName}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {eventGregorian.gregorianFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: 12 ISLAMIC MONTHS GUIDE */}
      {activeTab === 'months_guide' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HIJRI_MONTHS.map((m) => (
              <div
                key={m.index}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {m.index}
                  </span>
                  {m.isSacredMonth && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Sacred Month (حرمت والا مہینہ)
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {m.nameEn}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu mb-2">
                  {m.nameUrdu} • {m.nameArabic}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {m.significance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
