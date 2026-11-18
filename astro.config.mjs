import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sharp from 'sharp';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Chế độ mục Portfolio (tat / an / hien), đọc từ src/cauhinh-portfolio.json. Chỉ 'hien' mới vào sitemap.
const CHE_DO_PORTFOLIO = JSON.parse(readFileSync(join('src', 'cauhinh-portfolio.json'), 'utf8')).cheDo;

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

// Thêm width, height, loading="lazy" cho ảnh trong thân bài: trình duyệt giữ chỗ trước khi ảnh tải xong.
function anhKichThuoc() {
  const dem = new Map();
  const duyet = (nut, ra) => {
    if (nut.type === 'element' && nut.tagName === 'img' && typeof nut.properties?.src === 'string') ra.push(nut);
    nut.children?.forEach((c) => duyet(c, ra));
    return ra;
  };
  return async (cay) => {
    for (const img of duyet(cay, [])) {
      const src = img.properties.src;
      if (!src.startsWith('/images/')) continue;
      if (!dem.has(src)) {
        try {
          const m = await sharp(join(process.cwd(), 'public', src)).metadata();
          dem.set(src, { width: m.width, height: m.height });
        } catch {
          dem.set(src, null);
        }
      }
      const k = dem.get(src);
      if (k?.width && k?.height) {
        img.properties.width = k.width;
        img.properties.height = k.height;
      }
      img.properties.loading = 'lazy';
      img.properties.decoding = 'async';
    }
  };
}

// Ngày đăng của từng bài (lấy từ phần đầu tệp) để ghi vào sitemap.
function ngayCacBai() {
  const ban = new Map();
  let moiNhat = '';
  for (const khu of ['bai-viet', 'cong-trinh', 'nghe-thuat']) {
    for (const tep of readdirSync(join('src', 'content', khu))) {
      if (!tep.endsWith('.md') || tep.startsWith('mau-')) continue;
      const noi = readFileSync(join('src', 'content', khu, tep), 'utf8');
      if (/^draft:\s*true/m.test(noi)) continue;
      const ngay = (noi.match(/^date:\s*(\S+)/m) || [])[1];
      if (!ngay) continue;
      const en = tep.startsWith('en-');
      const slug = tep.replace(/^en-/, '').replace(/\.md$/, '');
      ban.set(`${SITE}${en ? '/en' : ''}/${khu}/${slug}/`, ngay);
      if (ngay > moiNhat) moiNhat = ngay;
    }
  }
  return { ban, moiNhat };
}
const { ban: NGAY_BAI, moiNhat: NGAY_MOI_NHAT } = ngayCacBai();

export default defineConfig({
  site: SITE,
  base: BASE || undefined,
  integrations: [
    {
      // Chế độ 'tat': ảnh portfolio không được đưa lên trang (public/portfolio vẫn nằm trong kho).
      name: 'bo-anh-portfolio-khi-tat',
      hooks: {
        'astro:build:done': ({ dir }) => {
          if (CHE_DO_PORTFOLIO === 'tat') rmSync(join(fileURLToPath(dir), 'portfolio'), { recursive: true, force: true });
        },
      },
    },
    sitemap({
      i18n: { defaultLocale: 'vi', locales: { vi: 'vi-VN', en: 'en-US' } },
      filter: (trang) => !trang.includes('/404') && (CHE_DO_PORTFOLIO === 'hien' || !trang.includes('/portfolio')),
      serialize(muc) {
        // Bài: ngày đăng của bài. Trang chủ và trang khu: ngày của bài mới nhất.
        const ngay = NGAY_BAI.get(muc.url) ?? NGAY_MOI_NHAT;
        if (ngay) muc.lastmod = new Date(`${ngay}T00:00:00Z`).toISOString();
        return muc;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [anhKichThuoc, ...(BASE ? [themBase] : [])],
  },
});
