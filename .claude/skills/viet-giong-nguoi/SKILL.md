---
name: viet-giong-nguoi
description: Viết hoặc sửa bài tiếng Việt cho trang Mặt Cắt sao cho đọc như người viết, tránh các dấu hiệu giọng AI. Dùng khi viết bài mới, rà soát bài đã có, hoặc khi người dùng nói "giọng AI", "tự nhiên hơn", "gần gũi hơn", "bớt máy".
---

# Viết giọng người cho Mặt Cắt

Mục tiêu là bài đọc tốt và đúng với người viết, không phải bài qua mặt được trình dò AI. Công cụ ở `tools/giong-ai/` chỉ chỉ ra chỗ nên đọc lại.

## Trước khi viết

1. Biết bài giúp ai làm gì hoặc hiểu gì. Ghi ra một câu. Nếu không viết nổi câu đó thì chưa nên viết.
2. Nếu người dùng có đưa mẫu giọng văn của họ (xem memory của dự án), đọc trước. Giọng của họ là chuẩn, không phải giọng mặc định của trợ lý.
3. Chọn ngôi: các bài hiện có dùng "tôi" và "ta". Nếu người dùng muốn "mình", đổi cả bài, không trộn.

## Khi viết

- **Chi tiết trước, nhận định sau.** Mỗi đoạn có ít nhất một thứ kiểm chứng được: tên người, năm, trang sách, một cảnh cụ thể. Đoạn nào chỉ có ý chung chung thì viết lại hoặc bỏ.
- **Không bịa trải nghiệm của người viết.** Không viết "tôi đã đến", "tôi từng thấy" nếu người dùng chưa nói. Ví dụ tự nghĩ ra thì ghi rõ là ví dụ ("ví dụ này của tôi").
- **Đoạn văn nối ý với ý.** Không nhồi đề mục, gạch đầu dòng hay bảng khi một đoạn là đủ. Đừng ép mọi thứ thành ba ý.
- **Để nhịp câu tự lệch.** Câu dài đi cùng câu ngắn vì ý cần vậy, không vì chỉ tiêu.
- **Từ thường thay từ hoa mỹ.** Nói thẳng việc gì, ai làm, ở đâu, bao nhiêu.
- **Giữ nguyên chú thích nguồn và chỗ chưa chắc.** Đó là phần trung thực của bài, không phải phần "máy". Khối "Lưu ý" đặt ở **cuối bài**, không đặt đầu bài, và không có câu chung chung kiểu "chưa đối chiếu với bản in"; chỉ ghi điều cụ thể (ví dụ nào do mình nghĩ ra, số liệu nào lấy từ bản dịch qua OCR).

## Câu tiếng Việt tròn đầy, không dịch chay

Người dùng đã chê tiêu đề và câu của trợ lý "nghe thô như câu dịch chay". Cách tránh:

- **Tiêu đề phải nói thành tiếng được.** Đọc to lên; nếu người Việt không nói như vậy thì viết lại. Ví dụ "căn phòng tối để một khe sáng có nghĩa" là cấu trúc dịch; "căn phòng tối chỉ chừa một khe sáng" thì nghe như lời nói.
- **Ưu tiên động từ thuần Việt và chủ ngữ rõ ràng.** "Ông chỉ chừa vài ô cửa" tự nhiên hơn "cửa mở bị hạn chế". Bỏ lối bị động cho vật ("được thực hiện", "bị phá bởi").
- **Tránh danh từ hóa.** "Sự đơn giản bị phá bởi độ sáng" nên thành "thứ duy nhất phá vỡ sự đơn giản ấy là độ sáng".
- **Từ Hán Việt vừa đủ.** "Phổ quát", "đối lập", "tiếp xúc" thường có chữ thuần Việt dễ nghe hơn: "không thuộc riêng ai", "đứng đối lại", "chạm vào".
- **Câu có hơi.** Thêm tiếng đệm khi cần ("thì", "chính là", "cũng", "vốn"), để câu tròn như lời kể, nhưng đừng đệm bừa.
- **Kiểm tra bằng tai.** Câu nào đọc vấp thì viết lại, kể cả khi đúng ngữ pháp.

## Dấu hiệu giọng AI trong tiếng Việt cần tránh

- **Mở bài:** "Trong bối cảnh…", "Bạn đã bao giờ tự hỏi…", "Hãy cùng khám phá…".
- **Đối lập giả:** "không chỉ… mà còn…", "không đơn thuần là… mà là…".
- **Câu nghe sâu:** "Ở cốt lõi…", "Sự thật là…", câu chốt một dòng sau mỗi đoạn.
- **Dàn dựng:** hỏi rồi tự trả lời ngay, "Điều thú vị là…".
- **Từ khoa trương:** "đóng vai trò then chốt", "hành trình", "bức tranh toàn cảnh", "giao thoa", "vô cùng", "đáng chú ý là".
- **Liệt kê máy móc:** "Thứ nhất, thứ hai, thứ ba", từ nối đầu câu dày đặc, mọi ý đều thành bộ ba.
- **Kết bài:** "Tóm lại…", "Hy vọng bài viết…", lời cảm ơn, lời chúc.
- **Hình thức:** dấu gạch dài "—", biểu tượng cảm xúc, in đậm tràn lan.
- **Giọng chăm sóc khách hàng:** "Dưới đây là…", "Hãy để tôi…".

Danh sách đầy đủ, có mức độ và gợi ý, nằm trong `tools/giong-ai/quy-tac.json`.

## Sau khi viết

1. Chạy:

   ```bash
   npm run quet-giong -- src/content/<khu>/<bai>.md --nhe
   ```

2. Với từng chỗ được đánh dấu, quyết định: sửa, hay giữ vì đúng nghĩa. Sửa bằng cách viết lại câu, không thay từ máy móc. Giữ nguyên nghĩa, nguồn và độ chắc chắn.
3. Đọc to lại ba chỗ: câu mở bài, câu cuối mỗi đoạn, câu cuối bài.
4. Nếu chỉ số báo "nhịp câu đều" hoặc "gạch đầu dòng chiếm nhiều", xem lại cấu trúc chứ đừng chỉ sửa từ.

## Không làm

- Không giả lỗi chính tả, không chèn tiếng lóng, không cố "làm lộn xộn" cho giống người.
- Không dùng hay giới thiệu công cụ nhằm qua mặt trình dò AI. Mục tiêu là viết hay hơn.
- Không coi điểm thấp là bằng chứng bài do người viết. Công cụ chỉ thấy bề mặt: từ, dấu câu, nhịp câu.
