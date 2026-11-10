import { getCollection } from 'astro:content';

// Ba khu nội dung của trang. `slug` vừa là tên thư mục trong src/content,
// vừa là đường dẫn trên web.
export const KHU = [
  {
    slug: 'bai-viet',
    ten: 'Bài viết',
    moTa: 'Tiểu luận về thiết kế, cách nghĩ và cách học.',
  },
  {
    slug: 'cong-trinh',
    ten: 'Công trình',
    moTa: 'Đọc một công trình kiến trúc: bối cảnh, ý tưởng, bản vẽ.',
  },
  {
    slug: 'nghe-thuat',
    ten: 'Nghệ thuật',
    moTa: 'Tác phẩm, họa sĩ và những bài học vẽ.',
  },
] as const;

export type KhuSlug = (typeof KHU)[number]['slug'];

export const timKhu = (slug: string) => KHU.find((k) => k.slug === slug)!;

// Các bài đã xuất bản của một khu, mới nhất trước.
export async function baiCuaKhu(slug: KhuSlug) {
  const bai = await getCollection(slug, ({ data }) => !data.draft);
  return bai
    .map((b) => ({ ...b, khu: slug }))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function tatCaBai() {
  const nhom = await Promise.all(KHU.map((k) => baiCuaKhu(k.slug)));
  return nhom.flat().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Phần đường dẫn gốc của trang ('' hoặc '/matcat'), lấy từ `base` trong astro.config.mjs.
export const GOC = import.meta.env.BASE_URL.replace(/\/$/, '');

// Đường dẫn nội bộ: duong('/bai-viet/') -> '/matcat/bai-viet/'.
export const duong = (p: string) => `${GOC}${p}`;

export const ngayThang =(d: Date) =>
  d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
