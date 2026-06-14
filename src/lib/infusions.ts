/**
 * Дані для калькулятора інфузій (Список препаратів, Emergency Manual v4.4, стор. 59).
 * Концентрації та діапазони доз — дослівно з джерела. Перерахунок у мл/год робить
 * клієнт офлайн за вагою пацієнта.
 *
 * `concPerMl` зберігається в ОДИНИЦІ маси, що відповідає `rate.unit`:
 *   - mcg/kg/min, mcg/min        → concPerMl у мкг/мл
 *   - mg/kg/hr, mg/kg/min, mg/min, mg/hr → concPerMl у мг/мл
 *   - mcg/kg/hr                  → concPerMl у мкг/мл
 *   - units/min                  → concPerMl в од/мл
 */

export type RateUnit =
  | 'mcg/kg/min'
  | 'mcg/kg/hr'
  | 'mg/kg/min'
  | 'mg/kg/hr'
  | 'mcg/min'
  | 'mg/min'
  | 'mg/hr'
  | 'units/min';

export interface InfusionDrug {
  name: string;
  /** Рецепт розведення (людською мовою). */
  recipe: string;
  /** Підпис концентрації для табло. */
  concLabel: string;
  /** Концентрація в одиниці маси, що відповідає rate.unit (див. вгорі). */
  concPerMl: number;
  /** Завантажувальна доза (текст), якщо є. */
  loading?: string;
  rate: { min: number; max: number; unit: RateUnit };
}

export interface InfusionGroup {
  title: string;
  drugs: InfusionDrug[];
}

