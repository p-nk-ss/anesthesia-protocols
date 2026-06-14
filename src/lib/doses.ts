/**
 * Дані для калькулятора болюсних доз: вага пацієнта → доза (мг/мкг) та об'єм (мл).
 * Дози — орієнтовні, з авторитетних джерел (BNF / SmPC / AnesthGuide.com; для
 * реанімаційних болюсів — Emergency Manual). Завжди звіряйте з локальним протоколом.
 *
 * Одиниці узгоджені: `perKg`/`fixed`/`maxDose` і `concPerMl` — в одній одиниці `unit`:
 *   unit 'mg'  → доза в мг,  concPerMl у мг/мл
 *   unit 'mcg' → доза в мкг, concPerMl у мкг/мл
 * Перерахунок робить клієнт офлайн (dose.ts).
 */

export type DoseUnit = 'mg' | 'mcg';

export interface BolusDrug {
  name: string;
  /** Показання/контекст (індукція, РСІ, анафілаксія…). */
  indication?: string;
  /** Доза на кг (у `unit`). Якщо немає — препарат не за вагою (див. `fixed`). */
  perKg?: { min: number; max: number };
  /** Фіксована доза (у `unit`), не залежить від ваги. */
  fixed?: { min: number; max: number };
  unit: DoseUnit;
  /** Абсолютний кеп дози (у `unit`). */
  maxDose?: number;
  /** Концентрація у тій самій одиниці, що `unit` (мг/мл або мкг/мл). */
  concPerMl: number;
  concLabel: string;
  note?: string;
}

export interface BolusGroup {
  title: string;
  drugs: BolusDrug[];
}

export interface LocalDrug {
  name: string;
  /** Макс. доза без адреналіну, мг/кг. */
  maxPerKg: number;
  /** Макс. доза з адреналіном, мг/кг (якщо є). */
  maxPerKgEpi?: number;
  /** Абсолютний максимум на одну блокаду, мг. */
  absoluteMax?: number;
  /** Стандартна концентрація, мг/мл (для розрахунку макс. об'єму). */
  concPerMl: number;
  concLabel: string;
  note?: string;
}

