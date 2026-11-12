# Urban Chic® – Phân hệ 1: Quản lý mua sắm online (Khách hàng)

Web giao diện khách hàng cho đồ án **Phân tích & Thiết kế Hướng đối tượng**, đồng bộ với:
- Tài liệu đồ án: BTH2 (mô tả dự án), BTH4 (Use case), BTH5 (đặc tả 19 UC), BTH6 (sequence), BTH7 (activity).
- Phần Admin của Trí: [mihtrjune66/OOAD_WEB_UI](https://github.com/mihtrjune66/OOAD_WEB_UI) – cùng thương hiệu, tông đen–trắng, font Inter, cùng mã sản phẩm/SKU (`SKU-AK01-DEN-L`…), mã voucher (`SALE50K`, `NEWMEM10`, `VIPMEMBER`, `FLASH100`), trạng thái đơn (`CHO_DUYET → DANG_DONG_GOI → DANG_GIAO → DA_GIAO / DA_HUY`).

## Chạy web
Cùng server FastAPI với phần Admin (đã gắn sẵn trong `backend_admin/main.py`):
```
pip install -r requirements.txt
python -m uvicorn backend_admin.main:app --reload
```
- Web Khách hàng (Phân hệ 1): `http://127.0.0.1:8000/khach-hang/`
- Web Quản trị nội bộ (Admin/Vận hành/Kho): `http://127.0.0.1:8000/`

Khi deploy Render (`render.yaml`) thì web khách hàng nằm ở `https://<ten-app>.onrender.com/khach-hang/`.
Cũng có thể mở trực tiếp `frontend_khachhang/index.html` bằng Chrome/Edge (cần Internet để tải Tailwind, Font Awesome và ảnh).

Dữ liệu lưu trong `localStorage` của trình duyệt. Muốn quay về dữ liệu mẫu: nút **Demo** (góc dưới trái) → *Khôi phục dữ liệu*.

## Tài khoản demo (xem `assets/js/data.js`)
| Tài khoản | Mật khẩu | Ghi chú |
|---|---|---|
| `minhquan` | `Demo@123` | Có sẵn 7 đơn hàng đủ trạng thái, giỏ hàng, yêu thích, 2 địa chỉ |
| `thuha` | `Demo@123` | Khách thành viên thường |
| `vankiet` | `Demo@123` | Tài khoản **bị khóa** – chụp luồng phụ Đăng nhập |

## Bảng ánh xạ Use case → màn hình
Trang `#/use-case` (link ở footer) liệt kê đầy đủ và có nút mở nhanh từng màn hình.

| UC | Tên | Màn hình (Boundary) | Đường dẫn |
|---|---|---|---|
| UC01 | Đăng ký tài khoản | GiaoDienDangKy | `#/dang-ky` |
| UC02 | Đăng nhập | GiaoDienDangNhap | `#/dang-nhap` |
| UC03 | Quên mật khẩu | GiaoDienKhoiPhuc | `#/quen-mat-khau`, `#/hop-thu`, `#/dat-lai-mat-khau/:token` |
| UC04 | Tìm kiếm sản phẩm | GiaoDienTimKiem | ô tìm kiếm trên header, `#/san-pham?q=...` |
| UC05 | Lọc sản phẩm | GiaoDienTimKiem | bộ lọc giá/màu/size bên trái `#/san-pham` |
| UC06 | Xem chi tiết sản phẩm | GiaoDienChiTiet | `#/san-pham/SP001` |
| UC07 | Xem khuyến mãi của SP | GiaoDienChiTiet | nút *Xem khuyến mãi* ở trang chi tiết |
| UC08 | Thêm vào giỏ hàng | GiaoDienChiTiet | nút *Thêm vào giỏ hàng* |
| UC09 | Quản lý giỏ hàng | GiaoDienGioHang | `#/gio-hang` |
| UC10 | Thêm vào mục yêu thích | GiaoDienChiTiet | nút trái tim |
| UC11 | Quản lý SP yêu thích | GiaoDienYeuThich | `#/tai-khoan/yeu-thich` |
| UC12 | Quản lý hồ sơ cá nhân | GiaoDienHoSo | `#/tai-khoan`, `/dia-chi`, `/mat-khau` |
| UC13 | Quản lý đơn hàng cá nhân | GiaoDienDonHang | `#/tai-khoan/don-hang` (+ tải hóa đơn, đổi trả) |
| UC14 | Hủy đơn | GiaoDienDonHang | nút *Hủy đơn* (đơn `DH20261105`, `DH20261110`) |
| UC15 | Xem quá trình vận chuyển | GiaoDienTheoDoi | `#/tai-khoan/don-hang/DH20261103/van-chuyen` |
| UC16 | Đặt hàng | GiaoDienDatHang | `#/dat-hang` |
| UC17 | Thanh toán | GiaoDienThanhToan | `#/thanh-toan/:maDon` |
| UC18 | Thanh toán COD | GiaoDienThanhToan | chọn COD → xác nhận |
| UC19 | Thanh toán MoMo/VNPay | GiaoDienThanhToan + cổng mô phỏng | `#/cong-thanh-toan/:ref`, `#/ket-qua-thanh-toan/:ref` |

## Nút **Demo** – chụp luồng phụ
- Bật/tắt **nhãn Use Case** (chip tím `UCxx · GiaoDienXxx`) trên mỗi màn hình.
- Mô phỏng lỗi hệ thống ngoài: *Email Service API lỗi*, *Cổng thanh toán lỗi khởi tạo*, *Cổng phản hồi chậm*, *API Đơn vị vận chuyển không phản hồi*.
- Lối tắt: điền tài khoản demo, hộp thư mô phỏng, danh mục UC, khôi phục dữ liệu.
- **Ẩn nút Demo** khi chụp hình sạch; nhấn `Shift + D` để hiện lại.

## Cấu trúc mã (theo lớp phân tích)
```
index.html
assets/css/style.css
assets/js/data.js            Dữ liệu mẫu (SAN_PHAM, BIEN_THE_SKU, KHUYEN_MAI, KHACH_HANG, DON_HANG...)
assets/js/controllers.js     Control + Entity: TaiKhoanController, XacThucController, SanPhamController,
                             KhuyenMaiController, GioHangController, YeuThichController, KhachHangController,
                             DonHangController, VanChuyenController, DatHangController, ThanhToanController
                             Hệ thống ngoài (mô phỏng): DichVuEmail, DichVuGiaoHang, DonViVanChuyen, CongMoMoVNPay
assets/js/views-*.js         Boundary: GiaoDienDangKy, GiaoDienDangNhap, GiaoDienKhoiPhuc, GiaoDienTimKiem,
                             GiaoDienChiTiet, GiaoDienGioHang, GiaoDienYeuThich, GiaoDienHoSo, GiaoDienDonHang,
                             GiaoDienTheoDoi, GiaoDienDatHang, GiaoDienThanhToan
assets/js/app.js             Điều hướng (hash router), header/footer, bảng Demo
```
Tên phương thức bám theo thông điệp trong sơ đồ tuần tự, ví dụ `dangKy()`, `dangNhap()`, `yeuCauKhoiPhuc()`, `datLaiMatKhau()`, `timKiem()`, `themVaoGio()`, `suaGio()`, `themYeuThich()`, `capNhatHoSo()`, `xemDanhSachDon()`, `taiHoaDon()`, `huyDon()`, `theoDoiVanChuyen()`, `tinhDonHang()`, `xacNhanDatHang()`, `layThongTinThanhToan()`, `xacNhanCOD()`, `taoThanhToan()`, `thongBaoKetQua()`, `traCuuKetQua()`.

## Ghi chú nghiệp vụ đã áp dụng
- Khách vãng lai được tìm kiếm, xem chi tiết, dùng giỏ hàng; giỏ được gộp vào tài khoản khi đăng nhập. Đặt hàng, hồ sơ, đơn hàng, yêu thích yêu cầu đăng nhập.
- Size S/M/L/XL, quản lý tồn theo SKU (Màu × Size); biến thể tồn = 0 bị khóa nút đặt mua.
- Đặt hàng: kiểm tra lại giá/tồn/voucher khi chốt, tạo đơn và giữ tồn trong một bước, rồi mới mở màn hình Thanh toán (UC17).
- Phí ship: nội thành TP.HCM 30.000₫, liên tỉnh 40.000₫, miễn phí từ 500.000₫.
- Quên mật khẩu: liên kết hiệu lực 15 phút, dùng 1 lần; thông báo không tiết lộ email có tồn tại hay không (theo sequence/activity UC03).
- Hủy đơn: chỉ khi *Chờ duyệt*; giải phóng tồn; đơn đã thanh toán điện tử chuyển *Đang xử lý hoàn tiền*.
- MoMo/VNPay: chỉ đánh dấu *Đã thanh toán* khi thông báo từ cổng hợp lệ (đúng chữ ký, số tiền) và chống ghi trùng; trang kết quả độc lập với callback.
- Đổi trả (theo mô tả BTH2): gửi yêu cầu cho đơn đã giao trong 7 ngày, kèm ảnh minh chứng → chuyển sang Phân hệ 2 xử lý.
