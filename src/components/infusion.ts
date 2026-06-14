/**
 * Клієнтський перерахунок швидкості інфузій у мл/год за вагою пацієнта.
 * Прогресивне покращення: без JS видно концентрації та дози (мкг/кг/хв тощо);
 * скрипт додає колонку мл/год. Повністю офлайн. Прив'язка на astro:page-load.
 */
type RateUnit = string;

function mlPerHour(concPerMl: number, dose: number, unit: RateUnit, wt: number): number {
  switch (unit) {
    case 'mcg/kg/min':
    case 'mg/kg/min':
      return (dose * wt * 60) / concPerMl;
    case 'mcg/kg/hr':
    case 'mg/kg/hr':
      return (dose * wt) / concPerMl;
    case 'mcg/min':
    case 'mg/min':
    case 'units/min':
      return (dose * 60) / concPerMl;
    case 'mg/hr':
      return dose / concPerMl;
    default:
      return NaN;
  }
}

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  const v = n >= 100 ? Math.round(n) : n >= 10 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
  return String(v).replace('.', ',');
}

let cleanups: Array<() => void> = [];

export function initInfusions(): void {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.querySelectorAll<HTMLElement>('[data-infusion]').forEach(setup);
}

function setup(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-weight]');
  const cells = Array.from(root.querySelectorAll<HTMLElement>('[data-rate]'));
  if (!input) return;

  function recompute(): void {
    const wt = parseFloat(input.value.replace(',', '.'));
    const valid = isFinite(wt) && wt > 0 && wt <= 300;
    root.classList.toggle('is-active', valid);
    for (const cell of cells) {
      const conc = parseFloat(cell.dataset.conc || '0');
      const min = parseFloat(cell.dataset.min || '0');
      const max = parseFloat(cell.dataset.max || '0');
      const unit = cell.dataset.unit || '';
      if (!valid) {
        cell.textContent = '—';
        continue;
      }
      const lo = mlPerHour(conc, min, unit, wt);
      const hi = mlPerHour(conc, max, unit, wt);
      cell.textContent = min === max ? `${fmt(lo)}` : `${fmt(lo)}–${fmt(hi)}`;
    }
  }

  const onInput = () => recompute();
  input.addEventListener('input', onInput);
  cleanups.push(() => input.removeEventListener('input', onInput));
  recompute();
}
