'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  Sparkles,
  Heart,
  Moon,
  Clock,
  Cake,
  Activity,
  Smile,
} from 'lucide-react';

export const AgeCalculator: React.FC = () => {
  const [birthDateStr, setBirthDateStr] = useState<string>('1998-08-14');
  const [asOfDateStr, setAsOfDateStr] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const ageData = useMemo(() => {
    if (!birthDateStr || !asOfDateStr) return null;

    const birth = new Date(birthDateStr + 'T00:00:00');
    const asOf = new Date(asOfDateStr + 'T00:00:00');

    if (isNaN(birth.getTime()) || isNaN(asOf.getTime()) || birth > asOf) {
      return null;
    }

    // Exact years, months, days
    let years = asOf.getFullYear() - birth.getFullYear();
    let months = asOf.getMonth() - birth.getMonth();
    let days = asOf.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Totals
    const diffMs = asOf.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;
    const totalMonths = years * 12 + months;

    // Day of the week born
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBorn = daysOfWeek[birth.getDay()];

    // Next birthday calculation
    let nextBdayYear = asOf.getFullYear();
    let nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    if (nextBday < asOf) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - asOf.getTime()) / (1000 * 60 * 60 * 24));
    const nextBdayDayOfWeek = daysOfWeek[nextBday.getDay()];

    // Western Zodiac
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    let zodiac = '';
    let zodiacIcon = '✨';

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { zodiac = 'Aquarius (The Water Bearer)'; zodiacIcon = '♒'; }
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) { zodiac = 'Pisces (The Fish)'; zodiacIcon = '♓'; }
    else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { zodiac = 'Aries (The Ram)'; zodiacIcon = '♈'; }
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { zodiac = 'Taurus (The Bull)'; zodiacIcon = '♉'; }
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { zodiac = 'Gemini (The Twins)'; zodiacIcon = '♊'; }
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { zodiac = 'Cancer (The Crab)'; zodiacIcon = '♋'; }
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { zodiac = 'Leo (The Lion)'; zodiacIcon = '♌'; }
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { zodiac = 'Virgo (The Maiden)'; zodiacIcon = '♍'; }
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { zodiac = 'Libra (The Scales)'; zodiacIcon = '♎'; }
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { zodiac = 'Scorpio (The Scorpion)'; zodiacIcon = '♏'; }
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { zodiac = 'Sagittarius (The Archer)'; zodiacIcon = '♐'; }
    else { zodiac = 'Capricorn (The Goat)'; zodiacIcon = '♑'; }

    // Chinese Zodiac
    const chineseAnimals = ['Rat 🐀', 'Ox 🐂', 'Tiger 🐅', 'Rabbit 🐇', 'Dragon 🐉', 'Snake 🐍', 'Horse 🐎', 'Goat 🐐', 'Monkey 🐒', 'Rooster 🐓', 'Dog 🐕', 'Pig 🐖'];
    const chineseZodiac = chineseAnimals[(birth.getFullYear() - 4) % 12];

    // Estimated life stats
    const heartbeats = Math.floor(totalMinutes * 72); // avg 72 bpm
    const breaths = Math.floor(totalMinutes * 16); // avg 16 breaths/min
    const hoursSlept = Math.floor(totalDays * 8);

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      dayBorn,
      daysToNextBday,
      nextBdayDayOfWeek,
      zodiac,
      zodiacIcon,
      chineseZodiac,
      heartbeats,
      breaths,
      hoursSlept,
    };
  }, [birthDateStr, asOfDateStr]);

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Date of Birth
          </label>
          <Input
            type="date"
            value={birthDateStr}
            onChange={(e) => setBirthDateStr(e.target.value)}
            className="text-sm font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Calculate Age As Of Date
          </label>
          <Input
            type="date"
            value={asOfDateStr}
            onChange={(e) => setAsOfDateStr(e.target.value)}
            className="text-sm font-semibold"
          />
        </div>
      </div>

      {ageData ? (
        <div className="space-y-6">
          {/* Main Age Hero Card */}
          <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-xl sm:p-8 dark:border-indigo-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Exact Age Calculation
                </p>
                <div className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {ageData.years} <span className="text-xl font-medium sm:text-3xl">years</span>,{' '}
                  {ageData.months} <span className="text-xl font-medium sm:text-3xl">months</span>,{' '}
                  {ageData.days} <span className="text-xl font-medium sm:text-3xl">days</span>
                </div>
                <p className="mt-2 text-xs text-indigo-200">
                  Born on a <strong className="text-white">{ageData.dayBorn}</strong>
                </p>
              </div>

              {/* Next Birthday Banner */}
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-200">
                  <Cake className="h-4 w-4 text-amber-300" />
                  <span>Next Birthday</span>
                </div>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  {ageData.daysToNextBday === 0 ? 'Today! 🎉' : `in ${ageData.daysToNextBday} days`}
                </p>
                <p className="text-[11px] text-indigo-200">
                  Will fall on a {ageData.nextBdayDayOfWeek}
                </p>
              </div>
            </div>
          </div>

          {/* Granular Total Units Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Total Lifetime Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {ageData.totalMonths.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Months</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {ageData.totalWeeks.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Weeks</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {ageData.totalDays.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {ageData.totalHours.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Hours</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {ageData.totalMinutes.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Minutes</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                  {ageData.totalSeconds.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">Total Seconds</p>
              </div>
            </div>
          </div>

          {/* Fun Milestones & Astrological Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Zodiac Signs</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">
                {ageData.zodiacIcon} {ageData.zodiac}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Chinese Zodiac: <strong>{ageData.chineseZodiac}</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Estimated Heartbeats</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                ~{ageData.heartbeats.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Estimated ~{(ageData.breaths).toLocaleString()} breaths taken
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>Sleep Estimate</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                ~{ageData.hoursSlept.toLocaleString()} hours
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Approx ~{Math.floor(ageData.hoursSlept / 24).toLocaleString()} full days asleep
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-600 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          Please select a valid birth date that is before or equal to the &ldquo;As of&rdquo; date.
        </div>
      )}
    </div>
  );
};
