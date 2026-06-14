/**
 * Клієнтський перерахунок болюсних доз за вагою: доза (мг/мкг) та об'єм (мл).
 * Прогресивне покращення: без JS видно дозу/кг і концентрації; скрипт заповнює
 * колонки «доза» та «мл». Повністю офлайн. Прив'язка на astro:page-load.
 */
function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  const v = n >= 100 ? Math.round(n) : n >= 10 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
  return String(v).replace('.', ',');
}

const num = (el: HTMLElement, key: string): number => parseFloat(el.dataset[key] || '');
const has = (el: HTMLElement, key: string): boolean =>
  el.dataset[key] !== undefined && el.dataset[key] !== '';

let cleanups: Array<() => void> = [];

export function initDoses(): void {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.querySelectorAll<HTMLElement>('[data-dose-calc]').forEach(setup);
}

function setup(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('[data-weight]');
  if (!input) return;
  const bolus = Array.from(root.querySelectorAll<HTMLElement>('[data-bolus]'));
  const locals = Array.from(root.querySelectorAll<HTMLElement>('[data-local]'));

  function capped(v: number, max: number): number {
    return isFinite(max) ? Math.min(v, max) : v;
  }
  function range(lo: number, hi: number, unit: string): string {
    return (Math.abs(lo - hi) < 1e-9 ? `${fmt(lo)}` : `${fmt(lo)}–${fmt(hi)}`) + ` ${unit}`;
  }

  function recompute(): void {
    const wt = parseFloat(input.value.replace(',', '.'));
    const valid = isFinite(wt) && wt > 0 && wt <= 300;
    root.classList.toggle('is-active', valid);

    for (const row of bolus) {
      const doseCell = row.querySelector<HTMLElement>('[data-dose]');
      const mlCell = row.querySelector<HTMLElement>('[data-ml]');
      const unit = row.dataset.unit || '';
      const conc = num(row, 'conc');
      const cap = has(row, 'max') ? num(row, 'max') : Infinity;
      let lo: number, hi: number;

      if (has(row, 'fixedmin')) {
        // Фіксована доза — не залежить від ваги.
        lo = num(row, 'fixedmin');
        hi = num(row, 'fixedmax');
      } else if (valid) {
        lo = capped(num(row, 'perkgmin') * wt, cap);
        hi = capped(num(row, 'perkgmax') * wt, cap);
      } else {
        if (doseCell) doseCell.textContent = '—';
        if (mlCell) mlCell.textContent = '—';
        continue;
      }
      if (doseCell) doseCell.textContent = range(lo, hi, unit);
      if (mlCell)
        mlCell.textContent =
          Math.abs(lo - hi) < 1e-9 ? `${fmt(lo / conc)}` : `${fmt(lo / conc)}–${fmt(hi / conc)}`;
    }

    for (const row of locals) {
      const mgCell = row.querySelector<HTMLElement>('[data-local-mg]');
      const mlCell = row.querySelector<HTMLElement>('[data-local-ml]');
      const conc = num(row, 'conc');
      const abs = has(row, 'absmax') ? num(row, 'absmax') : Infinity;
      if (!valid) {
        if (mgCell) mgCell.textContent = '—';
        if (mlCell) mlCell.textContent = '—';
        continue;
      }
      const plain = capped(num(row, 'maxperkg') * wt, abs);
      const epi = has(row, 'maxperkgepi') ? capped(num(row, 'maxperkgepi') * wt, abs) : NaN;
      if (mgCell)
        mgCell.textContent = isFinite(epi)
          ? `${fmt(plain)} / ${fmt(epi)} мг`
          : `${fmt(plain)} мг`;
      if (mlCell) mlCell.textContent = `${fmt(plain / conc)} мл`;
    }
  }

  const onInput = () => recompute();
  input.addEventListener('input', onInput);
  cleanups.push(() => input.removeEventListener('input', onInput));
  recompute();
}
