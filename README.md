# ALPHA-RIDER-BUILT-DIFF-ON-GOD-NO-CAP
Dùng cho những anh em bận công việc nhưng quá mệt mỏi việc ngồi chờ tour mòn con mắt, xong lúc mình không để ý thì lại bị chậm mất tiêu TvT

🏕️ Camp Tour Messenger - Auto Reply Extension

📌 Giới thiệu dự án (About The Project)

Camp Tour Messenger là một tiện ích mở rộng (Chrome/Edge Extension) được thiết kế đặc biệt dành riêng cho các anh em Rider/Tài xế/Freelancer. Công cụ này giúp tự động hóa hoàn toàn việc "bắt đơn" (camp tour) từ quản lý trên nền tảng Facebook Messenger Group Chat.

Thay vì phải túc trực dán mắt vào màn hình, tiện ích sẽ âm thầm giám sát nhóm chat theo thời gian thực (Real-time). Ngay khi quản lý gửi từ khóa thông báo có tour mới, tool sẽ lập tức tự động chuyển trang, gõ câu trả lời và nhấn Gửi với tốc độ chớp nhoáng nhưng vẫn đảm bảo mô phỏng giống hệt thao tác của người thật.

✨ Tính năng nổi bật (Core Features)

⚡ Bắt Tour Siêu Tốc (Real-time Polling): Quét tin nhắn liên tục mỗi 500ms, vượt qua rào cản Virtual DOM của React trên Facebook để đọc tin nhắn ngay khi vừa xuất hiện.

🎯 Nhận Diện Thông Minh kép:

Fuzzy Name Matching: Nhận diện linh hoạt tên Quản lý dù Facebook có hiển thị rút gọn (VD: Config "Duy Phúc" vẫn nhận đúng UI "Phúc").

Text Extraction: Xử lý mượt mà lỗi tin nhắn gộp, bóc tách chính xác chữ bỏ qua các thẻ ẩn (Screen Reader) của người khiếm thị.

🔄 Tự Động Chuyển Chat (Auto-Switch): Nếu bạn đang ở tab chat khác, tool sẽ tự động phát hiện nhóm đích có tin nhắn mới và dùng URL Navigation để "bẻ lái" trình duyệt về đúng group chat.

🤖 Mô Phỏng Người Thật (Humanize):

Không gửi API trực tiếp. Dùng DataTransfer và ClipboardEvent mô phỏng hành động "Paste" và gõ phím Enter trực tiếp vào khung Lexical Editor của Messenger.

Delay ngẫu nhiên (Min - Max) và chọn câu trả lời ngẫu nhiên trong danh sách.

🛡️ Cơ Chế An Toàn (Auto-Kill): Tự động ngắt hoàn toàn hoạt động (Stop Tool) ngay sau khi gửi thành công 1 tin nhắn để chống spam và bảo vệ tài khoản Facebook. Có âm thanh "Ting" báo hiệu thành công.

🎨 Giao Diện GenZ Cực Chất:

UI thiết kế theo phong cách Glassmorphism kính mờ hiện đại.

Background động Starry Nights (ASCII Art).

Hiệu ứng Sparkles Text lấp lánh tự code bằng Vanilla JS mô phỏng 1:1 từ thư viện Framer Motion của React.

Font chữ cá tính (Bungee Spice, Hachi Maru Pop, Playwrite VN Guides).

🛠️ Cài đặt (Installation)

Vì đây là tiện ích tùy chỉnh (chưa đưa lên Store public), bạn có thể cài đặt thủ công theo các bước sau:

Tải toàn bộ mã nguồn dự án này về máy (File .zip) và giải nén ra một thư mục.

Mở trình duyệt Chrome/Edge, truy cập vào trang Quản lý tiện ích: chrome://extensions/.

Bật chế độ Developer mode (Chế độ dành cho nhà phát triển) ở góc phải màn hình.

Nhấn vào nút Load unpacked (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén ở bước 1.

Ghim tiện ích Camp Tour Messenger lên thanh công cụ và bắt đầu sử dụng.

🚀 Hướng dẫn sử dụng (Usage)

Mở tiện ích lên, điền đầy đủ thông tin:

Tên Nhóm Chat: (VD: Tour for Us - phải copy chính xác 100% tên của nhóm chat thì mới có thể hoạt động)

Tên Quản Lý: Người sẽ phát tour (VD: Tung Tung God - cũng copy chính xác 100% tên Facebook).

Từ khóa báo tour: (VD: nhận, ae nhận - chỉ nhận được 1 từ hoặc cụm từ, không nhận được nhiều cụm từ, tool không không biệt được dấu phẩy là từ khoá thứ 2).

Danh sách trả lời: (VD: e, em, dạ em - tool sẽ tự động auto random các từ này để reply tin nhắn).

Min/Max Delay: Thời gian chờ trước khi reply (VD: 0.5 - 1 giây - cứ để thời gian như này là ổn, bắt tour nhanh lắm đó, nên không cần phải chỉnh nhanh hơn đâu, chỉnh lâu hơn thì nó sẽ delay lại reply lâu hơn theo thời gian min và max đã định).

Nhấn Lưu Cài Đặt.

Nhấn BẬT TOOL (Trạng thái chuyển sang màu xanh "Đang Chờ Tour...").

Treo máy ở tab messenger.com và đi pha một tách cafe. Việc còn lại để Tool lo!

🔒 Quyền riêng tư & Bảo mật (Privacy & Security)

100% Client-side: Tiện ích hoạt động hoàn toàn trên trình duyệt cá nhân của bạn. Không có bất kỳ dữ liệu tin nhắn, mật khẩu hay tài khoản nào được gửi ra máy chủ bên ngoài.

Sử dụng API chrome.storage.local để lưu cấu hình ngay trên máy tính của bạn.

こんにちは！アキです。
Made by Github: LDP-cyber
