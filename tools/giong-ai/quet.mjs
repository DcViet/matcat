#!/usr/bin/env node
// Quét giọng AI trong bài tiếng Việt của Mặt Cắt.
// Không phụ thuộc thư viện nào, chạy hoàn toàn trên máy, không gửi chữ đi đâu.
//
//   node tools/giong-ai/quet.mjs                 quét mọi bài trong src/content
//   node tools/giong-ai/quet.mjs duong/dan.md    quét một hay nhiều tệp
//   --nhe       hiện cả dấu hiệu mức nhẹ (mặc định chỉ hiện cao và vừa)
//   --strict    thoát mã 1 nếu có bài ở mức "nhiều dấu hiệu"
//   --json      in kết quả dạng JSON

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const goc = resolve(here, '..', '..');
const { quyTac } = JSON.parse(readFileSync(join(here, 'quy-tac.json'), 'utf8'));

const TRONG_SO = { cao: 3, vua: 2, nhe: 0.2 };
// Bài ngắn hơn ngưỡng này vẫn chia cho ngưỡng, để một dấu hiệu lẻ không làm điểm vọt lên.
const CHU_TOI_THIEU = 800;
const NHAN_MUC = { cao: 'cao', vua: 'vừa', nhe: 'nhẹ' };
// Điểm = tổng trọng số chia cho số nghìn chữ. Ngưỡng chọn theo thử nghiệm trên các bài hiện có.
const NGUONG_XEM = 4;
const NGUONG_NHIEU = 10;

const args = process.argv.slice(2);
const co = (c) => args.includes(c);
const duongDan = args.filter((a) => !a.startsWith('--'));

// ---------- Biên dịch quy tắc ----------

const thoat = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
const KHONG_CHU = '(?<![\\p{L}\\p{N}])';
const KHONG_CHU_SAU = '(?![\\p{L}\\p{N}])';

const luat = quyTac.map((r) => {
  const mau = [
    ...(r.cum ?? []).map((c) => `${KHONG_CHU}${thoat(c)}${KHONG_CHU_SAU}`),
    ...(r.mau ?? []),
  ];
  return { ...r, re: new RegExp(mau.join('|'), 'giu') };
});

// ---------- Làm sạch bài Markdown ----------

const xoaGiuDong = (m) => m.replace(/[^\n]/g, ' ');

