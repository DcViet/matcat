import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Trang chạy trên tên miền riêng https://matcat.blog (GitHub Pages, kho DcViet/matcat).
// Trước đó trang nằm ở https://dcviet.github.io/matcat/ với BASE = '/matcat'.
const SITE = 'https://matcat.blog';
const BASE = '';

// Trong bài Markdown, ảnh và liên kết nội bộ viết dạng `/images/ten.jpg`.
// Plugin này tự thêm BASE vào trước để chúng chạy đúng dưới /matcat.
function themBase() {
  const di = (nut) => {
    if (nut.type === 'element' && nut.properties) {
      for (const khoa of ['src', 'href']) {
        const v = nut.properties[khoa];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(`${BASE}/`)) {
          nut.properties[khoa] = BASE + v;
        }
      }
    }
    nut.children?.forEach(di);
  };
  return (cay) => di(cay);
}

export default defineConfig({
  site: SITE,
  base: BASE || undefined,
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US' } },
    }),
  ],
  markdown: {
    rehypePlugins: BASE ? [themBase] : [],
  },
});
