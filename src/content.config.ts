import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Phần đầu (frontmatter) chung cho mọi bài.
const chung = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  coverCredit: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const tep = (thuMuc: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${thuMuc}` });

export const collections = {
  'bai-viet': defineCollection({ loader: tep('bai-viet'), schema: chung }),
  'cong-trinh': defineCollection({
    loader: tep('cong-trinh'),
    schema: chung.extend({
      architect: z.string().optional(),
      location: z.string().optional(),
      year: z.string().optional(),
    }),
  }),
  'nghe-thuat': defineCollection({
    loader: tep('nghe-thuat'),
    schema: chung.extend({
      artist: z.string().optional(),
      medium: z.string().optional(),
      year: z.string().optional(),
    }),
  }),
};
