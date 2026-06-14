/**
 * Клієнтський розрахунок плану периопераційної інфузії за вагою, голодуванням,
 * інвазивністю операції та крововтратою. Прогресивне покращення: без JS видно
 * формули й діапазони; скрипт заповнює обчислені значення. Повністю офлайн.
 * Прив'язка на astro:page-load. Конвенції — за infusion.ts.
 */

/** Підтримуюча швидкість за правилом 4-2-1 (мл/год). */
function maintenanceRate(wt: number): number {
  if (wt <= 10) return wt * 4;
  if (wt <= 20) return 40 + (wt - 10) * 2;
  return 60 + (wt - 20) * 1;
}

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  const v = n >= 100 ? Math.round(n) : n >= 10 ? Math.round(n * 10) / 10 : Math.round(n * 100) / 100;
  return String(v).replace('.', ',');
}

function fmtRange(lo: number, hi: number): string {
  if (!isFinite(lo) || !isFinite(hi)) return '—';
  return Math.round(lo) === Math.round(hi) ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
}

let cleanups: Array<() => void> = [];

export function initFluid(): void {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.querySelectorAll<HTMLElement>('[data-fluid]').forEach(setup);
}

function num(el: HTMLInputElement | null): number {
  if (!el) return NaN;
  return parseFloat(el.value.replace(',', '.'));
}

function setup(root: HTMLElement): void {
  const weightEl = root.querySelector<HTMLInputElement>('[data-fluid-weight]');
  const fastingEl = root.querySelector<HTMLInputElement>('[data-fluid-fasting]');
  const classEl = root.querySelector<HTMLSelectElement>('[data-fluid-class]');
  const eblEl = root.querySelector<HTMLInputElement>('[data-fluid-ebl]');
  if (!weightEl) return;

  const out = (key: string): HTMLElement | null =>
    root.querySelector<HTMLElement>(`[data-fluid-out="${key}"]`);

  function set(key: string, text: string): void {
    const el = out(key);
    if (el) el.textContent = text;
  }

  function recompute(): void {
    const wt = num(weightEl);
    const fasting = Math.max(0, num(fastingEl) || 0);
    const ebl = Math.max(0, num(eblEl) || 0);

    const opt = classEl?.selectedOptions[0];
    const clsMin = parseFloat(opt?.dataset.min || '0');
    const clsMax = parseFloat(opt?.dataset.max || '0');

    const valid = isFinite(wt) && wt > 0 && wt <= 300;
    root.classList.toggle('is-active', valid);

    if (!valid) {
      root
        .querySelectorAll<HTMLElement>('[data-fluid-out]')
        .forEach((el) => (el.textContent = '—'));
      return;
    }

    // Підтримка (4-2-1)
    const maint = maintenanceRate(wt);
    set('maintenance', fmt(maint));

    // Дефіцит голодування та розподіл 50 / 25 / 25
    const deficit = maint * fasting;
    set('deficit', fmt(deficit));
    set('deficit-h1', fmt(deficit * 0.5));
    set('deficit-h2', fmt(deficit * 0.25));
    set('deficit-h3', fmt(deficit * 0.25));

    // Хірургічні втрати за інвазивністю (діапазон мл/год)
    const surgLo = clsMin * wt;
    const surgHi = clsMax * wt;
    set('surgical', fmtRange(surgLo, surgHi));

    // Заміщення крововтрати
    set('blood-crystalloid', ebl > 0 ? fmt(ebl * 3) : '—');
    set('blood-colloid', ebl > 0 ? fmt(ebl * 1) : '—');

    // Сумарна швидкість інтраопераційно (підтримка + частка дефіциту + втрати)
    set('hour1', fmtRange(maint + deficit * 0.5 + surgLo, maint + deficit * 0.5 + surgHi));
    set('hour2', fmtRange(maint + deficit * 0.25 + surgLo, maint + deficit * 0.25 + surgHi));
    set('hour3', fmtRange(maint + deficit * 0.25 + surgLo, maint + deficit * 0.25 + surgHi));
  }

  const inputs = [weightEl, fastingEl, classEl, eblEl].filter(Boolean) as HTMLElement[];
  const onInput = () => recompute();
  for (const el of inputs) {
    el.addEventListener('input', onInput);
    el.addEventListener('change', onInput);
    cleanups.push(() => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('change', onInput);
    });
  }
  recompute();
}
