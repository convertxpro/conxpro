export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  plural: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface UnitCategory {
  id: string;
  title: string;
  baseUnit: string;
  description: string;
  formulaTemplate: (from: string, to: string) => { title: string; expression: string; example: string };
  units: Record<string, UnitDefinition>;
  popularPairs: Array<[string, string]>;
}

export const UNIT_CATEGORIES: Record<string, UnitCategory> = {
  length: {
    id: 'length',
    title: 'Length & Distance',
    baseUnit: 'meter',
    description: 'Convert between metric and imperial length units including meters, feet, inches, kilometers, and miles.',
    popularPairs: [
      ['meter', 'foot'],
      ['foot', 'meter'],
      ['kilometer', 'mile'],
      ['mile', 'kilometer'],
      ['centimeter', 'inch'],
      ['inch', 'centimeter'],
      ['meter', 'yard'],
      ['yard', 'meter'],
      ['millimeter', 'inch'],
      ['inch', 'millimeter'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Conversion Formula`,
      expression: `Value in ${to} = Value in ${from} × Conversion Factor`,
      example: `Multiply your length in ${from} by the standard SI ratio to calculate the equivalent distance in ${to}.`,
    }),
    units: {
      meter: { id: 'meter', name: 'Meter', plural: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      kilometer: { id: 'kilometer', name: 'Kilometer', plural: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      centimeter: { id: 'centimeter', name: 'Centimeter', plural: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      millimeter: { id: 'millimeter', name: 'Millimeter', plural: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      micrometer: { id: 'micrometer', name: 'Micrometer', plural: 'Micrometers', symbol: 'µm', toBase: (v) => v * 1e-6, fromBase: (v) => v / 1e-6 },
      nanometer: { id: 'nanometer', name: 'Nanometer', plural: 'Nanometers', symbol: 'nm', toBase: (v) => v * 1e-9, fromBase: (v) => v / 1e-9 },
      inch: { id: 'inch', name: 'Inch', plural: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      foot: { id: 'foot', name: 'Foot', plural: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      yard: { id: 'yard', name: 'Yard', plural: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      mile: { id: 'mile', name: 'Mile', plural: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      nautical_mile: { id: 'nautical_mile', name: 'Nautical Mile', plural: 'Nautical Miles', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    },
  },

  weight: {
    id: 'weight',
    title: 'Weight & Mass',
    baseUnit: 'kilogram',
    description: 'Convert between metric and imperial weight measurements including kilograms, grams, pounds, ounces, and metric tons.',
    popularPairs: [
      ['kilogram', 'pound'],
      ['pound', 'kilogram'],
      ['gram', 'ounce'],
      ['ounce', 'gram'],
      ['kilogram', 'stone'],
      ['stone', 'kilogram'],
      ['metric_ton', 'pound'],
      ['gram', 'carat'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Conversion Formula`,
      expression: `Value in ${to} = Value in ${from} × Mass Conversion Factor`,
      example: `Multiply your weight in ${from} by the standard mass coefficient to find the exact value in ${to}.`,
    }),
    units: {
      kilogram: { id: 'kilogram', name: 'Kilogram', plural: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      gram: { id: 'gram', name: 'Gram', plural: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      milligram: { id: 'milligram', name: 'Milligram', plural: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      microgram: { id: 'microgram', name: 'Microgram', plural: 'Micrograms', symbol: 'µg', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
      metric_ton: { id: 'metric_ton', name: 'Metric Ton', plural: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      pound: { id: 'pound', name: 'Pound', plural: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      ounce: { id: 'ounce', name: 'Ounce', plural: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
      stone: { id: 'stone', name: 'Stone', plural: 'Stones', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
      carat: { id: 'carat', name: 'Carat', plural: 'Carats', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (v) => v / 0.0002 },
      grain: { id: 'grain', name: 'Grain', plural: 'Grains', symbol: 'gr', toBase: (v) => v * 0.00006479891, fromBase: (v) => v / 0.00006479891 },
    },
  },

  temperature: {
    id: 'temperature',
    title: 'Temperature',
    baseUnit: 'celsius',
    description: 'Convert between Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R) temperature scales.',
    popularPairs: [
      ['celsius', 'fahrenheit'],
      ['fahrenheit', 'celsius'],
      ['celsius', 'kelvin'],
      ['kelvin', 'celsius'],
      ['fahrenheit', 'kelvin'],
    ],
    formulaTemplate: (from, to) => {
      if (from === 'celsius' && to === 'fahrenheit') {
        return {
          title: 'Celsius to Fahrenheit Formula',
          expression: '°F = (°C × 9/5) + 32',
          example: 'To convert 25°C: (25 × 1.8) + 32 = 45 + 32 = 77°F.',
        };
      }
      if (from === 'fahrenheit' && to === 'celsius') {
        return {
          title: 'Fahrenheit to Celsius Formula',
          expression: '°C = (°F - 32) × 5/9',
          example: 'To convert 77°F: (77 - 32) × 5/9 = 45 × 0.5556 = 25°C.',
        };
      }
      if (from === 'celsius' && to === 'kelvin') {
        return {
          title: 'Celsius to Kelvin Formula',
          expression: 'K = °C + 273.15',
          example: 'To convert 25°C: 25 + 273.15 = 298.15 K.',
        };
      }
      if (from === 'kelvin' && to === 'celsius') {
        return {
          title: 'Kelvin to Celsius Formula',
          expression: '°C = K - 273.15',
          example: 'To convert 300 K: 300 - 273.15 = 26.85°C.',
        };
      }
      return {
        title: `${from} to ${to} Formula`,
        expression: `Standard thermodynamic conversion applied.`,
        example: `Convert ${from} to baseline Celsius then map to ${to}.`,
      };
    },
    units: {
      celsius: { id: 'celsius', name: 'Celsius', plural: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      fahrenheit: { id: 'fahrenheit', name: 'Fahrenheit', plural: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      kelvin: { id: 'kelvin', name: 'Kelvin', plural: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      rankine: { id: 'rankine', name: 'Rankine', plural: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 491.67 },
    },
  },

  area: {
    id: 'area',
    title: 'Area',
    baseUnit: 'square_meter',
    description: 'Convert between square meters, square feet, acres, hectares, square kilometers, and square miles.',
    popularPairs: [
      ['square_meter', 'square_foot'],
      ['square_foot', 'square_meter'],
      ['acre', 'square_foot'],
      ['square_foot', 'acre'],
      ['hectare', 'acre'],
      ['acre', 'hectare'],
      ['square_meter', 'acre'],
      ['square_kilometer', 'square_mile'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Conversion Formula`,
      expression: `Area in ${to} = Area in ${from} × Surface Area Factor`,
      example: `Multiply area in ${from} by the geometric unit conversion ratio to get ${to}.`,
    }),
    units: {
      square_meter: { id: 'square_meter', name: 'Square Meter', plural: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      square_kilometer: { id: 'square_kilometer', name: 'Square Kilometer', plural: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      square_centimeter: { id: 'square_centimeter', name: 'Square Centimeter', plural: 'Square Centimeters', symbol: 'cm²', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
      square_millimeter: { id: 'square_millimeter', name: 'Square Millimeter', plural: 'Square Millimeters', symbol: 'mm²', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      square_foot: { id: 'square_foot', name: 'Square Foot', plural: 'Square Feet', symbol: 'sq ft', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
      square_inch: { id: 'square_inch', name: 'Square Inch', plural: 'Square Inches', symbol: 'sq in', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
      square_yard: { id: 'square_yard', name: 'Square Yard', plural: 'Square Yards', symbol: 'sq yd', toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
      square_mile: { id: 'square_mile', name: 'Square Mile', plural: 'Square Miles', symbol: 'sq mi', toBase: (v) => v * 2589988.110336, fromBase: (v) => v / 2589988.110336 },
      acre: { id: 'acre', name: 'Acre', plural: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      hectare: { id: 'hectare', name: 'Hectare', plural: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    },
  },

  volume: {
    id: 'volume',
    title: 'Volume & Capacity',
    baseUnit: 'liter',
    description: 'Convert between liters, milliliters, gallons, quarts, pints, cups, tablespoons, teaspoons, and cubic meters.',
    popularPairs: [
      ['liter', 'gallon_us'],
      ['gallon_us', 'liter'],
      ['milliliter', 'fluid_ounce_us'],
      ['fluid_ounce_us', 'milliliter'],
      ['liter', 'cup_us'],
      ['cup_us', 'milliliter'],
      ['gallon_us', 'quart_us'],
      ['cubic_meter', 'liter'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Volume Formula`,
      expression: `Volume in ${to} = Volume in ${from} × Fluid Ratio`,
      example: `Multiply volume in ${from} by the volumetric coefficient to obtain capacity in ${to}.`,
    }),
    units: {
      liter: { id: 'liter', name: 'Liter', plural: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      milliliter: { id: 'milliliter', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      cubic_meter: { id: 'cubic_meter', name: 'Cubic Meter', plural: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cubic_centimeter: { id: 'cubic_centimeter', name: 'Cubic Centimeter', plural: 'Cubic Centimeters', symbol: 'cm³', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      gallon_us: { id: 'gallon_us', name: 'Gallon (US)', plural: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
      quart_us: { id: 'quart_us', name: 'Quart (US)', plural: 'Quarts (US)', symbol: 'qt', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
      pint_us: { id: 'pint_us', name: 'Pint (US)', plural: 'Pints (US)', symbol: 'pt', toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
      cup_us: { id: 'cup_us', name: 'Cup (US)', plural: 'Cups (US)', symbol: 'cup', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
      fluid_ounce_us: { id: 'fluid_ounce_us', name: 'Fluid Ounce (US)', plural: 'Fluid Ounces (US)', symbol: 'fl oz', toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
      tablespoon: { id: 'tablespoon', name: 'Tablespoon (US)', plural: 'Tablespoons (US)', symbol: 'tbsp', toBase: (v) => v * 0.01478676478125, fromBase: (v) => v / 0.01478676478125 },
      teaspoon: { id: 'teaspoon', name: 'Teaspoon (US)', plural: 'Teaspoons (US)', symbol: 'tsp', toBase: (v) => v * 0.00492892159375, fromBase: (v) => v / 0.00492892159375 },
      cubic_foot: { id: 'cubic_foot', name: 'Cubic Foot', plural: 'Cubic Feet', symbol: 'cu ft', toBase: (v) => v * 28.316846592, fromBase: (v) => v / 28.316846592 },
      cubic_inch: { id: 'cubic_inch', name: 'Cubic Inch', plural: 'Cubic Inches', symbol: 'cu in', toBase: (v) => v * 0.016387064, fromBase: (v) => v / 0.016387064 },
    },
  },

  speed: {
    id: 'speed',
    title: 'Speed & Velocity',
    baseUnit: 'meter_per_second',
    description: 'Convert between kilometers per hour (km/h), miles per hour (mph), meters per second (m/s), knots, and mach.',
    popularPairs: [
      ['kilometer_per_hour', 'mile_per_hour'],
      ['mile_per_hour', 'kilometer_per_hour'],
      ['meter_per_second', 'kilometer_per_hour'],
      ['knot', 'mile_per_hour'],
      ['knot', 'kilometer_per_hour'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Speed Formula`,
      expression: `Speed in ${to} = Speed in ${from} × Velocity Ratio`,
      example: `Multiply speed in ${from} by conversion ratio to calculate rate of motion in ${to}.`,
    }),
    units: {
      meter_per_second: { id: 'meter_per_second', name: 'Meter per Second', plural: 'Meters per Second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      kilometer_per_hour: { id: 'kilometer_per_hour', name: 'Kilometer per Hour', plural: 'Kilometers per Hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      mile_per_hour: { id: 'mile_per_hour', name: 'Mile per Hour', plural: 'Miles per Hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { id: 'knot', name: 'Knot (Nautical mph)', plural: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444444, fromBase: (v) => v / 0.514444444 },
      foot_per_second: { id: 'foot_per_second', name: 'Foot per Second', plural: 'Feet per Second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      mach: { id: 'mach', name: 'Mach (Speed of Sound in Air)', plural: 'Mach', symbol: 'Ma', toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
    },
  },

  time: {
    id: 'time',
    title: 'Time & Duration',
    baseUnit: 'second',
    description: 'Convert between seconds, minutes, hours, days, weeks, months, years, and decades.',
    popularPairs: [
      ['hour', 'minute'],
      ['minute', 'second'],
      ['day', 'hour'],
      ['week', 'day'],
      ['year', 'day'],
      ['month', 'day'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Time Formula`,
      expression: `Duration in ${to} = Duration in ${from} × Time Multiplier`,
      example: `Multiply time duration in ${from} to get the exact units of ${to}.`,
    }),
    units: {
      second: { id: 'second', name: 'Second', plural: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      millisecond: { id: 'millisecond', name: 'Millisecond', plural: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      microsecond: { id: 'microsecond', name: 'Microsecond', plural: 'Microseconds', symbol: 'µs', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      nanosecond: { id: 'nanosecond', name: 'Nanosecond', plural: 'Nanoseconds', symbol: 'ns', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
      minute: { id: 'minute', name: 'Minute', plural: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      hour: { id: 'hour', name: 'Hour', plural: 'Hours', symbol: 'hr', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      day: { id: 'day', name: 'Day', plural: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      week: { id: 'week', name: 'Week', plural: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      month: { id: 'month', name: 'Month (Average)', plural: 'Months', symbol: 'mo', toBase: (v) => v * 2629746, fromBase: (v) => v / 2629746 },
      year: { id: 'year', name: 'Year (365.25 d)', plural: 'Years', symbol: 'yr', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
      decade: { id: 'decade', name: 'Decade', plural: 'Decades', symbol: 'dec', toBase: (v) => v * 315576000, fromBase: (v) => v / 315576000 },
    },
  },

  pressure: {
    id: 'pressure',
    title: 'Pressure',
    baseUnit: 'pascal',
    description: 'Convert between Pascals (Pa), Kilopascals (kPa), Bar, PSI, Atmospheres, and mmHg.',
    popularPairs: [
      ['bar', 'psi'],
      ['psi', 'bar'],
      ['kilopascal', 'psi'],
      ['atmosphere', 'bar'],
      ['atmosphere', 'pascal'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Pressure Formula`,
      expression: `Pressure in ${to} = Pressure in ${from} × Pressure Constant`,
      example: `Multiply pressure in ${from} by the standard conversion factor to obtain ${to}.`,
    }),
    units: {
      pascal: { id: 'pascal', name: 'Pascal', plural: 'Pascals', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      kilopascal: { id: 'kilopascal', name: 'Kilopascal', plural: 'Kilopascals', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      megapascal: { id: 'megapascal', name: 'Megapascal', plural: 'Megapascals', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      bar: { id: 'bar', name: 'Bar', plural: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      millibar: { id: 'millibar', name: 'Millibar', plural: 'Millibars', symbol: 'mbar', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
      psi: { id: 'psi', name: 'Pound per Square Inch', plural: 'PSI', symbol: 'psi', toBase: (v) => v * 6894.757293168, fromBase: (v) => v / 6894.757293168 },
      atmosphere: { id: 'atmosphere', name: 'Standard Atmosphere', plural: 'Atmospheres', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      torr: { id: 'torr', name: 'Torr (mmHg)', plural: 'Torr', symbol: 'Torr', toBase: (v) => v * 133.322368421, fromBase: (v) => v / 133.322368421 },
    },
  },

  energy: {
    id: 'energy',
    title: 'Energy & Work',
    baseUnit: 'joule',
    description: 'Convert between Joules, Kilojoules, Calories, Kilocalories, Watt-hours, Kilowatt-hours, and BTUs.',
    popularPairs: [
      ['joule', 'calorie'],
      ['calorie', 'joule'],
      ['kilowatt_hour', 'joule'],
      ['kilocalorie', 'kilojoule'],
      ['btu', 'joule'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Energy Formula`,
      expression: `Energy in ${to} = Energy in ${from} × Energy Ratio`,
      example: `Multiply energy value in ${from} by thermodynamic equivalent to compute ${to}.`,
    }),
    units: {
      joule: { id: 'joule', name: 'Joule', plural: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      kilojoule: { id: 'kilojoule', name: 'Kilojoule', plural: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      megajoule: { id: 'megajoule', name: 'Megajoule', plural: 'Megajoules', symbol: 'MJ', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      calorie: { id: 'calorie', name: 'Gram Calorie', plural: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      kilocalorie: { id: 'kilocalorie', name: 'Kilocalorie (Food Cal)', plural: 'Kilocalories', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      watt_hour: { id: 'watt_hour', name: 'Watt-hour', plural: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      kilowatt_hour: { id: 'kilowatt_hour', name: 'Kilowatt-hour', plural: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      electronvolt: { id: 'electronvolt', name: 'Electronvolt', plural: 'Electronvolts', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (v) => v / 1.602176634e-19 },
      btu: { id: 'btu', name: 'British Thermal Unit', plural: 'BTUs', symbol: 'BTU', toBase: (v) => v * 1055.05585262, fromBase: (v) => v / 1055.05585262 },
      foot_pound: { id: 'foot_pound', name: 'Foot-Pound', plural: 'Foot-Pounds', symbol: 'ft⋅lb', toBase: (v) => v * 1.3558179483314, fromBase: (v) => v / 1.3558179483314 },
    },
  },

  power: {
    id: 'power',
    title: 'Power',
    baseUnit: 'watt',
    description: 'Convert between Watts, Kilowatts, Megawatts, Mechanical Horsepower (hp), and Metric Horsepower.',
    popularPairs: [
      ['kilowatt', 'horsepower'],
      ['horsepower', 'kilowatt'],
      ['watt', 'horsepower'],
      ['megawatt', 'kilowatt'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Power Formula`,
      expression: `Power in ${to} = Power in ${from} × Power Coefficient`,
      example: `Multiply power rating in ${from} by conversion ratio to find output in ${to}.`,
    }),
    units: {
      watt: { id: 'watt', name: 'Watt', plural: 'Watts', symbol: 'W', toBase: (v) => v, fromBase: (v) => v },
      kilowatt: { id: 'kilowatt', name: 'Kilowatt', plural: 'Kilowatts', symbol: 'kW', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      megawatt: { id: 'megawatt', name: 'Megawatt', plural: 'Megawatts', symbol: 'MW', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      horsepower: { id: 'horsepower', name: 'Mechanical Horsepower', plural: 'Horsepower', symbol: 'hp', toBase: (v) => v * 745.6998715822702, fromBase: (v) => v / 745.6998715822702 },
      metric_horsepower: { id: 'metric_horsepower', name: 'Metric Horsepower (PS)', plural: 'Metric Horsepower', symbol: 'PS', toBase: (v) => v * 735.49875, fromBase: (v) => v / 735.49875 },
      btu_per_hour: { id: 'btu_per_hour', name: 'BTU per Hour', plural: 'BTU/hr', symbol: 'BTU/h', toBase: (v) => v * 0.29307107, fromBase: (v) => v / 0.29307107 },
    },
  },

  storage: {
    id: 'storage',
    title: 'Digital Storage & Data',
    baseUnit: 'byte',
    description: 'Convert between Bits, Bytes, Kilobytes (KB), Megabytes (MB), Gigabytes (GB), Terabytes (TB), and Binary units (KiB, MiB, GiB).',
    popularPairs: [
      ['gigabyte', 'megabyte'],
      ['terabyte', 'gigabyte'],
      ['megabyte', 'kilobyte'],
      ['byte', 'bit'],
      ['gigabyte', 'gibibyte'],
      ['terabyte', 'tebibyte'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Data Formula`,
      expression: `Data in ${to} = Data in ${from} × Storage Factor`,
      example: `Multiply digital data amount in ${from} to compute capacity in ${to}.`,
    }),
    units: {
      bit: { id: 'bit', name: 'Bit', plural: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
      byte: { id: 'byte', name: 'Byte', plural: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      kilobyte: { id: 'kilobyte', name: 'Kilobyte (Decimal)', plural: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      megabyte: { id: 'megabyte', name: 'Megabyte (Decimal)', plural: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      gigabyte: { id: 'gigabyte', name: 'Gigabyte (Decimal)', plural: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      terabyte: { id: 'terabyte', name: 'Terabyte (Decimal)', plural: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
      petabyte: { id: 'petabyte', name: 'Petabyte (Decimal)', plural: 'Petabytes', symbol: 'PB', toBase: (v) => v * 1e15, fromBase: (v) => v / 1e15 },
      kibibyte: { id: 'kibibyte', name: 'Kibibyte (Binary)', plural: 'Kibibytes', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      mebibyte: { id: 'mebibyte', name: 'Mebibyte (Binary)', plural: 'Mebibytes', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      gibibyte: { id: 'gibibyte', name: 'Gibibyte (Binary)', plural: 'Gibibytes', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      tebibyte: { id: 'tebibyte', name: 'Tebibyte (Binary)', plural: 'Tebibytes', symbol: 'TiB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    },
  },

  angle: {
    id: 'angle',
    title: 'Plane Angle',
    baseUnit: 'radian',
    description: 'Convert between Degrees (°), Radians (rad), Gradians (grad), Arcminutes, Arcseconds, and Revolutions.',
    popularPairs: [
      ['degree', 'radian'],
      ['radian', 'degree'],
      ['degree', 'gradian'],
      ['revolution', 'degree'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Angle Formula`,
      expression: `Angle in ${to} = Angle in ${from} × Geometric Ratio`,
      example: `Multiply angular value in ${from} by geometric factor (e.g. π / 180) to compute ${to}.`,
    }),
    units: {
      radian: { id: 'radian', name: 'Radian', plural: 'Radians', symbol: 'rad', toBase: (v) => v, fromBase: (v) => v },
      degree: { id: 'degree', name: 'Degree', plural: 'Degrees', symbol: '°', toBase: (v) => (v * Math.PI) / 180, fromBase: (v) => (v * 180) / Math.PI },
      gradian: { id: 'gradian', name: 'Gradian (Gon)', plural: 'Gradians', symbol: 'grad', toBase: (v) => (v * Math.PI) / 200, fromBase: (v) => (v * 200) / Math.PI },
      arcminute: { id: 'arcminute', name: 'Arcminute', plural: 'Arcminutes', symbol: 'arcmin', toBase: (v) => (v * Math.PI) / 10800, fromBase: (v) => (v * 10800) / Math.PI },
      arcsecond: { id: 'arcsecond', name: 'Arcsecond', plural: 'Arcseconds', symbol: 'arcsec', toBase: (v) => (v * Math.PI) / 648000, fromBase: (v) => (v * 648000) / Math.PI },
      revolution: { id: 'revolution', name: 'Revolution (Circle)', plural: 'Revolutions', symbol: 'rev', toBase: (v) => v * 2 * Math.PI, fromBase: (v) => v / (2 * Math.PI) },
    },
  },

  fuel: {
    id: 'fuel',
    title: 'Fuel Economy & Consumption',
    baseUnit: 'kilometer_per_liter',
    description: 'Convert between Kilometers per Liter (km/L), Liters per 100km (L/100km), Miles per Gallon US (MPG US), and Miles per Gallon UK (MPG UK).',
    popularPairs: [
      ['mpg_us', 'kilometer_per_liter'],
      ['kilometer_per_liter', 'mpg_us'],
      ['liter_per_100km', 'mpg_us'],
      ['mpg_us', 'mpg_uk'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Fuel Consumption Formula`,
      expression: `Fuel metric calculated based on volumetric distance ratio.`,
      example: `Convert between distance per volume and volumetric consumption per 100 km.`,
    }),
    units: {
      kilometer_per_liter: {
        id: 'kilometer_per_liter',
        name: 'Kilometer per Liter',
        plural: 'Kilometers per Liter',
        symbol: 'km/L',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      mpg_us: {
        id: 'mpg_us',
        name: 'Miles per Gallon (US)',
        plural: 'MPG (US)',
        symbol: 'mpg (US)',
        toBase: (v) => v * 0.425143707,
        fromBase: (v) => v / 0.425143707,
      },
      mpg_uk: {
        id: 'mpg_uk',
        name: 'Miles per Gallon (UK)',
        plural: 'MPG (UK)',
        symbol: 'mpg (UK)',
        toBase: (v) => v * 0.35400619,
        fromBase: (v) => v / 0.35400619,
      },
      liter_per_100km: {
        id: 'liter_per_100km',
        name: 'Liters per 100km',
        plural: 'L/100km',
        symbol: 'L/100km',
        toBase: (v) => (v === 0 ? 0 : 100 / v),
        fromBase: (v) => (v === 0 ? 0 : 100 / v),
      },
    },
  },
};

/**
 * Format floating-point numbers cleanly with smart rounding
 */
export function formatUnitNumber(num: number, maxDecimals: number = 6): string {
  if (isNaN(num)) return '0';
  if (!isFinite(num)) return 'Infinity';
  if (num === 0) return '0';

  const abs = Math.abs(num);
  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) {
    return num.toExponential(4);
  }

  // Round without trailing zeroes
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(num * factor) / factor;
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Generates programmatic lookup tables for search engine indexing
 */
export function generateConversionTableData(
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string,
  values: number[] = [1, 2, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]
) {
  const fromUnit = category.units[fromUnitId];
  const toUnit = category.units[toUnitId];

  if (!fromUnit || !toUnit) {
    return {
      title: 'Unit Conversion Reference Table',
      headers: ['From Unit', 'To Unit'] as [string, string],
      rows: [],
    };
  }

  return {
    title: `${fromUnit.name} to ${toUnit.name} Conversion Reference Table`,
    headers: [`${fromUnit.name} (${fromUnit.symbol})`, `${toUnit.name} (${toUnit.symbol})`] as [string, string],
    rows: values.map((val) => {
      const baseVal = fromUnit.toBase(val);
      const converted = toUnit.fromBase(baseVal);
      return {
        fromValue: `${val} ${fromUnit.symbol}`,
        toValue: `${formatUnitNumber(converted, 5)} ${toUnit.symbol}`,
      };
    }),
    caption: `Standard mathematical reference matrix calculated using SI unit definitions.`,
  };
}

/**
 * Helper to get a category containing two unit IDs
 */
export function findCategoryByUnitIds(unitA: string, unitB: string): { category: UnitCategory; fromId: string; toId: string } | null {
  for (const cat of Object.values(UNIT_CATEGORIES)) {
    const units = cat.units;
    if (units[unitA] && units[unitB]) {
      return { category: cat, fromId: unitA, toId: unitB };
    }
  }
  return null;
}

/**
 * Helper to parse slug like "meter-to-foot"
 */
export function parseUnitPairSlug(slug: string): { category: UnitCategory; fromUnit: UnitDefinition; toUnit: UnitDefinition } | null {
  const parts = slug.split('-to-');
  if (parts.length !== 2) return null;
  const [fromId, toId] = parts;

  for (const cat of Object.values(UNIT_CATEGORIES)) {
    if (cat.units[fromId] && cat.units[toId]) {
      return {
        category: cat,
        fromUnit: cat.units[fromId],
        toUnit: cat.units[toId],
      };
    }
  }
  return null;
}
