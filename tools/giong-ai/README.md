# Quét giọng AI cho Mặt Cắt

Công cụ nhỏ để chỉ ra những chỗ trong bài tiếng Việt đọc ra giọng máy, cùng bộ quy tắc viết đi kèm. Chạy trên máy, không phụ thuộc thư viện, không gửi chữ đi đâu.

## Dùng

```bash
npm run quet-giong                                    # quét mọi bài trong src/content
npm run quet-giong -- src/content/nghe-thuat/ve-de-thay.md --nhe
npm run quet-giong -- --json                          # kết quả dạng JSON
npm run quet-giong -- --strict                        # thoát mã 1 nếu có bài "nhiều dấu hiệu"
```

Mặc định ẩn dấu hiệu mức nhẹ; thêm `--nhe` để xem hết.

## Nó làm gì

- Đọc các tệp Markdown, bỏ qua phần đầu tệp (trừ tiêu đề và đoạn dẫn), khối chú thích nguồn `<!-- -->`, khối mã, ảnh và địa chỉ liên kết.
- Tìm các dấu hiệu trong `quy-tac.json`, chia ba mức: cao, vừa, nhẹ. Mỗi dấu hiệu có gợi ý cách sửa.
- Tính điểm trên 1000 chữ (mức nhẹ chỉ tính rất ít; bài ngắn hơn 800 chữ vẫn chia cho 800). Dưới 4 là "sạch", từ 4 là "cần xem", từ 10 là "nhiều dấu hiệu".
- Báo thêm ba chỉ số về cấu trúc: độ dày của chữ in đậm, tỉ lệ dòng gạch đầu dòng, và độ đều của nhịp câu.

## Đã thử thế nào

- **Một bài văn cảm xúc do người viết tự viết:** điểm 3,8, "sạch". Chỉ dính một chữ "hành trình" và vài dấu chấm than, đều là dùng đúng chỗ.
- **Đoạn văn kiểu AI viết giả lập** (có đủ "Trong bối cảnh", "không chỉ… mà còn", "Thứ nhất, thứ hai, thứ ba", "Tóm lại", biểu tượng cảm xúc): điểm 80,5, "nhiều dấu hiệu".
- **Chín bài hiện có của Mặt Cắt:** đều "sạch", điểm từ 0 đến 2,1.

## Giới hạn

- Công cụ chỉ thấy bề mặt. Giọng AI còn nằm ở cấu trúc: bài nào cũng ba phần đều nhau, mỗi đoạn đều kết bằng một câu chốt, ý chung chung không có chi tiết. Những thứ này phải đọc mới thấy.
- Có dương tính giả. Chữ "hành trình" hay "đóng vai trò" đúng nghĩa vẫn bị đánh dấu. Quy tắc là gợi ý, người viết quyết định.
- Quy tắc viết theo cảm nhận về văn AI hiện nay và sẽ lỗi thời. Sửa `quy-tac.json` khi thấy dấu hiệu mới.
- Điểm thấp không chứng minh bài do người viết, và công cụ này không được làm ra để qua mặt trình dò AI.

## Thêm hay sửa quy tắc

Mở `quy-tac.json`. Mỗi quy tắc có `id`, `nhom`, `muc` (`cao`, `vua`, `nhe`), `goiY`, và một trong hai: `cum` (danh sách cụm từ, khớp không phân biệt hoa thường) hoặc `mau` (biểu thức chính quy, cờ `giu`).

## Nguồn cảm hứng

Cách chia nhóm dấu hiệu và ý tưởng "gợi ý để người viết sửa" tham khảo từ các dự án mã nguồn mở:
[blader/humanizer](https://github.com/blader/humanizer), [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop), [Anbeeld/WRITING.md](https://github.com/Anbeeld/WRITING.md), [epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) (bản dành cho tiếng Hàn). Không sao chép mã hay văn bản của họ; bộ quy tắc ở đây viết riêng cho tiếng Việt.
