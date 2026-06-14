import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Колекція протоколів. Кожен файл .md/.mdx у src/content/protocols/ — один протокол.
 * Поле `type` визначає макет сторінки:
 *   - 'algorithm' — покрокова вертикальна таймлінія (потрібен масив steps[])
 *   - 'reference' — довідковий текст (тіло Markdown/MDX)
 */
export const CATEGORIES = ['airway', 'emergencies', 'preoperative', 'checklists'] as const;

const protocols = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/protocols' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        category: z.enum(CATEGORIES),
        type: z.enum(['algorithm', 'reference']),
        order: z.number().default(100),
        updated: z.coerce.date().optional(),
        draft: z.boolean().default(false),
        cover: image().optional(),
        source: z
          .object({
            name: z.string(),
            org: z.string().optional(),
            url: z.string().url().optional(),
            license: z.string().optional(),
          })
          .optional(),
        // Тільки для type: 'algorithm'. Кожен крок — вузол таймлінії.
        steps: z
          .array(
            z.object({
              title: z.string(),
              body: z.string().optional(),
              items: z.array(z.string()).optional(),
              severity: z.enum(['info', 'warning', 'critical', 'success']).optional(),
              label: z.string().optional(),
              // Схема/ілюстрація етапу: шлях до зображення (у /public) + підпис.
              image: z.string().optional(),
              imageCaption: z.string().optional(),
            }),
          )
          .optional(),
      })
      .refine((d) => d.type !== 'algorithm' || (d.steps?.length ?? 0) > 0, {
        message: "Протоколи з type: 'algorithm' повинні мати непорожній масив steps[].",
      }),
});

export const collections = { protocols };
