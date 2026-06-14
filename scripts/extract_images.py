# -*- coding: utf-8 -*-
"""Витягує вбудовані растрові зображення з DAS PDF та (за потреби) рендерить
сторінки з фігурами у PNG. Результат у doc/_images/."""
import os, io, fitz

DOC = os.path.join(os.path.dirname(__file__), '..', 'doc')
OUT = os.path.join(DOC, '_images')
os.makedirs(OUT, exist_ok=True)
PDF = os.path.join(DOC, 'das-2025-ua_12_v2.pdf')

doc = fitz.open(PDF)
report = []

# 1) Вбудовані растрові зображення.
seen = set()
for pno in range(doc.page_count):
    page = doc[pno]
    for img in page.get_images(full=True):
        xref = img[0]
        if xref in seen:
            continue
        seen.add(xref)
        try:
            ext = doc.extract_image(xref)
            data = ext['image']
            w, h = ext.get('width', 0), ext.get('height', 0)
            if w * h < 40000:  # пропускаємо дрібні іконки/логотипи
                continue
            name = f'p{pno+1:02d}_x{xref}_{w}x{h}.{ext["extension"]}'
            with open(os.path.join(OUT, name), 'wb') as f:
                f.write(data)
            report.append(f'EMBED page={pno+1} xref={xref} {w}x{h} {ext["extension"]} bytes={len(data)}')
        except Exception as e:
            report.append(f'ERR page={pno+1} xref={xref} {e}')

# 2) Рендер сторінок із фігурами (на випадок векторних схем).
fig_pages = [5, 12, 15, 16, 17, 19]
for pno in fig_pages:
    if pno - 1 >= doc.page_count:
        continue
    page = doc[pno - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5))
    name = f'render_p{pno:02d}.png'
    pix.save(os.path.join(OUT, name))
    report.append(f'RENDER page={pno} -> {name} {pix.width}x{pix.height}')

with io.open(os.path.join(OUT, '_report.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))
for line in report:
    print(line.encode('ascii', 'replace').decode())
