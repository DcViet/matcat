#!/usr/bin/env node
// Kiểm tra trước khi đăng. Chạy sau `npm run build`, khi kho có bài mới chưa commit.
// Không phụ thuộc thư viện, không gửi gì ra ngoài. Thoát mã 1 nếu có lỗi.
//
//   node tools/dang-bai/kiem-tra.mjs          in kết quả dễ đọc
//   node tools/dang-bai/kiem-tra.mjs --json   in JSON
//
// Quy tắc cốt lõi: chỉ được THÊM tệp bài và ảnh; không sửa hay xóa bất cứ tệp nào đã có.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const goc = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MAX_BAI = Number(process.env.MAX_BAI ?? 4);
const KHU = ['bai-viet', 'cong-trinh', 'nghe-thuat'];
const loi = [];
const canhBao = [];
const ghiLoi = (tep, msg) => loi.push({ tep, msg });
const ghiCanhBao = (tep, msg) => canhBao.push({ tep, msg });

const sh = (c) => execSync(c, { cwd: goc, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const doc = (p) => readFileSync(join(goc, p), 'utf8').normalize('NFC').replace(/\r\n/g, '\n');

// ---------- 1. Chỉ thêm, không sửa ----------

const dong = sh('git status --porcelain -uall').split('\n').filter(Boolean);
const moi = [];
for (const d of dong) {
  const tt = d.slice(0, 2);
  const p = d.slice(3).replace(/^"|"$/g, '');
  if (tt.includes('M') || tt.includes('D') || tt.includes('R') || tt.includes('U')) {
    ghiLoi(p, `tệp đã có bị sửa hoặc xóa (${tt.trim()}); chỉ được thêm tệp mới`);
  } else if (/^src\/content\/(bai-viet|cong-trinh|nghe-thuat)\/[a-z0-9-]+\.md$/.test(p)) {
    moi.push(p);
  } else if (/^public\/images\/[a-z0-9._-]+\.(jpg|jpeg|png|svg)$/.test(p)) {
    moi.push(p);
  } else {
    ghiLoi(p, 'tệp nằm ngoài chỗ được phép (src/content/<khu>/, public/images/)');
  }
}

const baiMoi = moi.filter((p) => p.endsWith('.md'));
const anhMoi = moi.filter((p) => !p.endsWith('.md'));

for (const a of anhMoi) {
  const kb = statSync(join(goc, a)).size / 1024;
  if (kb > 1600) ghiLoi(a, `ảnh nặng ${Math.round(kb)} KB, vượt 1600 KB`);
}

// ---------- 2. Từng bài ----------

function frontmatter(noi) {
  const m = noi.match(/^---\n([\s\S]*?)\n---\n/);
  const d = {};
  if (!m) return { d, than: noi };
  for (const dongYaml of m[1].split('\n')) {
    const k = dongYaml.match(/^([A-Za-z]+):\s*(.*)$/);
    if (k) d[k[1]] = k[2].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
  }
  return { d, than: noi.slice(m[0].length) };
}

const tuyetPhep = /(public domain|phạm vi công cộng|CC0|CC BY(?!-N)(?:-SA)?[ \d.]*)/i;
const camPhep = /(\bNC\b|\bND\b|all rights reserved|bản quyền thuộc)/i;
const homNay = new Date().toISOString().slice(0, 10);
const du = (kh, slug, en) => join('src', 'content', kh, `${en ? 'en-' : ''}${slug}.md`);
const tonTai = (p) => existsSync(join(goc, p));
const slugDaCo = new Set(
  sh('git ls-files src/content')
    .split('\n')
    .filter((x) => x.endsWith('.md') && !x.includes('/mau-') && !x.includes('/en-'))
    .map((x) => basename(x, '.md')),
);

const bai = [];
for (const p of baiMoi) {
  const ten = basename(p, '.md');
  const en = ten.startsWith('en-');
  const slug = en ? ten.slice(3) : ten;
  const kh = p.split('/')[2];
  const { d, than } = frontmatter(doc(p));
  bai.push({ p, en, slug, kh, d, than });
}

const viMoi = bai.filter((b) => !b.en);
if (viMoi.length === 0) ghiLoi('-', 'không có bài tiếng Việt mới nào để đăng');
if (viMoi.length > MAX_BAI) ghiLoi('-', `có ${viMoi.length} bài mới, vượt giới hạn ${MAX_BAI} bài mỗi lần`);

for (const b of bai) {
  const { p, en, slug, kh, d } = b;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) ghiLoi(p, 'slug không hợp lệ');
  if (!en && slugDaCo.has(slug)) ghiLoi(p, 'slug trùng một bài đã có');
  if (!tonTai(du(kh, slug, !en))) ghiLoi(p, `thiếu bản ${en ? 'tiếng Việt' : 'tiếng Anh'} đi kèm`);

  for (const k of ['title', 'description', 'date']) if (!d[k]) ghiLoi(p, `thiếu trường ${k}`);
  if (d.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) ghiLoi(p, 'date phải dạng YYYY-MM-DD');
  if (d.date && d.date > homNay) ghiLoi(p, 'date ở tương lai');
  if (d.draft === 'true') ghiLoi(p, 'draft: true');
  if (en && d.lang !== 'en') ghiLoi(p, 'bản tiếng Anh phải có lang: "en"');
  if (!en && d.lang && d.lang !== 'vi') ghiLoi(p, 'bản tiếng Việt không được có lang khác vi');
  if (en && /[ạảãàáâậầấẩẫăắằặẳẵéèẻẽẹêếềệểễíìỉĩịóòỏõọôốồộổỗơớờợởỡúùủũụưứừựửữýỳỷỹỵđ]/i.test(`${d.title} ${d.description}`)) {
    ghiLoi(p, 'tiêu đề hoặc đoạn dẫn bản tiếng Anh còn chữ tiếng Việt');
  }

  if (!d.cover) {
    ghiCanhBao(p, 'không có ảnh bìa');
  } else {
    if (!d.cover.startsWith('/images/')) ghiLoi(p, 'cover phải bắt đầu bằng /images/');
    else if (!tonTai(join('public', d.cover))) ghiLoi(p, `ảnh bìa không tồn tại: ${d.cover}`);
    if (!d.coverAlt) ghiLoi(p, 'có ảnh bìa mà thiếu coverAlt');
    if (!d.coverCredit) ghiLoi(p, 'có ảnh bìa mà thiếu coverCredit');
    else {
      if (!tuyetPhep.test(d.coverCredit)) ghiLoi(p, 'coverCredit không ghi giấy phép mở (phạm vi công cộng, CC0, CC BY, CC BY-SA)');
      if (camPhep.test(d.coverCredit)) ghiLoi(p, 'coverCredit ghi giấy phép không cho phép dùng');
    }
  }

  const sach = b.than.replace(/<!--[\s\S]*?-->/g, '');
  const soChu = (sach.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const [lo, hi] = en ? [600, 2600] : [700, 2400];
  if (soChu < lo) ghiLoi(p, `quá ngắn: ${soChu} chữ (tối thiểu ${lo})`);
  if (soChu > hi) ghiLoi(p, `quá dài: ${soChu} chữ (tối đa ${hi})`);
  if (doc(p).includes('—')) ghiLoi(p, 'có dấu gạch dài "—"');
  if (/\b(TODO|TBD|lorem ipsum)\b|\[\.\.\.\]|\[…\]/i.test(sach)) ghiLoi(p, 'còn chỗ giữ chỗ (TODO, [...])');

  // Khối lưu ý cuối bài và dòng cho biết bài soạn tự động.
  const khoi = sach.trim().split(/\n{2,}/);
  const cuoi = khoi[khoi.length - 1] ?? '';
  if (!(en ? /^> \*\*Note\b/ : /^> \*\*Lưu ý\b/).test(cuoi)) ghiLoi(p, `khối cuối bài phải là "> **${en ? 'Note' : 'Lưu ý'}.**"`);
  if (!(en ? /drafted automatically/i : /soạn tự động/i).test(cuoi)) {
    ghiLoi(p, `khối ${en ? 'Note' : 'Lưu ý'} phải nói bài được ${en ? 'drafted automatically' : 'soạn tự động'} và chưa có người đọc lại`);
  }

  // Ảnh và liên kết trong thân bài.
  for (const m of sach.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)) {
    const duong = m[1];
    if (!tonTai(join('public', duong))) ghiLoi(p, `ảnh trong bài không tồn tại: ${duong}`);
    if (duong.endsWith('.svg')) {
      if (en && !duong.endsWith('-en.svg')) ghiLoi(p, `bản tiếng Anh phải dùng sơ đồ -en.svg: ${duong}`);
      if (!en && duong.endsWith('-en.svg')) ghiLoi(p, `bản tiếng Việt không được dùng sơ đồ -en.svg: ${duong}`);
    }
  }
  for (const m of sach.matchAll(/\]\((\/[^)\s#]*)\)/g)) {
    const h = m[1];
    if (h.startsWith('/images/')) continue;
    if (en && !h.startsWith('/en/')) ghiLoi(p, `liên kết trong bản tiếng Anh phải bắt đầu bằng /en/: ${h}`);
    if (!en && h.startsWith('/en/')) ghiLoi(p, `liên kết trong bản tiếng Việt không được bắt đầu bằng /en/: ${h}`);
    const t = h.replace(/^\/en/, '').match(/^\/(bai-viet|cong-trinh|nghe-thuat)\/([a-z0-9-]+)\/$/);
    if (t) {
      if (!tonTai(du(t[1], t[2], en))) ghiLoi(p, `liên kết tới bài không có: ${h}`);
    } else if (!/^\/(en\/)?(gioi-thieu|about|bai-viet|cong-trinh|nghe-thuat)?\/?$/.test(h)) {
      ghiCanhBao(p, `liên kết nội bộ lạ: ${h}`);
    }
  }
}

// ---------- 3. Công cụ quét giọng AI (chỉ bản tiếng Việt) ----------

for (const b of viMoi) {
  try {
    const kq = JSON.parse(sh(`node tools/giong-ai/quet.mjs "${b.p}" --json`))[0];
    if (kq.ketLuan === 'nhiều dấu hiệu') ghiLoi(b.p, `công cụ quét giọng AI chấm ${kq.diem}: nhiều dấu hiệu`);
    else if (kq.ketLuan === 'cần xem') ghiCanhBao(b.p, `công cụ quét giọng AI chấm ${kq.diem}: cần xem`);
  } catch (e) {
    ghiCanhBao(b.p, 'không chạy được công cụ quét giọng AI');
  }
}

// ---------- 4. Bản dựng ----------

const dist = join(goc, 'dist');
if (!existsSync(dist)) {
  ghiLoi('dist', 'chưa có thư mục dist; chạy `npm run build` trước');
} else {
  for (const b of bai) {
    const dich = join(dist, ...(b.en ? ['en'] : []), b.kh, b.slug, 'index.html');
    if (!existsSync(dich)) ghiLoi(b.p, 'bản dựng không có trang của bài này');
  }
  const duyet = (thuMuc, ra) => {
    for (const t of readdirSync(thuMuc)) {
      const p = join(thuMuc, t);
      if (statSync(p).isDirectory()) duyet(p, ra);
      else if (p.endsWith('.html')) ra.push(p);
    }
    return ra;
  };
  const hong = new Set();
  for (const f of duyet(dist, [])) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const h = m[1];
      if (h.startsWith('//')) continue;
      const rel = h.replace(/^\//, '');
      if (!(existsSync(join(dist, rel)) && statSync(join(dist, rel)).isFile()) && !existsSync(join(dist, rel, 'index.html'))) {
        hong.add(`${f.slice(dist.length + 1)} -> ${h}`);
      }
    }
  }
  for (const h of [...hong].slice(0, 10)) ghiLoi('dist', `liên kết hoặc ảnh hỏng trong bản dựng: ${h}`);
}

// ---------- Kết quả ----------

const ketQua = {
  baiVietMoi: viMoi.map((b) => `${b.kh}/${b.slug}`),
  soTepMoi: moi.length,
  loi,
  canhBao,
  dat: loi.length === 0,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(ketQua, null, 2));
} else {
  console.log(`Bài tiếng Việt mới: ${ketQua.baiVietMoi.length ? ketQua.baiVietMoi.join(', ') : '(không có)'}`);
  for (const l of loi) console.log(`LỖI     ${l.tep}: ${l.msg}`);
  for (const c of canhBao) console.log(`CẢNH BÁO ${c.tep}: ${c.msg}`);
  console.log(loi.length === 0 ? 'ĐẠT: có thể đăng.' : `KHÔNG ĐẠT: ${loi.length} lỗi. Không được đăng.`);
}
process.exit(loi.length === 0 ? 0 : 1);
