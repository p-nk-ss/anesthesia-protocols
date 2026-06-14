import type { CATEGORIES } from '../content.config';

export type CategoryKey = (typeof CATEGORIES)[number];

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  blurb: string;
  /** Inline SVG path data (24×24 viewBox), stroke-based. */
  icon: string;
}

/** Порядок = порядок відображення на головній. */
export const CATEGORY_LIST: CategoryMeta[] = [
  {
    key: 'airway',
    label: 'Дихальні шляхи',
    blurb: 'Інтубація, складні дихальні шляхи, FONA',
    icon: 'M4 13c2.5 0 3-3 5-3s2 3 4 3 2.5-4 4.5-4M5 18.5c1.8 0 2.3-2 3.5-2s1.6 2 3 2M7 7.5c1.2 0 1.7 1.5 2.8 1.5',
  },
  {
    key: 'emergencies',
    label: 'Невідкладні стани',
    blurb: 'Алгоритми дій у критичних ситуаціях',
    icon: 'M12 3 3 19.5h18L12 3Zm0 6v5m0 3.5h.01',
  },
  {
    key: 'preoperative',
    label: 'Передопераційна оцінка',
    blurb: 'Обстеження та підготовка до втручання',
    icon: 'M9 3h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2V4a1 1 0 0 1 1-1Zm0 2v1h6V5M8.5 12l2 2 4-4',
  },
  {
    key: 'tools',
    label: 'Шкали та інструменти',
    blurb: 'Калькулятори ризику та класифікації',
    icon: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 4h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 11v6.5',
  },
  {
    key: 'checklists',
    label: 'Чек-листи',
    blurb: 'Контрольні переліки та стандарти безпеки',
    icon: 'M9 5h11M9 12h11M9 19h11M4 5l1 1 2-2M4 12l1 1 2-2M4 19l1 1 2-2',
  },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.key, c]),
) as Record<CategoryKey, CategoryMeta>;

export const TYPE_LABEL: Record<'algorithm' | 'reference', string> = {
  algorithm: 'Алгоритм',
  reference: 'Довідка',
};
