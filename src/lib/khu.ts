import { getCollection } from 'astro:content';
import type { Lang } from './i18n';

// Ba khu nội dung của trang. `slug` vừa là tên thư mục trong src/content,
// vừa là đường dẫn trên web (giống nhau ở cả hai ngôn ngữ).
export const KHU = [
  {
    slug: 'bai-viet',
    ten: { vi: 'Bài viết', en: 'Essays' },
    moTa: {
      vi: 'Tiểu luận về thiết kế, cách nghĩ và cách học.',
      en: 'Essays on design, ways of thinking and ways of learning.',
    },
  },
  {
    slug: 'cong-trinh',
    ten: { vi: 'Công trình', en: 'Buildings' },
    moTa: {
      vi: 'Đọc một công trình kiến trúc: bối cảnh, ý tưởng, bản vẽ.',
      en: 'Reading a building: its context, its ideas, its drawings.',
    },
  },
  {
    slug: 'nghe-thuat',
    ten: { vi: 'Nghệ thuật', en: 'Art' },
    moTa: {
      vi: 'Tác phẩm, họa sĩ và những bài học vẽ.',
      en: 'Works, artists and lessons in drawing.',
    },
  },
] as const;

export type KhuSlug = (typeof KHU)[number]['slug'];

export const timKhu = (slug: string) => KHU.find((k) => k.slug === slug)!;

// Bản tiếng Anh của bài `x` nằm ở tệp `en-x.md`; đường dẫn dùng chung `x`.
export const slugBai = (id: string) => id.replace(/^en-/, '');

// Các bài đã xuất bản của một khu theo ngôn ngữ, mới nhất trước.
export async function baiCuaKhu(slug: KhuSlug, lang: Lang = 'vi') {
  const bai = await getCollection(slug, ({ data }) => !data.draft && data.lang === lang);
  return bai
    .map((b) => ({ ...b, khu: slug, slug: slugBai(b.id) }))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function tatCaBai(lang: Lang = 'vi') {
  const nhom = await Promise.all(KHU.map((k) => baiCuaKhu(k.slug, lang)));
  return nhom.flat().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Bài này có bản ở ngôn ngữ kia không (để nút chọn ngôn ngữ biết dẫn đi đâu).
export async function coBanDich(khu: KhuSlug, slug: string, lang: Lang) {
  const bai = await baiCuaKhu(khu, lang);
  return bai.some((b) => b.slug === slug);
}

// Phần đường dẫn gốc của trang ('' hoặc '/matcat'), lấy từ `base` trong astro.config.mjs.
export const GOC = import.meta.env.BASE_URL.replace(/\/$/, '');

// Đường dẫn nội bộ: duong('/bai-viet/') -> '/matcat/bai-viet/'.
export const duong = (p: string) => `${GOC}${p}`;

// Đường dẫn theo ngôn ngữ: duongNgon('en', '/bai-viet/') -> '/matcat/en/bai-viet/'.
export const duongNgon = (lang: Lang, p: string) => duong(lang === 'en' ? `/en${p}` : p);

export const ngayThang = (d: Date, lang: Lang = 'vi') =>
  d.toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
