-- =============================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU URBAN CHIC® (BẢN DÀNH CHO POSTGRESQL / PGADMIN 4)
-- Đồ án: Phân tích & Thiết kế Hướng đối tượng (OOAD) - Nhóm 19
-- Tương thích: PostgreSQL 12+, 13, 14, 15, 16, 17 và pgAdmin 4
-- =============================================================================

-- Xóa các bảng cũ nếu đã tồn tại để tránh lỗi trùng lặp khi chạy lại
DROP TABLE IF EXISTS CHI_TIET_PHIEU_KHO CASCADE;
DROP TABLE IF EXISTS PHIEU_KHO CASCADE;
DROP TABLE IF EXISTS YEU_CAU_DOI_TRA CASCADE;
DROP TABLE IF EXISTS CHI_TIET_DON_HANG CASCADE;
DROP TABLE IF EXISTS DON_HANG CASCADE;
DROP TABLE IF EXISTS CHINH_SACH_HE_THONG CASCADE;
DROP TABLE IF EXISTS NHA_CUNG_CAP CASCADE;
DROP TABLE IF EXISTS KHUYEN_MAI CASCADE;
DROP TABLE IF EXISTS TON_KHO_VI_TRI CASCADE;
DROP TABLE IF EXISTS BIEN_THE_SKU CASCADE;
DROP TABLE IF EXISTS SAN_PHAM CASCADE;
DROP TABLE IF EXISTS KHACH_HANG CASCADE;
DROP TABLE IF EXISTS NGUOI_DUNG CASCADE;