export const BOLUS_GROUPS: BolusGroup[] = [
  {
    title: 'Індукція (в/в)',
    drugs: [
      {
        name: 'Пропофол',
        indication: 'індукція',
        perKg: { min: 1.5, max: 2.5 },
        unit: 'mg',
        concPerMl: 10,
        concLabel: '10 мг/мл (1%)',
        note: 'Знижуй дозу в літніх і нестабільних пацієнтів',
      },
      {
        name: 'Кетамін',
        indication: 'індукція',
        perKg: { min: 1, max: 2 },
        unit: 'mg',
        concPerMl: 50,
        concLabel: '50 мг/мл',
      },
      {
        name: 'Етомідат',
        indication: 'індукція',
        perKg: { min: 0.2, max: 0.3 },
        unit: 'mg',
        concPerMl: 2,
        concLabel: '2 мг/мл',
      },
      {
        name: 'Тіопентал',
        indication: 'індукція',
        perKg: { min: 3, max: 5 },
        unit: 'mg',
        concPerMl: 25,
        concLabel: '25 мг/мл (2,5%)',
      },
      {
        name: 'Мідазолам',
        indication: 'седація / ко-індукція',
        perKg: { min: 0.02, max: 0.1 },
        unit: 'mg',
        concPerMl: 5,
        concLabel: '5 мг/мл',
        note: 'Доза для седації/ко-індукції, НЕ для моноіндукції',
      },
    ],
  },
  {
    title: 'Опіоїди',
    drugs: [
      {
        name: 'Фентаніл',
        perKg: { min: 1, max: 3 },
        unit: 'mcg',
        concPerMl: 50,
        concLabel: '50 мкг/мл',
      },
      {
        name: 'Альфентаніл',
        perKg: { min: 10, max: 20 },
        unit: 'mcg',
        concPerMl: 500,
        concLabel: '500 мкг/мл',
      },
      {
        name: 'Суфентаніл',
        perKg: { min: 0.1, max: 0.5 },
        unit: 'mcg',
        concPerMl: 5,
        concLabel: '5 мкг/мл',
      },
      {
        name: 'Морфін',
        perKg: { min: 0.05, max: 0.1 },
        unit: 'mg',
        concPerMl: 10,
        concLabel: '10 мг/мл',
      },
    ],
  },
  {
    title: 'Міорелаксанти',
    drugs: [
      {
        name: 'Суксаметоній',
        indication: 'РСІ',
        perKg: { min: 1, max: 1.5 },
        unit: 'mg',
        concPerMl: 50,
        concLabel: '50 мг/мл',
        note: 'Діти 1,5–2 мг/кг',
      },
      {
        name: 'Рокуроній',
        indication: 'інтубація',
        perKg: { min: 0.6, max: 0.6 },
        unit: 'mg',
        concPerMl: 10,
        concLabel: '10 мг/мл',
        note: 'РСІ 1,0–1,2 мг/кг',
      },
      {
        name: 'Цисатракурій',
        perKg: { min: 0.15, max: 0.15 },
        unit: 'mg',
        concPerMl: 2,
        concLabel: '2 мг/мл',
      },
      {
        name: 'Атракурій',
        perKg: { min: 0.5, max: 0.5 },
        unit: 'mg',
        concPerMl: 10,
        concLabel: '10 мг/мл',
      },
      {
        name: 'Векуроній',
        perKg: { min: 0.1, max: 0.1 },
        unit: 'mg',
        concPerMl: 2,
        concLabel: '2 мг/мл (10 мг + 5 мл)',
      },
    ],
  },
  {
    title: 'Реверсія та антихолінергіки',
    drugs: [
      {
        name: 'Неостигмін',
        indication: 'реверсія',
        perKg: { min: 0.04, max: 0.05 },
        unit: 'mg',
        maxDose: 5,
        concPerMl: 2.5,
        concLabel: '2,5 мг/мл',
        note: 'Разом з атропіном/глікопіролатом; макс 5 мг',
      },
      {
        name: 'Сугамадекс',
        indication: 'помірний блок',
        perKg: { min: 2, max: 2 },
        unit: 'mg',
        concPerMl: 100,
        concLabel: '100 мг/мл',
        note: 'Глибокий блок 4 мг/кг; негайна реверсія 16 мг/кг',
      },
      {
        name: 'Атропін',
        indication: 'з неостигміном',
        perKg: { min: 0.01, max: 0.02 },
        unit: 'mg',
        concPerMl: 1,
        concLabel: '1 мг/мл',
        note: 'Брадикардія: 0,5 мг в/в (діти 0,02 мг/кг)',
      },
      {
        name: 'Глікопіролат',
        indication: 'з неостигміном',
        perKg: { min: 0.01, max: 0.015 },
        unit: 'mg',
        maxDose: 1,
        concPerMl: 0.2,
        concLabel: '0,2 мг/мл',
        note: '0,2 мг на кожен 1 мг неостигміну',
      },
    ],
  },
  {
    title: 'Невідкладні болюси',
    drugs: [
      {
        name: 'Адреналін (анафілаксія, в/в)',
        perKg: { min: 1, max: 1 },
        unit: 'mcg',
        concPerMl: 100,
        concLabel: '100 мкг/мл (1:10 000)',
        note: 'IM 1:1000 — перша лінія; в/в лише досвідченим фахівцям. Інфузія 0,05–0,1 мкг/кг/хв',
      },
      {
        name: 'Адреналін (зупинка серця)',
        perKg: { min: 10, max: 10 },
        unit: 'mcg',
        maxDose: 1000,
        concPerMl: 100,
        concLabel: '100 мкг/мл (1:10 000)',
        note: 'Дорослі 1 мг кожні 3–5 хв',
      },
      {
        name: 'Ефедрин',
        indication: 'гіпотензія',
        fixed: { min: 5, max: 10 },
        unit: 'mg',
        concPerMl: 5,
        concLabel: '5 мг/мл',
      },
      {
        name: 'Фенілефрин',
        indication: 'гіпотензія',
        fixed: { min: 50, max: 100 },
        unit: 'mcg',
        concPerMl: 100,
        concLabel: '100 мкг/мл',
      },
      {
        name: 'Аміодарон',
        indication: 'ФШ/ШТ',
        perKg: { min: 5, max: 5 },
        unit: 'mg',
        maxDose: 300,
        concPerMl: 50,
        concLabel: '50 мг/мл',
        note: 'Зупинка серця: 300 мг болюс',
      },
      {
        name: 'Магнію сульфат',
        perKg: { min: 30, max: 50 },
        unit: 'mg',
        maxDose: 2000,
        concPerMl: 200,
        concLabel: '200 мг/мл (20%)',
        note: 'Torsade/еклампсія: 2 г в/в',
      },
      {
        name: 'Кальцію хлорид 10%',
        perKg: { min: 10, max: 20 },
        unit: 'mg',
        maxDose: 1000,
        concPerMl: 100,
        concLabel: '100 мг/мл (10%)',
        note: 'Макс ~1 г (10 мл) разово',
      },
      {
        name: 'Налоксон',
        indication: 'післяоп. депресія дихання',
        perKg: { min: 1, max: 10 },
        unit: 'mcg',
        concPerMl: 400,
        concLabel: '400 мкг/мл',
        note: 'Титруй до дихання. При передозуванні опіоїдами — 10 мкг/кг, повторюй до ~100 мкг/кг',
      },
      {
        name: 'Глюкоза 10%',
        indication: 'гіпоглікемія',
        perKg: { min: 200, max: 200 },
        unit: 'mg',
        concPerMl: 100,
        concLabel: '100 мг/мл (10%) = 2 мл/кг',
      },
    ],
  },
  {
    title: 'Антиеметики та ад’юванти',
    drugs: [
      {
        name: 'Ондансетрон',
        perKg: { min: 0.1, max: 0.1 },
        unit: 'mg',
        maxDose: 4,
        concPerMl: 2,
        concLabel: '2 мг/мл',
        note: 'Доросла доза 4 мг',
      },
      {
        name: 'Дексаметазон',
        indication: 'PONV',
        perKg: { min: 0.1, max: 0.15 },
        unit: 'mg',
        maxDose: 8,
        concPerMl: 4,
        concLabel: '4 мг/мл',
      },
      {
        name: 'Парацетамол',
        perKg: { min: 15, max: 15 },
        unit: 'mg',
        maxDose: 1000,
        concPerMl: 10,
        concLabel: '10 мг/мл',
        note: 'Макс 1 г разово, 4 г/добу',
      },
      {
        name: 'Транексамова кислота',
        perKg: { min: 15, max: 15 },
        unit: 'mg',
        maxDose: 1000,
        concPerMl: 100,
        concLabel: '100 мг/мл',
        note: 'Макс ~1 г разово',
      },
    ],
  },
];

