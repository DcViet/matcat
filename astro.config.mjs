import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Trang chạy trên GitHub Pages tại https://dcviet.github.io/matcat/.
// Khi chuyển sang tên miền riêng: đổi SITE thành tên miền đó và BASE thành ''.
const SITE = 'https://dcviet.github.io';
const BASE = '/matcat';

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
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: BASE ? [themBase] : [],
  },
});
