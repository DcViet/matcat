# Mặt Cắt

Trang viết về kiến trúc, nghệ thuật và cách nghĩ. Dựng bằng [Astro](https://astro.build), nội dung viết bằng Markdown.

## Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:4321/matcat/.

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

Trang chạy tại https://dcviet.github.io/matcat/. Mỗi lần đẩy mã lên nhánh `main`, GitHub tự build và cập nhật trang (xem `.github/workflows/deploy.yml`):

```bash
git add -A
git commit -m "Thêm bài mới"
git push
```

Khi chuyển sang tên miền riêng, đổi `SITE` và `BASE` ở đầu `astro.config.mjs`.
