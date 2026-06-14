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
    fill.style.transform = 'scaleY(1)';
    steps.forEach((s) => s.classList.add('lit'));
    return;
  }

  let fractions: number[] = [];
  const measure = () => {
    const h = root.offsetHeight || 1;
    fractions = steps.map((s) => (s.offsetTop + s.offsetHeight * 0.4) / h);
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = root.getBoundingClientRect();
    const center = window.innerHeight * 0.55;
    const total = rect.height || 1;
    const progress = Math.min(1, Math.max(0, (center - rect.top) / total));
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

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  });

  cleanup = () => {
    window.removeEventListener('scroll', onScroll);
  };
}
