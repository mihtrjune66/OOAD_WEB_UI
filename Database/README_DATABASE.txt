========================================================================
HỆ THỐNG CƠ SỞ DỮ LIỆU ĐỀ TÀI: URBAN CHIC (OOAD - NHÓM 19)
========================================================================

1. HỆ QUẢN TRỊ CSDL HỖ TRỢ:
   - SQLite 3 (CSDL chạy trực tiếp cùng ứng dụng web)
   - PostgreSQL (pgAdmin 4) - Cung cấp sẵn file script chuẩn dành riêng cho pgAdmin!

2. CÁC FILE TRONG THƯ MỤC NÀY:
   - urban_chic_postgresql.sql: File script SQL chuẩn 100% cú pháp PostgreSQL.
     👉 MỞ BẰNG PGADMIN 4: Mở Query Tool trong pgAdmin 4 -> Mở file này -> Bấm F5 (Execute) là chạy thành công 100%, tự động tạo bảng và chèn dữ liệu mẫu!
   - urban_chic_database.sql: File script SQL chuẩn SQLite / General SQL dump.
   - fashion_ooad.db: File CSDL SQLite nhị phân thực tế của ứng dụng web, mở bằng DB Browser for SQLite hoặc DBeaver xem được ngay.

3. DANH SÁCH BẢNG TRONG CSDL (Khớp 100% với Sơ đồ RDM & Class Diagram đồ án):
   1. NGUOI_DUNG           : Lưu tài khoản nhân sự nội bộ (Admin, Vận hành, Thủ kho).
   2. KHACH_HANG           : Lưu thông tin định danh khách hàng & trạng thái Blacklist (CRM).
   3. SAN_PHAM             : Lưu thông tin sản phẩm thời trang tổng quát.
   4. BIEN_THE_SKU         : Lưu từ điển biến thể theo Size, Màu, Mã vạch Barcode, Giá vốn, Giá bán.
   5. TON_KHO_VI_TRI       : Quản lý số lượng thực tế, tạm giữ, khả dụng và vị trí lưu kho.
   6. KHUYEN_MAI           : Lưu trữ chiến dịch Voucher (giảm theo % hoặc tiền, thời hạn, lượt dùng).
   7. DON_HANG             : Quản lý đơn hàng, địa chỉ, thanh toán, mã vận đơn và lịch sử hành trình.
   8. CHI_TIET_DON_HANG    : Chi tiết các mặt hàng SKU trong từng đơn hàng.
   9. YEU_CAU_DOI_TRA      : Hồ sơ khiếu nại, đổi hàng / trả hàng, ảnh minh chứng và mã thu hồi.
   10. CHINH_SACH_HE_THONG : Cấu hình quy tắc kinh doanh (thời hạn đổi trả, mức freeship, API keys).
   11. PHIEU_KHO           : Chứng từ phiếu nhập kho và phiếu xuất kho của Thủ kho.
   12. CHI_TIET_PHIEU_KHO  : Chi tiết số lượng, đơn giá các SKU trong từng phiếu kho.

4. HƯỚNG DẪN MỞ & XEM DỮ LIỆU:
   - Cách 1 (pgAdmin 4): Mở pgAdmin 4 -> Tạo database mới (vd: urban_chic) -> Mở Query Tool -> Mở file "urban_chic_postgresql.sql" -> Bấm F5.
   - Cách 2 (DB Browser for SQLite): Mở DB Browser -> Open Database -> Chọn "fashion_ooad.db".
========================================================================