export const INFUSION_GROUPS: InfusionGroup[] = [
  {
    title: 'Вазопресори та інотропи',
    drugs: [
      {
        name: 'Адреналін',
        recipe: '4 мг / 250 мл 0,9% NaCl',
        concLabel: '16 мкг/мл',
        concPerMl: 16,
        rate: { min: 0.02, max: 0.3, unit: 'mcg/kg/min' },
      },
      {
        name: 'Норадреналін',
        recipe: '4 мг / 250 мл 0,9% NaCl',
        concLabel: '16 мкг/мл',
        concPerMl: 16,
        rate: { min: 0.02, max: 0.3, unit: 'mcg/kg/min' },
      },
      {
        name: 'Фенілефрин',
        recipe: '40 мг / 250 мл 0,9% NaCl',
        concLabel: '160 мкг/мл',
        concPerMl: 160,
        rate: { min: 0.1, max: 1, unit: 'mcg/kg/min' },
      },
      {
        name: 'Дофамін',
        recipe: '400 мг / 250 мл 5% глюкози',
        concLabel: '1600 мкг/мл',
        concPerMl: 1600,
        rate: { min: 2, max: 10, unit: 'mcg/kg/min' },
      },
      {
        name: 'Добутамін',
        recipe: '500 мг / 250 мл 5% глюкози',
        concLabel: '2000 мкг/мл',
        concPerMl: 2000,
        rate: { min: 2, max: 20, unit: 'mcg/kg/min' },
      },
      {
        name: 'Мілринон',
        recipe: '20 мг / 100 мл 5% глюкози',
        concLabel: '200 мкг/мл',
        concPerMl: 200,
        loading: '50–75 мкг/кг за 10 хв',
        rate: { min: 0.375, max: 0.75, unit: 'mcg/kg/min' },
      },
      {
        name: 'Ізопротеренол',
        recipe: '1 мг / 250 мл 0,9% NaCl або 5% глюкози',
        concLabel: '4 мкг/мл',
        concPerMl: 4,
        rate: { min: 1, max: 5, unit: 'mcg/min' },
      },
      {
        name: 'Вазопресин',
        recipe: '60 од / 100 мл 0,9% NaCl',
        concLabel: '0,6 од/мл',
        concPerMl: 0.6,
        rate: { min: 0.01, max: 0.1, unit: 'units/min' },
      },
    ],
  },
  {
    title: 'Антиаритмічні',
    drugs: [
      {
        name: 'Аміодарон',
        recipe: '1200 мг / 250 мл 5% глюкози',
        concLabel: '4,8 мг/мл',
        concPerMl: 4.8,
        loading: '150 мг за 10 хв',
        rate: { min: 1, max: 1, unit: 'mg/min' },
      },
      {
        name: 'Лідокаїн',
        recipe: '2 г / 250 мл 0,9% NaCl',
        concLabel: '8 мг/мл',
        concPerMl: 8,
        loading: '1–1,5 мг/кг',
        rate: { min: 1, max: 2, unit: 'mg/kg/hr' },
      },
      {
        name: 'Есмолол',
        recipe: '2500 мг / 250 мл 0,9% NaCl',
        concLabel: '10 мг/мл',
        concPerMl: 10,
        rate: { min: 0.05, max: 0.3, unit: 'mg/kg/min' },
      },
      {
        name: 'Дилтіазем',
        recipe: '125 мг / 100 мл 0,9% NaCl або 5% глюкози',
        concLabel: '1,25 мг/мл',
        concPerMl: 1.25,
        loading: '2,5–25 мг',
        rate: { min: 2, max: 10, unit: 'mg/hr' },
      },
    ],
  },
  {
    title: 'Антигіпертензивні та вазодилататори',
    drugs: [
      {
        name: 'Нітрогліцерин',
        recipe: '50 мг / 250 мл 5% глюкози',
        concLabel: '200 мкг/мл',
        concPerMl: 200,
        rate: { min: 0.1, max: 1, unit: 'mcg/kg/min' },
      },
      {
        name: 'Нітропрусид натрію',
        recipe: '50 мг / 250 мл 0,9% NaCl',
        concLabel: '200 мкг/мл',
        concPerMl: 200,
        rate: { min: 0.1, max: 1, unit: 'mcg/kg/min' },
      },
      {
        name: 'Клевідипін',
        recipe: '25 мг / 50 мл',
        concLabel: '0,5 мг/мл',
        concPerMl: 0.5,
        rate: { min: 1, max: 16, unit: 'mg/hr' },
      },
      {
        name: 'Нікардипін',
        recipe: '40 мг / 200 мл 0,9% NaCl',
        concLabel: '0,2 мг/мл',
        concPerMl: 0.2,
        rate: { min: 5, max: 15, unit: 'mg/hr' },
      },
      {
        name: 'Фенолдопам',
        recipe: '10 мг / 250 мл 0,9% NaCl або 5% глюкози',
        concLabel: '40 мкг/мл',
        concPerMl: 40,
        rate: { min: 0.05, max: 0.2, unit: 'mcg/kg/min' },
      },
    ],
  },
  {
    title: 'Інші',
    drugs: [
      {
        name: 'Дексмедетомідин',
        recipe: '400 мкг / 100 мл 0,9% NaCl',
        concLabel: '4 мкг/мл',
        concPerMl: 4,
        loading: '0,5–1 мкг/кг за 10 хв',
        rate: { min: 0.2, max: 1.5, unit: 'mcg/kg/hr' },
      },
      {
        name: 'Реміфентаніл',
        recipe: '2000 мкг (2 мг) / 40 мл 0,9% NaCl',
        concLabel: '50 мкг/мл',
        concPerMl: 50,
        rate: { min: 0.01, max: 0.2, unit: 'mcg/kg/min' },
      },
      {
        name: 'Несиритид (BNP)',
        recipe: '1,5 мг / 250 мл 5% глюкози',
        concLabel: '6 мкг/мл',
        concPerMl: 6,
        loading: '2 мкг/кг за 1 хв',
        rate: { min: 0.01, max: 0.01, unit: 'mcg/kg/min' },
      },
    ],
  },
];

export const RATE_LABEL: Record<RateUnit, string> = {
  'mcg/kg/min': 'мкг/кг/хв',
  'mcg/kg/hr': 'мкг/кг/год',
  'mg/kg/min': 'мг/кг/хв',
  'mg/kg/hr': 'мг/кг/год',
  'mcg/min': 'мкг/хв',
  'mg/min': 'мг/хв',
  'mg/hr': 'мг/год',
  'units/min': 'од/хв',
};

export const isWeightBased = (u: RateUnit): boolean => u.includes('/kg');
