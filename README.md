# Urban Chic® – Hệ thống Quản lý Bán Quần Áo Trực Tuyến

Hệ thống thương mại điện tử và quản trị vận hành nội bộ của thương hiệu thời trang **Urban Chic®** (đồ án OOAD), gồm 2 phần dùng **chung 1 server và 1 cơ sở dữ liệu**:

1. **Website Mua sắm Khách hàng** (`frontend_khachhang/`) – Phân hệ 1, dành cho khách mua hàng.
2. **Hệ thống Quản trị & Vận hành Nội bộ** (`backend_admin/`) – cổng ERP phân quyền cho Nhân viên vận hành (Phân hệ 2), Thủ kho (Phân hệ 3) và Quản trị viên (Phân hệ 4).

---

## ⚡ Chạy nhanh trong 3 bước

```bash
# 1. Tải code
git clone https://github.com/mihtrjune66/Website-Clothing-Store.git
cd Website-Clothing-Store

# 2. Cài thư viện (cần Python 3.10+)
pip install -r requirements.txt

# 3. Chạy server
python -m uvicorn backend_admin.main:app --host 127.0.0.1 --port 8000
```

| Mở trang | Địa chỉ | Đăng nhập thử |
| :--- | :--- | :--- |
| 🛍️ Web Khách hàng | http://127.0.0.1:8000/khach-hang/ | `minhquan` / `Demo@123` |
| 🏢 Web Quản trị nội bộ | http://127.0.0.1:8000/ | `admin` / `admin123` |
| 🗄️ Xem database trực tiếp *(tùy chọn)* | http://127.0.0.1:8765 | chạy thêm `python tools/xem_db.py` |

> Mở 2 tab **Khách hàng** và **Quản trị** cạnh nhau: đặt đơn bên khách → khoảng 4 giây sau đơn hiện bên Admin; Admin duyệt đơn → bên khách tự đổi trạng thái.

---

## 📑 Mục lục

