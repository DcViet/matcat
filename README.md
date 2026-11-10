# Mặt Cắt

Trang viết về kiến trúc, nghệ thuật và cách nghĩ. Dựng bằng [Astro](https://astro.build), nội dung viết bằng Markdown.

## Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:4321.

## Viết bài mới

Mỗi bài là một tệp `.md` trong `src/content/`:

| Khu | Thư mục | Tệp mẫu |
| --- | --- | --- |
| Bài viết | `src/content/bai-viet/` | `dong-tu-mo-ra-kha-nang.md` |
| Công trình | `src/content/cong-trinh/` | `mau-cong-trinh.md` |
| Nghệ thuật | `src/content/nghe-thuat/` | `mau-tac-pham.md` |

1. Sao chép tệp mẫu, đặt tên không dấu, nối bằng gạch ngang (ví dụ `nha-tho-da.md`). Tên tệp là đường dẫn của bài.
2. Sửa phần đầu tệp (giữa hai dòng `---`): `title`, `description`, `date`.
3. Bài có `draft: true` sẽ không hiện trên trang. Đổi thành `false` khi viết xong.
4. Ảnh đặt trong `public/images/` và gọi bằng `/images/ten-anh.jpg`. Ghi nguồn ảnh ở `coverCredit`.

Có thể mở thư mục `src/content/` bằng Obsidian để viết.

## Xuất bản

```bash
npm run build
```

Kết quả nằm trong `dist/`, đưa lên Cloudflare Pages, GitHub Pages hoặc Netlify đều được. Trước khi xuất bản, đổi `site` trong `astro.config.mjs` thành tên miền thật.