function lamSach(raw) {
  let t = raw.normalize('NFC').replace(/\r\n/g, '\n');

  // Phần đầu tệp: chỉ giữ tiêu đề và đoạn dẫn để quét.
  const dau = t.match(/^---\n[\s\S]*?\n---\n/);
  if (dau) {
    const gon = dau[0]
      .split('\n')
      .map((d) => {
        const m = d.match(/^(title|description):\s*"?(.*?)"?\s*$/);
        return m ? ' '.repeat(d.length - m[2].length) + m[2] : ' '.repeat(d.length);
      })
      .join('\n');
    t = gon + t.slice(dau[0].length);
  }

  return t
    .replace(/<!--[\s\S]*?-->/g, xoaGiuDong) // khối chú thích nguồn
    .replace(/```[\s\S]*?```/g, xoaGiuDong) // khối mã
    .replace(/!\[[^\]]*\]\([^)]*\)/g, xoaGiuDong) // ảnh
    .replace(/\]\([^)]*\)/g, (m) => ']' + xoaGiuDong(m.slice(1))) // địa chỉ liên kết
    .replace(/`[^`\n]*`/g, xoaGiuDong); // mã trong dòng
}

// ---------- Quét một tệp ----------

const demChu = (t) => (t.match(/[\p{L}\p{N}]+/gu) ?? []).length;

function viTri(offsets, idx) {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= idx) lo = mid;
    else hi = mid - 1;
  }
  return { dong: lo + 1, cot: idx - offsets[lo] + 1 };
}

function chiSo(t, soChu) {
  const nghin = Math.max(soChu / 1000, 0.001);
  const dongKhac = t.split('\n').filter((d) => d.trim());
  const gachDau = dongKhac.filter((d) => /^\s*([-*+]|\d+\.)\s/.test(d)).length;

  // Nhịp câu: hệ số biến thiên của độ dài câu (độ lệch chuẩn chia trung bình).
  const bao = t
    .replace(/\b(tr|ch|tt|vd|ví dụ)\.\s/gi, '$1. ')
    .replace(/^\s*[|#>].*$/gm, ' ')
    .replace(/[*_]/g, '');
  const cau = bao
    .split(/(?<=[.!?…])\s+|\n{2,}/u)
    .map((c) => demChu(c))
    .filter((n) => n >= 3);
  let nhip = null;
  if (cau.length >= 12) {
    const tb = cau.reduce((a, b) => a + b, 0) / cau.length;
    const phuongSai = cau.reduce((a, b) => a + (b - tb) ** 2, 0) / cau.length;
    nhip = { soCau: cau.length, tb: +tb.toFixed(1), heSo: +(Math.sqrt(phuongSai) / tb).toFixed(2) };
  }

  return {
    inDam: +(((t.match(/\*\*[^*\n]+\*\*/g) ?? []).length) / nghin).toFixed(1),
    gachDauDong: dongKhac.length ? +((gachDau / dongKhac.length) * 100).toFixed(0) : 0,
    nhip,
  };
}

function quetTep(tep) {
  const raw = readFileSync(tep, 'utf8');
  const nhapNhang = /^draft:\s*true\s*$/m.test(raw.slice(0, 1200));
  const sach = lamSach(raw);
  const soChu = demChu(sach);

  const offsets = [0];
  for (let i = 0; i < sach.length; i++) if (sach[i] === '\n') offsets.push(i + 1);
  const dong = sach.split('\n');

  const trung = [];
  for (const r of luat) {
    r.re.lastIndex = 0;
    let m;
    while ((m = r.re.exec(sach))) {
      if (m[0] === '') {
        r.re.lastIndex++;
        continue;
      }
      const vt = viTri(offsets, m.index);
      const tho = (dong[vt.dong - 1] ?? '').trim();
      const o = Math.max(0, tho.indexOf(m[0].trim()) - 30);
      trung.push({
        quyTac: r.id,
        nhom: r.nhom,
        muc: r.muc,
        dong: vt.dong,
        cot: vt.cot,
        khop: m[0].trim().replace(/\s+/g, ' '),
        trich: (o > 0 ? '…' : '') + tho.slice(o, o + 100) + (tho.length > o + 100 ? '…' : ''),
        goiY: r.goiY,
      });
    }
  }
  trung.sort((a, b) => a.dong - b.dong || a.cot - b.cot);

  const tong = trung.reduce((s, h) => s + TRONG_SO[h.muc], 0);
  const diem = +(tong / (Math.max(soChu, CHU_TOI_THIEU) / 1000)).toFixed(1);
  const ketLuan = diem >= NGUONG_NHIEU ? 'nhiều dấu hiệu' : diem >= NGUONG_XEM ? 'cần xem' : 'sạch';
  return { tep, nhapNhang, soChu, diem, ketLuan, trung, chiSo: chiSo(sach, soChu) };
}

// ---------- Chọn tệp ----------

function duyet(thuMuc, ra) {
  for (const ten of readdirSync(thuMuc)) {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) duyet(p, ra);
    // Bỏ bản mẫu và bản tiếng Anh (en-...), công cụ chỉ dành cho tiếng Việt.
    else if (/\.mdx?$/.test(ten) && !ten.startsWith('mau-') && !ten.startsWith('en-')) ra.push(p);
  }
  return ra;
}

const tep = duongDan.length ? duongDan.map((p) => resolve(p)) : duyet(join(goc, 'src', 'content'), []);

const ketQua = tep.map(quetTep);

if (co('--json')) {
  console.log(JSON.stringify(ketQua, null, 2));
} else {
  const hienNhe = co('--nhe');
  for (const kq of ketQua) {
    const ten = relative(goc, kq.tep).replace(/\\/g, '/');
    const nhan = kq.nhapNhang ? ' (bản nháp)' : '';
    console.log(`\n== ${ten}${nhan}`);
    console.log(`   ${kq.soChu} chữ · điểm ${kq.diem} trên 1000 chữ · ${kq.ketLuan.toUpperCase()}`);
    const hien = kq.trung.filter((h) => hienNhe || h.muc !== 'nhe');
    const nhe = kq.trung.length - hien.length;
    for (const h of hien) {
      console.log(`   dòng ${h.dong}, cột ${h.cot} [${NHAN_MUC[h.muc]}] ${h.nhom}: "${h.khop}"`);
      console.log(`      ${h.trich}`);
      console.log(`      → ${h.goiY}`);
    }
    if (nhe > 0) console.log(`   (${nhe} dấu hiệu mức nhẹ đang ẩn; thêm --nhe để xem)`);
    const c = kq.chiSo;
    const ghi = [];
    if (c.inDam > 12) ghi.push(`in đậm dày (${c.inDam} chỗ/1000 chữ)`);
    if (c.gachDauDong > 35) ghi.push(`gạch đầu dòng chiếm ${c.gachDauDong}% số dòng`);
    if (c.nhip && c.nhip.heSo < 0.45) ghi.push(`nhịp câu đều (hệ số ${c.nhip.heSo}; câu dài trung bình ${c.nhip.tb} chữ)`);
    if (ghi.length) console.log(`   Chỉ số cần xem: ${ghi.join('; ')}.`);
    if (c.nhip) console.log(`   Nhịp câu: ${c.nhip.soCau} câu, dài trung bình ${c.nhip.tb} chữ, hệ số biến thiên ${c.nhip.heSo}.`);
  }
  const nhieu = ketQua.filter((k) => k.ketLuan === 'nhiều dấu hiệu').length;
  console.log(`\nTổng: ${ketQua.length} tệp; ${ketQua.filter((k) => k.ketLuan === 'cần xem').length} cần xem; ${nhieu} nhiều dấu hiệu.`);
  console.log('Công cụ chỉ gợi ý chỗ để người viết đọc lại; điểm thấp không chứng minh bài do người viết.');
}

if (co('--strict') && ketQua.some((k) => k.ketLuan === 'nhiều dấu hiệu')) process.exit(1);
