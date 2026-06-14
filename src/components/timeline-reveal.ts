/**
 * Ненав'язлива поява кроків таймлінії при прокрутці.
 * Гарантія доступності: початковий «прихований» стан задається ТІЛЬКИ через клас
 * .reveal-on, який ми додаємо лише коли є підтримка IntersectionObserver і користувач
 * не просив зменшити рух. Інакше кроки видимі одразу (JS вимкнено, reduced-motion).
 */
export function initTimelineReveal(): void {
  const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-tl-step]'));
  if (steps.length === 0) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  for (const s of steps) s.classList.add('reveal-on');

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );

  for (const s of steps) io.observe(s);
}
