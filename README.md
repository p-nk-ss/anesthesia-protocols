# Протоколи анестезіолога

Личный справочник вспомогательных протоколов и алгоритмов по анестезиологии.
Статический сайт на **Astro**, офлайн-режим (**PWA**), светлая/тёмная тема,
анимированные пошаговые алгоритмы (вертикальная таймлиния), поиск и категории.

Контент протоколов — на украинском. Интерфейс — на украинском.

---

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # сборка в dist/
npm run preview    # предпросмотр собранного (здесь работает service worker/офлайн)
```

> Service worker активен только в собранной версии (`build` + `preview`), не в `dev`.

---

## Как добавить новый протокол

1. Создайте файл `src/content/protocols/<slug>.mdx` (или `.md`).
   Имя файла (`<slug>`) станет адресом страницы: `/protocols/<slug>`.
2. Заполните «шапку» (frontmatter) и содержимое (см. шаблоны ниже).
3. `npm run build` локально для проверки — или сразу `git push` (см. деплой).

Исходные файлы (PDF/DOCX) лежат в `doc/` как архив. Для извлечения текста при
конвертации есть помощник:

```bash
pip install pymupdf python-docx     # один раз
python scripts/extract.py           # тексты появятся в doc/_extracted/
```

Дальше текст вычитывается вручную и переносится в `.mdx`. PDF со сканами
(изображения без текстового слоя) требуют ручного набора или OCR.

### Категории

`airway` · `emergencies` · `preoperative` · `checklists`
(метки и иконки — в `src/lib/categories.ts`, там же добавляются новые категории).

### Шаблон: алгоритм (таймлиния)

```mdx
---
title: Назва протоколу
description: Короткий опис для картки на головній.
category: airway
type: algorithm
order: 10                 # менше = вище у своїй категорії
updated: 2026-01-01
source:
  name: DAS 2025
  org: Difficult Airway Society
  url: https://das.uk.com/guidelines
steps:
  - label: План A           # короткий ярлик кроку (необов'язково)
    severity: info          # info | success | warning | critical
    title: Заголовок кроку
    body: Опис кроку одним абзацом.
    items:                  # необов'язковий список пунктів
      - Перший пункт
      - Другий пункт
---

Необов'язковий текст під таймлінією (нотатки, скорочення).
```

### Шаблон: справка (текст)

```mdx
---
title: Назва довідки
description: Короткий опис.
category: preoperative
type: reference
order: 10
source: { name: NICE NG45, url: https://www.nice.org.uk/guidance/ng45 }
---

## Розділ

Текст, **списки**, таблиці Markdown — усе рендериться в читабельний вигляд.
Таблиці автоматично отримують горизонтальну прокрутку на телефоні.
```

`severity` у кроках задаёт цвет узла: `info` (тил), `success` (зелёный),
`warning` (янтарный), `critical` (красный).

---

## Деплой (EasyPanel + Cloudflare)

Сайт собирается из `Dockerfile` (multi-stage: сборка Node → раздача nginx).

### EasyPanel

1. Залейте репозиторий на GitHub (см. ниже).
2. В EasyPanel: **Create → App**, источник — ваш GitHub-репозиторий.
3. Build method: **Dockerfile**.
4. Build arg / env: `SITE_URL=https://ваш-домен` (нужно для sitemap и canonical).
5. Контейнер слушает порт **80**.
6. Включите **Auto Deploy** (webhook) — при каждом `git push` сайт пересобирается.

### Cloudflare

1. DNS: запись `A`/`AAAA` (или `CNAME`) на сервер с EasyPanel.
2. SSL/TLS: режим **Full (strict)** — EasyPanel (Traefik) держит валидный
   Let's Encrypt-сертификат.
3. (Опц.) Cache rule: не кэшировать `sw.js` и HTML, чтобы обновления доходили
   сразу. nginx уже отдаёт для них `Cache-Control: no-cache`.

### Локальная проверка Docker

```bash
docker build --build-arg SITE_URL=https://ваш-домен -t protocols .
docker run --rm -p 8080:80 protocols   # http://localhost:8080
```

### Перед первым деплоем

Замените домен-заглушку `protocols.example.com` в:
`astro.config.mjs` (переменная `SITE` / env `SITE_URL`) и `public/robots.txt`.

---

## Структура

```
src/
  content/protocols/   ← сюда кладутся протоколы (.md/.mdx)
  components/          ← карточки, таймлиния, поиск, тема, капнограмма
  layouts/             ← Base / Algorithm / Reference
  pages/               ← index + /protocols/[...slug]
  styles/              ← global / timeline / prose
  lib/                 ← категории, утилиты
scripts/               ← extract.py (PDF/DOCX→текст), gen-icons.mjs
doc/                   ← оригиналы протоколов (архив)
Dockerfile, nginx.conf ← деплой
```
