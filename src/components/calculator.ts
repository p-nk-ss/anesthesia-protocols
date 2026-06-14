/**
 * Клієнтська логіка інтерактивних калькуляторів-шкал.
 * Прогресивне покращення: розмітка з реальними <input type="radio"> працює без
 * JS (видно питання + легенду балів); цей скрипт додає живий підрахунок суми,
 * анімоване табло та картку інтерпретації. Повністю офлайн, без мережі.
 * Прив'язується на astro:page-load (переживає View Transitions).
 * prefers-reduced-motion → миттєві зміни без анімації числа.
 */
interface Band {
  min: number;
  max: number;
  label: string;
  detail: string;
  severity: string;
}

let cleanups: Array<() => void> = [];

export function initCalculators(): void {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.querySelectorAll<HTMLFormElement>('[data-calc]').forEach(setup);
}

function setup(form: HTMLFormElement): void {
  const bandsEl = form.querySelector<HTMLScriptElement>('[data-bands]');
  let bands: Band[] = [];
  try {
    bands = JSON.parse(bandsEl?.textContent || '[]');
  } catch {
    bands = [];
  }

  const result = form.querySelector<HTMLElement>('[data-result]');
  const scoreEl = form.querySelector<HTMLElement>('[data-score]');
  const bandLabel = form.querySelector<HTMLElement>('[data-band-label]');
  const bandDetail = form.querySelector<HTMLElement>('[data-band-detail]');
  const progress = form.querySelector<HTMLElement>('[data-progress]');
  const reset = form.querySelector<HTMLElement>('[data-reset]');

  const groups = new Set<string>();
  form.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => groups.add(r.name));
  const total = groups.size;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let shown = 0;
  function animateTo(target: number): void {
    if (!scoreEl) return;
    if (reduce) {
      scoreEl.textContent = String(target);
      shown = target;
      return;
    }
    const from = shown;
    const start = performance.now();
    const dur = 320;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      scoreEl.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(step);
      else shown = target;
    };
    requestAnimationFrame(step);
  }

  function markPicked(name: string): void {
    form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((r) => {
      r.closest('.calc__opt')?.classList.toggle('is-picked', r.checked);
    });
  }

  function hide(): void {
    if (result) {
      result.hidden = true;
      result.removeAttribute('data-sev');
    }
    if (reset) reset.hidden = true;
    shown = 0;
  }

  function recompute(): void {
    let sum = 0;
    let answered = 0;
    groups.forEach((name) => {
      const checked = form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
      if (checked) {
        sum += Number(checked.value);
        answered += 1;
      }
    });

    if (answered === 0) {
      hide();
      return;
    }

    if (result) result.hidden = false;
    if (reset) reset.hidden = false;
    animateTo(sum);

    const band = bands.find((b) => sum >= b.min && sum <= b.max) ?? bands[bands.length - 1];
    if (band) {
      if (bandLabel) bandLabel.textContent = band.label;
      if (bandDetail) bandDetail.textContent = band.detail;
      if (result) result.dataset.sev = band.severity;
    }
    if (progress) {
      progress.textContent = answered < total ? `відповіді ${answered}/${total}` : 'усі відповіді';
      progress.dataset.complete = answered === total ? '1' : '0';
    }
  }

  const onChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t?.type === 'radio') markPicked(t.name);
    recompute();
  };
  const onReset = () => {
    // reset спрацьовує до очищення значень — відкладаємо на наступний тік.
    setTimeout(() => {
      form.querySelectorAll('.calc__opt.is-picked').forEach((l) => l.classList.remove('is-picked'));
      hide();
    }, 0);
  };

  form.addEventListener('change', onChange);
  form.addEventListener('reset', onReset);
  cleanups.push(() => {
    form.removeEventListener('change', onChange);
    form.removeEventListener('reset', onReset);
  });

  // Початковий стан (на випадок автозаповнення браузером).
  recompute();
}
