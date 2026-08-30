'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Globe,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Sun,
  Moon,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface CityTimezone {
  id: string;
  name: string;
  country: string;
  timezone: string;
  flag: string;
}

const DEFAULT_CITIES: CityTimezone[] = [
  { id: 'karachi', name: 'Karachi / Islamabad', country: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'london', name: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧' },
  { id: 'new_york', name: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
];

const ALL_AVAILABLE_CITIES: CityTimezone[] = [
  ...DEFAULT_CITIES,
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'los_angeles', name: 'Los Angeles (PST)', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'paris', name: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
];

export const TimezoneConverter: React.FC = () => {
  const [selectedCities, setSelectedCities] = useState<CityTimezone[]>(DEFAULT_CITIES);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState<boolean>(true);
  const [sliderMinutes, setSliderMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Ticking clock when isLive = true
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = new Date();
      setBaseDate(now);
      setSliderMinutes(now.getHours() * 60 + now.getMinutes());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Adjust base date when slider moves
  const handleSliderChange = (minutes: number) => {
    setIsLive(false);
    setSliderMinutes(minutes);
    const updated = new Date(baseDate);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    updated.setHours(hours, mins, 0, 0);
    setBaseDate(updated);
  };

  const handleResetToNow = () => {
    const now = new Date();
    setBaseDate(now);
    setSliderMinutes(now.getHours() * 60 + now.getMinutes());
    setIsLive(true);
  };

  // Add city
  const handleAddCity = (cityId: string) => {
    const found = ALL_AVAILABLE_CITIES.find((c) => c.id === cityId);
    if (found && !selectedCities.some((c) => c.id === cityId)) {
      setSelectedCities([...selectedCities, found]);
    }
  };

  // Remove city
  const handleRemoveCity = (cityId: string) => {
    setSelectedCities(selectedCities.filter((c) => c.id !== cityId));
  };

  // Helper to format date & time for a timezone
  const getTimeDetails = (timezone: string) => {
    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: isLive ? '2-digit' : undefined,
        hour12: true,
      });

      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const hour24Formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });

      const timeStr = timeFormatter.format(baseDate);
      const dateStr = dateFormatter.format(baseDate);
      const hourNum = parseInt(hour24Formatter.format(baseDate), 10);

      // Business hours classification: 9am-5pm = work, 7am-9am/5pm-10pm = awake, rest = night
      let status: 'work' | 'awake' | 'night' = 'night';
      if (hourNum >= 9 && hourNum < 17) status = 'work';
      else if ((hourNum >= 7 && hourNum < 9) || (hourNum >= 17 && hourNum < 22)) status = 'awake';

      return { timeStr, dateStr, hourNum, status };
    } catch {
      return { timeStr: '--:--', dateStr: '--', hourNum: 12, status: 'awake' as const };
    }
  };

  const unusedCities = ALL_AVAILABLE_CITIES.filter(
    (c) => !selectedCities.some((sc) => sc.id === c.id)
  );

  return (
    <div className="space-y-6">
      {/* Time Slider & Live Controls */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Global Time Simulator & Meeting Planner
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isLive ? 'gradient' : 'secondary'}
              onClick={handleResetToNow}
              leftIcon={<Clock className="h-3.5 w-3.5" />}
            >
              {isLive ? '● Live World Clock' : 'Reset to Current Time'}
            </Button>
          </div>
        </div>

        {/* Time slider */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>00:00 (12:00 AM)</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {Math.floor(sliderMinutes / 60)
                .toString()
                .padStart(2, '0')}
              :{(sliderMinutes % 60).toString().padStart(2, '0')}{' '}
              {sliderMinutes >= 720 ? 'PM' : 'AM'} (Selected Anchor)
            </span>
            <span>23:59 (11:59 PM)</span>
          </div>

          <input
            type="range"
            min={0}
            max={1439}
            value={sliderMinutes}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Working Hours (9 AM - 5 PM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Awake Hours (7 AM - 10 PM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-900 dark:bg-indigo-400" /> Sleeping Hours
          </span>
        </div>
      </div>

      {/* City Time Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selectedCities.map((city) => {
          const details = getTimeDetails(city.timezone);
          return (
            <div
              key={city.id}
              className={`relative rounded-2xl border p-4 shadow-xs transition-all ${
                details.status === 'work'
                  ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/20'
                  : details.status === 'awake'
                  ? 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                  : 'border-slate-200 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{city.flag}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {city.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{city.country}</p>
                  </div>
                </div>

                {selectedCities.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(city.id)}
                    className="rounded-lg p-1 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
                <div>
                  <p className="font-mono text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {details.timeStr}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" /> {details.dateStr}
                  </p>
                </div>

                <div>
                  {details.status === 'work' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Briefcase className="h-2.5 w-2.5" /> Business
                    </span>
                  )}
                  {details.status === 'awake' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <Sun className="h-2.5 w-2.5" /> Day/Evening
                    </span>
                  )}
                  {details.status === 'night' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <Moon className="h-2.5 w-2.5" /> Night
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add More Cities */}
      {unusedCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-500">Add City:</span>
          {unusedCities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleAddCity(city.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>{city.flag}</span>
              <span>{city.name}</span>
              <Plus className="h-3 w-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