-- -----------------------------------------------------------------------------
-- 1. BẢNG NGUOI_DUNG (Tài khoản nhân sự nội bộ)
-- -----------------------------------------------------------------------------
CREATE TABLE NGUOI_DUNG (
    MaNguoiDung VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SoDienThoai VARCHAR(20),
    MatKhauHash VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(30) NOT NULL, -- 'ADMIN', 'NV_VAN_HANH', 'NV_KHO'
    TrangThai VARCHAR(30) NOT NULL DEFAULT 'HOAT_DONG', -- 'HOAT_DONG', 'KHOA'
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO NGUOI_DUNG (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhauHash, VaiTro, TrangThai) VALUES
('NV001', 'Trần Minh Trí', 'admin@fashionshop.vn', '0908111222', 'admin123', 'ADMIN', 'HOAT_DONG'),
('NV002', 'Trần Thị Mai', 'vanhanh@fashionshop.vn', '0912345678', 'vanhanh123', 'NV_VAN_HANH', 'HOAT_DONG'),
('NV003', 'Lê Văn Hùng', 'kho@fashionshop.vn', '0987654321', 'kho123', 'NV_KHO', 'HOAT_DONG'),
('NV004', 'Phạm Quốc Bảo', 'bao.pham@fashionshop.vn', '0933221100', '123456', 'NV_VAN_HANH', 'KHOA');

-- -----------------------------------------------------------------------------
-- 2. BẢNG KHACH_HANG (Quản lý hồ sơ khách hàng CRM & Blacklist)
-- -----------------------------------------------------------------------------
CREATE TABLE KHACH_HANG (
    MaKhachHang VARCHAR(50) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    Email VARCHAR(100),
    DiaChiMacDinh TEXT,
    TrangThaiKH VARCHAR(30) NOT NULL DEFAULT 'HOAT_DONG', -- 'HOAT_DONG', 'BLACKLIST'
    NgayDangKy TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO KHACH_HANG (MaKhachHang, HoTen, SoDienThoai, Email, DiaChiMacDinh, TrangThaiKH, NgayDangKy) VALUES
('KH001', 'Nguyễn Minh Quân', '0908123456', 'quan.nguyen@gmail.com', '273 An Dương Vương, P.3, Q.5, TP.HCM', 'HOAT_DONG', '2026-09-15 08:00:00'),
('KH002', 'Phạm Thu Hà', '0987654321', 'thuha.pham@gmail.com', '88 Trần Hưng Đạo, P.7, Q.5, TP.HCM', 'HOAT_DONG', '2026-09-20 09:30:00'),
('KH003', 'Lê Hoàng Nam', '0912345678', 'hoangnam.le@yahoo.com', '125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM', 'HOAT_DONG', '2026-10-02 14:15:00'),
('KH004', 'Võ Thị Bích Trâm', '0934112233', 'bichtram.vo@gmail.com', '45 Nguyễn Đình Chiểu, Q.3, TP.HCM', 'HOAT_DONG', '2026-10-10 16:45:00'),
('KH005', 'Trương Văn Kiệt', '0977889900', 'kiet.truong@gmail.com', '12 Hòa Bình, Q.11, TP.HCM', 'BLACKLIST', '2026-10-18 11:20:00');

-- -----------------------------------------------------------------------------
-- 3. BẢNG SAN_PHAM (Danh mục sản phẩm thời trang)
-- -----------------------------------------------------------------------------
CREATE TABLE SAN_PHAM (
    MaSanPham VARCHAR(50) PRIMARY KEY,
    TenSanPham VARCHAR(200) NOT NULL,
    DanhMuc VARCHAR(100) NOT NULL,
    ThuongHieu VARCHAR(100) DEFAULT 'Urban Chic',
    GiaNiemYet NUMERIC(12, 2) NOT NULL,
    TrangThaiSP VARCHAR(30) DEFAULT 'DANG_BAN'
);

INSERT INTO SAN_PHAM (MaSanPham, TenSanPham, DanhMuc, ThuongHieu, GiaNiemYet, TrangThaiSP) VALUES
('SP001', 'Áo Khoác Kaki Basic', 'Áo khoác', 'Urban Chic', 450000.00, 'DANG_BAN'),
('SP002', 'Áo Khoác Bomber', 'Áo khoác', 'Urban Chic', 520000.00, 'DANG_BAN'),
('SP003', 'Áo Thun Cotton Compact', 'Áo thun', 'Urban Chic', 180000.00, 'DANG_BAN'),
('SP004', 'Áo Sơ Mi Lụa Dài Tay', 'Áo sơ mi', 'Urban Chic', 360000.00, 'DANG_BAN'),
('SP005', 'Quần Jeans Slimfit', 'Quần jeans', 'Urban Chic', 490000.00, 'DANG_BAN');

-- -----------------------------------------------------------------------------
-- 4. BẢNG BIEN_THE_SKU (Từ điển biến thể mặt hàng theo Size, Màu, Barcode)
-- -----------------------------------------------------------------------------
CREATE TABLE BIEN_THE_SKU (
    MaSKU VARCHAR(50) PRIMARY KEY,
    MaSanPham VARCHAR(50) NOT NULL REFERENCES SAN_PHAM(MaSanPham),
    KichCo VARCHAR(20) NOT NULL,
    MauSac VARCHAR(50) NOT NULL,
    MaVachBarcode VARCHAR(50) UNIQUE,
    GiaVon NUMERIC(12, 2) NOT NULL DEFAULT 100000.00,
    GiaBanSKU NUMERIC(12, 2) NOT NULL,
    NguongTonToiThieu INT DEFAULT 5,
    TrangThaiSKU VARCHAR(30) DEFAULT 'DANG_BAN'
);

INSERT INTO BIEN_THE_SKU (MaSKU, MaSanPham, KichCo, MauSac, MaVachBarcode, GiaVon, GiaBanSKU, NguongTonToiThieu, TrangThaiSKU) VALUES
('SKU-AK01-DEN-L', 'SP001', 'L', 'Đen', '8938501001', 280000.00, 450000.00, 5, 'DANG_BAN'),
('SKU-AK01-KEM-M', 'SP001', 'M', 'Kem', '8938501002', 280000.00, 450000.00, 5, 'DANG_BAN'),
('SKU-AK02-REU-XL', 'SP002', 'XL', 'Rêu', '8938501003', 320000.00, 520000.00, 5, 'DANG_BAN'),
('SKU-AT05-TRG-M', 'SP003', 'M', 'Trắng', '8938501004', 95000.00, 180000.00, 10, 'DANG_BAN'),
('SKU-AT05-DEN-L', 'SP003', 'L', 'Đen', '8938501005', 95000.00, 180000.00, 10, 'DANG_BAN'),
('SKU-SM04-XNH-M', 'SP004', 'M', 'Xanh Nhạt', '8938501006', 210000.00, 360000.00, 5, 'DANG_BAN'),
('SKU-QJ02-XANH-32', 'SP005', '32', 'Xanh Đậm', '8938501007', 290000.00, 490000.00, 8, 'DANG_BAN');

-- -----------------------------------------------------------------------------
-- 5. BẢNG TON_KHO_VI_TRI (Vị trí lưu kho và số lượng tồn)
-- -----------------------------------------------------------------------------
CREATE TABLE TON_KHO_VI_TRI (
    MaViTriKho VARCHAR(50) PRIMARY KEY,
    MaSKU VARCHAR(50) REFERENCES BIEN_THE_SKU(MaSKU),
    KhuVuc VARCHAR(50) DEFAULT 'Khu A',
    Tang VARCHAR(50) DEFAULT 'Tầng 1',
    KeHang VARCHAR(50) DEFAULT 'Kệ A1',
    KhuVucKe VARCHAR(100) NOT NULL,
    SoLuongThucTe INT NOT NULL DEFAULT 0,
    SoLuongTamGiu INT NOT NULL DEFAULT 0,
    SoLuongKhaDung INT NOT NULL DEFAULT 0,
    NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO TON_KHO_VI_TRI (MaViTriKho, MaSKU, KhuVuc, Tang, KeHang, KhuVucKe, SoLuongThucTe, SoLuongTamGiu, SoLuongKhaDung) VALUES
('KE-A1-T1', 'SKU-AK01-DEN-L', 'Khu A', 'Tầng 1', 'Kệ A1', 'Khu A - Tầng 1 - Kệ A1', 25, 2, 23),
('KE-A1-T2', 'SKU-AK01-KEM-M', 'Khu A', 'Tầng 2', 'Kệ A1', 'Khu A - Tầng 2 - Kệ A1', 15, 1, 14),
('KE-A2-T1', 'SKU-AK02-REU-XL', 'Khu A', 'Tầng 1', 'Kệ A2', 'Khu A - Tầng 1 - Kệ A2', 12, 0, 12),
('KE-B1-T1', 'SKU-AT05-TRG-M', 'Khu B', 'Tầng 1', 'Kệ B1', 'Khu B - Tầng 1 - Kệ B1', 55, 5, 50),
('KE-B1-T2', 'SKU-AT05-DEN-L', 'Khu B', 'Tầng 2', 'Kệ B1', 'Khu B - Tầng 2 - Kệ B1', 40, 2, 38),
('KE-C1-T1', 'SKU-SM04-XNH-M', 'Khu C', 'Tầng 1', 'Kệ C1', 'Khu C - Tầng 1 - Kệ C1', 18, 0, 18),
('KE-D1-T1', 'SKU-QJ02-XANH-32', 'Khu D', 'Tầng 1', 'Kệ D1', 'Khu D - Tầng 1 - Kệ D1', 5, 2, 3);

-- -----------------------------------------------------------------------------
-- 6. BẢNG KHUYEN_MAI (Voucher giảm giá)
-- -----------------------------------------------------------------------------
CREATE TABLE KHUYEN_MAI (
    MaKhuyenMai VARCHAR(50) PRIMARY KEY,
    CodeVoucher VARCHAR(50) UNIQUE NOT NULL,
    LoaiGiam VARCHAR(30) NOT NULL, -- 'PHAN_TRAM', 'SO_TIEN'
    GiaTriGiam NUMERIC(12, 2) NOT NULL,
    DonToiThieu NUMERIC(12, 2) DEFAULT 0,
    SoLuotToiDa INT NOT NULL,
    SoLuotDaDung INT DEFAULT 0,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    TrangThaiKM VARCHAR(30) NOT NULL DEFAULT 'DANG_HOAT_DONG'
);

INSERT INTO KHUYEN_MAI (MaKhuyenMai, CodeVoucher, LoaiGiam, GiaTriGiam, DonToiThieu, SoLuotToiDa, SoLuotDaDung, NgayBatDau, NgayKetThuc, TrangThaiKM) VALUES
('KM001', 'SALE50K', 'SO_TIEN', 50000.00, 500000.00, 200, 78, '2026-11-01', '2026-11-30', 'DANG_HOAT_DONG'),
('KM002', 'NEWMEM10', 'PHAN_TRAM', 10.00, 300000.00, 500, 142, '2026-11-01', '2026-12-31', 'DANG_HOAT_DONG'),
('KM003', 'VIPMEMBER', 'SO_TIEN', 100000.00, 1000000.00, 50, 19, '2026-11-01', '2026-12-15', 'DANG_HOAT_DONG'),
('KM004', 'FLASH100', 'SO_TIEN', 100000.00, 800000.00, 100, 100, '2026-10-01', '2026-10-31', 'VO_HIEU_HOA');

-- -----------------------------------------------------------------------------
-- 7. BẢNG NHA_CUNG_CAP (Đối tác cung ứng nguồn hàng)
-- -----------------------------------------------------------------------------
CREATE TABLE NHA_CUNG_CAP (
    MaNCC VARCHAR(50) PRIMARY KEY,
    TenNCC VARCHAR(200) NOT NULL,
    NguoiLienHe VARCHAR(100),
    SoDienThoai VARCHAR(20) NOT NULL,
    EmailNCC VARCHAR(100),
    DiaChiNCC TEXT,
    TrangThaiHopTac VARCHAR(30) NOT NULL DEFAULT 'DANG_HOP_TAC'
);

INSERT INTO NHA_CUNG_CAP (MaNCC, TenNCC, NguoiLienHe, SoDienThoai, EmailNCC, DiaChiNCC, TrangThaiHopTac) VALUES
('NCC01', 'Tổng Công Ty May Việt Tiến', 'Ông Vũ Văn Dũng', '02838640800', 'sales@viettien.com.vn', '07 Lê Minh Xuân, Q.Tân Bình, TP.HCM', 'DANG_HOP_TAC'),
('NCC02', 'Xưởng May Dệt May Nhà Bè (NBC)', 'Bà Lê Thu Thảo', '02838720077', 'contact@nhabe.com.vn', 'Bến Nghé, Tân Thuận Đông, Quận 7, TP.HCM', 'DANG_HOP_TAC'),
('NCC03', 'Công Ty TNHH Thời Trang An Phước', 'Ông Trần Thanh Phong', '02838350059', 'supply@anphuoc.com.vn', '100/11 An Dương Vương, Q.5, TP.HCM', 'DANG_HOP_TAC'),
('NCC04', 'Xưởng Gia Công Vải Phú Thọ', 'Ông Nguyễn Hoàng', '02839998888', 'phutho.garment@gmail.com', 'KCN Tân Bình, TP.HCM', 'NGUNG_HOP_TAC');

-- -----------------------------------------------------------------------------
-- 8. BẢNG CHINH_SACH_HE_THONG (Cấu hình chính sách & API Keys)
-- -----------------------------------------------------------------------------
CREATE TABLE CHINH_SACH_HE_THONG (
    MaCauHinh VARCHAR(50) PRIMARY KEY,
    SoNgayDoiTraToiDa INT NOT NULL,
    NguongTonKhoToiThieu INT NOT NULL,
    PhiShipMacDinh NUMERIC(12, 2) NOT NULL,
    MocFreeship NUMERIC(12, 2) NOT NULL,
    ApiKeyThanhToan VARCHAR(100) DEFAULT 'VNPAY_LIVE_99281_MOMO_8821',
    ApiKeyVanChuyen VARCHAR(100) DEFAULT 'GHN_TOKEN_772910_GHTK_112',
    ApiKeyEmail VARCHAR(100) DEFAULT 'SG.SendGrid_API_Key_2026_Live'
);

INSERT INTO CHINH_SACH_HE_THONG VALUES
('CONFIG01', 7, 5, 30000.00, 500000.00, 'VNPAY_LIVE_99281_MOMO_8821', 'GHN_TOKEN_772910_GHTK_112', 'SG.SendGrid_API_Key_2026_Live');

-- -----------------------------------------------------------------------------
-- 9. BẢNG DON_HANG (Đơn hàng mua sắm)
-- -----------------------------------------------------------------------------
CREATE TABLE DON_HANG (
    MaDonHang VARCHAR(50) PRIMARY KEY,
    MaKhachHang VARCHAR(50) NOT NULL REFERENCES KHACH_HANG(MaKhachHang),
    TenKhachHang VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    DiaChiGiao TEXT NOT NULL,
    MaNVXuLy VARCHAR(50) REFERENCES NGUOI_DUNG(MaNguoiDung),
    MaKhuyenMai VARCHAR(50) REFERENCES KHUYEN_MAI(MaKhuyenMai),
    NgayDat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TongTienHang NUMERIC(12, 2) NOT NULL,
    PhiVanChuyen NUMERIC(12, 2) DEFAULT 30000.00,
    TienGiamGia NUMERIC(12, 2) DEFAULT 0.00,
    TongThanhToan NUMERIC(12, 2) NOT NULL,
    PhuongThucTT VARCHAR(50) NOT NULL,
    TrangThaiTT VARCHAR(30) DEFAULT 'CHUA_THANH_TOAN',
    MaVanDon VARCHAR(50),
    DonViVanChuyen VARCHAR(100) DEFAULT 'Giao Hàng Nhanh (GHN)',
    TrangThaiDon VARCHAR(30) NOT NULL DEFAULT 'CHO_DUYET',
    LyDoHuy TEXT,
    GhiChuVanDon TEXT,
    LichSuHanhTrinh TEXT
);

INSERT INTO DON_HANG (MaDonHang, MaKhachHang, TenKhachHang, SoDienThoai, DiaChiGiao, MaNVXuLy, MaKhuyenMai, NgayDat, TongTienHang, PhiVanChuyen, TienGiamGia, TongThanhToan, PhuongThucTT, TrangThaiTT, MaVanDon, DonViVanChuyen, TrangThaiDon, LyDoHuy, GhiChuVanDon, LichSuHanhTrinh) VALUES
('DH20261101', 'KH001', 'Nguyễn Minh Quân', '0908123456', '273 An Dương Vương, P.3, Q.5, TP.HCM', 'NV002', 'KM001', '2026-11-05 10:15:00', 810000.00, 30000.00, 50000.00, 790000.00, 'VNPay', 'DA_THANH_TOAN', 'VNPOST1101', 'VNPost Express', 'DA_GIAO', NULL, 'Giao thành công tại quầy lễ tân', '05/11 10:15: Đặt hàng thành công | 05/11 11:00: Đã duyệt & đóng gói | 06/11 08:00: Đang giao hàng | 06/11 15:30: Giao hàng thành công'),
('DH20261098', 'KH003', 'Lê Hoàng Nam', '0912345678', '125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM', 'NV002', NULL, '2026-11-07 14:20:00', 520000.00, 30000.00, 0.00, 550000.00, 'COD', 'DA_THANH_TOAN', 'GHN8849202', 'Giao Hàng Nhanh (GHN)', 'DA_GIAO', NULL, 'Đã thu hộ COD đủ', '07/11 14:20: Đặt hàng | 07/11 16:00: Đóng gói | 08/11 11:00: Đã giao thành công'),
('DH20261085', 'KH002', 'Phạm Thu Hà', '0987654321', '88 Trần Hưng Đạo, P.7, Q.5, TP.HCM', 'NV002', NULL, '2026-11-08 09:00:00', 900000.00, 0.00, 0.00, 900000.00, 'MoMo', 'DA_THANH_TOAN', 'GHN8849201', 'Giao Hàng Nhanh (GHN)', 'DA_GIAO', NULL, 'Khách đã nhận', '08/11 09:00: Đặt hàng | 09/11 14:00: Đã giao thành công'),
('DH20261070', 'KH004', 'Võ Thị Bích Trâm', '0934112233', '45 Nguyễn Đình Chiểu, Q.3, TP.HCM', 'NV002', 'KM002', '2026-11-09 16:40:00', 1220000.00, 0.00, 122000.00, 1098000.00, 'VNPay', 'DA_THANH_TOAN', 'VNPOST1070', 'VNPost Express', 'DA_GIAO', NULL, 'Giao giờ hành chính', '09/11 16:40: Đặt hàng | 10/11 10:20: Đã giao thành công'),
('DH20261105', 'KH001', 'Nguyễn Minh Quân', '0908123456', '273 An Dương Vương, P.3, Q.5, TP.HCM', NULL, NULL, '2026-11-11 08:30:00', 450000.00, 30000.00, 0.00, 480000.00, 'COD', 'CHUA_THANH_TOAN', NULL, 'Giao Hàng Nhanh (GHN)', 'CHO_DUYET', NULL, NULL, '11/11 08:30: Khách đặt hàng mới - Chờ nhân viên vận hành duyệt'),
('DH20261106', 'KH002', 'Phạm Thu Hà', '0987654321', '88 Trần Hưng Đạo, P.7, Q.5, TP.HCM', 'NV002', 'KM001', '2026-11-11 09:15:00', 540000.00, 30000.00, 50000.00, 520000.00, 'VNPay', 'DA_THANH_TOAN', 'GHN8849206', 'Giao Hàng Nhanh (GHN)', 'DANG_DONG_GOI', NULL, 'Đang soạn hàng tại kệ B1', '11/11 09:15: Đặt hàng | 11/11 09:45: Đã duyệt đơn & tạo mã vận đơn GHN8849206 - Chờ in tem & đóng gói'),
('DH20261107', 'KH003', 'Lê Hoàng Nam', '0912345678', '125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM', 'NV002', NULL, '2026-11-11 10:00:00', 540000.00, 0.00, 0.00, 540000.00, 'MoMo', 'DA_THANH_TOAN', 'GHTK992017', 'Giao Hàng Tiết Kiệm (GHTK)', 'DANG_GIAO', NULL, 'Bưu tá đang trên tuyến đường Lê Duẩn', '11/11 10:00: Đặt hàng | 11/11 10:30: Đã đóng gói & In tem | 11/11 13:00: Đã bàn giao bưu tá GHTK - Đang vận chuyển');

-- -----------------------------------------------------------------------------
-- 10. BẢNG CHI_TIET_DON_HANG
-- -----------------------------------------------------------------------------
CREATE TABLE CHI_TIET_DON_HANG (
    MaDonHang VARCHAR(50) NOT NULL REFERENCES DON_HANG(MaDonHang) ON DELETE CASCADE,
    MaSKU VARCHAR(50) NOT NULL REFERENCES BIEN_THE_SKU(MaSKU),
    TenSanPham VARCHAR(200) NOT NULL,
    SoLuongMua INT NOT NULL,
    DonGiaBan NUMERIC(12, 2) NOT NULL,
    ThanhTien NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (MaDonHang, MaSKU)
);

INSERT INTO CHI_TIET_DON_HANG (MaDonHang, MaSKU, TenSanPham, SoLuongMua, DonGiaBan, ThanhTien) VALUES
('DH20261101', 'SKU-AK01-DEN-L', 'Áo Khoác Kaki Basic (L/Đen)', 1, 450000.00, 450000.00),
('DH20261101', 'SKU-AT05-TRG-M', 'Áo Thun Cotton Compact (M/Trắng)', 2, 180000.00, 360000.00),
('DH20261098', 'SKU-AK02-REU-XL', 'Áo Khoác Bomber (XL/Rêu)', 1, 520000.00, 520000.00),
('DH20261085', 'SKU-SM04-XNH-M', 'Áo Sơ Mi Lụa Dài Tay (M)', 2, 360000.00, 720000.00),
('DH20261085', 'SKU-AT05-DEN-L', 'Áo Thun Cotton Compact (L/Đen)', 1, 180000.00, 180000.00),
('DH20261070', 'SKU-AK02-REU-XL', 'Áo Khoác Bomber (XL/Rêu)', 2, 520000.00, 1040000.00),
('DH20261070', 'SKU-AT05-TRG-M', 'Áo Thun Cotton Compact (M/Trắng)', 1, 180000.00, 180000.00),
('DH20261105', 'SKU-AK01-DEN-L', 'Áo Khoác Kaki Basic (L/Đen)', 1, 450000.00, 450000.00),
('DH20261106', 'SKU-AT05-TRG-M', 'Áo Thun Cotton Compact (M/Trắng)', 3, 180000.00, 540000.00),
('DH20261107', 'SKU-SM04-XNH-M', 'Áo Sơ Mi Lụa Dài Tay (M)', 1, 360000.00, 360000.00),
('DH20261107', 'SKU-AT05-DEN-L', 'Áo Thun Cotton Compact (L/Đen)', 1, 180000.00, 180000.00);

-- -----------------------------------------------------------------------------
-- 11. BẢNG YEU_CAU_DOI_TRA (Khiếu nại và đổi trả hàng)
-- -----------------------------------------------------------------------------
CREATE TABLE YEU_CAU_DOI_TRA (
    MaYeuCau VARCHAR(50) PRIMARY KEY,
    MaDonHang VARCHAR(50) NOT NULL REFERENCES DON_HANG(MaDonHang),
    KhachHang VARCHAR(100) NOT NULL,
    MaNVPhuTrach VARCHAR(50) REFERENCES NGUOI_DUNG(MaNguoiDung),
    NgayGuiYeuCau TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LyDoDoiTra TEXT NOT NULL,
    HinhAnhMinhChung TEXT,
    PhuongAnXuLy VARCHAR(100),
    MaVanDonThuHoi VARCHAR(50),
    GhiChuXuLy TEXT,
    TrangThaiYC VARCHAR(30) NOT NULL DEFAULT 'CHO_TIEP_NHAN'
);

INSERT INTO YEU_CAU_DOI_TRA (MaYeuCau, MaDonHang, KhachHang, MaNVPhuTrach, NgayGuiYeuCau, LyDoDoiTra, HinhAnhMinhChung, PhuongAnXuLy, MaVanDonThuHoi, GhiChuXuLy, TrangThaiYC) VALUES
('DT-0042', 'DH20261085', 'Phạm Thu Hà', 'NV002', '2026-11-10 09:30:00', 'Đường chỉ ở cổ áo sơ mi bị sứt chỉ nhẹ khi mở hộp nhận hàng', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400', 'Đổi sản phẩm mới cùng mã SKU', 'TH-GHN-0042', 'Đã thẩm định ảnh chụp tem mác còn nguyên vẹn', 'DA_CHAP_NHAN'),
('DT-0043', 'DH20261098', 'Lê Hoàng Nam', NULL, '2026-11-11 11:20:00', 'Khách mặc hơi chật vai áo Bomber size XL, đề xuất hỗ trợ đổi size hoặc hoàn tiền', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', 'Đổi sản phẩm mới', NULL, NULL, 'CHO_TIEP_NHAN');

-- -----------------------------------------------------------------------------
-- 12. BẢNG PHIEU_KHO (Chứng từ phiếu nhập kho & xuất kho)
-- -----------------------------------------------------------------------------
CREATE TABLE PHIEU_KHO (
    MaPhieuKho VARCHAR(50) PRIMARY KEY,
    MaNVKho VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    TenNVKho VARCHAR(100),
    MaNCC VARCHAR(50) REFERENCES NHA_CUNG_CAP(MaNCC),
    LoaiPhieu VARCHAR(30) NOT NULL, -- 'NHAP_KHO', 'XUAT_KHO'
    LyDoXuat VARCHAR(200),
    DoiTuongNhan VARCHAR(200),
    TongGiaTri NUMERIC(12, 2) DEFAULT 0.00,
    NgayLapPhieu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    GhiChu TEXT
);

INSERT INTO PHIEU_KHO (MaPhieuKho, MaNVKho, TenNVKho, MaNCC, LoaiPhieu, LyDoXuat, DoiTuongNhan, TongGiaTri, NgayLapPhieu, GhiChu) VALUES
('PNK-0001', 'NV003', 'Lê Văn Hùng', 'NCC01', 'NHAP_KHO', NULL, 'Kho Trung Tâm Q.5', 11200000.00, '2026-11-05 09:30:00', 'Nhập lô áo khoác kaki đầu mùa Thu Đông'),
('PXK-0001', 'NV003', 'Lê Văn Hùng', NULL, 'XUAT_KHO', 'Xuất bàn giao đóng gói đơn hàng', 'Bộ phận Đóng gói Vận hành', 950000.00, '2026-11-08 14:15:00', 'Xuất kho theo Pick-list đợt 1 ngày 08/11');

-- -----------------------------------------------------------------------------
-- 13. BẢNG CHI_TIET_PHIEU_KHO
-- -----------------------------------------------------------------------------
CREATE TABLE CHI_TIET_PHIEU_KHO (
    MaPhieuKho VARCHAR(50) NOT NULL REFERENCES PHIEU_KHO(MaPhieuKho) ON DELETE CASCADE,
    MaSKU VARCHAR(50) NOT NULL REFERENCES BIEN_THE_SKU(MaSKU),
    SoLuong INT NOT NULL,
    DonGia NUMERIC(12, 2) NOT NULL,
    MaViTriKho VARCHAR(50) DEFAULT 'KE-A1-T1',
    PRIMARY KEY (MaPhieuKho, MaSKU)
);

INSERT INTO CHI_TIET_PHIEU_KHO (MaPhieuKho, MaSKU, SoLuong, DonGia, MaViTriKho) VALUES
('PNK-0001', 'SKU-AK01-DEN-L', 20, 280000.00, 'KE-A1-T1'),
('PNK-0001', 'SKU-AK01-KEM-M', 20, 280000.00, 'KE-A1-T2'),
('PXK-0001', 'SKU-AT05-TRG-M', 10, 95000.00, 'KE-B1-T1');

-- HOÀN TẤT KHỞI TẠO CSDL POSTGRESQL CHUẨN!