/**
 * Макс. дози місцевих анестетиків (дорослі) — AnesthGuide.com. Для дітей звіряйте
 * окремо. Об'єм рахується за стандартною концентрацією; інші концентрації
 * масштабуються лінійно.
 */
export const LOCAL_ANAESTHETICS: LocalDrug[] = [
  {
    name: 'Лідокаїн',
    maxPerKg: 4,
    maxPerKgEpi: 7,
    absoluteMax: 400,
    concPerMl: 20,
    concLabel: '20 мг/мл (2%)',
  },
  {
    name: 'Прилокаїн',
    maxPerKg: 5,
    maxPerKgEpi: 8,
    absoluteMax: 400,
    concPerMl: 20,
    concLabel: '20 мг/мл (2%)',
  },
  {
    name: 'Мепівакаїн',
    maxPerKg: 5,
    absoluteMax: 400,
    concPerMl: 20,
    concLabel: '20 мг/мл (2%)',
  },
  {
    name: 'Бупівакаїн',
    maxPerKg: 2,
    maxPerKgEpi: 3,
    absoluteMax: 150,
    concPerMl: 5,
    concLabel: '5 мг/мл (0,5%)',
  },
  {
    name: 'Левобупівакаїн',
    maxPerKg: 2,
    maxPerKgEpi: 3,
    absoluteMax: 150,
    concPerMl: 5,
    concLabel: '5 мг/мл (0,5%)',
  },
  {
    name: 'Ропівакаїн',
    maxPerKg: 3,
    absoluteMax: 300,
    concPerMl: 7.5,
    concLabel: '7,5 мг/мл (0,75%)',
  },
];

export const UNIT_LABEL: Record<DoseUnit, string> = {
  mg: 'мг',
  mcg: 'мкг',
};

export const isWeightBased = (d: BolusDrug): boolean => !!d.perKg;
