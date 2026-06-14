/**
 * Клієнтська логіка чек-листа: лічильник виконаних пунктів (на фазу й загальний)
 * та кнопка «Скинути». Нативні чекбокси працюють і без JS; скрипт лише додає
 * прогрес і скидання. Стан тримається у межах сесії (без сховища). Офлайн.
 * Прив'язка на astro:page-load.
 */
let cleanups: Array<() => void> = [];

export function initChecklists(): void {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.querySelectorAll<HTMLElement>('[data-checklist]').forEach(setup);
}

function setup(root: HTMLElement): void {
  const boxes = Array.from(root.querySelectorAll<HTMLInputElement>('[data-check]'));
  if (boxes.length === 0) return;

  const bar = root.querySelector<HTMLElement>('[data-ckl-bar]');
  const totalEl = root.querySelector<HTMLElement>('[data-ckl-total]');
  const resetBtn = root.querySelector<HTMLButtonElement>('[data-ckl-reset]');
  const phases = Array.from(root.querySelectorAll<HTMLElement>('[data-phase]'));

  // Прогрес-панель прихована без JS (нативні чекбокси й так працюють).
  if (bar) bar.hidden = false;

  function update(): void {
    let done = 0;
    for (const ph of phases) {
      const pbx = Array.from(ph.querySelectorAll<HTMLInputElement>('[data-check]'));
      const d = pbx.filter((b) => b.checked).length;
      done += d;
      const count = ph.querySelector<HTMLElement>('[data-phase-count]');
      if (count) {
        count.textContent = `${d}/${pbx.length}`;
        count.hidden = false;
      }
      ph.classList.toggle('is-done', pbx.length > 0 && d === pbx.length);
    }
    if (totalEl) totalEl.textContent = `${done}/${boxes.length}`;
    root.style.setProperty('--ckl-progress', boxes.length ? String(done / boxes.length) : '0');
    root.classList.toggle('is-complete', done === boxes.length);
  }

  const onChange = () => update();
  root.addEventListener('change', onChange);
  cleanups.push(() => root.removeEventListener('change', onChange));

  if (resetBtn) {
    const onReset = () => {
      boxes.forEach((b) => {
        b.checked = false;
      });
      update();
    };
    resetBtn.addEventListener('click', onReset);
    cleanups.push(() => resetBtn.removeEventListener('click', onReset));
  }

  update();
}