1. [Công nghệ & cấu trúc thư mục](#-công-nghệ--cấu-trúc-thư-mục)
2. [Cài đặt & chạy chi tiết](#-cài-đặt--chạy-chi-tiết)
3. [Tài khoản đăng nhập](#-tài-khoản-đăng-nhập)
4. [Hướng dẫn sử dụng Web Khách hàng](#️-hướng-dẫn-sử-dụng-web-khách-hàng-phân-hệ-1)
5. [Hướng dẫn sử dụng Web Quản trị nội bộ](#-hướng-dẫn-sử-dụng-web-quản-trị-nội-bộ-phân-hệ-2-3-4)
6. [Hai web kết nối với nhau như thế nào](#-hai-web-kết-nối-với-nhau-như-thế-nào)
7. [Cơ sở dữ liệu: dữ liệu được lưu ở đâu](#️-cơ-sở-dữ-liệu-dữ-liệu-được-lưu-ở-đâu)
8. [Xem database trực tiếp](#-xem-database-trực-tiếp)
9. [Kịch bản test gợi ý](#-kịch-bản-test-gợi-ý)
10. [Hạn chế đã biết](#️-hạn-chế-đã-biết)
11. [Xử lý sự cố](#-xử-lý-sự-cố)
12. [Triển khai lên Render](#️-triển-khai-lên-render)

---

## 🛠 Công nghệ & cấu trúc thư mục

- **Server & Web nội bộ:** Python, FastAPI, Uvicorn, Pydantic, SQLite, Tailwind CSS.
- **Web Khách hàng:** HTML5, Tailwind CSS, Font Awesome, JavaScript thuần (kiến trúc MVC / BCE).

```text
Website-Clothing-Store/
├── backend_admin/                 # Server + Web Quản trị nội bộ (Phân hệ 2, 3, 4)
│   ├── main.py                    # Toàn bộ REST API, phục vụ cả 2 giao diện web
│   ├── database.py                # Tạo 13 bảng SQLite + dữ liệu mẫu (chạy khi server khởi động)
│   ├── fashion_ooad.db            # ⭐ File database server đang dùng
│   └── static/                    # Giao diện web nội bộ (index.html, app.js)
├── frontend_khachhang/            # Web Khách hàng (Phân hệ 1)
│   ├── index.html
│   └── assets/js/                 # data.js (dữ liệu mẫu), controllers.js (nghiệp vụ + gọi API),
│                                  # views-*.js (giao diện), app.js (điều hướng, tự đồng bộ)
├── Database/                      # Bản sao CSDL + script SQL (SQLite & PostgreSQL) để nộp/xem
├── tools/
│   └── xem_db.py                  # Trang xem database trực tiếp, tự cập nhật
├── requirements.txt
├── render.yaml                    # Cấu hình deploy Render
└── README.md
```

---

## 🚀 Cài đặt & chạy chi tiết

### Yêu cầu
- **Python 3.10 trở lên** (kiểm tra: `python --version`).
- Có **Internet** khi mở web (để tải Tailwind, Font Awesome và ảnh sản phẩm).

### Bước 1 – Cài thư viện
```bash
pip install -r requirements.txt
```

### Bước 2 – Chạy server (chọn 1 trong 2 cách)

**Cách A – Một cổng duy nhất (khuyên dùng):**
```bash
python -m uvicorn backend_admin.main:app --host 127.0.0.1 --port 8000
```
- Web Quản trị: http://127.0.0.1:8000/
- Web Khách hàng: http://127.0.0.1:8000/khach-hang/

Thêm `--reload` nếu đang sửa code Python và muốn server tự khởi động lại.

**Cách B – Hai cổng riêng biệt** (giống khi deploy thật – 2 link độc lập). Mở 2 cửa sổ terminal:
```bash
# Terminal 1 – server + web nội bộ
python -m uvicorn backend_admin.main:app --host 127.0.0.1 --port 8000

# Terminal 2 – web khách hàng (file tĩnh)
python -m http.server 3000 --directory frontend_khachhang --bind 127.0.0.1
```
- Web Khách hàng: http://127.0.0.1:3000/ – tự gọi API sang `http://127.0.0.1:8000`, nên **Terminal 1 phải đang chạy**.
- Muốn trỏ web khách hàng sang server khác: thêm `?api=<địa chỉ server>` vào link, ví dụ `http://127.0.0.1:3000/?api=https://urban-chic-admin.onrender.com`.

### Bước 3 – Tắt server
Bấm `Ctrl + C` trong cửa sổ terminal đang chạy.

---

## 🔑 Tài khoản đăng nhập

### Web Quản trị nội bộ (http://127.0.0.1:8000/)

Đăng nhập bằng **email**, **mã nhân viên** (vd. `NV001`) hoặc **tên tắt**.

| Vai trò | Tên tắt | Email | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** (`ADMIN` – Phân hệ 4) | `admin` | `admin@fashionshop.vn` | `admin123` | Thống kê, nhân sự, voucher, CRM/Blacklist, nhà cung cấp, chính sách hệ thống |
| **Nhân viên vận hành** (`NV_VAN_HANH` – Phân hệ 2) | `vanhanh` | `vanhanh@fashionshop.vn` | `vanhanh123` | Duyệt/từ chối đơn, pick-list, tem vận đơn, theo dõi vận đơn, xử lý đổi trả |
| **Thủ kho** (`NV_KHO` – Phân hệ 3) | `kho` | `kho@fashionshop.vn` | `kho123` | Từ điển SKU, tồn kho & định mức, vị trí kho, phiếu nhập/xuất |
| Vận hành **bị khóa** (test từ chối) | – | `bao.pham@fashionshop.vn` | `123456` | Đăng nhập phải bị từ chối |

### Web Khách hàng (http://127.0.0.1:8000/khach-hang/)

| Tên đăng nhập | Email | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| `minhquan` | `quan.nguyen@gmail.com` | `Demo@123` | Có sẵn lịch sử đơn, sổ địa chỉ, yêu thích |
| `thuha` | `thuha.pham@gmail.com` | `Demo@123` | Khách thành viên |
| `vankiet` | `kiet.truong@gmail.com` | `Demo@123` | **Bị khóa** – test từ chối đăng nhập |

### Mã voucher mẫu

| Mã | Giảm | Đơn tối thiểu | Trạng thái |
| :--- | :--- | :--- | :--- |
| `SALE50K` | 50.000₫ | 500.000₫ | Hoạt động (01/11 – 30/11/2026) |
| `NEWMEM10` | 10% | 300.000₫ | Hoạt động (01/11 – 31/12/2026) |
| `VIPMEMBER` | 100.000₫ | 1.000.000₫ | Hoạt động (01/11 – 15/12/2026) |
| `FLASH100` | 100.000₫ | 800.000₫ | **Đã vô hiệu hóa** – test mã hết hiệu lực |

---

## 🛍️ Hướng dẫn sử dụng Web Khách hàng (Phân hệ 1)

19 use case theo tài liệu đặc tả (BTH5). Cột **"Ghi vào DB"** cho biết thao tác có lưu vào database server hay chỉ lưu trong trình duyệt.

| Nhóm | UC | Chức năng | Cách dùng | Ghi vào DB |
| :--- | :--- | :--- | :--- | :--- |
| **Tài khoản** | UC01 | Đăng ký | *Đăng nhập → Tạo tài khoản*. Mật khẩu ≥ 8 ký tự, có chữ và số; phải tick đồng ý điều khoản | `KHACH_HANG` |
| | UC02 | Đăng nhập | Bằng tên đăng nhập hoặc email | – |
| | UC03 | Quên mật khẩu | Nhập email → nhận mã/link (giả lập) → đặt mật khẩu mới | – |
| | UC12 | Hồ sơ cá nhân | *Tài khoản*: sửa họ tên, SĐT, sổ địa chỉ, đổi mật khẩu | `KHACH_HANG` |
| **Sản phẩm** | UC04 | Tìm kiếm | Ô tìm kiếm trên đầu trang | – |
| | UC05 | Lọc / sắp xếp | Trang *Sản phẩm*: lọc danh mục, giá, size, màu, đang sale; sắp xếp theo giá | – |
| | UC06 | Xem chi tiết | Bấm vào sản phẩm, chọn màu + size | – |
| | UC07 | Xem khuyến mãi | Trong trang chi tiết: *"X mã voucher có thể áp dụng"* | – |
| **Giỏ & Yêu thích** | UC08–09 | Giỏ hàng | Thêm, tăng/giảm, xóa sản phẩm | – (trình duyệt) |
| | UC10–11 | Yêu thích | Bấm ♡ trên sản phẩm; xem ở biểu tượng ♡ trên đầu trang | – (trình duyệt) |
| **Mua hàng** | UC16 | Đặt hàng | Giỏ hàng → *Đặt hàng* → chọn địa chỉ, nhập voucher → xác nhận | `DON_HANG`, `CHI_TIET_DON_HANG`, `TON_KHO_VI_TRI`, `KHUYEN_MAI` |
| | UC17 | Chọn thanh toán | Sau khi đặt, chọn COD / MoMo / VNPay | `DON_HANG` |
| | UC18 | COD | Xác nhận thanh toán khi nhận hàng | `DON_HANG` |
| | UC19 | Thanh toán online | Cổng MoMo/VNPay **giả lập** có đồng hồ đếm ngược, chọn thành công / thất bại | `DON_HANG` |
| **Sau mua** | UC13 | Đơn hàng của tôi | *Tài khoản → Đơn hàng*: lọc theo trạng thái, xem chi tiết | – |
| | UC14 | Hủy đơn / đổi trả | Hủy khi đơn còn *Chờ duyệt*; đổi trả với đơn *Đã giao* còn trong hạn | `DON_HANG`, `YEU_CAU_DOI_TRA` |
| | UC15 | Theo dõi vận chuyển | Xem hành trình đơn đang giao | – |

**Nút Demo** (góc dưới bên trái) → *Khôi phục dữ liệu*: đưa **phía trình duyệt** về dữ liệu mẫu (tài khoản, giỏ, đơn hiển thị). Nút này **không** xóa dữ liệu trong database server.

---

## 🏢 Hướng dẫn sử dụng Web Quản trị nội bộ (Phân hệ 2, 3, 4)

Menu bên trái hiển thị theo vai trò đăng nhập.

**Nhân viên vận hành** (`vanhanh` / `vanhanh123`)
- Danh sách đơn hàng mới (`CHO_DUYET`) → **Duyệt** hoặc **Từ chối** (kèm lý do).
- Chuyển trạng thái: `CHO_DUYET → DANG_DONG_GOI → DANG_GIAO → DA_GIAO` (hoặc `DA_HUY`).
- In pick-list, tem vận đơn; theo dõi vận đơn.
- Xử lý yêu cầu đổi trả khách gửi lên.

**Thủ kho** (`kho` / `kho123`)
- Từ điển SKU: sửa giá bán, ẩn/hiện SKU → web khách cập nhật giá/tình trạng hàng.
- Tồn kho theo vị trí, định mức cảnh báo tồn tối thiểu.
- Lập phiếu nhập kho / xuất kho.

**Quản trị viên** (`admin` / `admin123`)
- Dashboard thống kê doanh thu, đơn hàng, tồn kho.
- Quản lý nhân sự: tạo, sửa, khóa tài khoản nhân viên.
- **Voucher:** phát hành mã mới, vô hiệu hóa/kích hoạt lại → hiện ngay bên web khách.
- **CRM khách hàng:** xem hồ sơ, lịch sử đơn, đưa vào/gỡ khỏi **Blacklist** (khách bị blacklist không đặt được hàng).
- Nhà cung cấp; **chính sách hệ thống** (phí ship, mốc freeship, số ngày đổi trả) → áp dụng bên web khách.

---

## 🔄 Hai web kết nối với nhau như thế nào

```text
 Web Khách hàng (trình duyệt)                 Server FastAPI               Web Quản trị (trình duyệt)
 ─────────────────────────────                ──────────────               ──────────────────────────
 Đặt đơn / đăng ký / đổi trả ──POST /api/store/...──▶  main.py  ──INSERT/UPDATE──▶  fashion_ooad.db
                                                          │                              │
 Mỗi 4 giây: GET /api/store/sync ◀────────SELECT──────────┘                              │
   (trạng thái đơn, tồn kho, giá SKU,                                                    │
    voucher, blacklist, chính sách)              GET /api/admin/... mỗi 4 giây ◀─SELECT──┘
```

- **Khách → Admin:** đặt hàng, hủy đơn, thanh toán, đổi trả, đăng ký, sửa hồ sơ được gửi về server bằng `fetch()` và ghi vào SQLite.
- **Admin → Khách:** web khách gọi `/api/store/sync` **mỗi 4 giây**, khi quay lại tab, và ngay lập tức qua `BroadcastChannel` nếu 2 tab mở trên cùng trình duyệt.
- Web Quản trị cũng tự tải lại dữ liệu mỗi 4 giây, nên **không cần F5**.

---

## 🗄️ Cơ sở dữ liệu: dữ liệu được lưu ở đâu

Dữ liệu nằm ở **2 nơi**:

| | **Database SQLite** | **localStorage của trình duyệt** |
| :--- | :--- | :--- |
| Vị trí | File `backend_admin/fashion_ooad.db` | Trong trình duyệt, khóa `urbanchic_khachhang_v2` |
| Ai đọc được | Server → cả 2 web | Chỉ web khách trên **đúng trình duyệt + đúng địa chỉ** đó |
| Lưu gì | Khách hàng, đơn hàng, tồn kho, SKU, voucher, đổi trả, nhân viên, chính sách | **Tên đăng nhập + mật khẩu khách**, giỏ hàng, yêu thích, sổ địa chỉ |
| Tắt server / tắt máy | ✅ Còn | ✅ Còn |
| Mất khi | Xóa/ghi đè file `.db` | Xóa dữ liệu duyệt web, dùng máy/trình duyệt/tab ẩn danh khác, bấm *Khôi phục dữ liệu*, đổi `127.0.0.1` ↔ `localhost` |

👉 Xem localStorage: mở web khách → **F12** → tab **Application** → **Local Storage** → `urbanchic_khachhang_v2`.

### Một lượt đăng ký được lưu như thế nào

1. **JavaScript** tạo tài khoản và lưu vào localStorage – [`controllers.js`](frontend_khachhang/assets/js/controllers.js) (`TaiKhoanController.dangKy` → `DB.save()`).
2. **JavaScript** gửi lên server: `POST /api/store/customer/register` (`StoreAPI.registerCustomer`).
3. **Python** nhận yêu cầu và chạy câu **SQL** – [`main.py`](backend_admin/main.py) (`store_register_customer`):
   ```sql
   SELECT MaKhachHang FROM KHACH_HANG WHERE LOWER(Email) = ?;            -- email đã có chưa?
   INSERT OR IGNORE INTO KHACH_HANG (MaKhachHang, HoTen, SoDienThoai, Email, DiaChiMacDinh, TrangThaiKH)
   VALUES (?, ?, ?, ?, ?, 'HOAT_DONG');                                   -- thêm 1 dòng
   ```
4. `db.commit()` → dữ liệu được ghi hẳn xuống file `fashion_ooad.db`.

> ⚠️ Bảng `KHACH_HANG` **không có cột tên đăng nhập/mật khẩu**, nên mật khẩu khách chỉ nằm trong trình duyệt (xem [Hạn chế đã biết](#️-hạn-chế-đã-biết)).

### 13 bảng trong database

| Bảng | Nội dung |
| :--- | :--- |
| `NGUOI_DUNG` | Tài khoản nhân viên nội bộ (Admin, Vận hành, Thủ kho) |
| `KHACH_HANG` | Hồ sơ khách hàng, trạng thái Blacklist |
| `SAN_PHAM` | Sản phẩm |
| `BIEN_THE_SKU` | Biến thể theo size/màu, giá vốn, giá bán |
| `TON_KHO_VI_TRI` | Tồn thực tế, tạm giữ, khả dụng, vị trí kệ |
| `KHUYEN_MAI` | Voucher: loại giảm, giá trị, đơn tối thiểu, thời hạn, số lượt |
| `DON_HANG` | Đơn hàng, thanh toán, vận đơn, lịch sử hành trình |
| `CHI_TIET_DON_HANG` | Các SKU trong từng đơn |
| `YEU_CAU_DOI_TRA` | Yêu cầu đổi/trả hàng |
| `NHA_CUNG_CAP` | Nhà cung cấp |
| `CHINH_SACH_HE_THONG` | Phí ship, mốc freeship, số ngày đổi trả… |
| `PHIEU_KHO`, `CHI_TIET_PHIEU_KHO` | Phiếu nhập/xuất kho và chi tiết |

Câu lệnh tạo bảng: [`backend_admin/database.py`](backend_admin/database.py) · Script SQL đầy đủ: [`Database/`](Database/).

### Đưa database về dữ liệu mẫu ban đầu
Tắt server (`Ctrl + C`), rồi chọn 1 trong 2 cách:
```bash
# Cách 1: lấy lại file .db gốc từ Git
git checkout -- backend_admin/fashion_ooad.db

# Cách 2: xóa file, server sẽ tự tạo lại bảng + dữ liệu mẫu khi khởi động
del backend_admin\fashion_ooad.db        # Windows
rm backend_admin/fashion_ooad.db         # macOS / Linux
```
Sau đó bấm **Demo → Khôi phục dữ liệu** bên web khách để phía trình duyệt cũng về mẫu.

---

## 🔍 Xem database trực tiếp

Công cụ [`tools/xem_db.py`](tools/xem_db.py) mở một trang web hiển thị **toàn bộ bảng**, **tự cập nhật mỗi 2 giây** và **tô vàng dòng mới** – tiện để thấy ngay khi có người đăng ký hoặc đặt hàng. Công cụ chỉ **đọc** database, không sửa gì, và không cần cài thêm thư viện.

```bash
# Mở thêm 1 terminal (server cổng 8000 vẫn chạy ở terminal kia)
python tools/xem_db.py
```
Mở http://127.0.0.1:8765

- **Cột trái:** danh sách bảng + số dòng; bảng vừa thay đổi có viền vàng.
- **Ô đen:** câu SQL đang chạy (`SELECT * FROM "KHACH_HANG"`).
- **Thay đổi gần đây:** nhật ký kiểu `10:31:05 – KHACH_HANG: 5 → 6 dòng`.
- **Tạm dừng:** dừng tự cập nhật để đọc kỹ.
- Đổi file hoặc cổng: `python tools/xem_db.py <đường_dẫn.db> <cổng>`.

**Cách khác:** cài [DB Browser for SQLite](https://sqlitebrowser.org/) hoặc extension *SQLite Viewer* cho VS Code rồi mở `backend_admin/fashion_ooad.db` (xem được, sửa được, chạy SQL tùy ý).

---

## ✅ Kịch bản test gợi ý

**Test đồng bộ 2 chiều** – mở 3 tab: Web khách, Web quản trị, Xem database.

| # | Làm gì | Kết quả mong đợi |
| :--- | :--- | :--- |
| 1 | Khách đăng ký tài khoản mới | `KHACH_HANG` thêm 1 dòng; Admin → CRM thấy khách mới |
| 2 | Khách `minhquan` đặt 1 đơn, dùng mã `NEWMEM10` | `DON_HANG` thêm dòng `CHO_DUYET`; tồn kho giảm; `NEWMEM10` tăng 1 lượt dùng |
| 3 | `vanhanh` duyệt đơn → đóng gói → giao → đã giao | Bên khách, trạng thái đơn đổi theo trong ~4 giây |
| 4 | `admin` phát hành voucher mới (ngày bắt đầu = hôm nay) | Mã hiện ở trang chủ + trang sản phẩm bên khách |
| 5 | `admin` vô hiệu hóa voucher đó | Bên khách, mã chuyển sang "không còn hiệu lực" |
| 6 | `kho` sửa giá bán 1 SKU | Giá trên trang sản phẩm bên khách đổi theo |
| 7 | `admin` đưa khách vào Blacklist | Khách đó đặt hàng bị chặn |
| 8 | `admin` đổi phí ship / mốc freeship | Bước đặt hàng bên khách tính theo số mới |
| 9 | Khách hủy đơn đang `CHO_DUYET` | `DON_HANG` chuyển `DA_HUY`; Admin thấy đơn bị hủy |
| 10 | Khách gửi đổi trả cho đơn đã giao | `YEU_CAU_DOI_TRA` thêm dòng; Vận hành thấy yêu cầu |

**Test trường hợp lỗi bên khách:** sai mật khẩu; tài khoản `vankiet` bị khóa; đăng ký trùng tên/email; mật khẩu yếu; giỏ trống; thiếu địa chỉ; SĐT sai định dạng; voucher sai / hết hạn (`FLASH100`) / chưa đủ đơn tối thiểu; thêm vượt tồn kho; hủy đơn đã giao.

---

## ⚠️ Hạn chế đã biết

Hệ thống phục vụ mục đích **học tập/demo**, còn các điểm sau cần lưu ý khi test:

1. **Tài khoản khách chỉ lưu mật khẩu trong trình duyệt.** Đăng ký ở máy/trình duyệt này thì không đăng nhập được ở máy khác (database chỉ có hồ sơ, không có mật khẩu).
2. **Mã khách (`KH…`) và mã đơn (`DH2026…`) do trình duyệt tự sinh.** Hai trình duyệt khác nhau có thể sinh trùng mã → bản ghi thứ hai bị bỏ qua: tài khoản không vào `KHACH_HANG` (do `INSERT OR IGNORE`), đơn không sang Admin (server trả "Đơn hàng đã tồn tại").
3. **Server chưa tự kiểm tra lại tồn kho, giá và voucher khi đặt hàng** – tin số liệu trình duyệt gửi lên; đặt quá tồn thì tồn kho chỉ về 0.
4. **Database chỉ có 7 SKU mẫu**; khi khách đặt SKU chưa có, server tự tạo SKU tạm (gắn vào `SP001`, tồn 25).
5. **Bảo mật:** mật khẩu nhân viên lưu dạng chữ thường (cột `MatKhauHash` chưa băm); API `/api/admin/...` chưa kiểm tra token – phân quyền mới ở mức giao diện.

---

## 🧰 Xử lý sự cố

| Hiện tượng | Cách xử lý |
| :--- | :--- |
| `pip` / `python` không nhận lệnh | Cài Python 3.10+, tick *Add Python to PATH*; thử `py` thay cho `python` |
| `Address already in use` / cổng 8000 bị chiếm | Tắt server cũ, hoặc chạy cổng khác: `--port 8001` (khi đó web khách mở tại `http://127.0.0.1:8001/khach-hang/`) |
| Web khách không thấy dữ liệu từ Admin | Kiểm tra server cổng 8000 còn chạy; F12 → *Console* xem lỗi; nếu dùng Cách B phải chạy đủ 2 terminal |
| Đăng ký xong không thấy trong database | Xem đúng trang `http://127.0.0.1:8765` (không phải file HTML tĩnh); xem mục *Hạn chế* số 2 |
| Không đăng nhập được tài khoản vừa tạo | Đang dùng trình duyệt/địa chỉ khác lúc đăng ký (mục *Hạn chế* số 1) |
| Dữ liệu rối, muốn làm lại | [Đưa database về dữ liệu mẫu](#đưa-database-về-dữ-liệu-mẫu-ban-đầu) + Demo → Khôi phục dữ liệu |
| Giao diện vỡ, không có icon/ảnh | Cần Internet để tải Tailwind, Font Awesome và ảnh |
| Terminal Windows báo `UnicodeEncodeError` | Chạy `chcp 65001` trước, hoặc dùng Windows Terminal |

---

## ☁️ Triển khai lên Render

File `render.yaml` cấu hình sẵn 2 dịch vụ từ cùng 1 repo:
1. **`urban-chic-admin`** (Web Service – Python): server + web nội bộ, có luôn web khách tại `/khach-hang/`.
2. **`urban-chic-store`** (Static Site): web khách hàng độc lập; tự tìm server `urban-chic-admin` để gọi API (hoặc chỉ định bằng `?api=`).

Các bước: đẩy code lên GitHub → Render → **New → Blueprint** → chọn repo → Render đọc `render.yaml` và tạo 2 dịch vụ.

> ⚠️ Gói **Free** của Render không giữ ổ đĩa: mỗi lần deploy lại hoặc dịch vụ khởi động lại, `fashion_ooad.db` quay về bản trong Git (mất đơn/khách tạo khi chạy). Dịch vụ free cũng "ngủ" sau một thời gian không dùng, lần mở đầu tiên mất khoảng 30–60 giây.
