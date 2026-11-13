# Urban Chic® – Hệ thống Quản lý Bán Quần Áo Trực Tuyến

Hệ thống thương mại điện tử và quản trị vận hành nội bộ của thương hiệu thời trang **Urban Chic®**, được thiết kế tách biệt thành **2 hệ thống độc lập** chuẩn kiến trúc thực tế:
1. **Website Mua sắm Khách hàng (`frontend_khachhang/`):** Trang thương mại điện tử D2C dành cho Khách hàng (Phân hệ 1).
2. **Hệ thống Quản trị & Vận hành Nội bộ (`backend_admin/`):** Cổng ERP nội bộ phân quyền theo vai trò dành cho Nhân viên vận hành (Phân hệ 2), Thủ kho (Phân hệ 3) và Quản trị viên (Phân hệ 4).

---

## 🛠 Công nghệ & Cấu trúc thư mục

- **Hệ thống Nội bộ (ERP Portal):** Python, FastAPI, Uvicorn, Pydantic, SQLite (`fashion_ooad.db`), Tailwind CSS.
- **Website Khách hàng (Storefront):** HTML5, Tailwind CSS, Font Awesome, Vanilla JavaScript (Kiến trúc MVC / BCE).

```text
OOAD_WEB_UI/
├── backend_admin/                 # Hệ thống Quản trị & Vận hành Nội bộ (Phân hệ 2, 3, 4)
│   ├── database.py                # Khởi tạo 10 bảng CSDL SQLite & Dữ liệu nghiệp vụ
│   ├── main.py                    # REST API & Phục vụ giao diện Portal Nội bộ
│   ├── fashion_ooad.db            # Cơ sở dữ liệu SQLite
│   └── static/                    # Giao diện Web Nội bộ (index.html, app.js)
├── frontend_khachhang/            # Website Mua sắm Khách hàng độc lập (Phân hệ 1)
│   ├── index.html
│   └── assets/js/                 # Tầng dữ liệu, nghiệp vụ & giao diện (data.js, controllers.js, views-*.js, app.js)
├── requirements.txt               # Thư viện Python
├── render.yaml                    # Blueprint triển khai 2 dịch vụ độc lập trên Render
└── README.md                      # Hướng dẫn khởi chạy hệ thống
```

---

## 🚀 Cách chạy 2 hệ thống độc lập trên máy cá nhân (Local)

### 1. Cài đặt thư viện
```bash
pip install -r requirements.txt
```

### 2. Khởi chạy 2 cổng độc lập
- **Hệ thống Quản trị & Vận hành Nội bộ (Cổng `8000`):**
  ```bash
  python -m uvicorn backend_admin.main:app --host 127.0.0.1 --port 8000
  ```
  👉 Link truy cập: http://127.0.0.1:8000/

- **Website Mua sắm Khách hàng (Cổng `3000`):**
  ```bash
  python -m http.server 3000 --directory frontend_khachhang --bind 127.0.0.1
  ```
  👉 Link truy cập: http://127.0.0.1:3000/

---

## 🔑 Tài khoản đăng nhập theo từng Hệ thống

### I. Hệ thống Quản trị & Vận hành Nội bộ (`http://127.0.0.1:8000/`)

| Vai trò (Phân hệ) | Tên đăng nhập / Email | Mật khẩu | Chức năng nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (`ADMIN` - Phân hệ 4)** | `admin` *(hoặc `admin@fashionshop.vn`)* | `admin123` | Báo cáo thống kê doanh thu/tồn kho, Quản lý nhân sự, Voucher, CRM/Blacklist, Nhà cung cấp, Chính sách hệ thống |
| **Nhân viên vận hành (`NV_VAN_HANH` - Phân hệ 2)** | `vanhanh` *(hoặc `lan.nguyen@fashionshop.vn`)* | `vanhanh123` | Xử lý duyệt/từ chối đơn hàng, In Pick-list & Tem vận đơn, Theo dõi vận đơn, Xử lý khiếu nại đổi trả |
| **Thủ kho (`NV_KHO` - Phân hệ 3)** | `kho` *(hoặc `hung.le@fashionshop.vn`)* | `kho123` | Quản lý từ điển SKU, Quản lý tồn kho & định mức cảnh báo, Vị trí lưu kho, Lập phiếu Nhập/Xuất kho |

### II. Website Mua sắm Khách hàng (`http://127.0.0.1:3000/`)

| Tài khoản | Mật khẩu | Mô tả tài khoản |
| :--- | :--- | :--- |
| `minhquan` | `Demo@123` | Khách hàng thành viên (có lịch sử đơn hàng, sổ địa chỉ, danh sách yêu thích) |
| `thuha` | `Demo@123` | Khách hàng thành viên |
| `vankiet` | `Demo@123` | Tài khoản bị khóa (kiểm tra nghiệp vụ từ chối đăng nhập) |

---

## ☁️ Triển khai 2 Link Công khai Độc lập trên Render
File `render.yaml` đã được cấu hình sẵn 2 dịch vụ riêng biệt từ cùng 1 kho mã nguồn GitHub:
1. **Link 1 – Hệ thống Nội bộ (`urban-chic-admin` - Web Service):** `https://urban-chic-admin.onrender.com`
2. **Link 2 – Website Khách hàng (`urban-chic-store` - Static Site):** `https://urban-chic-store.onrender.com`
