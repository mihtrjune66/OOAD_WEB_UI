import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "fashion_ooad.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Bảng NGUOI_DUNG (Tài khoản nội bộ)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS NGUOI_DUNG (
        MaNguoiDung TEXT PRIMARY KEY,
        HoTen TEXT NOT NULL,
        Email TEXT UNIQUE NOT NULL,
        SoDienThoai TEXT,
        MatKhauHash TEXT NOT NULL,
        VaiTro TEXT NOT NULL, -- 'ADMIN', 'NV_VAN_HANH', 'NV_KHO'
        TrangThai TEXT NOT NULL DEFAULT 'HOAT_DONG', -- 'HOAT_DONG', 'KHOA'
        NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Bảng KHACH_HANG (CRM - Quản lý thông tin khách hàng & Blacklist)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS KHACH_HANG (
        MaKhachHang TEXT PRIMARY KEY,
        HoTen TEXT NOT NULL,
        SoDienThoai TEXT NOT NULL,
        Email TEXT,
        DiaChiMacDinh TEXT,
        TrangThaiKH TEXT NOT NULL DEFAULT 'HOAT_DONG', -- 'HOAT_DONG', 'BLACKLIST'
        NgayDangKy DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Bảng SAN_PHAM & BIEN_THE_SKU (Quản lý thông tin SKU & Giá vốn/Giá bán)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS SAN_PHAM (
        MaSanPham TEXT PRIMARY KEY,
        TenSanPham TEXT NOT NULL,
        DanhMuc TEXT NOT NULL,
        ThuongHieu TEXT DEFAULT 'Urban Chic',
        GiaNiemYet REAL NOT NULL,
        TrangThaiSP TEXT DEFAULT 'DANG_BAN'
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS BIEN_THE_SKU (
        MaSKU TEXT PRIMARY KEY,
        MaSanPham TEXT NOT NULL,
        KichCo TEXT NOT NULL,
        MauSac TEXT NOT NULL,
        MaVachBarcode TEXT UNIQUE,
        GiaVon REAL NOT NULL DEFAULT 100000,
        GiaBanSKU REAL NOT NULL,
        NguongTonToiThieu INTEGER DEFAULT 5,
        TrangThaiSKU TEXT DEFAULT 'DANG_BAN', -- 'DANG_BAN', 'TAM_AN'
        FOREIGN KEY (MaSanPham) REFERENCES SAN_PHAM(MaSanPham)
    )
    """)

    # 4. Bảng TON_KHO_VI_TRI (Quản lý vị trí lưu kho & Tồn kho)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS TON_KHO_VI_TRI (
        MaViTriKho TEXT PRIMARY KEY,
        MaSKU TEXT,
        KhuVuc TEXT DEFAULT 'Khu A',
        Tang TEXT DEFAULT 'Tầng 1',
        KeHang TEXT DEFAULT 'Kệ A1',
        KhuVucKe TEXT NOT NULL,
        SoLuongThucTe INTEGER NOT NULL DEFAULT 0,
        SoLuongTamGiu INTEGER NOT NULL DEFAULT 0,
        SoLuongKhaDung INTEGER NOT NULL DEFAULT 0,
        NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (MaSKU) REFERENCES BIEN_THE_SKU(MaSKU)
    )
    """)

    # 5. Bảng KHUYEN_MAI (Quản lý chương trình khuyến mãi Voucher)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS KHUYEN_MAI (
        MaKhuyenMai TEXT PRIMARY KEY,
        CodeVoucher TEXT UNIQUE NOT NULL,
        LoaiGiam TEXT NOT NULL, -- 'PHAN_TRAM', 'SO_TIEN'
        GiaTriGiam REAL NOT NULL,
        DonToiThieu REAL DEFAULT 0,
        SoLuotToiDa INTEGER NOT NULL,
        SoLuotDaDung INTEGER DEFAULT 0,
        NgayBatDau DATE NOT NULL,
        NgayKetThuc DATE NOT NULL,
        TrangThaiKM TEXT NOT NULL DEFAULT 'DANG_HOAT_DONG' -- 'DANG_HOAT_DONG', 'VO_HIEU_HOA'
    )
    """)

    # 6. Bảng DON_HANG & CHI_TIET_DON_HANG (Xử lý đơn, In tem, Theo dõi vận đơn)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS DON_HANG (
        MaDonHang TEXT PRIMARY KEY,
        MaKhachHang TEXT NOT NULL,
        TenKhachHang TEXT NOT NULL,
        SoDienThoai TEXT NOT NULL,
        DiaChiGiao TEXT NOT NULL,
        MaNVXuLy TEXT,
        MaKhuyenMai TEXT,
        NgayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
        TongTienHang REAL NOT NULL,
        PhiVanChuyen REAL DEFAULT 30000,
        TienGiamGia REAL DEFAULT 0,
        TongThanhToan REAL NOT NULL,
        PhuongThucTT TEXT NOT NULL,
        TrangThaiTT TEXT DEFAULT 'CHUA_THANH_TOAN', -- 'DA_THANH_TOAN', 'CHUA_THANH_TOAN', 'DA_HOAN_TIEN'
        MaVanDon TEXT,
        DonViVanChuyen TEXT DEFAULT 'Giao Hàng Nhanh (GHN)',
        TrangThaiDon TEXT NOT NULL DEFAULT 'CHO_DUYET',
        -- 'CHO_DUYET', 'DANG_DONG_GOI', 'DANG_GIAO', 'HEN_GIAO_LAI', 'GIAO_THAT_BAI', 'DA_GIAO', 'DA_HUY', 'DOI_TRA'
        LyDoHuy TEXT,
        GhiChuVanDon TEXT,
        LichSuHanhTrinh TEXT,
        FOREIGN KEY (MaNVXuLy) REFERENCES NGUOI_DUNG(MaNguoiDung),
        FOREIGN KEY (MaKhuyenMai) REFERENCES KHUYEN_MAI(MaKhuyenMai)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS CHI_TIET_DON_HANG (
        MaDonHang TEXT NOT NULL,
        MaSKU TEXT NOT NULL,
        TenSanPham TEXT NOT NULL,
        SoLuongMua INTEGER NOT NULL,
        DonGiaBan REAL NOT NULL,
        ThanhTien REAL NOT NULL,
        PRIMARY KEY (MaDonHang, MaSKU),
        FOREIGN KEY (MaDonHang) REFERENCES DON_HANG(MaDonHang),
        FOREIGN KEY (MaSKU) REFERENCES BIEN_THE_SKU(MaSKU)
    )
    """)

    # 7. Bảng YEU_CAU_DOI_TRA (Xử lý khiếu nại và đổi trả)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS YEU_CAU_DOI_TRA (
        MaYeuCau TEXT PRIMARY KEY,
        MaDonHang TEXT NOT NULL,
        KhachHang TEXT NOT NULL,
        MaNVPhuTrach TEXT,
        NgayGuiYeuCau DATETIME DEFAULT CURRENT_TIMESTAMP,
        LyDoDoiTra TEXT NOT NULL,
        HinhAnhMinhChung TEXT,
        PhuongAnXuLy TEXT,
        MaVanDonThuHoi TEXT,
        GhiChuXuLy TEXT,
        TrangThaiYC TEXT NOT NULL DEFAULT 'CHO_TIEP_NHAN', -- 'CHO_TIEP_NHAN', 'DA_CHAP_NHAN', 'TU_CHOI'
        FOREIGN KEY (MaDonHang) REFERENCES DON_HANG(MaDonHang)
    )
    """)

    # 8. Bảng NHA_CUNG_CAP (Quản lý thông tin nhà cung cấp)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS NHA_CUNG_CAP (
        MaNCC TEXT PRIMARY KEY,
        TenNCC TEXT NOT NULL,
        NguoiLienHe TEXT,
        SoDienThoai TEXT NOT NULL,
        EmailNCC TEXT,
        DiaChiNCC TEXT,
        TrangThaiHopTac TEXT NOT NULL DEFAULT 'DANG_HOP_TAC' -- 'DANG_HOP_TAC', 'NGUNG_HOP_TAC'
    )
    """)

    # 9. Bảng CHINH_SACH_HE_THONG (Cấu hình các quy tắc và chính sách + API Keys)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS CHINH_SACH_HE_THONG (
        MaCauHinh TEXT PRIMARY KEY,
        SoNgayDoiTraToiDa INTEGER NOT NULL,
        NguongTonKhoToiThieu INTEGER NOT NULL,
        PhiShipMacDinh REAL NOT NULL,
        MocFreeship REAL NOT NULL,
        ApiKeyThanhToan TEXT DEFAULT 'VNPAY_LIVE_99281_MOMO_8821',
        ApiKeyVanChuyen TEXT DEFAULT 'GHN_TOKEN_772910_GHTK_112',
        ApiKeyEmail TEXT DEFAULT 'SG.SendGrid_API_Key_2026_Live'
    )
    """)

    # 10. Bảng PHIEU_KHO & CHI_TIET_PHIEU_KHO (Lập phiếu nhập kho & Lập phiếu xuất kho)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS PHIEU_KHO (
        MaPhieuKho TEXT PRIMARY KEY,
        MaNVKho TEXT NOT NULL,
        TenNVKho TEXT,
        MaNCC TEXT,
        LoaiPhieu TEXT NOT NULL, -- 'NHAP_KHO', 'XUAT_KHO'
        LyDoXuat TEXT,
        DoiTuongNhan TEXT,
        TongGiaTri REAL DEFAULT 0,
        NgayLapPhieu DATETIME DEFAULT CURRENT_TIMESTAMP,
        GhiChu TEXT,
        FOREIGN KEY (MaNVKho) REFERENCES NGUOI_DUNG(MaNguoiDung),
        FOREIGN KEY (MaNCC) REFERENCES NHA_CUNG_CAP(MaNCC)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS CHI_TIET_PHIEU_KHO (
        MaPhieuKho TEXT NOT NULL,
        MaSKU TEXT NOT NULL,
        SoLuong INTEGER NOT NULL,
        DonGia REAL NOT NULL,
        MaViTriKho TEXT DEFAULT 'KE-A1-T1',
        PRIMARY KEY (MaPhieuKho, MaSKU),
        FOREIGN KEY (MaPhieuKho) REFERENCES PHIEU_KHO(MaPhieuKho),
        FOREIGN KEY (MaSKU) REFERENCES BIEN_THE_SKU(MaSKU)
    )
    """)

    # SEED DATA MẪU
    cursor.execute("SELECT COUNT(*) FROM NGUOI_DUNG")
    if cursor.fetchone()[0] == 0:
        users = [
            ("NV001", "Trần Minh Trí", "admin@fashionshop.vn", "0908111222", "admin123", "ADMIN", "HOAT_DONG"),
            ("NV002", "Trần Thị Mai", "vanhanh@fashionshop.vn", "0912345678", "vanhanh123", "NV_VAN_HANH", "HOAT_DONG"),
            ("NV003", "Lê Văn Hùng", "kho@fashionshop.vn", "0987654321", "kho123", "NV_KHO", "HOAT_DONG"),
            ("NV004", "Phạm Quốc Bảo", "bao.pham@fashionshop.vn", "0933221100", "123456", "NV_VAN_HANH", "KHOA"),
        ]
        cursor.executemany("INSERT INTO NGUOI_DUNG (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhauHash, VaiTro, TrangThai) VALUES (?,?,?,?,?,?,?)", users)

        customers = [
            ("KH001", "Nguyễn Minh Quân", "0908123456", "quan.nguyen@gmail.com", "273 An Dương Vương, P.3, Q.5, TP.HCM", "HOAT_DONG", "2026-09-15"),
            ("KH002", "Phạm Thu Hà", "0987654321", "thuha.pham@gmail.com", "88 Trần Hưng Đạo, P.7, Q.5, TP.HCM", "HOAT_DONG", "2026-09-20"),
            ("KH003", "Lê Hoàng Nam", "0912345678", "hoangnam.le@yahoo.com", "125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM", "HOAT_DONG", "2026-10-02"),
            ("KH004", "Võ Thị Bích Trâm", "0934112233", "bichtram.vo@gmail.com", "45 Nguyễn Đình Chiểu, Q.3, TP.HCM", "HOAT_DONG", "2026-10-10"),
            ("KH005", "Trương Văn Kiệt", "0977889900", "kiet.truong@gmail.com", "12 Hòa Bình, Q.11, TP.HCM", "BLACKLIST", "2026-10-18")
        ]
        cursor.executemany("INSERT INTO KHACH_HANG VALUES (?,?,?,?,?,?,?)", customers)

        products = [
            ("SP001", "Áo Khoác Kaki Basic", "Áo khoác", "Urban Chic", 450000, "DANG_BAN"),
            ("SP002", "Áo Khoác Bomber", "Áo khoác", "Urban Chic", 520000, "DANG_BAN"),
            ("SP003", "Áo Thun Cotton Compact", "Áo thun", "Urban Chic", 180000, "DANG_BAN"),
            ("SP004", "Áo Sơ Mi Lụa Dài Tay", "Áo sơ mi", "Urban Chic", 360000, "DANG_BAN"),
            ("SP005", "Quần Jeans Slimfit", "Quần jeans", "Urban Chic", 490000, "DANG_BAN")
        ]
        cursor.executemany("INSERT INTO SAN_PHAM VALUES (?,?,?,?,?,?)", products)

        skus = [
            ("SKU-AK01-DEN-L", "SP001", "L", "Đen", "8938501001", 280000, 450000, 5, "DANG_BAN"),
            ("SKU-AK01-KEM-M", "SP001", "M", "Kem", "8938501002", 280000, 450000, 5, "DANG_BAN"),
            ("SKU-AK02-REU-XL", "SP002", "XL", "Rêu", "8938501003", 320000, 520000, 5, "DANG_BAN"),
            ("SKU-AT05-TRG-M", "SP003", "M", "Trắng", "8938501004", 95000, 180000, 10, "DANG_BAN"),
            ("SKU-AT05-DEN-L", "SP003", "L", "Đen", "8938501005", 95000, 180000, 10, "DANG_BAN"),
            ("SKU-SM04-XNH-M", "SP004", "M", "Xanh Nhạt", "8938501006", 210000, 360000, 5, "DANG_BAN"),
            ("SKU-QJ02-XANH-32", "SP005", "32", "Xanh Đậm", "8938501007", 290000, 490000, 8, "DANG_BAN")
        ]
        cursor.executemany("INSERT INTO BIEN_THE_SKU VALUES (?,?,?,?,?,?,?,?,?)", skus)

        inventory = [
            ("KE-A1-T1", "SKU-AK01-DEN-L", "Khu A", "Tầng 1", "Kệ A1", "Khu A - Tầng 1 - Kệ A1", 25, 2, 23),
            ("KE-A1-T2", "SKU-AK01-KEM-M", "Khu A", "Tầng 2", "Kệ A1", "Khu A - Tầng 2 - Kệ A1", 15, 1, 14),
            ("KE-A2-T1", "SKU-AK02-REU-XL", "Khu A", "Tầng 1", "Kệ A2", "Khu A - Tầng 1 - Kệ A2", 12, 0, 12),
            ("KE-B1-T1", "SKU-AT05-TRG-M", "Khu B", "Tầng 1", "Kệ B1", "Khu B - Tầng 1 - Kệ B1", 55, 5, 50),
            ("KE-B1-T2", "SKU-AT05-DEN-L", "Khu B", "Tầng 2", "Kệ B1", "Khu B - Tầng 2 - Kệ B1", 40, 2, 38),
            ("KE-C1-T1", "SKU-SM04-XNH-M", "Khu C", "Tầng 1", "Kệ C1", "Khu C - Tầng 1 - Kệ C1", 18, 0, 18),
            ("KE-D1-T1", "SKU-QJ02-XANH-32", "Khu D", "Tầng 1", "Kệ D1", "Khu D - Tầng 1 - Kệ D1", 5, 2, 3)
        ]
        cursor.executemany("INSERT INTO TON_KHO_VI_TRI (MaViTriKho, MaSKU, KhuVuc, Tang, KeHang, KhuVucKe, SoLuongThucTe, SoLuongTamGiu, SoLuongKhaDung) VALUES (?,?,?,?,?,?,?,?,?)", inventory)

        vouchers = [
            ("KM001", "SALE50K", "SO_TIEN", 50000, 500000, 200, 78, "2026-11-01", "2026-11-30", "DANG_HOAT_DONG"),
            ("KM002", "NEWMEM10", "PHAN_TRAM", 10, 300000, 500, 142, "2026-11-01", "2026-12-31", "DANG_HOAT_DONG"),
            ("KM003", "VIPMEMBER", "SO_TIEN", 100000, 1000000, 50, 19, "2026-11-01", "2026-12-15", "DANG_HOAT_DONG"),
            ("KM004", "FLASH100", "SO_TIEN", 100000, 800000, 100, 100, "2026-10-01", "2026-10-31", "VO_HIEU_HOA")
        ]
        cursor.executemany("INSERT INTO KHUYEN_MAI VALUES (?,?,?,?,?,?,?,?,?,?)", vouchers)

        suppliers = [
            ("NCC01", "Tổng Công Ty May Việt Tiến", "Ông Vũ Văn Dũng", "02838640800", "sales@viettien.com.vn", "07 Lê Minh Xuân, Q.Tân Bình, TP.HCM", "DANG_HOP_TAC"),
            ("NCC02", "Xưởng May Dệt May Nhà Bè (NBC)", "Bà Lê Thu Thảo", "02838720077", "contact@nhabe.com.vn", "Bến Nghé, Tân Thuận Đông, Quận 7, TP.HCM", "DANG_HOP_TAC"),
            ("NCC03", "Công Ty TNHH Thời Trang An Phước", "Ông Trần Thanh Phong", "02838350059", "supply@anphuoc.com.vn", "100/11 An Dương Vương, Q.5, TP.HCM", "DANG_HOP_TAC"),
            ("NCC04", "Xưởng Gia Công Vải Phú Thọ", "Ông Nguyễn Hoàng", "02839998888", "phutho.garment@gmail.com", "KCN Tân Bình, TP.HCM", "NGUNG_HOP_TAC")
        ]
        cursor.executemany("INSERT INTO NHA_CUNG_CAP VALUES (?,?,?,?,?,?,?)", suppliers)

        orders = [
            ("DH20261101", "KH001", "Nguyễn Minh Quân", "0908123456", "273 An Dương Vương, P.3, Q.5, TP.HCM", "NV002", "KM001", "2026-11-05 10:15:00", 810000, 30000, 50000, 790000, "VNPay", "DA_THANH_TOAN", "VNPOST1101", "VNPost Express", "DA_GIAO", None, "Giao thành công tại quầy lễ tân", "05/11 10:15: Đặt hàng thành công | 05/11 11:00: Đã duyệt & đóng gói | 06/11 08:00: Đang giao hàng | 06/11 15:30: Giao hàng thành công"),
            ("DH20261098", "KH003", "Lê Hoàng Nam", "0912345678", "125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM", "NV002", None, "2026-11-07 14:20:00", 520000, 30000, 0, 550000, "COD", "DA_THANH_TOAN", "GHN8849202", "Giao Hàng Nhanh (GHN)", "DA_GIAO", None, "Đã thu hộ COD đủ", "07/11 14:20: Đặt hàng | 07/11 16:00: Đóng gói | 08/11 11:00: Đã giao thành công"),
            ("DH20261085", "KH002", "Phạm Thu Hà", "0987654321", "88 Trần Hưng Đạo, P.7, Q.5, TP.HCM", "NV002", None, "2026-11-08 09:00:00", 900000, 0, 0, 900000, "MoMo", "DA_THANH_TOAN", "GHN8849201", "Giao Hàng Nhanh (GHN)", "DA_GIAO", None, "Khách đã nhận", "08/11 09:00: Đặt hàng | 09/11 14:00: Đã giao thành công"),
            ("DH20261070", "KH004", "Võ Thị Bích Trâm", "0934112233", "45 Nguyễn Đình Chiểu, Q.3, TP.HCM", "NV002", "KM002", "2026-11-09 16:40:00", 1220000, 0, 122000, 1098000, "VNPay", "DA_THANH_TOAN", "VNPOST1070", "VNPost Express", "DA_GIAO", None, "Giao giờ hành chính", "09/11 16:40: Đặt hàng | 10/11 10:20: Đã giao thành công"),
            ("DH20261105", "KH001", "Nguyễn Minh Quân", "0908123456", "273 An Dương Vương, P.3, Q.5, TP.HCM", None, None, "2026-11-11 08:30:00", 450000, 30000, 0, 480000, "COD", "CHUA_THANH_TOAN", None, "Giao Hàng Nhanh (GHN)", "CHO_DUYET", None, None, "11/11 08:30: Khách đặt hàng mới - Chờ nhân viên vận hành duyệt"),
            ("DH20261106", "KH002", "Phạm Thu Hà", "0987654321", "88 Trần Hưng Đạo, P.7, Q.5, TP.HCM", "NV002", "KM001", "2026-11-11 09:15:00", 540000, 30000, 50000, 520000, "VNPay", "DA_THANH_TOAN", "GHN8849206", "Giao Hàng Nhanh (GHN)", "DANG_DONG_GOI", None, "Đang soạn hàng tại kệ B1", "11/11 09:15: Đặt hàng | 11/11 09:45: Đã duyệt đơn & tạo mã vận đơn GHN8849206 - Chờ in tem & đóng gói"),
            ("DH20261107", "KH003", "Lê Hoàng Nam", "0912345678", "125 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM", "NV002", None, "2026-11-11 10:00:00", 540000, 0, 0, 540000, "MoMo", "DA_THANH_TOAN", "GHTK992017", "Giao Hàng Tiết Kiệm (GHTK)", "DANG_GIAO", None, "Bưu tá đang trên tuyến đường Lê Duẩn", "11/11 10:00: Đặt hàng | 11/11 10:30: Đã đóng gói & In tem | 11/11 13:00: Đã bàn giao bưu tá GHTK - Đang vận chuyển")
        ]
        cursor.executemany("""
            INSERT INTO DON_HANG (
                MaDonHang, MaKhachHang, TenKhachHang, SoDienThoai, DiaChiGiao, MaNVXuLy, MaKhuyenMai,
                NgayDat, TongTienHang, PhiVanChuyen, TienGiamGia, TongThanhToan, PhuongThucTT, TrangThaiTT,
                MaVanDon, DonViVanChuyen, TrangThaiDon, LyDoHuy, GhiChuVanDon, LichSuHanhTrinh
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, orders)

        order_details = [
            ("DH20261101", "SKU-AK01-DEN-L", "Áo Khoác Kaki Basic (L/Đen)", 1, 450000, 450000),
            ("DH20261101", "SKU-AT05-TRG-M", "Áo Thun Cotton Compact (M/Trắng)", 2, 180000, 360000),
            ("DH20261098", "SKU-AK02-REU-XL", "Áo Khoác Bomber (XL/Rêu)", 1, 520000, 520000),
            ("DH20261085", "SKU-SM04-XNH-M", "Áo Sơ Mi Lụa Dài Tay (M)", 2, 360000, 720000),
            ("DH20261085", "SKU-AT05-DEN-L", "Áo Thun Cotton Compact (L/Đen)", 1, 180000, 180000),
            ("DH20261070", "SKU-AK02-REU-XL", "Áo Khoác Bomber (XL/Rêu)", 2, 520000, 1040000),
            ("DH20261070", "SKU-AT05-TRG-M", "Áo Thun Cotton Compact (M/Trắng)", 1, 180000, 180000),
            ("DH20261105", "SKU-AK01-DEN-L", "Áo Khoác Kaki Basic (L/Đen)", 1, 450000, 450000),
            ("DH20261106", "SKU-AT05-TRG-M", "Áo Thun Cotton Compact (M/Trắng)", 3, 180000, 540000),
            ("DH20261107", "SKU-SM04-XNH-M", "Áo Sơ Mi Lụa Dài Tay (M)", 1, 360000, 360000),
            ("DH20261107", "SKU-AT05-DEN-L", "Áo Thun Cotton Compact (L/Đen)", 1, 180000, 180000)
        ]
        cursor.executemany("INSERT INTO CHI_TIET_DON_HANG VALUES (?,?,?,?,?,?)", order_details)

        returns = [
            ("DT-0042", "DH20261085", "Phạm Thu Hà", "NV002", "2026-11-10 09:30:00", "Đường chỉ ở cổ áo sơ mi bị sứt chỉ nhẹ khi mở hộp nhận hàng", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400", "Đổi sản phẩm mới cùng mã SKU", "TH-GHN-0042", "Đã thẩm định ảnh chụp tem mác còn nguyên vẹn", "DA_CHAP_NHAN"),
            ("DT-0043", "DH20261098", "Lê Hoàng Nam", None, "2026-11-11 11:20:00", "Khách mặc hơi chật vai áo Bomber size XL, đề xuất hỗ trợ đổi size hoặc hoàn tiền", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400", "Đổi sản phẩm mới", None, None, "CHO_TIEP_NHAN")
        ]
        cursor.executemany("""
            INSERT INTO YEU_CAU_DOI_TRA (
                MaYeuCau, MaDonHang, KhachHang, MaNVPhuTrach, NgayGuiYeuCau,
                LyDoDoiTra, HinhAnhMinhChung, PhuongAnXuLy, MaVanDonThuHoi, GhiChuXuLy, TrangThaiYC
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """, returns)

        policies = [("CONFIG01", 7, 5, 30000, 500000, "VNPAY_LIVE_99281_MOMO_8821", "GHN_TOKEN_772910_GHTK_112", "SG.SendGrid_API_Key_2026_Live")]
        cursor.executemany("INSERT INTO CHINH_SACH_HE_THONG VALUES (?,?,?,?,?,?,?,?)", policies)

        receipts = [
            ("PNK-0001", "NV003", "Lê Văn Hùng", "NCC01", "NHAP_KHO", None, "Kho Trung Tâm Q.5", 11200000, "2026-11-05 09:30:00", "Nhập lô áo khoác kaki đầu mùa Thu Đông"),
            ("PXK-0001", "NV003", "Lê Văn Hùng", None, "XUAT_KHO", "Xuất bàn giao đóng gói đơn hàng", "Bộ phận Đóng gói Vận hành", 950000, "2026-11-08 14:15:00", "Xuất kho theo Pick-list đợt 1 ngày 08/11")
        ]
        cursor.executemany("INSERT INTO PHIEU_KHO VALUES (?,?,?,?,?,?,?,?,?,?)", receipts)

        receipt_items = [
            ("PNK-0001", "SKU-AK01-DEN-L", 20, 280000, "KE-A1-T1"),
            ("PNK-0001", "SKU-AK01-KEM-M", 20, 280000, "KE-A1-T2"),
            ("PXK-0001", "SKU-AT05-TRG-M", 10, 95000, "KE-B1-T1")
        ]
        cursor.executemany("INSERT INTO CHI_TIET_PHIEU_KHO VALUES (?,?,?,?,?)", receipt_items)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_database()
    print("Database SQLite khởi tạo thành công!")
