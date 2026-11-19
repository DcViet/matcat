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

// ---------------------------------------------------------------------------
// Bài liên quan: chọn tự động theo tiêu đề, mô tả, thẻ và người thực hiện,
// nên bài mới đăng (kể cả bài do lịch tự động viết) tự có liên kết hai chiều với bài cũ.
// ---------------------------------------------------------------------------
const TU_DUNG = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'not', 'but', 'you', 'your', 'its',
  'into', 'have', 'has', 'how', 'why', 'what', 'when', 'can', 'all', 'out', 'their', 'they', 'than', 'then',
  'there', 'about', 'over', 'more', 'most', 'one', 'who', 'which', 'will', 'would', 'been', 'also', 'just',
  'only', 'like', 'each', 'such', 'does', 'did', 'get', 'got', 'too', 'very', 'his', 'her', 'she', 'him',
]);

const tachTu = (chuoi: string) =>
  chuoi.toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter(Boolean);

type BaiTrongKho = Awaited<ReturnType<typeof tatCaBai>>[number];

// Đặc trưng của một bài: từ đơn và cặp từ liền nhau, có trọng số (tiêu đề và thẻ nặng hơn mô tả).
function dacTrung(b: BaiTrongKho) {
  const d = b.data as { title: string; description: string; tags: string[] };
  const kq = new Map<string, number>();
  const cong = (k: string, v: number) => kq.set(k, (kq.get(k) ?? 0) + v);
  const them = (chuoi: string, trong: number) => {
    const t = tachTu(chuoi);
    for (let i = 0; i < t.length; i++) {
      if (t[i].length >= 3 && !TU_DUNG.has(t[i])) cong(t[i], trong);
      if (i + 1 < t.length && t[i].length >= 2 && t[i + 1].length >= 2) cong(t[i] + ' ' + t[i + 1], trong * 1.5);
    }
  };
  them(d.title, 3);
  them(d.description, 1);
  for (const tag of d.tags) them(tag, 3);
  return kq;
}

const nguoiLam = (b: BaiTrongKho) => {
  const d = b.data as Record<string, any>;
  const ten = String(d.architect ?? d.artist ?? '').toLowerCase().trim();
  // Bỏ chỗ điền tạm ("Tên kiến trúc sư") và chuỗi quá dài (ghi chú dài thay cho tên).
  return ten && !ten.startsWith('tên ') && ten.length <= 40 ? ten : '';
};

// Trả về tối đa `n` bài liên quan nhất với `bai` (cùng ngôn ngữ), điểm bằng nhau thì bài mới hơn lên trước.
export async function baiLienQuan(bai: BaiTrongKho, lang: Lang = 'vi', n = 3) {
  const tat = await tatCaBai(lang);
  const vector = new Map(tat.map((b) => [b.khu + '/' + b.slug, dacTrung(b)]));

  // IDF: từ xuất hiện ở ít bài thì nặng hơn.
  const df = new Map<string, number>();
  for (const v of vector.values()) for (const k of v.keys()) df.set(k, (df.get(k) ?? 0) + 1);
  const idf = (k: string) => Math.log((tat.length + 1) / ((df.get(k) ?? 0) + 1)) + 1;
  const trongSo = (v: Map<string, number>) => {
    const w = new Map<string, number>();
    let binhPhuong = 0;
    for (const [k, tf] of v) {
      const x = tf * idf(k);
      w.set(k, x);
      binhPhuong += x * x;
    }
    return { w, chuan: Math.sqrt(binhPhuong) || 1 };
  };

  const goc = trongSo(vector.get(bai.khu + '/' + bai.slug) ?? new Map());
  const tenGoc = nguoiLam(bai);
  const theGoc = new Set(((bai.data as any).tags as string[]).map((t) => t.toLowerCase()));

  return tat
    .filter((b) => !(b.khu === bai.khu && b.slug === bai.slug))
    .map((b) => {
      const kia = trongSo(vector.get(b.khu + '/' + b.slug)!);
      let tich = 0;
      for (const [k, x] of goc.w) tich += x * (kia.w.get(k) ?? 0);
      let diem = tich / (goc.chuan * kia.chuan);
      for (const t of (b.data as any).tags as string[]) if (theGoc.has(t.toLowerCase())) diem += 0.15;
      if (tenGoc && tenGoc === nguoiLam(b)) diem += 0.3;
      if (b.khu === bai.khu) diem += 0.02;
      return { b, diem };
    })
    .sort((x, y) => y.diem - x.diem || y.b.data.date.valueOf() - x.b.data.date.valueOf())
    .slice(0, n)
    .map((x) => x.b);
}
