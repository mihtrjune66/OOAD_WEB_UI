from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
from datetime import datetime
from backend_admin.database import get_db_connection, init_database

init_database()

app = FastAPI(title="Urban Chic - Hệ Thống Vận Hành & Quản Trị Nội Bộ (OOAD)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

def row_to_dict(row):
    return dict(row) if row else None

# ==================== PYDANTIC MODELS ====================

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class ChangePasswordRequest(BaseModel):
    user_id: str
    old_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    user_id: str
    ho_ten: str
    so_dien_thoai: str

class ForgotPasswordRequest(BaseModel):
    email: str

class EmployeeCreate(BaseModel):
    ma_nv: str
    ho_ten: str
    email: str
    so_dien_thoai: Optional[str] = ""
    mat_khau: str
    vai_tro: str

class EmployeeUpdate(BaseModel):
    ho_ten: str
    so_dien_thoai: Optional[str] = ""
    vai_tro: str

class VoucherCreate(BaseModel):
    code: str
    loai_giam: str
    gia_tri_giam: float
    don_toi_thieu: float = 0
    so_luot_toi_da: int = 100
    ngay_bat_dau: str
    ngay_ket_thuc: str

class VoucherUpdate(BaseModel):
    loai_giam: str
    gia_tri_giam: float
    don_toi_thieu: float
    so_luot_toi_da: int
    ngay_bat_dau: str
    ngay_ket_thuc: str

class SupplierCreate(BaseModel):
    ma_ncc: str
    ten_ncc: str
    nguoi_lien_he: Optional[str] = ""
    so_dien_thoai: str
    email: Optional[str] = ""
    dia_chi: Optional[str] = ""

class SupplierUpdate(BaseModel):
    ten_ncc: str
    nguoi_lien_he: Optional[str] = ""
    so_dien_thoai: str
    email: Optional[str] = ""
    dia_chi: Optional[str] = ""

class PolicyConfig(BaseModel):
    ma_cau_hinh: str = "CONFIG01"
    so_ngay_doi_tra: int
    nguong_ton_kho: int
    phi_ship: float
    moc_freeship: float
    api_key_thanh_toan: Optional[str] = "VNPAY_LIVE_99281_MOMO_8821"
    api_key_van_chuyen: Optional[str] = "GHN_TOKEN_772910_GHTK_112"
    api_key_email: Optional[str] = "SG.SendGrid_API_Key_2026_Live"

class OrderActionRequest(BaseModel):
    action: str  # 'APPROVE', 'REJECT'
    ly_do: Optional[str] = ""
    don_vi_van_chuyen: Optional[str] = "Giao Hàng Nhanh (GHN)"
    ma_nv: Optional[str] = "NV002"

class TrackingUpdateRequest(BaseModel):
    action: str  # 'DISPATCH', 'SYNC_WEBHOOK', 'UPDATE_STATUS'
    trang_thai_moi: Optional[str] = None
    ghi_chu_su_co: Optional[str] = ""
    ma_nv: Optional[str] = "NV002"

class ReturnActionRequest(BaseModel):
    action: str  # 'APPROVE', 'REJECT'
    phuong_an: Optional[str] = "Đổi sản phẩm mới cùng mã SKU"
    ghi_chu: Optional[str] = ""
    ma_nv: Optional[str] = "NV002"

class SkuCreate(BaseModel):
    ma_sku: str
    ma_sp: str
    ten_sp_moi: Optional[str] = None
    danh_muc_moi: Optional[str] = "Áo thun"
    kich_co: str
    mau_sac: str
    barcode: str
    gia_von: float = 100000
    gia_ban: float
    nguong_canh_bao: int = 5
    ma_vi_tri: Optional[str] = "KE-A1-T1"

class SkuUpdate(BaseModel):
    kich_co: str
    mau_sac: str
    barcode: str
    gia_von: float
    gia_ban: float
    nguong_canh_bao: int

class StockConfigUpdate(BaseModel):
    gia_von: float
    gia_ban: float
    nguong_ton_toi_thieu: int

class LocationCreate(BaseModel):
    ma_vi_tri: str
    khu_vuc: str
    tang: str
    ke_hang: str
    ma_sku: Optional[str] = None
    so_luong_thuc_te: int = 0

class LocationUpdate(BaseModel):
    khu_vuc: str
    tang: str
    ke_hang: str
    ma_sku: Optional[str] = None

class ReceiptItem(BaseModel):
    ma_sku: str
    so_luong: int
    don_gia: float
    ma_vi_tri: Optional[str] = "KE-A1-T1"

class ReceiptCreate(BaseModel):
    ma_phieu: Optional[str] = None
    loai_phieu: str  # 'NHAP_KHO' or 'XUAT_KHO'
    ma_ncc: Optional[str] = None
    ly_do_xuat: Optional[str] = ""
    doi_tuong_nhan: Optional[str] = ""
    ma_nv: Optional[str] = "NV003"
    ten_nv: Optional[str] = "Lê Văn Hùng"
    ghi_chu: Optional[str] = ""
    chi_tiet: List[ReceiptItem]

# --- STOREFRONT (KHÁCH HÀNG) MODELS ---
class StoreOrderItem(BaseModel):
    sku: str
    name: Optional[str] = ""
    qty: int
    price: float

class StoreOrderCreate(BaseModel):
    order_id: str
    customer_id: str
    customer_name: str
    phone: str
    address: str
    items: List[StoreOrderItem]
    subtotal: float
    ship_fee: float = 0
    discount: float = 0
    voucher_code: Optional[str] = None
    total: float
    pay_method: Optional[str] = "COD"
    pay_status: Optional[str] = "CHUA_THANH_TOAN"
    note: Optional[str] = ""

class StoreCancelOrder(BaseModel):
    reason: str

class StorePayOrder(BaseModel):
    pay_method: str
    pay_status: str
    txn_id: Optional[str] = None

class StoreReturnCreate(BaseModel):
    return_id: str
    order_id: str
    customer_name: str
    reason: str
    detail: Optional[str] = ""
    option: str
    image_url: Optional[str] = ""

class StoreCustomerRegister(BaseModel):
    customer_id: Optional[str] = None
    username: str
    email: str
    password: Optional[str] = "Demo@123"
    phone: Optional[str] = ""
    name: Optional[str] = ""
    address: Optional[str] = ""

class StoreCustomerUpdate(BaseModel):
    customer_id: str
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""



# ==================== AUTHENTICATION API ====================

@app.post("/api/auth/login")
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    account = req.username_or_email.strip().lower()

    if account in ["admin", "minhtri"]:
        cursor.execute("SELECT * FROM NGUOI_DUNG WHERE VaiTro = 'ADMIN' LIMIT 1")
    elif account in ["vanhanh", "mai"]:
        cursor.execute("SELECT * FROM NGUOI_DUNG WHERE VaiTro = 'NV_VAN_HANH' LIMIT 1")
    elif account in ["kho", "thukho", "hung"]:
        cursor.execute("SELECT * FROM NGUOI_DUNG WHERE VaiTro = 'NV_KHO' LIMIT 1")
    else:
        cursor.execute("""
            SELECT * FROM NGUOI_DUNG
            WHERE LOWER(Email) = ? OR LOWER(MaNguoiDung) = ?
        """, (account, account))

    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Tài khoản hoặc Email không tồn tại trong hệ thống!")
    if user["MatKhauHash"] != req.password:
        raise HTTPException(status_code=401, detail="Mật khẩu đăng nhập không chính xác!")
    if user["TrangThai"] != "HOAT_DONG":
        raise HTTPException(status_code=403, detail="Tài khoản nhân sự này hiện đang bị khóa!")

    return {
        "success": True,
        "user": {
            "id": user["MaNguoiDung"],
            "name": user["HoTen"],
            "email": user["Email"],
            "role": user["VaiTro"],
            "phone": user["SoDienThoai"]
        },
        "token": f"token-{user['MaNguoiDung']}-{user['VaiTro']}"
    }

@app.post("/api/auth/change-password")
def change_password(req: ChangePasswordRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM NGUOI_DUNG WHERE MaNguoiDung = ?", (req.user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
    if user["MatKhauHash"] != req.old_password:
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác!")
    if len(req.new_password) < 4:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải có ít nhất 4 ký tự!")

    cursor.execute("UPDATE NGUOI_DUNG SET MatKhauHash = ? WHERE MaNguoiDung = ?", (req.new_password, req.user_id))
    db.commit()
    return {"success": True, "message": "Đổi mật khẩu thành công!"}

@app.post("/api/auth/update-profile")
def update_profile(req: UpdateProfileRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE NGUOI_DUNG SET HoTen = ?, SoDienThoai = ? WHERE MaNguoiDung = ?
    """, (req.ho_ten, req.so_dien_thoai, req.user_id))
    db.commit()
    return {"success": True, "message": "Đã cập nhật thông tin hồ sơ cá nhân!"}

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM NGUOI_DUNG WHERE LOWER(Email) = ?", (req.email.strip().lower(),))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Email này không tồn tại trong cơ sở dữ liệu nội bộ!")
    return {
        "success": True,
        "message": f"[Email Service API] Đã gửi liên kết khôi phục mật khẩu tới hộp thư {user['Email']} của nhân sự {user['HoTen']}."
    }


# ==================== PHÂN HỆ 4: QUẢN TRỊ HỆ THỐNG (ADMIN) ====================

@app.get("/api/admin/dashboard")
def get_dashboard_stats(
    report_type: str = "DOANH_THU",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()

    # Lọc đơn hàng theo ngày nếu có
    date_filter = ""
    params = []
    if start_date and end_date:
        date_filter = " AND date(NgayDat) BETWEEN date(?) AND date(?)"
        params = [start_date, end_date]

    cursor.execute(f"SELECT COALESCE(SUM(TongThanhToan), 0) FROM DON_HANG WHERE TrangThaiDon = 'DA_GIAO'{date_filter}", params)
    revenue = cursor.fetchone()[0]

    cursor.execute(f"SELECT COUNT(*) FROM DON_HANG WHERE 1=1{date_filter}", params)
    total_orders = cursor.fetchone()[0]

    cursor.execute(f"SELECT COUNT(*) FROM DON_HANG WHERE TrangThaiDon = 'DA_GIAO'{date_filter}", params)
    delivered_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM YEU_CAU_DOI_TRA")
    return_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM KHUYEN_MAI WHERE TrangThaiKM = 'DANG_HOAT_DONG'")
    active_vouchers = cursor.fetchone()[0]

    # Tính lợi nhuận thực tế dựa trên GiaVon của các SKU đã giao
    cursor.execute(f"""
        SELECT COALESCE(SUM(ct.ThanhTien - (ct.SoLuongMua * b.GiaVon)), 0)
        FROM CHI_TIET_DON_HANG ct
        JOIN DON_HANG d ON ct.MaDonHang = d.MaDonHang
        JOIN BIEN_THE_SKU b ON ct.MaSKU = b.MaSKU
        WHERE d.TrangThaiDon = 'DA_GIAO'{date_filter}
    """, params)
    estimated_profit = cursor.fetchone()[0]

    return {
        "revenue": revenue,
        "estimated_profit": estimated_profit,
        "total_orders": total_orders,
        "delivered_orders": delivered_orders,
        "return_count": return_count,
        "active_vouchers": active_vouchers
    }

@app.get("/api/admin/top-products")
def get_top_products(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT ct.MaSKU, ct.TenSanPham, sp.DanhMuc, b.GiaVon, b.GiaBanSKU,
               SUM(ct.SoLuongMua) as TongSoLuong,
               SUM(ct.ThanhTien) as TongDoanhThu,
               SUM(ct.ThanhTien - (ct.SoLuongMua * b.GiaVon)) as LoiNhuanGop
        FROM CHI_TIET_DON_HANG ct
        JOIN DON_HANG dh ON ct.MaDonHang = dh.MaDonHang
        JOIN BIEN_THE_SKU b ON ct.MaSKU = b.MaSKU
        JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
        WHERE dh.TrangThaiDon = 'DA_GIAO'
        GROUP BY ct.MaSKU
        ORDER BY TongDoanhThu DESC
    """)
    return [row_to_dict(r) for r in cursor.fetchall()]

# --- UC: Quản lý tài khoản nhân viên & Gửi email thông tin đăng nhập ---
@app.get("/api/admin/employees")
def get_employees(q: Optional[str] = None, role: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = "SELECT MaNguoiDung, HoTen, Email, SoDienThoai, VaiTro, TrangThai, NgayTao FROM NGUOI_DUNG WHERE 1=1"
    params = []
    if q:
        query += " AND (LOWER(HoTen) LIKE ? OR LOWER(Email) LIKE ? OR LOWER(MaNguoiDung) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw, kw])
    if role and role != "TAT_CA":
        query += " AND VaiTro = ?"
        params.append(role)
    query += " ORDER BY MaNguoiDung ASC"
    cursor.execute(query, params)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.post("/api/admin/employees")
def create_employee(emp: EmployeeCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT MaNguoiDung FROM NGUOI_DUNG WHERE MaNguoiDung = ? OR Email = ?", (emp.ma_nv, emp.email))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Mã nhân viên hoặc Email đã tồn tại trên hệ thống!")

    cursor.execute("""
        INSERT INTO NGUOI_DUNG (MaNguoiDung, HoTen, Email, SoDienThoai, MatKhauHash, VaiTro, TrangThai)
        VALUES (?, ?, ?, ?, ?, ?, 'HOAT_DONG')
    """, (emp.ma_nv, emp.ho_ten, emp.email, emp.so_dien_thoai, emp.mat_khau, emp.vai_tro))
    db.commit()
    return {
        "success": True,
        "message": f"Đã tạo tài khoản #{emp.ma_nv} ({emp.ho_ten}) và tự động kích hoạt <<Email Service API>> gửi thông tin đăng nhập tới {emp.email}!"
    }

@app.put("/api/admin/employees/{emp_id}")
def update_employee(emp_id: str, req: EmployeeUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM NGUOI_DUNG WHERE MaNguoiDung = ?", (emp_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên!")
    cursor.execute("""
        UPDATE NGUOI_DUNG SET HoTen = ?, SoDienThoai = ?, VaiTro = ? WHERE MaNguoiDung = ?
    """, (req.ho_ten, req.so_dien_thoai, req.vai_tro, emp_id))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật hồ sơ và phân quyền cho nhân viên #{emp_id}!"}

@app.patch("/api/admin/employees/{emp_id}/toggle-status")
def toggle_employee_status(emp_id: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT TrangThai, HoTen FROM NGUOI_DUNG WHERE MaNguoiDung = ?", (emp_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên!")
    new_status = "KHOA" if row["TrangThai"] == "HOAT_DONG" else "HOAT_DONG"
    cursor.execute("UPDATE NGUOI_DUNG SET TrangThai = ? WHERE MaNguoiDung = ?", (new_status, emp_id))
    db.commit()
    action_str = "Khóa thu hồi quyền truy cập" if new_status == "KHOA" else "Mở khóa kích hoạt lại"
    return {"success": True, "new_status": new_status, "message": f"Đã {action_str} tài khoản của nhân sự {row['HoTen']}!"}

@app.post("/api/admin/employees/{emp_id}/send-credentials")
def send_employee_credentials(emp_id: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT HoTen, Email, VaiTro, MatKhauHash FROM NGUOI_DUNG WHERE MaNguoiDung = ?", (emp_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên!")
    return {
        "success": True,
        "message": f"[Email Service API] Đã gửi email cấp thông tin đăng nhập (Tài khoản: {row['Email']} | Vai trò: {row['VaiTro']}) tới hộp thư của {row['HoTen']}!"
    }

# --- UC: Quản lý thông tin khách hàng (CRM & Blacklist) ---
@app.get("/api/admin/customers")
def get_customers(q: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT kh.MaKhachHang, kh.HoTen as TenKhachHang, kh.SoDienThoai, kh.Email,
               kh.DiaChiMacDinh as DiaChiGiao, kh.TrangThaiKH, kh.NgayDangKy,
               COUNT(dh.MaDonHang) as TongDonHang,
               COALESCE(SUM(CASE WHEN dh.TrangThaiDon != 'DA_HUY' THEN dh.TongThanhToan ELSE 0 END), 0) as TongChiTieu,
               MAX(dh.NgayDat) as DonMoiNhat
        FROM KHACH_HANG kh
        LEFT JOIN DON_HANG dh ON kh.MaKhachHang = dh.MaKhachHang
        WHERE 1=1
    """
    params = []
    if q:
        query += " AND (LOWER(kh.HoTen) LIKE ? OR kh.SoDienThoai LIKE ? OR LOWER(kh.Email) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw, kw])
    query += " GROUP BY kh.MaKhachHang ORDER BY TongChiTieu DESC"
    cursor.execute(query, params)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.get("/api/admin/customers/{ma_kh}/orders")
def get_customer_order_history(ma_kh: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM KHACH_HANG WHERE MaKhachHang = ?", (ma_kh,))
    customer = row_to_dict(cursor.fetchone())
    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ khách hàng!")
    cursor.execute("SELECT * FROM DON_HANG WHERE MaKhachHang = ? ORDER BY NgayDat DESC", (ma_kh,))
    orders = [row_to_dict(r) for r in cursor.fetchall()]
    for o in orders:
        cursor.execute("SELECT * FROM CHI_TIET_DON_HANG WHERE MaDonHang = ?", (o["MaDonHang"],))
        o["items"] = [row_to_dict(i) for i in cursor.fetchall()]
    return {"customer": customer, "orders": orders}

@app.patch("/api/admin/customers/{ma_kh}/toggle-blacklist")
def toggle_customer_blacklist(ma_kh: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT HoTen, TrangThaiKH FROM KHACH_HANG WHERE MaKhachHang = ?", (ma_kh,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng!")
    new_st = "BLACKLIST" if row["TrangThaiKH"] == "HOAT_DONG" else "HOAT_DONG"
    cursor.execute("UPDATE KHACH_HANG SET TrangThaiKH = ? WHERE MaKhachHang = ?", (new_st, ma_kh))
    db.commit()
    msg = f"Đã đưa khách hàng [{row['HoTen']}] vào danh sách chặn (Blacklist)!" if new_st == "BLACKLIST" else f"Đã gỡ cờ Blacklist, khôi phục hoạt động cho khách hàng [{row['HoTen']}]!"
    return {"success": True, "new_status": new_st, "message": msg}

# --- UC: Quản lý chương trình khuyến mãi (Voucher) ---
@app.get("/api/admin/vouchers")
def get_vouchers(q: Optional[str] = None, status: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    # Tự động vô hiệu hóa các mã đã hết lượt dùng hoặc quá hạn theo đặc tả Use Case
    cursor.execute("""
        UPDATE KHUYEN_MAI
        SET TrangThaiKM = 'VO_HIEU_HOA'
        WHERE SoLuotDaDung >= SoLuotToiDa OR date(NgayKetThuc) < date('now')
    """)
    db.commit()

    query = "SELECT * FROM KHUYEN_MAI WHERE 1=1"
    params = []
    if q:
        query += " AND (LOWER(CodeVoucher) LIKE ? OR LOWER(MaKhuyenMai) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw])
    if status and status != "TAT_CA":
        query += " AND TrangThaiKM = ?"
        params.append(status)
    query += " ORDER BY NgayBatDau DESC"
    cursor.execute(query, params)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.post("/api/admin/vouchers")
def create_voucher(v: VoucherCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    code = v.code.strip().upper()
    cursor.execute("SELECT * FROM KHUYEN_MAI WHERE CodeVoucher = ?", (code,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Mã Code Voucher này đã tồn tại!")
    if v.loai_giam == "PHAN_TRAM" and (v.gia_tri_giam <= 0 or v.gia_tri_giam > 100):
        raise HTTPException(status_code=400, detail="Mức giảm phần trăm phải nằm trong khoảng 1% - 100%!")

    cursor.execute("SELECT COUNT(*) FROM KHUYEN_MAI")
    ma_km = f"KM{cursor.fetchone()[0] + 1:03d}"

    cursor.execute("""
        INSERT INTO KHUYEN_MAI (MaKhuyenMai, CodeVoucher, LoaiGiam, GiaTriGiam, DonToiThieu, SoLuotToiDa, SoLuotDaDung, NgayBatDau, NgayKetThuc, TrangThaiKM)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'DANG_HOAT_DONG')
    """, (ma_km, code, v.loai_giam, v.gia_tri_giam, v.don_toi_thieu, v.so_luot_toi_da, v.ngay_bat_dau, v.ngay_ket_thuc))
    db.commit()
    return {"success": True, "message": f"Đã phát hành và kích hoạt mã khuyến mãi {code} ({ma_km})!"}

@app.put("/api/admin/vouchers/{code}")
def update_voucher(code: str, v: VoucherUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM KHUYEN_MAI WHERE CodeVoucher = ?", (code,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Không tìm thấy mã khuyến mãi!")
    cursor.execute("""
        UPDATE KHUYEN_MAI
        SET LoaiGiam = ?, GiaTriGiam = ?, DonToiThieu = ?, SoLuotToiDa = ?, NgayBatDau = ?, NgayKetThuc = ?
        WHERE CodeVoucher = ?
    """, (v.loai_giam, v.gia_tri_giam, v.don_toi_thieu, v.so_luot_toi_da, v.ngay_bat_dau, v.ngay_ket_thuc, code))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật thông số chiến dịch Voucher {code}!"}

@app.patch("/api/admin/vouchers/{code}/toggle-status")
def toggle_voucher(code: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT TrangThaiKM, SoLuotDaDung, SoLuotToiDa FROM KHUYEN_MAI WHERE CodeVoucher = ?", (code,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy Voucher!")
    if row["TrangThaiKM"] != "DANG_HOAT_DONG" and row["SoLuotDaDung"] >= row["SoLuotToiDa"]:
        raise HTTPException(status_code=400, detail="Voucher này đã sử dụng hết tổng số lượt tối đa, vui lòng tăng giới hạn lượt dùng trước khi kích hoạt lại!")
    new_st = "VO_HIEU_HOA" if row["TrangThaiKM"] == "DANG_HOAT_DONG" else "DANG_HOAT_DONG"
    cursor.execute("UPDATE KHUYEN_MAI SET TrangThaiKM = ? WHERE CodeVoucher = ?", (new_st, code))
    db.commit()
    return {"success": True, "new_status": new_st, "message": f"Đã chuyển trạng thái Voucher {code} sang {new_st}!"}

# --- UC: Quản lý thông tin nhà cung cấp ---
@app.get("/api/admin/suppliers")
def get_suppliers(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT ncc.*,
               COUNT(p.MaPhieuKho) as SoPhieuNhap,
               COALESCE(SUM(p.TongGiaTri), 0) as TongGiaTriNhap
        FROM NHA_CUNG_CAP ncc
        LEFT JOIN PHIEU_KHO p ON ncc.MaNCC = p.MaNCC AND p.LoaiPhieu = 'NHAP_KHO'
        GROUP BY ncc.MaNCC
        ORDER BY ncc.MaNCC ASC
    """)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.post("/api/admin/suppliers")
def create_supplier(req: SupplierCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT MaNCC FROM NHA_CUNG_CAP WHERE MaNCC = ?", (req.ma_ncc,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Mã nhà cung cấp đã tồn tại!")
    cursor.execute("""
        INSERT INTO NHA_CUNG_CAP VALUES (?, ?, ?, ?, ?, ?, 'DANG_HOP_TAC')
    """, (req.ma_ncc, req.ten_ncc, req.nguoi_lien_he, req.so_dien_thoai, req.email, req.dia_chi))
    db.commit()
    return {"success": True, "message": f"Đã lưu hồ sơ nhà cung cấp {req.ten_ncc} và đồng bộ sang phân hệ Kho!"}

@app.put("/api/admin/suppliers/{ma_ncc}")
def update_supplier(ma_ncc: str, req: SupplierUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE NHA_CUNG_CAP
        SET TenNCC = ?, NguoiLienHe = ?, SoDienThoai = ?, EmailNCC = ?, DiaChiNCC = ?
        WHERE MaNCC = ?
    """, (req.ten_ncc, req.nguoi_lien_he, req.so_dien_thoai, req.email, req.dia_chi, ma_ncc))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật hồ sơ đối tác {req.ten_ncc}!"}

@app.patch("/api/admin/suppliers/{ma_ncc}/toggle-status")
def toggle_supplier_status(ma_ncc: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT TenNCC, TrangThaiHopTac FROM NHA_CUNG_CAP WHERE MaNCC = ?", (ma_ncc,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhà cung cấp!")
    new_st = "NGUNG_HOP_TAC" if row["TrangThaiHopTac"] == "DANG_HOP_TAC" else "DANG_HOP_TAC"
    cursor.execute("UPDATE NHA_CUNG_CAP SET TrangThaiHopTac = ? WHERE MaNCC = ?", (new_st, ma_ncc))
    db.commit()
    msg = f"Đã ngừng hợp tác với [{row['TenNCC']}]. Phân hệ Kho sẽ bị chặn tạo phiếu nhập mới từ đối tác này!" if new_st == "NGUNG_HOP_TAC" else f"Đã khôi phục trạng thái hợp tác với [{row['TenNCC']}]!"
    return {"success": True, "new_status": new_st, "message": msg}

# --- UC: Cấu hình các quy tắc và chính sách ---
@app.get("/api/admin/policies")
def get_policies(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM CHINH_SACH_HE_THONG LIMIT 1")
    return row_to_dict(cursor.fetchone())

@app.post("/api/admin/policies")
def update_policies(req: PolicyConfig, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE CHINH_SACH_HE_THONG
        SET SoNgayDoiTraToiDa = ?, NguongTonKhoToiThieu = ?, PhiShipMacDinh = ?, MocFreeship = ?,
            ApiKeyThanhToan = ?, ApiKeyVanChuyen = ?, ApiKeyEmail = ?
        WHERE MaCauHinh = ?
    """, (
        req.so_ngay_doi_tra, req.nguong_ton_kho, req.phi_ship, req.moc_freeship,
        req.api_key_thanh_toan, req.api_key_van_chuyen, req.api_key_email, req.ma_cau_hinh
    ))
    db.commit()
    return {"success": True, "message": "Đã lưu cấu hình quy tắc kinh doanh và khóa kết nối API toàn hệ thống!"}


# ==================== PHÂN HỆ 2: NHÂN VIÊN VẬN HÀNH (NV_VAN_HANH) ====================

@app.get("/api/ops/orders")
def get_ops_orders(
    status: Optional[str] = None,
    status_filter: Optional[str] = None,
    q: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    query = """
        SELECT d.*, COALESCE(kh.TrangThaiKH, 'HOAT_DONG') as TrangThaiKH
        FROM DON_HANG d
        LEFT JOIN KHACH_HANG kh ON d.MaKhachHang = kh.MaKhachHang
        WHERE 1=1
    """
    params = []
    st = status or status_filter
    if st and st != "TAT_CA":
        query += " AND d.TrangThaiDon = ?"
        params.append(st)
    if q:
        query += " AND (LOWER(d.MaDonHang) LIKE ? OR d.SoDienThoai LIKE ? OR LOWER(d.TenKhachHang) LIKE ? OR LOWER(COALESCE(d.MaVanDon,'')) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw, kw, kw])
    query += " ORDER BY d.NgayDat DESC"

    cursor.execute(query, params)
    orders = [row_to_dict(r) for r in cursor.fetchall()]

    for o in orders:
        cursor.execute("""
            SELECT ct.*,
                   COALESCE(t.SoLuongKhaDung, 0) as TonKhaDung,
                   COALESCE(t.SoLuongThucTe, 0) as TonThucTe,
                   COALESCE(t.MaViTriKho, 'KE-A1-T1') as MaViTriKho,
                   COALESCE(t.KhuVucKe, 'Khu A - Tầng 1') as KhuVucKe,
                   b.KichCo, b.MauSac, b.MaVachBarcode
            FROM CHI_TIET_DON_HANG ct
            LEFT JOIN BIEN_THE_SKU b ON ct.MaSKU = b.MaSKU
            LEFT JOIN TON_KHO_VI_TRI t ON ct.MaSKU = t.MaSKU
            WHERE ct.MaDonHang = ?
        """, (o["MaDonHang"],))
        items = [row_to_dict(i) for i in cursor.fetchall()]
        o["items"] = items
        o["du_ton_kho"] = all(i["TonKhaDung"] >= i["SoLuongMua"] for i in items)

    return orders

@app.get("/api/ops/orders/{order_id}")
def get_ops_order_detail(order_id: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT d.*, COALESCE(kh.TrangThaiKH, 'HOAT_DONG') as TrangThaiKH
        FROM DON_HANG d
        LEFT JOIN KHACH_HANG kh ON d.MaKhachHang = kh.MaKhachHang
        WHERE d.MaDonHang = ?
    """, (order_id,))
    order = row_to_dict(cursor.fetchone())
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng!")

    cursor.execute("""
        SELECT ct.*,
               COALESCE(t.SoLuongKhaDung, 0) as TonKhaDung,
               COALESCE(t.SoLuongThucTe, 0) as TonThucTe,
               COALESCE(t.MaViTriKho, 'KE-A1-T1') as MaViTriKho,
               COALESCE(t.KhuVucKe, 'Khu A - Tầng 1') as KhuVucKe,
               b.KichCo, b.MauSac, b.MaVachBarcode
        FROM CHI_TIET_DON_HANG ct
        LEFT JOIN BIEN_THE_SKU b ON ct.MaSKU = b.MaSKU
        LEFT JOIN TON_KHO_VI_TRI t ON ct.MaSKU = t.MaSKU
        WHERE ct.MaDonHang = ?
    """, (order_id,))
    order["items"] = [row_to_dict(i) for i in cursor.fetchall()]
    return order

# --- UC: Xử lý đơn hàng (Duyệt đơn / Từ chối đơn) ---
@app.post("/api/ops/orders/{order_id}/action")
def process_order_action(order_id: str, req: OrderActionRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM DON_HANG WHERE MaDonHang = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng!")

    current_status = order["TrangThaiDon"]
    now_str = datetime.now().strftime("%d/%m %H:%M")
    old_log = order["LichSuHanhTrinh"] or ""

    if req.action == "APPROVE":
        if current_status != "CHO_DUYET":
            raise HTTPException(status_code=400, detail="Chỉ có thể duyệt đơn hàng đang ở trạng thái 'Chờ duyệt'!")

        # Đối soát tồn kho khả dụng
        cursor.execute("""
            SELECT ct.MaSKU, ct.TenSanPham, ct.SoLuongMua, COALESCE(t.SoLuongKhaDung, 0) as KhaDung
            FROM CHI_TIET_DON_HANG ct
            LEFT JOIN TON_KHO_VI_TRI t ON ct.MaSKU = t.MaSKU
            WHERE ct.MaDonHang = ?
        """, (order_id,))
        for item in cursor.fetchall():
            if item["KhaDung"] < item["SoLuongMua"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Tồn kho mã {item['MaSKU']} ({item['TenSanPham']}) không đủ để duyệt đơn (Cần {item['SoLuongMua']}, Khả dụng {item['KhaDung']})! Đề xuất từ chối đơn hoặc nhập thêm hàng."
                )

        tracking = order["MaVanDon"] or f"GHN{order_id.replace('DH', '')[-6:]}"
        new_log = f"{old_log} | {now_str}: NV {req.ma_nv} đã duyệt đơn & cấp mã vận đơn {tracking} - Chuyển đóng gói".strip(" |")
        cursor.execute("""
            UPDATE DON_HANG
            SET TrangThaiDon = 'DANG_DONG_GOI', MaVanDon = ?, DonViVanChuyen = ?, MaNVXuLy = ?, LichSuHanhTrinh = ?
            WHERE MaDonHang = ?
        """, (tracking, req.don_vi_van_chuyen, req.ma_nv, new_log, order_id))
        db.commit()
        return {
            "success": True,
            "message": f"Đã duyệt đơn hàng #{order_id}, cấp mã vận đơn {tracking} và chuyển sang khâu Đóng gói / In tem!",
            "tracking_code": tracking
        }

    elif req.action == "REJECT":
        if current_status in ["DA_GIAO", "DA_HUY"]:
            raise HTTPException(status_code=400, detail="Không thể từ chối/hủy đơn hàng đã giao hoặc đã hủy!")
        ly_do = req.ly_do.strip() if req.ly_do else "Thông tin nhận hàng không hợp lệ / Hết tồn kho"

        # Giải phóng tồn kho tạm giữ
        cursor.execute("SELECT MaSKU, SoLuongMua FROM CHI_TIET_DON_HANG WHERE MaDonHang = ?", (order_id,))
        for item in cursor.fetchall():
            cursor.execute("""
                UPDATE TON_KHO_VI_TRI
                SET SoLuongTamGiu = MAX(0, SoLuongTamGiu - ?),
                    SoLuongKhaDung = SoLuongThucTe - MAX(0, SoLuongTamGiu - ?)
                WHERE MaSKU = ?
            """, (item["SoLuongMua"], item["SoLuongMua"], item["MaSKU"]))

        # Kiểm tra nếu đơn đã thanh toán điện tử (MoMo/VNPay) -> Kích hoạt hoàn tiền
        trang_thai_tt = order["TrangThaiTT"]
        refund_msg = ""
        if trang_thai_tt == "DA_THANH_TOAN" or "VNPAY" in order["PhuongThucTT"].upper() or "MOMO" in order["PhuongThucTT"].upper():
            trang_thai_tt = "DA_HOAN_TIEN"
            refund_msg = " Đồng thời hệ thống đã kích hoạt lệnh hoàn tiền tự động qua cổng thanh toán điện tử cho khách!"

        new_log = f"{old_log} | {now_str}: Đã từ chối/hủy đơn (Lý do: {ly_do})".strip(" |")
        cursor.execute("""
            UPDATE DON_HANG
            SET TrangThaiDon = 'DA_HUY', LyDoHuy = ?, TrangThaiTT = ?, MaNVXuLy = ?, LichSuHanhTrinh = ?
            WHERE MaDonHang = ?
        """, (ly_do, trang_thai_tt, req.ma_nv, new_log, order_id))
        db.commit()
        return {
            "success": True,
            "message": f"Đã từ chối đơn #{order_id} (Lý do: {ly_do}) và giải phóng tồn kho tạm giữ!{refund_msg}"
        }

    raise HTTPException(status_code=400, detail="Thao tác không hợp lệ!")

# --- UC: Theo dõi và cập nhật vận đơn ---
@app.post("/api/ops/orders/{order_id}/tracking")
def update_order_tracking(order_id: str, req: TrackingUpdateRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM DON_HANG WHERE MaDonHang = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng!")

    current_status = order["TrangThaiDon"]
    if current_status in ["DA_GIAO", "DA_HUY"]:
        raise HTTPException(status_code=400, detail="Đơn hàng đã hoàn tất hoặc đã hủy, không thể cập nhật trạng thái vận đơn nữa!")

    now_str = datetime.now().strftime("%d/%m %H:%M")
    old_log = order["LichSuHanhTrinh"] or ""

    if req.action == "DISPATCH":
        if current_status != "DANG_DONG_GOI":
            raise HTTPException(status_code=400, detail="Chỉ xuất bàn giao ĐVVC cho đơn hàng đang ở trạng thái 'Đang đóng gói'!")

        cursor.execute("SELECT MaSKU, SoLuongMua FROM CHI_TIET_DON_HANG WHERE MaDonHang = ?", (order_id,))
        for item in cursor.fetchall():
            cursor.execute("""
                UPDATE TON_KHO_VI_TRI
                SET SoLuongThucTe = MAX(0, SoLuongThucTe - ?),
                    SoLuongTamGiu = MAX(0, SoLuongTamGiu - ?),
                    SoLuongKhaDung = MAX(0, (SoLuongThucTe - ?) - MAX(0, SoLuongTamGiu - ?))
                WHERE MaSKU = ?
            """, (item["SoLuongMua"], item["SoLuongMua"], item["SoLuongMua"], item["SoLuongMua"], item["MaSKU"]))

        new_log = f"{old_log} | {now_str}: Đã bàn giao kiện hàng cho bưu tá {order['DonViVanChuyen']} - Bắt đầu giao hàng".strip(" |")
        cursor.execute("""
            UPDATE DON_HANG
            SET TrangThaiDon = 'DANG_GIAO', GhiChuVanDon = 'Đã bàn giao ĐVVC, đang trung chuyển', LichSuHanhTrinh = ?
            WHERE MaDonHang = ?
        """, (new_log, order_id))
        db.commit()
        return {"success": True, "message": f"Đã xuất kho và bàn giao vận đơn {order['MaVanDon']} cho đơn vị vận chuyển!"}

    elif req.action == "SYNC_WEBHOOK":
        new_log = f"{old_log} | {now_str}: [Webhook API {order['DonViVanChuyen']}] Bưu tá đang phát hàng tại khu vực của người nhận".strip(" |")
        cursor.execute("""
            UPDATE DON_HANG
            SET GhiChuVanDon = 'Đồng bộ API: Bưu tá đang trên tuyến phát hàng', LichSuHanhTrinh = ?
            WHERE MaDonHang = ?
        """, (new_log, order_id))
        db.commit()
        return {"success": True, "message": f"[Webhook API] Đã đồng bộ lộ trình thời gian thực từ đối tác {order['DonViVanChuyen']}!"}

    elif req.action == "UPDATE_STATUS":
        new_status = req.trang_thai_moi or current_status
        note = req.ghi_chu_su_co.strip() if req.ghi_chu_su_co else "Cập nhật trạng thái vận đơn"
        status_labels = {
            "DANG_GIAO": "Đang giao hàng",
            "HEN_GIAO_LAI": "Khách hẹn lại ngày giao",
            "GIAO_THAT_BAI": "Giao thất bại / Sự cố SĐT",
            "DA_GIAO": "Đã giao hàng thành công"
        }
        st_label = status_labels.get(new_status, new_status)
        new_log = f"{old_log} | {now_str}: [{st_label}] {note}".strip(" |")

        trang_thai_tt = "DA_THANH_TOAN" if new_status == "DA_GIAO" else order["TrangThaiTT"]
        cursor.execute("""
            UPDATE DON_HANG
            SET TrangThaiDon = ?, TrangThaiTT = ?, GhiChuVanDon = ?, LichSuHanhTrinh = ?
            WHERE MaDonHang = ?
        """, (new_status, trang_thai_tt, note, new_log, order_id))
        db.commit()
        return {"success": True, "message": f"Đã cập nhật vận đơn #{order_id} sang trạng thái [{st_label}]!"}

    raise HTTPException(status_code=400, detail="Hành động cập nhật vận đơn không hợp lệ!")

# --- UC: Xử lý khiếu nại và đổi trả ---
@app.get("/api/ops/returns")
def get_ops_returns(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT SoNgayDoiTraToiDa FROM CHINH_SACH_HE_THONG LIMIT 1")
    policy_row = cursor.fetchone()
    max_days = policy_row["SoNgayDoiTraToiDa"] if policy_row else 7

    cursor.execute("""
        SELECT r.*, d.MaVanDon, d.SoDienThoai, d.NgayDat, d.TongThanhToan, d.PhuongThucTT,
               COALESCE(kh.TrangThaiKH, 'HOAT_DONG') as TrangThaiKH,
               CAST(julianday(r.NgayGuiYeuCau) - julianday(d.NgayDat) AS INTEGER) as SoNgayTuLucMua
        FROM YEU_CAU_DOI_TRA r
        JOIN DON_HANG d ON r.MaDonHang = d.MaDonHang
        LEFT JOIN KHACH_HANG kh ON d.MaKhachHang = kh.MaKhachHang
        ORDER BY r.NgayGuiYeuCau DESC
    """)
    rows = [row_to_dict(r) for r in cursor.fetchall()]
    for r in rows:
        days = r.get("SoNgayTuLucMua") or 2
        r["SoNgayDoiTraToiDa"] = max_days
        r["QuaHanDoiTra"] = days > max_days
    return rows

@app.post("/api/ops/returns/{return_id}/process")
def process_return(return_id: str, req: ReturnActionRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM YEU_CAU_DOI_TRA WHERE MaYeuCau = ?", (return_id,))
    item = cursor.fetchone()
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ khiếu nại/đổi trả!")

    if req.action == "APPROVE":
        new_status = "DA_CHAP_NHAN"
        thu_hoi_code = f"TH-GHN-{return_id.replace('DT-', '')}"
        ghi_chu = req.ghi_chu or "Đủ điều kiện đổi trả theo chính sách hệ thống"
        cursor.execute("""
            UPDATE YEU_CAU_DOI_TRA
            SET TrangThaiYC = ?, PhuongAnXuLy = ?, MaVanDonThuHoi = ?, GhiChuXuLy = ?, MaNVPhuTrach = ?
            WHERE MaYeuCau = ?
        """, (new_status, req.phuong_an, thu_hoi_code, ghi_chu, req.ma_nv, return_id))
        cursor.execute("UPDATE DON_HANG SET TrangThaiDon = 'DOI_TRA' WHERE MaDonHang = ?", (item["MaDonHang"],))
        db.commit()
        return {
            "success": True,
            "message": f"Đã DUYỆT yêu cầu #{return_id}! Hệ thống đã sinh mã vận đơn thu hồi hàng [{thu_hoi_code}] và kích hoạt phương án [{req.phuong_an}]."
        }
    else:
        new_status = "TU_CHOI"
        ghi_chu = req.ghi_chu or "Vi phạm quy định tem mác hoặc quá thời hạn đổi trả"
        cursor.execute("""
            UPDATE YEU_CAU_DOI_TRA
            SET TrangThaiYC = ?, PhuongAnXuLy = 'Từ chối yêu cầu', GhiChuXuLy = ?, MaNVPhuTrach = ?
            WHERE MaYeuCau = ?
        """, (new_status, ghi_chu, req.ma_nv, return_id))
        db.commit()
        return {
            "success": True,
            "message": f"Đã TỪ CHỐI yêu cầu đổi trả #{return_id} (Lý do: {ghi_chu}) và gửi thông báo cho khách hàng!"
        }


# ==================== PHÂN HỆ 3: NHÂN VIÊN KHO / THỦ KHO (NV_KHO) ====================

# --- UC: Quản lý thông tin SKU (Bộ từ điển dữ liệu sản phẩm) ---
@app.get("/api/wh/skus")
def get_wh_skus(q: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT b.*, sp.TenSanPham, sp.DanhMuc, sp.ThuongHieu,
               COALESCE(t.MaViTriKho, 'CHUA_XEP') as MaViTriKho,
               COALESCE(t.SoLuongKhaDung, 0) as SoLuongKhaDung
        FROM BIEN_THE_SKU b
        JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
        LEFT JOIN TON_KHO_VI_TRI t ON b.MaSKU = t.MaSKU
        WHERE 1=1
    """
    params = []
    if q:
        query += " AND (LOWER(b.MaSKU) LIKE ? OR LOWER(sp.TenSanPham) LIKE ? OR LOWER(COALESCE(b.MaVachBarcode,'')) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw, kw])
    query += " ORDER BY b.MaSKU ASC"
    cursor.execute(query, params)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.post("/api/wh/skus")
def create_sku(req: SkuCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    ma_sku = req.ma_sku.strip().upper()
    if not ma_sku or not req.kich_co.strip() or not req.mau_sac.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập đầy đủ các thuộc tính bắt buộc (Mã SKU, Kích cỡ, Màu sắc)!")

    cursor.execute("SELECT MaSKU FROM BIEN_THE_SKU WHERE MaSKU = ?", (ma_sku,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail=f"Mã SKU [{ma_sku}] đã tồn tại trong bộ từ điển dữ liệu sản phẩm! Vui lòng chọn mã khác.")

    cursor.execute("SELECT MaSKU FROM BIEN_THE_SKU WHERE MaVachBarcode = ?", (req.barcode.strip(),))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail=f"Mã vạch Barcode [{req.barcode}] đã bị trùng lặp với SKU khác!")

    cursor.execute("""
        SELECT MaSKU FROM BIEN_THE_SKU
        WHERE MaSanPham = ? AND LOWER(KichCo) = ? AND LOWER(MauSac) = ?
    """, (req.ma_sp, req.kich_co.strip().lower(), req.mau_sac.strip().lower()))
    dup = cursor.fetchone()
    if dup:
        raise HTTPException(status_code=400, detail=f"Biến thể Size [{req.kich_co}] - Màu [{req.mau_sac}] của sản phẩm này đã tồn tại dưới mã {dup['MaSKU']}!")

    cursor.execute("""
        INSERT INTO BIEN_THE_SKU (MaSKU, MaSanPham, KichCo, MauSac, MaVachBarcode, GiaVon, GiaBanSKU, NguongTonToiThieu, TrangThaiSKU)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TAM_AN')
    """, (ma_sku, req.ma_sp, req.kich_co.strip(), req.mau_sac.strip(), req.barcode.strip(), req.gia_von, req.gia_ban, req.nguong_canh_bao))

    ma_vt = req.ma_vi_tri.strip().upper() if req.ma_vi_tri else f"KE-{ma_sku[-4:]}"
    cursor.execute("""
        INSERT OR REPLACE INTO TON_KHO_VI_TRI (MaViTriKho, MaSKU, KhuVuc, Tang, KeHang, KhuVucKe, SoLuongThucTe, SoLuongTamGiu, SoLuongKhaDung)
        VALUES (?, ?, 'Khu A', 'Tầng 1', ?, ?, 0, 0, 0)
    """, (ma_vt, ma_sku, ma_vt, f"Khu A - Tầng 1 - {ma_vt}"))
    db.commit()
    return {"success": True, "message": f"Đã khởi tạo mã SKU [{ma_sku}] vào bộ từ điển sản phẩm và gán vị trí kệ {ma_vt}!"}

@app.put("/api/wh/skus/{ma_sku}")
def update_sku(ma_sku: str, req: SkuUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM BIEN_THE_SKU WHERE MaSKU = ?", (ma_sku,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Không tìm thấy mã SKU cần chỉnh sửa!")
    if req.gia_ban <= 0 or req.gia_von < 0:
        raise HTTPException(status_code=400, detail="Giá bán và giá vốn không hợp lệ!")

    cursor.execute("""
        UPDATE BIEN_THE_SKU
        SET KichCo = ?, MauSac = ?, MaVachBarcode = ?, GiaVon = ?, GiaBanSKU = ?, NguongTonToiThieu = ?
        WHERE MaSKU = ?
    """, (req.kich_co, req.mau_sac, req.barcode, req.gia_von, req.gia_ban, req.nguong_canh_bao, ma_sku))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật thuộc tính mã SKU [{ma_sku}] thành công!"}

# --- UC: Quản lý tồn kho ---
@app.get("/api/wh/inventory")
def get_wh_inventory(q: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT b.MaSKU, b.MaSanPham, b.KichCo, b.MauSac, b.MaVachBarcode,
               b.GiaVon, b.GiaBanSKU, b.NguongTonToiThieu, b.TrangThaiSKU,
               sp.TenSanPham, sp.DanhMuc,
               COALESCE(t.MaViTriKho, 'CHUA_XEP') as MaViTriKho,
               COALESCE(t.KhuVuc, 'Khu A') as KhuVuc,
               COALESCE(t.Tang, 'Tầng 1') as Tang,
               COALESCE(t.KeHang, 'Kệ A1') as KeHang,
               COALESCE(t.KhuVucKe, '---') as KhuVucKe,
               COALESCE(t.SoLuongThucTe, 0) as SoLuongThucTe,
               COALESCE(t.SoLuongTamGiu, 0) as SoLuongTamGiu,
               COALESCE(t.SoLuongKhaDung, 0) as SoLuongKhaDung
        FROM BIEN_THE_SKU b
        JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
        LEFT JOIN TON_KHO_VI_TRI t ON b.MaSKU = t.MaSKU
        WHERE 1=1
    """
    params = []
    if q:
        query += " AND (LOWER(b.MaSKU) LIKE ? OR LOWER(sp.TenSanPham) LIKE ? OR LOWER(COALESCE(b.MaVachBarcode,'')) LIKE ? OR LOWER(COALESCE(t.MaViTriKho,'')) LIKE ?)"
        kw = f"%{q.strip().lower()}%"
        params.extend([kw, kw, kw, kw])
    query += " ORDER BY t.SoLuongKhaDung ASC"
    cursor.execute(query, params)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.put("/api/wh/inventory/{ma_sku}/stock-config")
def update_inventory_stock_config(ma_sku: str, req: StockConfigUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if req.gia_ban <= 0 or req.gia_von < 0 or req.nguong_ton_toi_thieu < 0:
        raise HTTPException(status_code=400, detail="Giá bán, giá vốn hoặc mức tồn tối thiểu không hợp lệ!")
    cursor.execute("SELECT * FROM BIEN_THE_SKU WHERE MaSKU = ?", (ma_sku,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Không tìm thấy SKU trong danh mục!")

    cursor.execute("""
        UPDATE BIEN_THE_SKU
        SET GiaVon = ?, GiaBanSKU = ?, NguongTonToiThieu = ?
        WHERE MaSKU = ?
    """, (req.gia_von, req.gia_ban, req.nguong_ton_toi_thieu, ma_sku))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật Giá vốn, Giá bán và Ngưỡng cảnh báo tồn tối thiểu cho [{ma_sku}]!"}

# --- UC: Quản lý vị trí lưu kho ---
@app.get("/api/wh/locations")
def get_wh_locations(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT t.*, sp.TenSanPham, b.KichCo, b.MauSac
        FROM TON_KHO_VI_TRI t
        LEFT JOIN BIEN_THE_SKU b ON t.MaSKU = b.MaSKU
        LEFT JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
        ORDER BY t.MaViTriKho ASC
    """)
    return [row_to_dict(r) for r in cursor.fetchall()]

@app.post("/api/wh/locations")
def create_wh_location(req: LocationCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    ma_vt = req.ma_vi_tri.strip().upper()
    if not ma_vt or not req.khu_vuc.strip() or not req.tang.strip() or not req.ke_hang.strip():
        raise HTTPException(status_code=400, detail="Vui lòng nhập đầy đủ Mã vị trí, Khu vực, Tầng và Kệ hàng!")

    cursor.execute("SELECT MaViTriKho FROM TON_KHO_VI_TRI WHERE MaViTriKho = ?", (ma_vt,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail=f"Mã vị trí lưu kho [{ma_vt}] đã tồn tại! Vui lòng nhập mã khác.")

    if req.ma_sku:
        cursor.execute("SELECT MaSKU FROM BIEN_THE_SKU WHERE MaSKU = ?", (req.ma_sku,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Mã SKU được chọn không tồn tại trong danh mục sản phẩm!")

    khu_vuc_ke = f"{req.khu_vuc.strip()} - {req.tang.strip()} - {req.ke_hang.strip()}"
    cursor.execute("""
        INSERT INTO TON_KHO_VI_TRI (MaViTriKho, MaSKU, KhuVuc, Tang, KeHang, KhuVucKe, SoLuongThucTe, SoLuongTamGiu, SoLuongKhaDung)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (ma_vt, req.ma_sku, req.khu_vuc.strip(), req.tang.strip(), req.ke_hang.strip(), khu_vuc_ke, req.so_luong_thuc_te, req.so_luong_thuc_te))
    db.commit()
    return {"success": True, "message": f"Đã thêm mới vị trí lưu kho [{ma_vt}] ({khu_vuc_ke}) thành công!"}

@app.put("/api/wh/locations/{ma_vi_tri}")
def update_wh_location(ma_vi_tri: str, req: LocationUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM TON_KHO_VI_TRI WHERE MaViTriKho = ?", (ma_vi_tri,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Không tìm thấy mã vị trí lưu kho!")

    khu_vuc_ke = f"{req.khu_vuc.strip()} - {req.tang.strip()} - {req.ke_hang.strip()}"
    cursor.execute("""
        UPDATE TON_KHO_VI_TRI
        SET KhuVuc = ?, Tang = ?, KeHang = ?, KhuVucKe = ?, MaSKU = ?, NgayCapNhat = CURRENT_TIMESTAMP
        WHERE MaViTriKho = ?
    """, (req.khu_vuc.strip(), req.tang.strip(), req.ke_hang.strip(), khu_vuc_ke, req.ma_sku, ma_vi_tri))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật thông tin kệ [{ma_vi_tri}] và gắn kết SKU [{req.ma_sku or 'Trống'}]!"}

# --- UC: Lập phiếu nhập kho & Lập phiếu xuất kho ---
@app.get("/api/wh/receipts")
def get_wh_receipts(loai_phieu: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT p.*, ncc.TenNCC
        FROM PHIEU_KHO p
        LEFT JOIN NHA_CUNG_CAP ncc ON p.MaNCC = ncc.MaNCC
        WHERE 1=1
    """
    params = []
    if loai_phieu and loai_phieu != "TAT_CA":
        query += " AND p.LoaiPhieu = ?"
        params.append(loai_phieu)
    query += " ORDER BY p.NgayLapPhieu DESC"

    cursor.execute(query, params)
    receipts = [row_to_dict(r) for r in cursor.fetchall()]
    for rc in receipts:
        cursor.execute("""
            SELECT ct.*, sp.TenSanPham, b.KichCo, b.MauSac
            FROM CHI_TIET_PHIEU_KHO ct
            JOIN BIEN_THE_SKU b ON ct.MaSKU = b.MaSKU
            JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
            WHERE ct.MaPhieuKho = ?
        """, (rc["MaPhieuKho"],))
        rc["items"] = [row_to_dict(i) for i in cursor.fetchall()]
    return receipts

@app.post("/api/wh/receipts")
def create_receipt(req: ReceiptCreate, db: sqlite3.Connection = Depends(get_db)):
    if not req.chi_tiet:
        raise HTTPException(status_code=400, detail="Phiếu kho phải có ít nhất 1 dòng mặt hàng SKU!")

    cursor = db.cursor()

    # Kiểm tra mã phiếu
    if req.ma_phieu and req.ma_phieu.strip():
        ma_phieu = req.ma_phieu.strip().upper()
        cursor.execute("SELECT MaPhieuKho FROM PHIEU_KHO WHERE MaPhieuKho = ?", (ma_phieu,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail=f"Mã phiếu [{ma_phieu}] đã tồn tại trong CSDL! Vui lòng nhập mã phiếu khác.")
    else:
        cursor.execute("SELECT COUNT(*) FROM PHIEU_KHO WHERE LoaiPhieu = ?", (req.loai_phieu,))
        count = cursor.fetchone()[0] + 1
        prefix = "PNK" if req.loai_phieu == "NHAP_KHO" else "PXK"
        ma_phieu = f"{prefix}-202611-{count:02d}"

    # Nếu là NHAP_KHO: Kiểm tra Nhà cung cấp tồn tại và đang hợp tác (Dòng sự kiện phụ 3 - UC Lập phiếu nhập kho)
    if req.loai_phieu == "NHAP_KHO":
        if not req.ma_ncc:
            raise HTTPException(status_code=400, detail="Vui lòng chọn Nhà cung cấp cho phiếu nhập kho!")
        cursor.execute("SELECT TenNCC, TrangThaiHopTac FROM NHA_CUNG_CAP WHERE MaNCC = ?", (req.ma_ncc,))
        ncc = cursor.fetchone()
        if not ncc:
            raise HTTPException(status_code=400, detail="Nhà cung cấp không tồn tại trong hệ thống!")
        if ncc["TrangThaiHopTac"] != "DANG_HOP_TAC":
            raise HTTPException(
                status_code=400,
                detail=f"Nhà cung cấp [{ncc['TenNCC']}] hiện đang ở trạng thái NGỪNG HỢP TÁC! Không thể lập phiếu nhập kho."
            )

    # Kiểm tra từng dòng SKU trước khi lưu (Atomicity Transaction)
    for item in req.chi_tiet:
        if item.so_luong <= 0 or item.don_gia < 0:
            raise HTTPException(status_code=400, detail=f"Số lượng hoặc đơn giá của mã {item.ma_sku} không hợp lệ!")
        cursor.execute("""
            SELECT b.MaSKU, COALESCE(t.SoLuongKhaDung, 0) as KhaDung
            FROM BIEN_THE_SKU b
            LEFT JOIN TON_KHO_VI_TRI t ON b.MaSKU = t.MaSKU
            WHERE b.MaSKU = ?
        """, (item.ma_sku,))
        sku_row = cursor.fetchone()
        if not sku_row:
            raise HTTPException(status_code=400, detail=f"Mã SKU [{item.ma_sku}] không tồn tại trong danh mục sản phẩm!")

        # Nếu là XUAT_KHO: Kiểm tra số lượng xuất <= tồn khả dụng (Dòng sự kiện phụ 4 - UC Lập phiếu xuất kho)
        if req.loai_phieu == "XUAT_KHO" and item.so_luong > sku_row["KhaDung"]:
            raise HTTPException(
                status_code=400,
                detail=f"Mã SKU [{item.ma_sku}] không đủ hàng khả dụng để xuất (Yêu cầu xuất: {item.so_luong}, Tồn khả dụng hiện tại: {sku_row['KhaDung']})!"
            )

    tong_tien = sum(item.so_luong * item.don_gia for item in req.chi_tiet)

    cursor.execute("""
        INSERT INTO PHIEU_KHO (MaPhieuKho, MaNVKho, TenNVKho, MaNCC, LoaiPhieu, LyDoXuat, DoiTuongNhan, TongGiaTri, GhiChu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ma_phieu, req.ma_nv, req.ten_nv, req.ma_ncc, req.loai_phieu,
        req.ly_do_xuat, req.doi_tuong_nhan, tong_tien, req.ghi_chu
    ))

    zero_stock_skus = []
    for item in req.chi_tiet:
        cursor.execute("""
            INSERT INTO CHI_TIET_PHIEU_KHO (MaPhieuKho, MaSKU, SoLuong, DonGia, MaViTriKho)
            VALUES (?, ?, ?, ?, ?)
        """, (ma_phieu, item.ma_sku, item.so_luong, item.don_gia, item.ma_vi_tri))

        if req.loai_phieu == "NHAP_KHO":
            cursor.execute("""
                UPDATE TON_KHO_VI_TRI
                SET SoLuongThucTe = SoLuongThucTe + ?,
                    SoLuongKhaDung = SoLuongKhaDung + ?,
                    NgayCapNhat = CURRENT_TIMESTAMP
                WHERE MaSKU = ?
            """, (item.so_luong, item.so_luong, item.ma_sku))
            cursor.execute("UPDATE BIEN_THE_SKU SET TrangThaiSKU = 'DANG_BAN', GiaVon = ? WHERE MaSKU = ?", (item.don_gia, item.ma_sku))
        else:
            cursor.execute("""
                UPDATE TON_KHO_VI_TRI
                SET SoLuongThucTe = MAX(0, SoLuongThucTe - ?),
                    SoLuongKhaDung = MAX(0, SoLuongKhaDung - ?),
                    NgayCapNhat = CURRENT_TIMESTAMP
                WHERE MaSKU = ?
            """, (item.so_luong, item.so_luong, item.ma_sku))

            # Nếu tồn khả dụng giảm về 0 -> Tự động ẩn biến thể / khóa đặt hàng trên Website (Dòng sự kiện phụ 6)
            cursor.execute("SELECT SoLuongKhaDung FROM TON_KHO_VI_TRI WHERE MaSKU = ?", (item.ma_sku,))
            rem = cursor.fetchone()
            if rem and rem["SoLuongKhaDung"] <= 0:
                cursor.execute("UPDATE BIEN_THE_SKU SET TrangThaiSKU = 'TAM_AN' WHERE MaSKU = ?", (item.ma_sku,))
                zero_stock_skus.append(item.ma_sku)

    db.commit()
    extra_note = f" (Lưu ý: Mã {', '.join(zero_stock_skus)} đã về tồn 0 nên hệ thống tự động khóa đặt hàng trên Website!)" if zero_stock_skus else ""
    loai_str = "Nhập kho" if req.loai_phieu == "NHAP_KHO" else "Xuất kho"
    return {
        "success": True,
        "message": f"Đã lập phiếu {loai_str} [{ma_phieu}] và cập nhật số lượng tồn kho thành công!{extra_note}",
        "ma_phieu": ma_phieu
    }

@app.get("/api/products")
def get_products(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM SAN_PHAM")
    return [row_to_dict(r) for r in cursor.fetchall()]

# ==================== PHÂN HỆ 1: STOREFRONT API (KHÁCH HÀNG KẾT NỐI CSDL) ====================

@app.get("/api/store/sync")
def store_sync(customer_id: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = """
        SELECT d.*, k.CodeVoucher
        FROM DON_HANG d
        LEFT JOIN KHUYEN_MAI k ON (d.MaKhuyenMai = k.MaKhuyenMai OR d.MaKhuyenMai = k.CodeVoucher)
        WHERE 1=1
    """
    params = []
    if customer_id:
        query += " AND d.MaKhachHang = ?"
        params.append(customer_id)
    query += " ORDER BY d.NgayDat DESC"
    cursor.execute(query, params)
    orders = [row_to_dict(r) for r in cursor.fetchall()]
    for o in orders:
        cursor.execute("SELECT * FROM CHI_TIET_DON_HANG WHERE MaDonHang = ?", (o["MaDonHang"],))
        o["items"] = [row_to_dict(i) for i in cursor.fetchall()]

    cursor.execute("SELECT * FROM YEU_CAU_DOI_TRA ORDER BY NgayGuiYeuCau DESC")
    returns = [row_to_dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT MaSKU, SoLuongKhaDung FROM TON_KHO_VI_TRI WHERE MaSKU IS NOT NULL")
    stock = {r["MaSKU"]: r["SoLuongKhaDung"] for r in cursor.fetchall()}

    cursor.execute("""
        SELECT b.*, sp.TenSanPham, sp.DanhMuc
        FROM BIEN_THE_SKU b
        LEFT JOIN SAN_PHAM sp ON b.MaSanPham = sp.MaSanPham
    """)
    skus = [row_to_dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM KHUYEN_MAI")
    vouchers = [row_to_dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM KHACH_HANG")
    customers_list = [row_to_dict(r) for r in cursor.fetchall()]
    customers = {r["MaKhachHang"]: r["TrangThaiKH"] for r in customers_list}

    cursor.execute("SELECT * FROM CHINH_SACH_HE_THONG LIMIT 1")
    policy_row = cursor.fetchone()
    policy = row_to_dict(policy_row) if policy_row else None

    return {
        "success": True,
        "orders": orders,
        "returns": returns,
        "stock": stock,
        "skus": skus,
        "vouchers": vouchers,
        "customers": customers,
        "customers_list": customers_list,
        "policy": policy
    }

@app.post("/api/store/order")
def store_create_order(req: StoreOrderCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()

    # Kiểm tra Blacklist của khách hàng trong CSDL SQLite
    cursor.execute("SELECT TrangThaiKH, HoTen FROM KHACH_HANG WHERE MaKhachHang = ? OR SoDienThoai = ?", (req.customer_id, req.phone))
    kh = cursor.fetchone()
    if kh and kh["TrangThaiKH"] == "BLACKLIST":
        raise HTTPException(status_code=403, detail=f"Khách hàng [{kh['HoTen']}] đang nằm trong danh sách hạn chế (Blacklist). Không thể thực hiện đặt hàng!")

    # Đảm bảo có thông tin khách hàng trong KHACH_HANG
    cursor.execute("SELECT MaKhachHang FROM KHACH_HANG WHERE MaKhachHang = ?", (req.customer_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT OR IGNORE INTO KHACH_HANG (MaKhachHang, HoTen, SoDienThoai, DiaChiMacDinh, TrangThaiKH)
            VALUES (?, ?, ?, ?, 'HOAT_DONG')
        """, (req.customer_id, req.customer_name, req.phone, req.address))
    else:
        cursor.execute("""
            UPDATE KHACH_HANG
            SET HoTen = COALESCE(NULLIF(?, ''), HoTen),
                SoDienThoai = COALESCE(NULLIF(?, ''), SoDienThoai),
                DiaChiMacDinh = COALESCE(NULLIF(?, ''), DiaChiMacDinh)
            WHERE MaKhachHang = ?
        """, (req.customer_name, req.phone, req.address, req.customer_id))

    # Kiểm tra đơn đã tồn tại chưa
    cursor.execute("SELECT MaDonHang FROM DON_HANG WHERE MaDonHang = ?", (req.order_id,))
    if cursor.fetchone():
        return {"success": True, "message": "Đơn hàng đã tồn tại", "order_id": req.order_id}

    # Ánh xạ voucher_code -> MaKhuyenMai
    ma_km = None
    if req.voucher_code:
        cursor.execute("SELECT MaKhuyenMai FROM KHUYEN_MAI WHERE UPPER(CodeVoucher) = UPPER(?) OR UPPER(MaKhuyenMai) = UPPER(?)", (req.voucher_code, req.voucher_code))
        km_row = cursor.fetchone()
        ma_km = km_row["MaKhuyenMai"] if km_row else req.voucher_code

    now_str = datetime.now().strftime("%d/%m %H:%M")
    initial_log = f"{now_str}: Khách hàng đặt đơn hàng trực tuyến - Chờ nhân viên vận hành duyệt"

    pay_method = req.pay_method or "CHO_CHON_PT"
    pay_status = req.pay_status or "CHO_CHON_PT"

    cursor.execute("""
        INSERT INTO DON_HANG (
            MaDonHang, MaKhachHang, TenKhachHang, SoDienThoai, DiaChiGiao, MaKhuyenMai,
            TongTienHang, PhiVanChuyen, TienGiamGia, TongThanhToan, PhuongThucTT, TrangThaiTT,
            TrangThaiDon, DonViVanChuyen, GhiChuVanDon, LichSuHanhTrinh
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CHO_DUYET', 'Giao Hàng Nhanh (GHN)', ?, ?)
    """, (
        req.order_id, req.customer_id, req.customer_name, req.phone, req.address, ma_km,
        req.subtotal, req.ship_fee, req.discount, req.total, pay_method, pay_status,
        req.note or None, initial_log
    ))

    for it in req.items:
        item_name = it.name or it.sku
        # Đảm bảo mã SKU có trong BIEN_THE_SKU và TON_KHO_VI_TRI để không bị lỗi FK hoặc thiếu thông tin khi Vận hành duyệt đơn
        cursor.execute("SELECT MaSKU FROM BIEN_THE_SKU WHERE MaSKU = ?", (it.sku,))
        if not cursor.fetchone():
            parts = it.sku.split("-")
            sz = parts[-1] if len(parts) >= 4 else "M"
            clr = parts[-2] if len(parts) >= 4 else "Mặc định"
            cursor.execute("INSERT OR IGNORE INTO SAN_PHAM (MaSanPham, TenSanPham, DanhMuc, ThuongHieu, GiaNiemYet, TrangThaiSP) VALUES ('SP001', 'Sản phẩm Urban Chic', 'Thời trang', 'Urban Chic', ?, 'DANG_BAN')", (it.price,))
            cursor.execute("""
                INSERT OR IGNORE INTO BIEN_THE_SKU (MaSKU, MaSanPham, KichCo, MauSac, GiaVon, GiaBanSKU, NguongTonToiThieu, TrangThaiSKU)
                VALUES (?, 'SP001', ?, ?, ?, ?, 5, 'DANG_BAN')
            """, (it.sku, sz, clr, round(it.price * 0.6), it.price))
            cursor.execute("""
                INSERT OR IGNORE INTO TON_KHO_VI_TRI (MaViTriKho, MaSKU, KhuVuc, Tang, KeHang, KhuVucKe, SoLuongThucTe, SoLuongTamGiu, SoLuongKhaDung)
                VALUES (?, ?, 'Khu A', 'Tầng 1', 'Kệ A1', 'Khu A - Tầng 1 - Kệ A1', 25, 0, 25)
            """, (f"KE-{it.sku[-6:]}", it.sku))

        cursor.execute("""
            INSERT OR REPLACE INTO CHI_TIET_DON_HANG (MaDonHang, MaSKU, TenSanPham, SoLuongMua, DonGiaBan, ThanhTien)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (req.order_id, it.sku, item_name, it.qty, it.price, it.qty * it.price))

        cursor.execute("""
            UPDATE TON_KHO_VI_TRI
            SET SoLuongTamGiu = SoLuongTamGiu + ?,
                SoLuongKhaDung = MAX(0, SoLuongKhaDung - ?)
            WHERE MaSKU = ?
        """, (it.qty, it.qty, it.sku))

    if req.voucher_code:
        cursor.execute("UPDATE KHUYEN_MAI SET SoLuotDaDung = SoLuotDaDung + 1 WHERE UPPER(CodeVoucher) = UPPER(?) OR UPPER(MaKhuyenMai) = UPPER(?)", (req.voucher_code, req.voucher_code))

    db.commit()
    return {"success": True, "message": f"Đơn hàng #{req.order_id} đã được lưu vào hệ thống CSDL SQLite nội bộ!", "order_id": req.order_id}

@app.post("/api/store/order/{order_id}/cancel")
def store_cancel_order(order_id: str, req: StoreCancelOrder, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM DON_HANG WHERE MaDonHang = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng!")
    if order["TrangThaiDon"] not in ["CHO_DUYET", "DANG_DONG_GOI"]:
        raise HTTPException(status_code=400, detail="Đơn hàng đã bàn giao vận chuyển hoặc hoàn tất, không thể hủy trực tiếp!")

    cursor.execute("SELECT MaSKU, SoLuongMua FROM CHI_TIET_DON_HANG WHERE MaDonHang = ?", (order_id,))
    for item in cursor.fetchall():
        cursor.execute("""
            UPDATE TON_KHO_VI_TRI
            SET SoLuongTamGiu = MAX(0, SoLuongTamGiu - ?),
                SoLuongKhaDung = SoLuongThucTe - MAX(0, SoLuongTamGiu - ?)
            WHERE MaSKU = ?
        """, (item["SoLuongMua"], item["SoLuongMua"], item["MaSKU"]))

    now_str = datetime.now().strftime("%d/%m %H:%M")
    old_log = order["LichSuHanhTrinh"] or ""
    new_log = f"{old_log} | {now_str}: Khách hủy đơn trên Web (Lý do: {req.reason}) - Đã giải phóng tồn kho".strip(" |")

    trang_thai_tt = order["TrangThaiTT"]
    if trang_thai_tt == "DA_THANH_TOAN" and order["PhuongThucTT"].upper() != "COD":
        trang_thai_tt = "CHO_HOAN_TIEN"

    cursor.execute("""
        UPDATE DON_HANG
        SET TrangThaiDon = 'DA_HUY', LyDoHuy = ?, TrangThaiTT = ?, LichSuHanhTrinh = ?
        WHERE MaDonHang = ?
    """, (req.reason, trang_thai_tt, new_log, order_id))
    db.commit()
    return {"success": True, "message": f"Đã hủy đơn hàng #{order_id} và hoàn tồn kho!"}

@app.post("/api/store/order/{order_id}/pay")
def store_pay_order(order_id: str, req: StorePayOrder, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM DON_HANG WHERE MaDonHang = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng!")

    now_str = datetime.now().strftime("%d/%m %H:%M")
    old_log = order["LichSuHanhTrinh"] or ""
    txn_note = f" (Mã GD: {req.txn_id})" if req.txn_id else ""
    new_log = f"{old_log} | {now_str}: Thanh toán qua {req.pay_method} - Trạng thái: {req.pay_status}{txn_note}".strip(" |")

    cursor.execute("""
        UPDATE DON_HANG
        SET PhuongThucTT = ?, TrangThaiTT = ?, LichSuHanhTrinh = ?
        WHERE MaDonHang = ?
    """, (req.pay_method, req.pay_status, new_log, order_id))
    db.commit()
    return {"success": True, "message": f"Đã cập nhật trạng thái thanh toán đơn #{order_id}!"}

@app.post("/api/store/returns")
def store_create_return(req: StoreReturnCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT MaYeuCau FROM YEU_CAU_DOI_TRA WHERE MaYeuCau = ?", (req.return_id,))
    if cursor.fetchone():
        return {"success": True, "message": "Yêu cầu đổi trả đã tồn tại", "return_id": req.return_id}

    ly_do_day_du = f"{req.reason} - {req.detail}".strip(" -") if req.detail else req.reason
    img_url = req.image_url or "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"

    cursor.execute("""
        INSERT INTO YEU_CAU_DOI_TRA (
            MaYeuCau, MaDonHang, KhachHang, LyDoDoiTra, HinhAnhMinhChung, PhuongAnXuLy, TrangThaiYC
        ) VALUES (?, ?, ?, ?, ?, ?, 'CHO_TIEP_NHAN')
    """, (
        req.return_id, req.order_id, req.customer_name, ly_do_day_du, img_url, req.option
    ))
    db.commit()
    return {"success": True, "message": f"Đã lưu yêu cầu đổi trả #{req.return_id} và gửi tới Phân hệ Vận hành!"}

@app.post("/api/store/customer/register")
def store_register_customer(req: StoreCustomerRegister, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT MaKhachHang FROM KHACH_HANG WHERE LOWER(Email) = ?", (req.email.lower(),))
    if cursor.fetchone():
        return {"success": True, "message": "Khách hàng đã có trong CSDL"}

    ma_kh = req.customer_id
    if not ma_kh:
        cursor.execute("SELECT COUNT(*) FROM KHACH_HANG")
        ma_kh = f"KH{cursor.fetchone()[0] + 1:03d}"

    cursor.execute("""
        INSERT OR IGNORE INTO KHACH_HANG (MaKhachHang, HoTen, SoDienThoai, Email, DiaChiMacDinh, TrangThaiKH)
        VALUES (?, ?, ?, ?, ?, 'HOAT_DONG')
    """, (ma_kh, req.name or req.username, req.phone or "Chưa cập nhật", req.email, req.address))
    db.commit()
    return {"success": True, "customer_id": ma_kh, "message": "Đã lưu tài khoản khách hàng vào CSDL!"}

@app.post("/api/store/customer/update")
def store_update_customer(req: StoreCustomerUpdate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT MaKhachHang FROM KHACH_HANG WHERE MaKhachHang = ?", (req.customer_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT OR IGNORE INTO KHACH_HANG (MaKhachHang, HoTen, SoDienThoai, Email, DiaChiMacDinh, TrangThaiKH)
            VALUES (?, ?, ?, ?, ?, 'HOAT_DONG')
        """, (req.customer_id, req.name or req.customer_id, req.phone or "", req.email or "", req.address or ""))
    else:
        cursor.execute("""
            UPDATE KHACH_HANG
            SET HoTen = COALESCE(NULLIF(?, ''), HoTen),
                Email = COALESCE(NULLIF(?, ''), Email),
                SoDienThoai = COALESCE(NULLIF(?, ''), SoDienThoai),
                DiaChiMacDinh = COALESCE(NULLIF(?, ''), DiaChiMacDinh)
            WHERE MaKhachHang = ?
        """, (req.name, req.email, req.phone, req.address, req.customer_id))
    db.commit()
    return {"success": True, "message": "Đã đồng bộ thông tin hồ sơ khách hàng vào CSDL!"}


# Phục vụ giao diện tĩnh
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Phân hệ 1 – Web Storefront cho Khách hàng (frontend_khachhang/), truy cập tại /khach-hang/ hoặc trực tiếp trên domain store
KHACH_HANG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend_khachhang")
if os.path.isdir(KHACH_HANG_DIR):
    app.mount("/khach-hang", StaticFiles(directory=KHACH_HANG_DIR, html=True), name="khach_hang")
    assets_dir = os.path.join(KHACH_HANG_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="khach_hang_assets")

@app.get("/admin")
@app.get("/admin/")
def serve_admin_explicit():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/")
def serve_home(request: Request):
    host = (request.headers.get("host") or "").lower()
    # Nếu truy cập qua domain store (ví dụ urban-chic-store.onrender.com) thì mở thẳng Website Khách hàng ở trang gốc /
    if ("store" in host or "shop" in host or "khachhang" in host) and os.path.isdir(KHACH_HANG_DIR):
        return FileResponse(os.path.join(KHACH_HANG_DIR, "index.html"))
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

@app.get("/{filename}.js")
def serve_js(filename: str):
    file_path = os.path.join(STATIC_DIR, f"{filename}.js")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404)
