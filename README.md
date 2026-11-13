# Urban Chic® – Hệ thống Quản lý Bán Quần Áo Trực Tuyến (Đồ án OOAD - Nhóm 19)

Ứng dụng web full-stack minh họa quy trình Phân tích & Thiết kế Hướng đối tượng (OOAD) cho cửa hàng thời trang **Urban Chic®**, bao gồm đầy đủ 4 phân hệ nghiệp vụ:
1. **Phân hệ 1 – Khách hàng (Storefront):** Web mua sắm trực tuyến (`frontend_khachhang/`).
2. **Phân hệ 2 – Nhân viên vận hành:** Xử lý duyệt đơn, in tem vận đơn/Pick-list, theo dõi vận đơn, xử lý khiếu nại đổi trả (`backend_admin/`).
3. **Phân hệ 3 – Nhân viên kho / Thủ kho:** Quản lý từ điển SKU, tồn kho, vị trí kệ kho, lập phiếu nhập/xuất kho (`backend_admin/`).
4. **Phân hệ 4 – Quản trị hệ thống (Admin):** Báo cáo thống kê doanh thu/tồn kho, quản lý tài khoản nhân viên, chương trình khuyến mãi (Voucher), CRM khách hàng & Blacklist, nhà cung cấp và cấu hình chính sách hệ thống (`backend_admin/`).

---

## 🛠 Công nghệ & Cấu trúc thư mục

- **Backend:** Python, FastAPI, Uvicorn, Pydantic, SQLite (`fashion_ooad.db`).
- **Frontend:** HTML5, Tailwind CSS, Font Awesome, Vanilla JavaScript (SPA / Modular MVC).

```text
OOAD_WEB_UI/
├── backend_admin/                 # Hệ thống Portal Nội bộ (Phân hệ 2, 3, 4) & FastAPI Server
│   ├── database.py                # Khởi tạo 10 bảng CSDL SQLite & Dữ liệu mẫu
│   ├── main.py                    # REST API & mount static web Admin + Khách hàng
│   ├── fashion_ooad.db            # Cơ sở dữ liệu SQLite nội bộ
│   └── static/                    # Giao diện Web Portal (index.html, app.js)
├── frontend_khachhang/            # Web Mua sắm Khách hàng (Phân hệ 1 - Storefront)
│   ├── index.html
│   └── assets/js/                 # Mô hình MVC/BCE (data.js, controllers.js, views-*.js, app.js)
├── requirements.txt               # Thư viện Python cần thiết
├── render.yaml                    # Cấu hình Deploy lên Render
└── README.md                      # Tài liệu hướng dẫn tổng quan & chạy thử
```

---

## 🚀 Cách chạy dự án trên máy cá nhân (Local)

### Bước 1: Cài đặt thư viện
Mở Terminal / PowerShell tại thư mục gốc của dự án và chạy:
```bash
pip install -r requirements.txt
```

### Bước 2: Khởi động Web Server
Chạy lệnh sau để bật đồng thời cả 4 phân hệ trên cùng một máy chủ:
```bash
python -m uvicorn backend_admin.main:app --host 127.0.0.1 --port 8099 --reload
```
*(Nếu chạy qua Render thì server tự chạy với lệnh `python -m uvicorn backend_admin.main:app --host 0.0.0.0 --port $PORT`).*

### Bước 3: Mở trình duyệt để test
- **Trang mua sắm Khách hàng (Phân hệ 1):**  
  👉 http://127.0.0.1:8099/khach-hang/
- **Trang Quản trị Nội bộ (Phân hệ 2, 3, 4):**  
  👉 http://127.0.0.1:8099/  
  *(Hoặc bấm nút **"Đến trang mua sắm dành cho Khách hàng"** ngay dưới khung đăng nhập Admin để chuyển qua lại nhanh chóng).*

---

## 🔑 Tài khoản đăng nhập để Test từng Phân hệ

### 1. Phân hệ Nội bộ (`http://127.0.0.1:8099/`)
Hệ thống tự động điều hướng đúng giao diện & quyền hạn tương ứng với tài khoản đăng nhập:

| Vai trò (Phân hệ) | Tên đăng nhập / Email | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (`ADMIN`)** | `admin` *(hoặc `admin@fashionshop.vn`)* | `admin123` | Dashboard doanh thu/tồn kho, Nhân viên, Voucher, CRM/Blacklist, Nhà cung cấp, Cấu hình |
| **Nhân viên vận hành (`NV_VAN_HANH`)** | `vanhanh` *(hoặc `lan.nguyen@fashionshop.vn`)* | `vanhanh123` | Duyệt đơn hàng, In Pick-list & Tem vận đơn, Cập nhật vận đơn, Xử lý đổi trả |
| **Nhân viên kho / Thủ kho (`NV_KHO`)** | `kho` *(hoặc `hung.le@fashionshop.vn`)* | `kho123` | Quản lý SKU, Cập nhật giá & định mức tồn, Sơ đồ kệ kho, Lập phiếu Nhập/Xuất kho |

### 2. Phân hệ Khách hàng (`http://127.0.0.1:8099/khach-hang/`)

| Tài khoản | Mật khẩu | Ghi chú test |
| :--- | :--- | :--- |
| `minhquan` | `Demo@123` | Thành viên có sẵn 7 đơn hàng đủ trạng thái, giỏ hàng, yêu thích, 2 địa chỉ |
| `thuha` | `Demo@123` | Khách hàng thành viên thông thường |
| `vankiet` | `Demo@123` | Tài khoản **bị khóa** (dùng để test luồng phụ khi đăng nhập bị từ chối) |

*(Mẹo dành cho Phân hệ Khách hàng: Bấm nút **Demo** ở góc dưới bên trái để bật/tắt nhãn Use Case, mô phỏng lỗi cổng thanh toán / đơn vị vận chuyển hoặc khôi phục lại dữ liệu mẫu ban đầu. Nhấn `Shift + D` để ẩn nút Demo khi chụp hình báo cáo).*

---

## ☁️ Truy cập trên Cloud (Render)
Sau khi Merge code mới lên GitHub (`main`), Render sẽ tự động triển khai tại link:
- **Portal Nội bộ:** `https://<ten-app>.onrender.com/`
- **Web Khách hàng:** `https://<ten-app>.onrender.com/khach-hang/`

