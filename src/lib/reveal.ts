/**
 * Глобальна поява елементів при прокрутці.
 * Будь-який елемент із [data-reveal] плавно з'являється, коли входить у вьюпорт.
 * Стаггер — через CSS-змінну --reveal-i (індекс у групі), яку проставляємо тут
 * для елементів усередині [data-reveal-group].
 *
 * Доступність: приховування описане лише в @media (no-preference) у global.css,
 * тож при reduced-motion або без JS контент видимий одразу.
 */
let observer: IntersectionObserver | null = null;

export function initReveal(): void {
  // Прибираємо попередній спостерігач (повторний виклик на astro:page-load).
  observer?.disconnect();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Проставляємо індекс стаггера всередині кожної групи.
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal]');
    items.forEach((el, i) => el.style.setProperty('--reveal-i', String(i)));
  });

  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        // Високі блоки (довідкові сторінки): 12% елемента може бути більшим за
        // вьюпорт і поріг ніколи не спрацює — показуємо за першого ж перетину.
        const tall = entry.boundingClientRect.height > window.innerHeight * 0.9;
        if (entry.isIntersecting && (tall || entry.intersectionRatio >= 0.12)) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: [0, 0.12] },
  );

  for (const el of targets) observer.observe(el);
}
