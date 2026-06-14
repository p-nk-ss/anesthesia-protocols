/**
 * Заповнення світного rail таймлінії при прокрутці + підсвічування вузлів,
 * повз які пройшов «промінь». Прив'язано до позиції центру вьюпорта.
 * prefers-reduced-motion → rail повний, усі вузли підсвічені, без обробників.
 */
let cleanup: (() => void) | null = null;

export function initTimeline(): void {
  cleanup?.();
  cleanup = null;

  const root = document.querySelector<HTMLElement>('[data-timeline]');
  if (!root) return;

  const fill = root.querySelector<HTMLElement>('.tl-rail__fill');
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-tl-step]'));
  if (!fill || steps.length === 0) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    const len = Math.max(1, steps[steps.length - 1].offsetTop);
    const r = root.querySelector<HTMLElement>('.tl-rail');
    fill.style.height = `${len}px`;
    if (r) r.style.height = `${len}px`;
    fill.style.transform = 'scaleY(1)';
    steps.forEach((s) => s.classList.add('lit'));
    return;
  }

  // Рейка з'єднує ЦЕНТРИ першого та останнього вузлів. Її довжина = offsetTop
  // останнього кроку (відстань між центрами), а не повна висота таймлінії —
  // інакше під останнім колом лишався б незаповнений «хвіст» (висока картка
  // останнього кроку тягне низ таймлінії далеко за останнє коло).
  const rail = root.querySelector<HTMLElement>('.tl-rail');
  let railLen = 1;
  let fractions: number[] = [];
  const measure = () => {
    railLen = Math.max(1, steps[steps.length - 1].offsetTop);
    fill.style.height = `${railLen}px`;
    if (rail) rail.style.height = `${railLen}px`;
    fractions = steps.map((s) => s.offsetTop / railLen);
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = root.getBoundingClientRect();
    const center = window.innerHeight * 0.55;
    // Кінчик заповнювача (24 + p·railLen) доходить до центру вузла (offsetTop+24),
    // коли той перетинає лінію-тригер. Останній вузол → p = 1 (рейка заповнена).
    const progress = Math.min(1, Math.max(0, (center - rect.top - 24) / railLen));
    fill.style.transform = `scaleY(${progress})`;
    for (let i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('lit', progress >= fractions[i]);
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const remeasure = () => {
    measure();
    update();
  };

  remeasure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure);
  // Висота таймлінії змінюється після довантаження шрифтів/зображень — без
  // переміру пороги вузлів лишаються застарілими і вузол спалахує невчасно.
  window.addEventListener('load', remeasure);

  let ro: ResizeObserver | null = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(remeasure);
    ro.observe(root);
  }
  root.querySelectorAll('img').forEach((img) => {
    if (!(img as HTMLImageElement).complete) {
      img.addEventListener('load', remeasure, { once: true });
    }
  });

  cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('load', remeasure);
    ro?.disconnect();
  };
}
