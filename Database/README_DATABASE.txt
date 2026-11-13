========================================================================
HỆ THỐNG CƠ SỞ DỮ LIỆU ĐỀ TÀI: URBAN CHIC (OOAD - NHÓM 19)
========================================================================

1. HỆ QUẢN TRỊ CSDL:
   - SQLite 3 (Cơ sở dữ liệu quan hệ nhúng, chuẩn SQL-92/RDM)
   - Tên cơ sở dữ liệu: fashion_ooad.db

2. CÁC FILE TRONG THƯ MỤC NÀY:
   - urban_chic_database.sql: File kịch bản SQL chứa toàn bộ câu lệnh tạo bảng (DDL) 
     và dữ liệu mẫu khởi tạo (DML) cho 10 bảng của hệ thống. Có thể mở xem hoặc 
     thực thi trên bất kỳ công cụ quản lý CSDL nào (DB Browser for SQLite, DBeaver, VS Code...).
   - fashion_ooad.db: File CSDL SQLite nhị phân đã được tạo sẵn và chứa đầy đủ dữ liệu 
     mẫu để chạy chương trình ngay lập tức mà không cần cài đặt máy chủ CSDL phức tạp.

3. DANH SÁCH 10 BẢNG TRONG CSDL (Khớp 100% với Sơ đồ RDM & Class Diagram đồ án):
   - NGUOI_DUNG           : Lưu tài khoản nhân sự nội bộ (Admin, Vận hành, Thủ kho).
   - KHACH_HANG           : Lưu thông tin định danh khách hàng & trạng thái Blacklist (CRM).
   - SAN_PHAM             : Lưu thông tin sản phẩm thời trang tổng quát.
   - BIEN_THE_SKU         : Lưu từ điển biến thể theo Size, Màu, Mã vạch Barcode, Giá vốn, Giá bán.
   - TON_KHO_VI_TRI       : Quản lý số lượng thực tế, tạm giữ, khả dụng và vị trí lưu kho.
   - KHUYEN_MAI           : Lưu trữ chiến dịch Voucher (giảm theo % hoặc tiền, thời hạn, lượt dùng).
   - DON_HANG             : Quản lý đơn hàng, địa chỉ, thanh toán, mã vận đơn và lịch sử hành trình.
   - CHI_TIET_DON_HANG    : Chi tiết các mặt hàng SKU trong từng đơn hàng.
   - YEU_CAU_DOI_TRA      : Hồ sơ khiếu nại, đổi hàng / trả hàng, ảnh minh chứng và mã thu hồi.
   - CHINH_SACH_HE_THONG  : Cấu hình quy tắc kinh doanh (thời hạn đổi trả, mức freeship, API keys).
   - PHIEU_KHO            : Chứng từ phiếu nhập kho và phiếu xuất kho của Thủ kho.
   - CHI_TIET_PHIEU_KHO   : Chi tiết số lượng, đơn giá các SKU trong từng phiếu kho.

4. HƯỚNG DẪN MỞ & XEM DỮ LIỆU:
   - Cách 1 (Khuyên dùng): Dùng phần mềm "DB Browser for SQLite" (hoặc DBeaver) 
     -> Chọn "Open Database" -> Chọn file "fashion_ooad.db".
   - Cách 2: Mở file "urban_chic_database.sql" bằng bất kỳ trình soạn thảo nào 
     (Notepad, VS Code, Word) để đọc cấu trúc DDL và dữ liệu DML.
========================================================================

