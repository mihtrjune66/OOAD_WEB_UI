// ==========================================================================
// URBAN CHIC® - HỆ THỐNG VẬN HÀNH & QUẢN TRỊ NỘI BỘ (CHUẨN ĐẶC TẢ USE CASE OOAD)
// ==========================================================================

let currentUser = null;
let currentTab = null;
let currentOpsFilter = 'TAT_CA';
let currentWhReceiptFilter = 'TAT_CA';
let cachedOrders = [];
let cachedReturns = [];
let cachedEmployees = [];
let cachedVouchers = [];
let cachedSuppliers = [];
let cachedSkus = [];
let cachedInventory = [];
let cachedLocations = [];

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('login-password');
    const icon = document.getElementById('toggle-pass-icon');
    if (!passInput || !icon) return;
    if (passInput.type === 'password') {
        passInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ----------------- CẤU HÌNH MENU THEO ĐẶC TẢ USE CASE -----------------
const ROLE_CONFIGS = {
    'ADMIN': {
        title: 'HỆ THỐNG QUẢN TRỊ',
        roleLabel: 'Quản trị viên',
        defaultTab: 'dashboard',
        avatarInitials: 'AD',
        menu: [
            { id: 'dashboard', label: 'Xem báo cáo thống kê', icon: 'fa-chart-line' },
            { id: 'employees', label: 'Quản lý tài khoản nhân viên', icon: 'fa-users-gear' },
            { id: 'vouchers', label: 'Quản lý CT khuyến mãi', icon: 'fa-ticket' },
            { id: 'customers', label: 'Quản lý thông tin khách hàng', icon: 'fa-address-book' },
            { id: 'suppliers', label: 'Quản lý TT nhà cung cấp', icon: 'fa-truck-field' },
            { id: 'policies', label: 'Cấu hình quy tắc & chính sách', icon: 'fa-sliders' }
        ]
    },
    'NV_VAN_HANH': {
        title: 'QUẢN LÝ ĐƠN HÀNG',
        roleLabel: 'Nhân viên Vận hành',
        defaultTab: 'ops-orders',
        avatarInitials: 'VH',
        menu: [
            { id: 'ops-orders', label: 'Xử lý đơn hàng', icon: 'fa-clipboard-check' },
            { id: 'ops-labels', label: 'In tem thông tin đơn hàng', icon: 'fa-print' },
            { id: 'ops-tracking', label: 'Theo dõi & cập nhật vận đơn', icon: 'fa-truck-fast' },
            { id: 'ops-returns', label: 'Xử lý khiếu nại & đổi trả', icon: 'fa-arrow-rotate-left' }
        ]
    },
    'NV_KHO': {
        title: 'QUẢN LÝ SẢN PHẨM & KHO',
        roleLabel: 'Thủ kho',
        defaultTab: 'wh-skus',
        avatarInitials: 'TK',
        menu: [
            { id: 'wh-skus', label: 'Quản lý thông tin SKU', icon: 'fa-tags' },
            { id: 'wh-inventory', label: 'Quản lý tồn kho', icon: 'fa-boxes-stacked' },
            { id: 'wh-locations', label: 'Quản lý vị trí lưu kho', icon: 'fa-map-location-dot' },
            { id: 'wh-receipts', label: 'Lập phiếu nhập / xuất kho', icon: 'fa-file-invoice' }
        ]
    }
};

// ----------------- KHỞI CHẠY KHI TẢI TRANG -----------------
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('urban_chic_auth') || sessionStorage.getItem('urban_chic_auth');
    if (saved) {
        try {
            currentUser = JSON.parse(saved);
            renderUserWorkspace(currentUser);
        } catch (e) {
            localStorage.removeItem('urban_chic_auth');
            sessionStorage.removeItem('urban_chic_auth');
        }
    }

    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const account = document.getElementById('login-account').value.trim();
        const password = document.getElementById('login-password').value;
        const remember = document.getElementById('remember-me').checked;
        const errBox = document.getElementById('login-error');
        const errText = document.getElementById('login-error-text');
        errBox.classList.add('hidden');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username_or_email: account, password: password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Đăng nhập không thành công');

            currentUser = data.user;
            if (remember) {
                localStorage.setItem('urban_chic_auth', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('urban_chic_auth', JSON.stringify(currentUser));
            }

            renderUserWorkspace(currentUser);
        } catch (err) {
            errText.textContent = err.message;
            errBox.classList.remove('hidden');
        }
    });

    document.getElementById('form-forgot-pass').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-forgot-password');
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    bindProfileForms();
    bindAdminForms();
    bindOpsForms();
    bindWarehouseForms();
});

function renderUserWorkspace(user) {
    const roleKey = user.role || 'ADMIN';
    const config = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS['ADMIN'];

    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-portal').classList.remove('hidden');

    const displayName = user.name || "Người dùng";
    document.getElementById('user-name-display').textContent = displayName;
    document.getElementById('sidebar-user-name').textContent = displayName;
    document.getElementById('user-role-display').textContent = config.roleLabel;
    document.getElementById('sidebar-role-label').textContent = config.roleLabel;
    document.getElementById('portal-role-sub').textContent = config.title;

    const initials = config.avatarInitials || 'UC';
    document.getElementById('sidebar-avatar-text').textContent = initials;
    document.getElementById('topbar-avatar-text').textContent = initials;

    const navMenu = document.getElementById('sidebar-menu');
    navMenu.innerHTML = config.menu.map(item => `
        <button id="nav-${item.id}" onclick="switchTab('${item.id}')"
            class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-all text-left">
            <i class="fa-solid ${item.icon} w-4 text-center text-sm"></i>
            <span>${item.label}</span>
        </button>
    `).join('');

    switchTab(config.defaultTab);
}

function logout() {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc?")) return;
    localStorage.removeItem('urban_chic_auth');
    sessionStorage.removeItem('urban_chic_auth');
    currentUser = null;
    document.getElementById('main-portal').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('login-password').value = '';
}

function switchTab(tabName) {
    currentTab = tabName;

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('bg-gray-100', 'text-black', 'font-semibold');
        btn.classList.add('text-gray-600', 'font-medium');
    });
    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-600', 'font-medium');
        activeBtn.classList.add('bg-gray-100', 'text-black', 'font-semibold');
        document.getElementById('header-active-title').textContent = activeBtn.innerText.trim();
    }

    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) targetPane.classList.remove('hidden');

    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'employees') loadEmployees();
    else if (tabName === 'customers') loadCustomers();
    else if (tabName === 'vouchers') loadVouchers();
    else if (tabName === 'suppliers') loadSuppliers();
    else if (tabName === 'policies') loadPolicies();
    else if (tabName === 'ops-orders') loadOpsOrders();
    else if (tabName === 'ops-labels') loadOpsLabels();
    else if (tabName === 'ops-tracking') loadOpsTracking();
    else if (tabName === 'ops-returns') loadOpsReturns();
    else if (tabName === 'wh-skus') loadWhSkus();
    else if (tabName === 'wh-inventory') loadWhInventory();
    else if (tabName === 'wh-locations') loadWhLocations();
    else if (tabName === 'wh-receipts') loadWhReceipts();
}

function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('profile-name').value = currentUser.name || "";
    document.getElementById('profile-email').value = currentUser.email || "";
    document.getElementById('profile-phone').value = currentUser.phone || "";
    document.getElementById('pw-old').value = "";
    document.getElementById('pw-new').value = "";
    document.getElementById('pw-confirm').value = "";
    openModal('modal-admin-profile');
}

function bindProfileForms() {
    document.getElementById('form-update-profile').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('profile-name').value.trim();
        const newPhone = document.getElementById('profile-phone').value.trim();
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, ho_ten: newName, so_dien_thoai: newPhone })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            currentUser.name = newName;
            currentUser.phone = newPhone;
            localStorage.setItem('urban_chic_auth', JSON.stringify(currentUser));
            document.getElementById('user-name-display').textContent = newName;
            document.getElementById('sidebar-user-name').textContent = newName;
            alert(data.message);
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-change-password').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldP = document.getElementById('pw-old').value;
        const newP = document.getElementById('pw-new').value;
        const cfmP = document.getElementById('pw-confirm').value;
        if (newP !== cfmP) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id, old_password: oldP, new_password: newP })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-admin-profile');
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });
}


// ==========================================================================
// I. PHÂN HỆ QUẢN TRỊ HỆ THỐNG (ADMIN)
// ==========================================================================

// 1. UC: Xem báo cáo thống kê (Loại báo cáo Doanh thu / Tồn kho + Từ ngày - Đến ngày + Xuất Excel/PDF)
async function loadDashboard() {
    const reportType = document.getElementById('report-type-select')?.value || 'DOANH_THU';
    const startDate = document.getElementById('report-start-date')?.value || '';
    const endDate = document.getElementById('report-end-date')?.value || '';

    try {
        const dashRes = await fetch(`/api/admin/dashboard?report_type=${reportType}&start_date=${startDate}&end_date=${endDate}`);
        const data = await dashRes.json();

        document.getElementById('stat-revenue').textContent = formatVND(data.revenue);
        document.getElementById('stat-profit').textContent = formatVND(data.estimated_profit);
        document.getElementById('stat-orders').textContent = `${data.delivered_orders} / ${data.total_orders} đơn`;
        document.getElementById('stat-returns').textContent = `${data.return_count} Yêu cầu`;

        const thead = document.getElementById('thead-dashboard-report');
        const tbody = document.getElementById('table-top-products');
        const titleEl = document.getElementById('dashboard-table-title');
        const badgeEl = document.getElementById('dashboard-sub-badge');

        if (reportType === 'DOANH_THU') {
            titleEl.textContent = "Báo Cáo Doanh Thu & Lợi Nhuận Gộp Theo Mặt Hàng SKU";
            badgeEl.textContent = `Kỳ báo cáo: ${startDate || 'Đầu kỳ'} → ${endDate || 'Hiện tại'}`;
            const topRes = await fetch('/api/admin/top-products');
            const topProds = await topRes.json();

            thead.innerHTML = `
                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th class="px-6 py-3.5">Mã SKU</th>
                    <th class="px-6 py-3.5">Tên Sản Phẩm</th>
                    <th class="px-6 py-3.5">Danh Mục</th>
                    <th class="px-6 py-3.5">Số Lượng Đã Bán</th>
                    <th class="px-6 py-3.5 text-right">Tổng Doanh Thu</th>
                    <th class="px-6 py-3.5 text-right">Lợi Nhuận Gộp</th>
                </tr>
            `;
            tbody.innerHTML = topProds.map(p => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">${p.MaSKU}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${p.TenSanPham}</td>
                    <td class="px-6 py-4 text-gray-500 text-xs">${p.DanhMuc}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${p.TongSoLuong} chiếc</td>
                    <td class="px-6 py-4 text-right font-bold text-black">${formatVND(p.TongDoanhThu)}</td>
                    <td class="px-6 py-4 text-right font-bold text-emerald-600">${formatVND(p.LoiNhuanGop)}</td>
                </tr>
            `).join('') || `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400">Chưa có dữ liệu doanh thu</td></tr>`;
        } else {
            titleEl.textContent = "Báo Cáo Thống Kê Tình Trạng Tồn Kho & Giá Trị Hàng Tồn";
            badgeEl.textContent = "Đối soát kho thời gian thực";
            const invRes = await fetch('/api/wh/inventory');
            const invList = await invRes.json();

            thead.innerHTML = `
                <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th class="px-6 py-3.5">Mã SKU</th>
                    <th class="px-6 py-3.5">Sản Phẩm & Phân Loại</th>
                    <th class="px-6 py-3.5">Vị Trí Kệ</th>
                    <th class="px-6 py-3.5">Tồn Thực Tế / Khả Dụng</th>
                    <th class="px-6 py-3.5 text-right">Giá Trị Tồn (Theo Giá Vốn)</th>
                    <th class="px-6 py-3.5 text-right">Tình Trạng</th>
                </tr>
            `;
            tbody.innerHTML = invList.map(i => {
                const low = i.SoLuongKhaDung <= i.NguongTonToiThieu;
                return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 font-mono font-bold text-gray-900">${i.MaSKU}</td>
                        <td class="px-6 py-4 font-semibold text-gray-900">${i.TenSanPham} (${i.KichCo}/${i.MauSac})</td>
                        <td class="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">${i.MaViTriKho}</td>
                        <td class="px-6 py-4 font-semibold">${i.SoLuongThucTe} thực tế / <span class="${low ? 'text-red-600' : 'text-emerald-600'} font-bold">${i.SoLuongKhaDung} khả dụng</span></td>
                        <td class="px-6 py-4 text-right font-bold text-gray-900">${formatVND(i.SoLuongThucTe * i.GiaVon)}</td>
                        <td class="px-6 py-4 text-right">
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${low ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                                ${low ? 'Cảnh báo sắp hết' : 'An toàn'}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

function exportReportFile(format) {
    if (format === 'PDF') {
        window.print();
        return;
    }
    const table = document.querySelector('#tab-dashboard table');
    if (!table) return;
    let csv = '\uFEFF';
    for (const row of table.rows) {
        const cells = Array.from(row.cells).map(c => `"${c.innerText.replace(/"/g, '""')}"`);
        csv += cells.join(',') + '\r\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Thong_Ke_UrbanChic_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
}

// 2. UC: Quản lý tài khoản nhân viên & Gửi email thông tin đăng nhập
async function loadEmployees() {
    const q = document.getElementById('emp-search-q')?.value || '';
    const role = document.getElementById('emp-filter-role')?.value || 'TAT_CA';
    try {
        const res = await fetch(`/api/admin/employees?q=${encodeURIComponent(q)}&role=${role}`);
        cachedEmployees = await res.json();
        const tbody = document.getElementById('table-employees');

        const roleLabels = {
            'ADMIN': { text: 'Quản trị viên (Admin)', badge: 'bg-black text-white' },
            'NV_VAN_HANH': { text: 'Nhân viên Vận hành', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
            'NV_KHO': { text: 'Nhân viên Kho (Thủ kho)', badge: 'bg-amber-50 text-amber-800 border border-amber-200' }
        };

        tbody.innerHTML = cachedEmployees.map(u => {
            const r = roleLabels[u.VaiTro] || { text: u.VaiTro, badge: 'bg-gray-100 text-gray-600' };
            const isActive = u.TrangThai === 'HOAT_DONG';

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">#${u.MaNguoiDung}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${u.HoTen}</td>
                    <td class="px-6 py-4 text-gray-600 text-xs">${u.Email}</td>
                    <td class="px-6 py-4 text-gray-600 font-mono text-xs">${u.SoDienThoai || '---'}</td>
                    <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-lg ${r.badge}">${r.text}</span></td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                            ${isActive ? 'Đang hoạt động' : 'Bị khóa'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-1.5">
                        <button onclick="openEditEmployeeModal('${u.MaNguoiDung}')" class="text-xs text-gray-700 hover:text-black font-semibold border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-100">
                            <i class="fa-solid fa-pen-to-square"></i> Sửa/Phân quyền
                        </button>
                        <button onclick="sendEmployeeCredentials('${u.MaNguoiDung}')" class="text-xs text-indigo-600 hover:bg-indigo-50 font-semibold border border-indigo-200 px-2.5 py-1 rounded-lg" title="Gửi email thông tin đăng nhập">
                            <i class="fa-regular fa-envelope"></i> Gửi Mail TK
                        </button>
                        <button onclick="toggleEmployee('${u.MaNguoiDung}')" class="text-xs font-semibold px-2.5 py-1 rounded-lg border ${isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}">
                            ${isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Không tìm thấy nhân viên phù hợp</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function openEditEmployeeModal(empId) {
    const emp = cachedEmployees.find(x => x.MaNguoiDung === empId);
    if (!emp) return;
    document.getElementById('emp-edit-mode').value = 'EDIT';
    document.getElementById('emp-modal-title').textContent = `Cập Nhật & Phân Quyền Nhân Viên #${emp.MaNguoiDung}`;
    document.getElementById('emp-id').value = emp.MaNguoiDung;
    document.getElementById('emp-id').disabled = true;
    document.getElementById('emp-name').value = emp.HoTen;
    document.getElementById('emp-email').value = emp.Email;
    document.getElementById('emp-email').disabled = true;
    document.getElementById('emp-pass-group').classList.add('hidden');
    document.getElementById('emp-phone').value = emp.SoDienThoai || '';
    document.getElementById('emp-role').value = emp.VaiTro;
    openModal('modal-add-employee');
}

async function toggleEmployee(id) {
    if (!confirm("Xác nhận thay đổi trạng thái hoạt động (Khóa / Mở khóa) của tài khoản nhân sự này?")) return;
    const res = await fetch(`/api/admin/employees/${id}/toggle-status`, { method: 'PATCH' });
    const data = await res.json();
    alert(data.message);
    loadEmployees();
}

async function sendEmployeeCredentials(id) {
    const res = await fetch(`/api/admin/employees/${id}/send-credentials`, { method: 'POST' });
    const data = await res.json();
    alert(data.message);
}

// 3. UC: Quản lý thông tin khách hàng (CRM & Blacklist)
async function loadCustomers() {
    const q = document.getElementById('cust-search-q')?.value || '';
    try {
        const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`);
        const list = await res.json();
        const tbody = document.getElementById('table-customers');

        tbody.innerHTML = list.map(c => {
            const isBlacklisted = c.TrangThaiKH === 'BLACKLIST';
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-bold text-gray-900">#${c.MaKhachHang} - ${c.TenKhachHang}</p>
                        <p class="text-xs text-gray-400">Đăng ký: ${c.NgayDangKy || '---'}</p>
                    </td>
                    <td class="px-6 py-4">
                        <p class="font-mono text-xs font-semibold text-gray-800">${c.SoDienThoai}</p>
                        <p class="text-xs text-gray-500">${c.Email || '---'}</p>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">${c.DiaChiGiao || '---'}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${c.TongDonHang} đơn</td>
                    <td class="px-6 py-4 font-bold text-emerald-600">${formatVND(c.TongChiTieu)}</td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}">
                            ${isBlacklisted ? 'Đã chặn (Blacklist)' : 'Đang hoạt động'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-1.5">
                        <button onclick="viewCustomerOrders('${c.MaKhachHang}')" class="text-xs font-semibold text-gray-700 hover:text-black px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-100">
                            <i class="fa-solid fa-clock-rotate-left mr-1"></i> Lịch sử đơn
                        </button>
                        <button onclick="toggleCustomerBlacklist('${c.MaKhachHang}')" class="text-xs font-semibold px-2.5 py-1 border rounded-lg ${isBlacklisted ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' : 'border-red-200 text-red-600 hover:bg-red-50'}">
                            ${isBlacklisted ? 'Gỡ Blacklist' : 'Chặn Blacklist'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Không tìm thấy hồ sơ khách hàng</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function viewCustomerOrders(maKh) {
    try {
        const res = await fetch(`/api/admin/customers/${maKh}/orders`);
        const data = await res.json();
        const c = data.customer;
        const orders = data.orders || [];

        document.getElementById('cust-history-title').textContent = `Lịch Sử Đơn Hàng: ${c.HoTen} (#${c.MaKhachHang})`;
        document.getElementById('cust-history-sub').textContent = `SĐT: ${c.SoDienThoai} | Email: ${c.Email || '---'} | Địa chỉ: ${c.DiaChiMacDinh}`;

        const box = document.getElementById('cust-history-body');
        if (!orders.length) {
            box.innerHTML = `<p class="text-center text-gray-400 py-6 text-sm">Khách hàng này chưa có đơn đặt hàng nào.</p>`;
        } else {
            box.innerHTML = orders.map(o => `
                <div class="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-sm text-black">#${o.MaDonHang}</span>
                            <span class="text-xs px-2 py-0.5 rounded-md bg-gray-200 text-gray-800 font-semibold">${o.TrangThaiDon}</span>
                            <span class="text-xs text-gray-400">${o.NgayDat}</span>
                        </div>
                        <p class="text-xs text-gray-700 mt-1 font-medium">${(o.items || []).map(i => `${i.TenSanPham} (x${i.SoLuongMua})`).join(', ')}</p>
                        <p class="text-[11px] text-gray-500 mt-0.5">Thanh toán: ${o.PhuongThucTT} (${o.TrangThaiTT}) | Vận đơn: ${o.MaVanDon || 'Chưa cấp'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-black text-emerald-600">${formatVND(o.TongThanhToan)}</p>
                    </div>
                </div>
            `).join('');
        }
        openModal('modal-customer-orders');
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

async function toggleCustomerBlacklist(maKh) {
    if (!confirm("Xác nhận thay đổi trạng thái chặn (Blacklist) đối với hồ sơ khách hàng này?")) return;
    const res = await fetch(`/api/admin/customers/${maKh}/toggle-blacklist`, { method: 'PATCH' });
    const data = await res.json();
    alert(data.message);
    loadCustomers();
}

// 4. UC: Quản lý chương trình khuyến mãi (Voucher)
async function loadVouchers() {
    const q = document.getElementById('vouch-search-q')?.value || '';
    const status = document.getElementById('vouch-filter-status')?.value || 'TAT_CA';
    try {
        const res = await fetch(`/api/admin/vouchers?q=${encodeURIComponent(q)}&status=${status}`);
        cachedVouchers = await res.json();
        const tbody = document.getElementById('table-vouchers');

        tbody.innerHTML = cachedVouchers.map(v => {
            const isActive = v.TrangThaiKM === 'DANG_HOAT_DONG';
            const valueStr = v.LoaiGiam === 'PHAN_TRAM' ? `${v.GiaTriGiam}%` : formatVND(v.GiaTriGiam);

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-gray-500">#${v.MaKhuyenMai}</td>
                    <td class="px-6 py-4 font-mono font-bold text-gray-900 text-sm tracking-wider">${v.CodeVoucher}</td>
                    <td class="px-6 py-4 text-gray-600 text-xs">${v.LoaiGiam === 'PHAN_TRAM' ? 'Phần trăm (%)' : 'Tiền mặt (VNĐ)'}</td>
                    <td class="px-6 py-4 font-bold text-black">${valueStr}</td>
                    <td class="px-6 py-4 text-gray-600 text-xs">${formatVND(v.DonToiThieu)}</td>
                    <td class="px-6 py-4 font-semibold text-gray-900">${v.SoLuotDaDung} / ${v.SoLuotToiDa}</td>
                    <td class="px-6 py-4 text-xs text-gray-500">${v.NgayBatDau} → ${v.NgayKetThuc}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
                            ${isActive ? 'Đang chạy' : 'Đã kết thúc/Khóa'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-1.5">
                        <button onclick="openEditVoucherModal('${v.CodeVoucher}')" class="text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100">
                            Sửa
                        </button>
                        <button onclick="toggleVoucher('${v.CodeVoucher}')" class="text-xs font-semibold px-2.5 py-1 rounded-lg border ${isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}">
                            ${isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="9" class="px-6 py-4 text-center text-gray-400">Không có chiến dịch khuyến mãi nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function openEditVoucherModal(code) {
    const v = cachedVouchers.find(x => x.CodeVoucher === code);
    if (!v) return;
    document.getElementById('vouch-edit-mode').value = 'EDIT';
    document.getElementById('vouch-modal-title').textContent = `Cập Nhật Chiến Dịch Voucher [${v.CodeVoucher}]`;
    document.getElementById('vouch-code').value = v.CodeVoucher;
    document.getElementById('vouch-code').disabled = true;
    document.getElementById('vouch-type').value = v.LoaiGiam;
    document.getElementById('vouch-val').value = v.GiaTriGiam;
    document.getElementById('vouch-min').value = v.DonToiThieu;
    document.getElementById('vouch-max').value = v.SoLuotToiDa;
    document.getElementById('vouch-start').value = v.NgayBatDau;
    document.getElementById('vouch-end').value = v.NgayKetThuc;
    openModal('modal-add-voucher');
}

async function toggleVoucher(code) {
    const res = await fetch(`/api/admin/vouchers/${code}/toggle-status`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) {
        alert("Lỗi: " + data.detail);
        return;
    }
    alert(data.message);
    loadVouchers();
}

// 5. UC: Quản lý thông tin nhà cung cấp
async function loadSuppliers() {
    try {
        const res = await fetch('/api/admin/suppliers');
        cachedSuppliers = await res.json();
        const tbody = document.getElementById('table-suppliers');

        tbody.innerHTML = cachedSuppliers.map(s => {
            const isCoop = s.TrangThaiHopTac === 'DANG_HOP_TAC';
            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">#${s.MaNCC}</td>
                    <td class="px-6 py-4 font-bold text-gray-900">${s.TenNCC}</td>
                    <td class="px-6 py-4">
                        <p class="font-semibold text-gray-800 text-xs">${s.NguoiLienHe || '---'}</p>
                        <p class="font-mono text-xs text-gray-500">${s.SoDienThoai}</p>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-600 max-w-xs">
                        <p>${s.EmailNCC || '---'}</p>
                        <p class="truncate text-gray-400">${s.DiaChiNCC || '---'}</p>
                    </td>
                    <td class="px-6 py-4 text-xs">
                        <p class="font-bold text-gray-900">${s.SoPhieuNhap || 0} phiếu nhập</p>
                        <p class="text-emerald-600 font-semibold">${formatVND(s.TongGiaTriNhap)}</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${isCoop ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                            ${isCoop ? 'Đang hợp tác' : 'Đã ngừng hợp tác'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-1.5">
                        <button onclick="openEditSupplierModal('${s.MaNCC}')" class="text-xs font-semibold text-gray-700 px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-100">
                            Sửa
                        </button>
                        <button onclick="toggleSupplierStatus('${s.MaNCC}')" class="text-xs font-semibold px-2.5 py-1 border rounded-lg ${isCoop ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}">
                            ${isCoop ? 'Ngừng hợp tác' : 'Khôi phục hợp tác'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Chưa có nhà cung cấp</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function openEditSupplierModal(maNcc) {
    const s = cachedSuppliers.find(x => x.MaNCC === maNcc);
    if (!s) return;
    document.getElementById('ncc-edit-mode').value = 'EDIT';
    document.getElementById('ncc-modal-title').textContent = `Cập Nhật Nhà Cung Cấp #${s.MaNCC}`;
    document.getElementById('ncc-id').value = s.MaNCC;
    document.getElementById('ncc-id').disabled = true;
    document.getElementById('ncc-name').value = s.TenNCC;
    document.getElementById('ncc-contact').value = s.NguoiLienHe || '';
    document.getElementById('ncc-phone').value = s.SoDienThoai || '';
    document.getElementById('ncc-email').value = s.EmailNCC || '';
    document.getElementById('ncc-addr').value = s.DiaChiNCC || '';
    openModal('modal-add-supplier');
}

async function toggleSupplierStatus(maNcc) {
    if (!confirm("Xác nhận thay đổi trạng thái hợp tác với nhà cung cấp này?")) return;
    const res = await fetch(`/api/admin/suppliers/${maNcc}/toggle-status`, { method: 'PATCH' });
    const data = await res.json();
    alert(data.message);
    loadSuppliers();
}

// 6. UC: Cấu hình các quy tắc và chính sách
async function loadPolicies() {
    try {
        const res = await fetch('/api/admin/policies');
        const p = await res.json();
        if (p) {
            document.getElementById('policy-return-days').value = p.SoNgayDoiTraToiDa;
            document.getElementById('policy-min-stock').value = p.NguongTonKhoToiThieu;
            document.getElementById('policy-ship-fee').value = p.PhiShipMacDinh;
            document.getElementById('policy-freeship').value = p.MocFreeship;
            document.getElementById('policy-api-payment').value = p.ApiKeyThanhToan || 'VNPAY_LIVE_99281_MOMO_8821';
            document.getElementById('policy-api-shipping').value = p.ApiKeyVanChuyen || 'GHN_TOKEN_772910_GHTK_112';
            document.getElementById('policy-api-email').value = p.ApiKeyEmail || 'SG.SendGrid_API_Key_2026_Live';
        }
    } catch (e) {
        console.error(e);
    }
}

function bindAdminForms() {
    // Reset modal state on add buttons
    document.querySelector('button[onclick="openModal(\'modal-add-employee\')"]')?.addEventListener('click', () => {
        document.getElementById('emp-edit-mode').value = 'CREATE';
        document.getElementById('emp-modal-title').textContent = 'Cấp Tài Khoản Nhân Sự & Gửi Email';
        document.getElementById('emp-id').disabled = false;
        document.getElementById('emp-email').disabled = false;
        document.getElementById('emp-pass-group').classList.remove('hidden');
        document.getElementById('form-add-employee').reset();
    });

    document.querySelector('button[onclick="openModal(\'modal-add-voucher\')"]')?.addEventListener('click', () => {
        document.getElementById('vouch-edit-mode').value = 'CREATE';
        document.getElementById('vouch-modal-title').textContent = 'Thiết Lập Chiến Dịch Voucher Mới';
        document.getElementById('vouch-code').disabled = false;
        document.getElementById('form-add-voucher').reset();
    });

    document.querySelector('button[onclick="openModal(\'modal-add-supplier\')"]')?.addEventListener('click', () => {
        document.getElementById('ncc-edit-mode').value = 'CREATE';
        document.getElementById('ncc-modal-title').textContent = 'Thêm Hồ Sơ Nhà Cung Cấp Mới';
        document.getElementById('ncc-id').disabled = false;
        document.getElementById('form-add-supplier').reset();
    });

    document.getElementById('form-add-employee').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('emp-edit-mode').value;
        const empId = document.getElementById('emp-id').value.trim();

        try {
            let res;
            if (mode === 'EDIT') {
                res = await fetch(`/api/admin/employees/${empId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ho_ten: document.getElementById('emp-name').value.trim(),
                        so_dien_thoai: document.getElementById('emp-phone').value.trim(),
                        vai_tro: document.getElementById('emp-role').value
                    })
                });
            } else {
                res = await fetch('/api/admin/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ma_nv: empId,
                        ho_ten: document.getElementById('emp-name').value.trim(),
                        email: document.getElementById('emp-email').value.trim(),
                        mat_khau: document.getElementById('emp-pass').value || '123456',
                        so_dien_thoai: document.getElementById('emp-phone').value.trim(),
                        vai_tro: document.getElementById('emp-role').value
                    })
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-add-employee');
            loadEmployees();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-add-voucher').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('vouch-edit-mode').value;
        const code = document.getElementById('vouch-code').value.trim().toUpperCase();
        const payload = {
            code: code,
            loai_giam: document.getElementById('vouch-type').value,
            gia_tri_giam: parseFloat(document.getElementById('vouch-val').value),
            don_toi_thieu: parseFloat(document.getElementById('vouch-min').value || 0),
            so_luot_toi_da: parseInt(document.getElementById('vouch-max').value || 100),
            ngay_bat_dau: document.getElementById('vouch-start').value,
            ngay_ket_thuc: document.getElementById('vouch-end').value
        };
        try {
            const url = mode === 'EDIT' ? `/api/admin/vouchers/${code}` : '/api/admin/vouchers';
            const method = mode === 'EDIT' ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-add-voucher');
            loadVouchers();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-add-supplier').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('ncc-edit-mode').value;
        const maNcc = document.getElementById('ncc-id').value.trim().toUpperCase();
        const payload = {
            ma_ncc: maNcc,
            ten_ncc: document.getElementById('ncc-name').value.trim(),
            nguoi_lien_he: document.getElementById('ncc-contact').value.trim(),
            so_dien_thoai: document.getElementById('ncc-phone').value.trim(),
            email: document.getElementById('ncc-email').value.trim(),
            dia_chi: document.getElementById('ncc-addr').value.trim()
        };
        try {
            const url = mode === 'EDIT' ? `/api/admin/suppliers/${maNcc}` : '/api/admin/suppliers';
            const method = mode === 'EDIT' ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-add-supplier');
            loadSuppliers();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-policy-config').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            ma_cau_hinh: 'CONFIG01',
            so_ngay_doi_tra: parseInt(document.getElementById('policy-return-days').value),
            nguong_ton_kho: parseInt(document.getElementById('policy-min-stock').value),
            phi_ship: parseFloat(document.getElementById('policy-ship-fee').value),
            moc_freeship: parseFloat(document.getElementById('policy-freeship').value),
            api_key_thanh_toan: document.getElementById('policy-api-payment').value.trim(),
            api_key_van_chuyen: document.getElementById('policy-api-shipping').value.trim(),
            api_key_email: document.getElementById('policy-api-email').value.trim()
        };
        try {
            const res = await fetch('/api/admin/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            loadPolicies();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });
}


// ==========================================================================
// II. PHÂN HỆ NHÂN VIÊN VẬN HÀNH (NV_VAN_HANH)
// ==========================================================================

const ORDER_STATUS_MAP = {
    'CHO_DUYET': { text: 'Chờ duyệt', badge: 'bg-amber-100 text-amber-800' },
    'DANG_DONG_GOI': { text: 'Đang đóng gói', badge: 'bg-blue-100 text-blue-800' },
    'DANG_GIAO': { text: 'Đang giao hàng', badge: 'bg-purple-100 text-purple-800' },
    'HEN_GIAO_LAI': { text: 'Hẹn giao lại', badge: 'bg-orange-100 text-orange-800' },
    'GIAO_THAT_BAI': { text: 'Giao thất bại', badge: 'bg-red-100 text-red-800' },
    'DA_GIAO': { text: 'Đã giao thành công', badge: 'bg-emerald-100 text-emerald-800' },
    'DA_HUY': { text: 'Đã hủy', badge: 'bg-gray-200 text-gray-600' },
    'DOI_TRA': { text: 'Đang đổi trả', badge: 'bg-rose-100 text-rose-800' }
};

function filterOpsOrders(status, btnEl) {
    currentOpsFilter = status;
    document.querySelectorAll('.btn-ops-filter').forEach(btn => {
        btn.classList.remove('bg-black', 'text-white', 'font-semibold');
        btn.classList.add('bg-white', 'text-gray-700', 'font-medium', 'border', 'border-gray-200');
    });
    if (btnEl) {
        btnEl.classList.remove('bg-white', 'text-gray-700', 'font-medium', 'border', 'border-gray-200');
        btnEl.classList.add('bg-black', 'text-white', 'font-semibold');
    }
    loadOpsOrders();
}

// 1. UC: Xử lý đơn hàng
async function loadOpsOrders() {
    const q = document.getElementById('ops-order-search')?.value || '';
    try {
        const res = await fetch(`/api/ops/orders?status=${currentOpsFilter}&q=${encodeURIComponent(q)}`);
        cachedOrders = await res.json();
        const tbody = document.getElementById('table-ops-orders');

        tbody.innerHTML = cachedOrders.map(o => {
            const st = ORDER_STATUS_MAP[o.TrangThaiDon] || { text: o.TrangThaiDon, badge: 'bg-gray-100 text-gray-700' };
            const isBlacklisted = o.TrangThaiKH === 'BLACKLIST';
            const stockBadge = o.du_ton_kho
                ? `<span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"><i class="fa-solid fa-check mr-1"></i>Đủ tồn kho</span>`
                : `<span class="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Thiếu tồn kho</span>`;

            let actionHtml = `
                <button onclick="openOpsOrderDetail('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <i class="fa-regular fa-eye mr-1"></i> Chi tiết & Tồn kho
                </button>
            `;
            if (o.TrangThaiDon === 'CHO_DUYET') {
                actionHtml += `
                    <button onclick="approveOpsOrder('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-lg">
                        <i class="fa-solid fa-check mr-1"></i> Duyệt đơn
                    </button>
                    <button onclick="rejectOpsOrder('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 rounded-lg">
                        Từ chối
                    </button>
                `;
            }

            const itemsStr = (o.items || []).map(i => `${i.TenSanPham} (x${i.SoLuongMua})`).join('<br>');

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4">
                        <p class="font-mono font-bold text-gray-900">#${o.MaDonHang}</p>
                        <p class="text-xs text-gray-400">${o.NgayDat}</p>
                    </td>
                    <td class="px-5 py-4">
                        <div class="flex items-center gap-1.5">
                            <p class="font-bold text-gray-900">${o.TenKhachHang}</p>
                            ${isBlacklisted ? `<span class="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">BLACKLIST</span>` : ''}
                        </div>
                        <p class="font-mono text-xs text-gray-500">${o.SoDienThoai}</p>
                        <p class="text-[11px] text-gray-400 truncate max-w-[200px]" title="${o.DiaChiGiao}">${o.DiaChiGiao}</p>
                    </td>
                    <td class="px-5 py-4 text-xs">
                        <div class="font-medium text-gray-800 mb-1">${itemsStr}</div>
                        ${stockBadge}
                    </td>
                    <td class="px-5 py-4 text-xs">
                        <p class="font-bold text-black text-sm">${formatVND(o.TongThanhToan)}</p>
                        <p class="text-gray-500">${o.PhuongThucTT} (${o.TrangThaiTT === 'DA_THANH_TOAN' ? '<span class="text-emerald-600 font-semibold">Đã TT</span>' : o.TrangThaiTT === 'DA_HOAN_TIEN' ? '<span class="text-rose-600 font-semibold">Đã hoàn tiền</span>' : 'Chưa TT'})</p>
                    </td>
                    <td class="px-5 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${st.badge}">${st.text}</span>
                        ${o.LyDoHuy ? `<p class="text-[11px] text-red-500 mt-1">Lý do: ${o.LyDoHuy}</p>` : ''}
                    </td>
                    <td class="px-5 py-4 text-right space-x-1">
                        ${actionHtml}
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400">Không có đơn hàng nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function openOpsOrderDetail(orderId) {
    try {
        const res = await fetch(`/api/ops/orders/${orderId}`);
        const o = await res.json();
        document.getElementById('detail-order-title').textContent = `Chi Tiết Đơn Hàng #${o.MaDonHang} & Đối Soát Tồn Kho`;
        document.getElementById('detail-order-sub').textContent = `Ngày đặt: ${o.NgayDat} | Trạng thái: ${o.TrangThaiDon}`;

        const itemsRows = (o.items || []).map(i => {
            const enough = i.TonKhaDung >= i.SoLuongMua;
            return `
                <tr class="border-b border-gray-100 text-xs">
                    <td class="py-2.5 font-mono font-bold">${i.MaSKU}</td>
                    <td class="py-2.5 font-semibold">${i.TenSanPham}</td>
                    <td class="py-2.5 font-mono text-indigo-600 font-bold">${i.MaViTriKho}</td>
                    <td class="py-2.5 text-center font-bold">${i.SoLuongMua}</td>
                    <td class="py-2.5 text-center font-bold ${enough ? 'text-emerald-600' : 'text-red-600'}">${i.TonKhaDung}</td>
                    <td class="py-2.5 text-right font-semibold">${enough ? '<span class="text-emerald-600">Đủ hàng</span>' : '<span class="text-red-600">Thiếu hàng!</span>'}</td>
                </tr>
            `;
        }).join('');

        document.getElementById('detail-order-body').innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-xs">
                <div>
                    <p class="font-bold text-gray-500 uppercase mb-1">Thông tin người nhận</p>
                    <p class="font-bold text-sm text-gray-900">${o.TenKhachHang} (${o.SoDienThoai})</p>
                    <p class="text-gray-600 mt-1">Địa chỉ: ${o.DiaChiGiao}</p>
                </div>
                <div>
                    <p class="font-bold text-gray-500 uppercase mb-1">Thanh toán & Vận chuyển</p>
                    <p>Phương thức: <b>${o.PhuongThucTT}</b> (${o.TrangThaiTT})</p>
                    <p>Tổng thanh toán: <b class="text-emerald-600 text-sm">${formatVND(o.TongThanhToan)}</b></p>
                    <p>Mã vận đơn: <b class="font-mono text-indigo-600">${o.MaVanDon || 'Chưa cấp'}</b></p>
                </div>
            </div>
            <div>
                <p class="text-xs font-bold text-gray-700 uppercase mb-2">Bảng đối chiếu số lượng tồn kho của các SKU trong đơn:</p>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                            <th class="py-2">Mã SKU</th>
                            <th class="py-2">Sản Phẩm</th>
                            <th class="py-2">Vị Trí Kệ</th>
                            <th class="py-2 text-center">SL Đặt</th>
                            <th class="py-2 text-center">Tồn Khả Dụng</th>
                            <th class="py-2 text-right">Kết Luận</th>
                        </tr>
                    </thead>
                    <tbody>${itemsRows}</tbody>
                </table>
            </div>
            ${o.TrangThaiDon === 'CHO_DUYET' ? `
                <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button onclick="rejectOpsOrder('${o.MaDonHang}'); closeModal('modal-ops-order-detail');" class="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50">
                        Từ Chối / Hủy Đơn Hàng
                    </button>
                    <button onclick="approveOpsOrder('${o.MaDonHang}'); closeModal('modal-ops-order-detail');" class="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800">
                        Xác Nhận Duyệt Đơn (Chuyển Đóng Gói)
                    </button>
                </div>
            ` : ''}
        `;
        openModal('modal-ops-order-detail');
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

async function approveOpsOrder(orderId) {
    if (!confirm(`Xác nhận DUYỆT đơn hàng #${orderId} và chuyển sang trạng thái Đang đóng gói?`)) return;
    try {
        const res = await fetch(`/api/ops/orders/${orderId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'APPROVE', ma_nv: currentUser ? currentUser.id : 'NV002' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        alert(data.message);
        loadOpsOrders();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

async function rejectOpsOrder(orderId) {
    const reason = prompt(`Nhập lý do TỪ CHỐI / HỦY đơn hàng #${orderId} (VD: Sai số điện thoại, Hết tồn kho...):`, "Thông tin số điện thoại người nhận không liên lạc được");
    if (reason === null) return;
    try {
        const res = await fetch(`/api/ops/orders/${orderId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'REJECT', ly_do: reason, ma_nv: currentUser ? currentUser.id : 'NV002' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        alert(data.message);
        loadOpsOrders();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

// 2. UC: In tem thông tin đơn hàng (Pick-list & Shipping Label)
async function loadOpsLabels() {
    try {
        const res = await fetch('/api/ops/orders');
        const allOrders = await res.json();
        const printable = allOrders.filter(o => ['DANG_DONG_GOI', 'DANG_GIAO', 'DA_GIAO'].includes(o.TrangThaiDon));
        const tbody = document.getElementById('table-ops-labels');

        tbody.innerHTML = printable.map(o => {
            const st = ORDER_STATUS_MAP[o.TrangThaiDon] || { text: o.TrangThaiDon, badge: 'bg-gray-100 text-gray-700' };
            const skuList = (o.items || []).map(i => `<span class="font-mono font-bold">${i.MaSKU}</span> (x${i.SoLuongMua}) - Kệ: <b class="text-indigo-600">${i.MaViTriKho}</b>`).join('<br>');

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">#${o.MaDonHang}</td>
                    <td class="px-6 py-4">
                        <p class="font-mono font-bold text-indigo-600">${o.MaVanDon || 'VNPOST-TEMP'}</p>
                        <p class="text-xs text-gray-500">${o.DonViVanChuyen}</p>
                    </td>
                    <td class="px-6 py-4 text-xs">
                        <p class="font-bold text-gray-900">${o.TenKhachHang} - ${o.SoDienThoai}</p>
                        <p class="text-gray-500">${o.DiaChiGiao}</p>
                    </td>
                    <td class="px-6 py-4 text-xs leading-relaxed">${skuList}</td>
                    <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${st.badge}">${st.text}</span></td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="openPrintPreviewModal('${o.MaDonHang}')" class="px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-semibold shadow-2xs">
                            <i class="fa-solid fa-print mr-1"></i> Xem & In Tem / Pick-list
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400">Chưa có đơn hàng đã duyệt để in tem</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function openPrintPreviewModal(orderId) {
    try {
        const res = await fetch(`/api/ops/orders/${orderId}`);
        const o = await res.json();
        const codAmount = o.PhuongThucTT.toUpperCase().includes('COD') ? o.TongThanhToan : 0;

        const pickRows = (o.items || []).map((i, idx) => `
            <tr class="border-b border-gray-200 text-xs">
                <td class="py-2 px-3">${idx + 1}</td>
                <td class="py-2 px-3 font-mono font-bold">${i.MaSKU}</td>
                <td class="py-2 px-3 font-semibold">${i.TenSanPham}</td>
                <td class="py-2 px-3 font-mono font-bold text-indigo-600">${i.MaViTriKho} (${i.KhuVucKe})</td>
                <td class="py-2 px-3 text-center font-black text-sm">${i.SoLuongMua}</td>
            </tr>
        `).join('');

        document.getElementById('print-label-content').innerHTML = `
            <!-- 1. PHIẾU SOẠN HÀNG (PICK-LIST) CHO THỦ KHO -->
            <div class="border-2 border-dashed border-gray-300 rounded-2xl p-5 bg-gray-50/50">
                <div class="flex justify-between items-start border-b border-gray-200 pb-3 mb-3">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-widest bg-gray-900 text-white px-2.5 py-0.5 rounded">Tài liệu nội bộ kho</span>
                        <h4 class="text-base font-black text-gray-900 mt-1">PHIẾU SOẠN HÀNG (PICK-LIST) - ĐƠN #${o.MaDonHang}</h4>
                    </div>
                    <div class="text-right text-xs text-gray-600">
                        <p>Ngày in: <b>${new Date().toLocaleString('vi-VN')}</b></p>
                        <p>Bàn giao cho: <b>Thủ kho lấy hàng</b></p>
                    </div>
                </div>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-200/70 text-[11px] font-bold uppercase text-gray-700">
                            <th class="py-2 px-3">STT</th>
                            <th class="py-2 px-3">Mã SKU</th>
                            <th class="py-2 px-3">Tên Mặt Hàng & Size/Màu</th>
                            <th class="py-2 px-3">Vị Trí Kệ Lưu Kho</th>
                            <th class="py-2 px-3 text-center">Số Lượng Lấy</th>
                        </tr>
                    </thead>
                    <tbody>${pickRows}</tbody>
                </table>
            </div>

            <!-- 2. TEM VẬN ĐƠN (SHIPPING LABEL) DÁN KIỆN HÀNG -->
            <div class="border-2 border-black rounded-2xl p-6 bg-white">
                <div class="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                    <div>
                        <h3 class="text-xl font-black tracking-wider uppercase">URBAN CHIC® LOGISTICS</h3>
                        <p class="text-xs font-bold text-gray-600">Đối tác vận chuyển: ${o.DonViVanChuyen}</p>
                    </div>
                    <div class="text-right">
                        <div class="inline-block border-2 border-black px-4 py-1 font-mono font-black text-sm tracking-widest bg-gray-100">
                            |||| |||| ||| |||| |||||
                        </div>
                        <p class="font-mono font-bold text-xs mt-1">MÃ VẬN ĐƠN: ${o.MaVanDon || 'GHN884920'}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6 border-b border-gray-300 pb-4 mb-4 text-xs">
                    <div>
                        <p class="font-bold text-gray-500 uppercase">Người gửi:</p>
                        <p class="font-bold text-sm text-black">Kho Trung Tâm Urban Chic®</p>
                        <p>273 An Dương Vương, Quận 5, TP.HCM</p>
                        <p>Hotline: 1900 6868</p>
                    </div>
                    <div>
                        <p class="font-bold text-gray-500 uppercase">Người nhận:</p>
                        <p class="font-black text-base text-black">${o.TenKhachHang} - ${o.SoDienThoai}</p>
                        <p class="font-semibold text-gray-800 mt-0.5">${o.DiaChiGiao}</p>
                    </div>
                </div>

                <div class="flex justify-between items-center">
                    <div class="text-xs">
                        <p class="font-bold text-gray-500 uppercase">Nội dung kiện hàng (Cho xem hàng, không thử):</p>
                        <p class="font-semibold text-gray-900 mt-0.5">${(o.items || []).map(i => `${i.TenSanPham} (x${i.SoLuongMua})`).join(', ')}</p>
                    </div>
                    <div class="text-right border-2 border-black rounded-xl px-4 py-2 bg-gray-50">
                        <p class="text-[10px] font-bold uppercase text-gray-500">Tiền thu hộ (COD):</p>
                        <p class="text-lg font-black text-black">${formatVND(codAmount)}</p>
                    </div>
                </div>
            </div>
        `;
        openModal('modal-print-label');
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

// 3. UC: Theo dõi và cập nhật vận đơn
async function loadOpsTracking() {
    try {
        const res = await fetch('/api/ops/orders');
        const allOrders = await res.json();
        const trackList = allOrders.filter(o => o.TrangThaiDon !== 'CHO_DUYET');
        const tbody = document.getElementById('table-ops-tracking');

        tbody.innerHTML = trackList.map(o => {
            const st = ORDER_STATUS_MAP[o.TrangThaiDon] || { text: o.TrangThaiDon, badge: 'bg-gray-100 text-gray-700' };
            let btns = '';

            if (o.TrangThaiDon === 'DANG_DONG_GOI') {
                btns += `
                    <button onclick="dispatchOrderToCarrier('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">
                        <i class="fa-solid fa-truck-ramp-box mr-1"></i> Bàn Giao ĐVVC
                    </button>
                `;
            }
            if (['DANG_GIAO', 'HEN_GIAO_LAI', 'GIAO_THAT_BAI'].includes(o.TrangThaiDon)) {
                btns += `
                    <button onclick="syncCarrierWebhook('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg" title="Đồng bộ API đối tác vận chuyển">
                        <i class="fa-solid fa-rotate mr-1"></i> Đồng bộ API
                    </button>
                `;
            }
            btns += `
                <button onclick="openTrackingModal('${o.MaDonHang}')" class="px-2.5 py-1 text-xs font-semibold border border-gray-200 text-gray-800 hover:bg-gray-100 rounded-lg">
                    <i class="fa-solid fa-route mr-1"></i> Lộ trình & Cập nhật
                </button>
            `;

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-mono font-bold text-indigo-600">${o.MaVanDon || 'Chưa cấp'}</p>
                        <p class="font-mono text-xs text-gray-500">Đơn: #${o.MaDonHang}</p>
                    </td>
                    <td class="px-6 py-4">
                        <p class="font-bold text-gray-900">${o.TenKhachHang}</p>
                        <p class="font-mono text-xs text-gray-500">${o.SoDienThoai}</p>
                    </td>
                    <td class="px-6 py-4 text-xs font-semibold text-gray-700">${o.DonViVanChuyen}</td>
                    <td class="px-6 py-4 text-xs text-gray-600 max-w-xs">${o.GhiChuVanDon || 'Đang xử lý lộ trình'}</td>
                    <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${st.badge}">${st.text}</span></td>
                    <td class="px-6 py-4 text-right space-x-1">
                        ${btns}
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-400">Chưa có vận đơn nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function dispatchOrderToCarrier(orderId) {
    if (!confirm(`Xác nhận bàn giao kiện hàng #${orderId} cho bưu tá vận chuyển và trừ tồn kho thực tế?`)) return;
    try {
        const res = await fetch(`/api/ops/orders/${orderId}/tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'DISPATCH', ma_nv: currentUser ? currentUser.id : 'NV002' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        alert(data.message);
        loadOpsTracking();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

async function syncCarrierWebhook(orderId) {
    try {
        const res = await fetch(`/api/ops/orders/${orderId}/tracking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SYNC_WEBHOOK', ma_nv: currentUser ? currentUser.id : 'NV002' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        alert(data.message);
        loadOpsTracking();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

async function openTrackingModal(orderId) {
    try {
        const res = await fetch(`/api/ops/orders/${orderId}`);
        const o = await res.json();
        document.getElementById('tracking-order-id').value = o.MaDonHang;
        document.getElementById('tracking-modal-title').textContent = `Lộ Trình Vận Đơn ${o.MaVanDon || ''} (Đơn #${o.MaDonHang})`;
        document.getElementById('tracking-modal-sub').textContent = `Đối tác: ${o.DonViVanChuyen} | Người nhận: ${o.TenKhachHang} (${o.SoDienThoai})`;

        const steps = (o.LichSuHanhTrinh || 'Khởi tạo đơn hàng').split('|').map(s => s.trim()).filter(Boolean);
        document.getElementById('tracking-timeline-box').innerHTML = steps.reverse().map((step, i) => `
            <div class="flex items-start gap-2.5 ${i === 0 ? 'text-black font-bold' : 'text-gray-500'}">
                <span class="w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                <span>${step}</span>
            </div>
        `).join('');

        document.getElementById('tracking-new-status').value = ['DANG_GIAO', 'HEN_GIAO_LAI', 'GIAO_THAT_BAI', 'DA_GIAO'].includes(o.TrangThaiDon) ? o.TrangThaiDon : 'DANG_GIAO';
        document.getElementById('tracking-incident-note').value = o.GhiChuVanDon || '';
        openModal('modal-ops-tracking');
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

// 4. UC: Xử lý khiếu nại và đổi trả
async function loadOpsReturns() {
    try {
        const res = await fetch('/api/ops/returns');
        cachedReturns = await res.json();
        const tbody = document.getElementById('table-ops-returns');

        const statusMap = {
            'CHO_TIEP_NHAN': { text: 'Chờ thẩm định', badge: 'bg-amber-100 text-amber-800' },
            'DA_CHAP_NHAN': { text: 'Đã duyệt đổi trả', badge: 'bg-emerald-100 text-emerald-800' },
            'TU_CHOI': { text: 'Đã từ chối', badge: 'bg-red-100 text-red-800' }
        };

        tbody.innerHTML = cachedReturns.map(r => {
            const st = statusMap[r.TrangThaiYC] || { text: r.TrangThaiYC, badge: 'bg-gray-100 text-gray-700' };
            const isBlacklisted = r.TrangThaiKH === 'BLACKLIST';
            const policyCheck = r.QuaHanDoiTra
                ? `<span class="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold text-[11px]">Quá hạn (${r.SoNgayTuLucMua}/${r.SoNgayDoiTraToiDa} ngày)</span>`
                : `<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Trong hạn (${r.SoNgayTuLucMua}/${r.SoNgayDoiTraToiDa} ngày)</span>`;

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4">
                        <p class="font-mono font-bold text-gray-900">#${r.MaYeuCau}</p>
                        <p class="font-mono text-xs text-indigo-600 font-semibold">Đơn gốc: #${r.MaDonHang}</p>
                    </td>
                    <td class="px-5 py-4">
                        <div class="flex items-center gap-1.5">
                            <p class="font-bold text-gray-900">${r.KhachHang}</p>
                            ${isBlacklisted ? `<span class="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">BLACKLIST</span>` : ''}
                        </div>
                        <p class="font-mono text-xs text-gray-500">${r.SoDienThoai || '---'}</p>
                    </td>
                    <td class="px-5 py-4 text-xs max-w-xs">
                        <p class="text-gray-800 font-medium">${r.LyDoDoiTra}</p>
                        ${r.HinhAnhMinhChung ? `<a href="${r.HinhAnhMinhChung}" target="_blank" class="text-indigo-600 underline font-semibold mt-1 inline-block"><i class="fa-regular fa-image mr-1"></i>Xem ảnh minh chứng</a>` : ''}
                    </td>
                    <td class="px-5 py-4 text-xs">
                        ${policyCheck}
                        <p class="text-[11px] text-gray-400 mt-1">Gửi: ${r.NgayGuiYeuCau}</p>
                    </td>
                    <td class="px-5 py-4 text-xs">
                        <p class="font-semibold text-gray-900">${r.PhuongAnXuLy || 'Chờ thẩm định'}</p>
                        ${r.MaVanDonThuHoi ? `<p class="font-mono text-[11px] text-indigo-600 font-bold mt-0.5">Mã thu hồi: ${r.MaVanDonThuHoi}</p>` : ''}
                    </td>
                    <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${st.badge}">${st.text}</span></td>
                    <td class="px-5 py-4 text-right">
                        <button onclick="openReturnDetailModal('${r.MaYeuCau}')" class="px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-semibold">
                            <i class="fa-solid fa-magnifying-glass-check mr-1"></i> Thẩm định
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Không có yêu cầu khiếu nại / đổi trả nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function openReturnDetailModal(maYc) {
    const r = cachedReturns.find(x => x.MaYeuCau === maYc);
    if (!r) return;
    document.getElementById('return-modal-id').value = r.MaYeuCau;
    document.getElementById('return-note').value = r.GhiChuXuLy || 'Đã kiểm tra hình ảnh minh chứng hợp lệ';

    document.getElementById('return-detail-info').innerHTML = `
        <div class="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5">
            <p><b>Mã yêu cầu:</b> #${r.MaYeuCau} | <b>Đơn hàng gốc:</b> #${r.MaDonHang} (${formatVND(r.TongThanhToan)})</p>
            <p><b>Khách hàng:</b> ${r.KhachHang} (${r.SoDienThoai}) ${r.TrangThaiKH === 'BLACKLIST' ? '<b class="text-red-600">[CẢNH BÁO: KHÁCH THUỘC BLACKLIST]</b>' : ''}</p>
            <p><b>Lý do khiếu nại:</b> ${r.LyDoDoiTra}</p>
            <p><b>Kiểm tra hạn đổi trả:</b> ${r.SoNgayTuLucMua} ngày kể từ lúc mua (Tối đa cho phép: ${r.SoNgayDoiTraToiDa} ngày)</p>
            ${r.HinhAnhMinhChung ? `<div class="pt-2"><img src="${r.HinhAnhMinhChung}" class="h-28 rounded-xl object-cover border border-gray-200" alt="Ảnh minh chứng"></div>` : ''}
        </div>
    `;
    openModal('modal-ops-return-detail');
}

function bindOpsForms() {
    document.getElementById('form-update-tracking').addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderId = document.getElementById('tracking-order-id').value;
        try {
            const res = await fetch(`/api/ops/orders/${orderId}/tracking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'UPDATE_STATUS',
                    trang_thai_moi: document.getElementById('tracking-new-status').value,
                    ghi_chu_su_co: document.getElementById('tracking-incident-note').value.trim(),
                    ma_nv: currentUser ? currentUser.id : 'NV002'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-ops-tracking');
            loadOpsTracking();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-process-return').addEventListener('submit', async (e) => {
        e.preventDefault();
        const returnId = document.getElementById('return-modal-id').value;
        try {
            const res = await fetch(`/api/ops/returns/${returnId}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: document.getElementById('return-decision').value,
                    phuong_an: document.getElementById('return-resolution').value,
                    ghi_chu: document.getElementById('return-note').value.trim(),
                    ma_nv: currentUser ? currentUser.id : 'NV002'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-ops-return-detail');
            loadOpsReturns();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });
}


// ==========================================================================
// III. PHÂN HỆ NHÂN VIÊN KHO / THỦ KHO (NV_KHO)
// ==========================================================================

// 1. UC: Quản lý thông tin SKU (Bộ từ điển dữ liệu sản phẩm)
async function loadWhSkus() {
    const q = document.getElementById('sku-dict-search')?.value || '';
    try {
        const res = await fetch(`/api/wh/skus?q=${encodeURIComponent(q)}`);
        cachedSkus = await res.json();
        const tbody = document.getElementById('table-wh-skus');

        tbody.innerHTML = cachedSkus.map(s => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-gray-900">${s.MaSKU}</td>
                <td class="px-6 py-4">
                    <p class="font-bold text-gray-900">${s.TenSanPham}</p>
                    <p class="text-xs text-gray-500">Phân loại: ${s.DanhMuc} (#${s.MaSanPham})</p>
                </td>
                <td class="px-6 py-4 text-xs font-semibold text-gray-800">Size ${s.KichCo} / Màu ${s.MauSac}</td>
                <td class="px-6 py-4 font-mono text-xs text-gray-600"><i class="fa-solid fa-barcode mr-1"></i>${s.MaVachBarcode || '---'}</td>
                <td class="px-6 py-4 font-semibold text-gray-700">${formatVND(s.GiaVon)}</td>
                <td class="px-6 py-4 font-bold text-black">${formatVND(s.GiaBanSKU)}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openEditSkuModal('${s.MaSKU}')" class="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-800">
                        <i class="fa-solid fa-pen mr-1"></i> Sửa thuộc tính
                    </button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Không tìm thấy mã SKU nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function openCreateSkuModal() {
    try {
        const res = await fetch('/api/products');
        const prods = await res.json();
        const sel = document.getElementById('sku-prod-id');
        sel.innerHTML = prods.map(p => `<option value="${p.MaSanPham}">${p.MaSanPham} - ${p.TenSanPham} (${p.DanhMuc})</option>`).join('');

        document.getElementById('sku-edit-mode').value = 'CREATE';
        document.getElementById('sku-modal-title').textContent = 'Khởi Tạo Mã Biến Thể SKU Mới';
        document.getElementById('sku-code').disabled = false;
        document.getElementById('sku-prod-group').classList.remove('hidden');
        document.getElementById('sku-rack-group').classList.remove('hidden');
        document.getElementById('form-add-sku').reset();
        openModal('modal-add-sku');
    } catch (e) {
        alert("Lỗi: " + e.message);
    }
}

function openEditSkuModal(maSku) {
    const s = cachedSkus.find(x => x.MaSKU === maSku);
    if (!s) return;
    document.getElementById('sku-edit-mode').value = 'EDIT';
    document.getElementById('sku-modal-title').textContent = `Cập Nhật Thuộc Tính SKU [${s.MaSKU}]`;
    document.getElementById('sku-code').value = s.MaSKU;
    document.getElementById('sku-code').disabled = true;
    document.getElementById('sku-prod-group').classList.add('hidden');
    document.getElementById('sku-rack-group').classList.add('hidden');
    document.getElementById('sku-size').value = s.KichCo;
    document.getElementById('sku-color').value = s.MauSac;
    document.getElementById('sku-barcode').value = s.MaVachBarcode || '';
    document.getElementById('sku-cost').value = s.GiaVon;
    document.getElementById('sku-price').value = s.GiaBanSKU;
    document.getElementById('sku-min-stock').value = s.NguongTonToiThieu;
    openModal('modal-add-sku');
}

// 2. UC: Quản lý tồn kho
async function loadWhInventory() {
    const q = document.getElementById('wh-inv-search')?.value || '';
    try {
        const res = await fetch(`/api/wh/inventory?q=${encodeURIComponent(q)}`);
        cachedInventory = await res.json();
        const tbody = document.getElementById('table-wh-inventory');

        tbody.innerHTML = cachedInventory.map(item => {
            const isOut = item.SoLuongKhaDung <= 0;
            const isLow = item.SoLuongKhaDung <= item.NguongTonToiThieu;

            let statusHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Đang mở bán (An toàn)</span>`;
            if (isOut) {
                statusHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white"><i class="fa-solid fa-eye-slash mr-1"></i>Đã ẩn/Khóa đặt trên Web (Tồn = 0)</span>`;
            } else if (isLow) {
                statusHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Cảnh báo chạm mức tối thiểu</span>`;
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4">
                        <p class="font-mono font-bold text-gray-900">${item.MaSKU}</p>
                        <p class="text-xs font-semibold text-gray-700">${item.TenSanPham}</p>
                        <p class="font-mono text-[11px] text-indigo-600">Vị trí: ${item.MaViTriKho}</p>
                    </td>
                    <td class="px-5 py-4 text-xs font-semibold text-gray-800">${item.KichCo} / ${item.MauSac}</td>
                    <td class="px-5 py-4 text-xs">
                        <p class="text-gray-500">Vốn: <b>${formatVND(item.GiaVon)}</b></p>
                        <p class="text-black font-bold">Bán: ${formatVND(item.GiaBanSKU)}</p>
                    </td>
                    <td class="px-5 py-4 font-semibold text-gray-900">${item.SoLuongThucTe}</td>
                    <td class="px-5 py-4 text-amber-700 font-semibold">${item.SoLuongTamGiu}</td>
                    <td class="px-5 py-4 font-black text-base ${isLow ? 'text-red-600' : 'text-emerald-600'}">${item.SoLuongKhaDung}</td>
                    <td class="px-5 py-4 font-mono text-xs text-gray-600">${item.NguongTonToiThieu} chiếc</td>
                    <td class="px-5 py-4">${statusHtml}</td>
                    <td class="px-5 py-4 text-right">
                        <button onclick="openStockConfigModal('${item.MaSKU}')" class="px-2.5 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-800">
                            <i class="fa-solid fa-sliders mr-1"></i> Giá & Định mức
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="9" class="px-5 py-4 text-center text-gray-400">Không tìm thấy SKU khớp từ khóa</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function openStockConfigModal(maSku) {
    const item = cachedInventory.find(x => x.MaSKU === maSku);
    if (!item) return;
    document.getElementById('stock-cfg-sku').value = item.MaSKU;
    document.getElementById('stock-cfg-title').textContent = `Cập Nhật Tồn Kho: ${item.MaSKU}`;
    document.getElementById('stock-cfg-cost').value = item.GiaVon;
    document.getElementById('stock-cfg-price').value = item.GiaBanSKU;
    document.getElementById('stock-cfg-min').value = item.NguongTonToiThieu;
    openModal('modal-stock-config');
}

// 3. UC: Quản lý vị trí lưu kho
async function loadWhLocations() {
    try {
        const res = await fetch('/api/wh/locations');
        cachedLocations = await res.json();
        const tbody = document.getElementById('table-wh-locations');

        tbody.innerHTML = cachedLocations.map(loc => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-indigo-600">${loc.MaViTriKho}</td>
                <td class="px-6 py-4 font-semibold text-gray-900">${loc.KhuVuc || 'Khu A'}</td>
                <td class="px-6 py-4 text-gray-700">${loc.Tang || 'Tầng 1'}</td>
                <td class="px-6 py-4 font-semibold text-gray-800">${loc.KeHang || 'Kệ A1'}</td>
                <td class="px-6 py-4">
                    ${loc.MaSKU ? `<span class="font-mono font-bold text-black">${loc.MaSKU}</span> <span class="text-xs text-gray-500">- ${loc.TenSanPham || ''} (${loc.KichCo || ''}/${loc.MauSac || ''})</span>` : '<span class="text-xs text-gray-400 italic">Kệ trống (Chưa phân bổ SKU)</span>'}
                </td>
                <td class="px-6 py-4 font-bold text-gray-900">${loc.SoLuongThucTe || 0} chiếc</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="openLocationModal('${loc.MaViTriKho}')" class="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-800">
                        <i class="fa-solid fa-pen-to-square mr-1"></i> Cập nhật / Gán SKU
                    </button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Chưa có sơ đồ vị trí kệ</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

async function openLocationModal(maViTri = null) {
    const skuRes = await fetch('/api/wh/skus');
    const skus = await skuRes.json();
    const sel = document.getElementById('loc-sku-select');
    sel.innerHTML = `<option value="">-- Kệ trống (Chưa gắn SKU) --</option>` + skus.map(s => `
        <option value="${s.MaSKU}">${s.MaSKU} - ${s.TenSanPham} (${s.KichCo}/${s.MauSac})</option>
    `).join('');

    if (maViTri) {
        const loc = cachedLocations.find(x => x.MaViTriKho === maViTri);
        if (!loc) return;
        document.getElementById('loc-edit-mode').value = 'EDIT';
        document.getElementById('loc-modal-title').textContent = `Cập Nhật Vị Trí Kệ [${loc.MaViTriKho}]`;
        document.getElementById('loc-id').value = loc.MaViTriKho;
        document.getElementById('loc-id').disabled = true;
        document.getElementById('loc-area').value = loc.KhuVuc || 'Khu A';
        document.getElementById('loc-floor').value = loc.Tang || 'Tầng 1';
        document.getElementById('loc-rack').value = loc.KeHang || 'Kệ A1';
        sel.value = loc.MaSKU || '';
    } else {
        document.getElementById('loc-edit-mode').value = 'CREATE';
        document.getElementById('loc-modal-title').textContent = 'Thêm Mới Vị Trí Lưu Kho';
        document.getElementById('loc-id').disabled = false;
        document.getElementById('form-wh-location').reset();
    }
    openModal('modal-wh-location');
}

// 4 & 5. UC: Lập phiếu nhập kho & Lập phiếu xuất kho
function filterWhReceipts(type, btnEl) {
    currentWhReceiptFilter = type;
    document.querySelectorAll('.btn-wh-filter').forEach(btn => {
        btn.classList.remove('bg-black', 'text-white', 'font-semibold');
        btn.classList.add('bg-white', 'text-gray-700', 'font-medium', 'border', 'border-gray-200');
    });
    if (btnEl) {
        btnEl.classList.remove('bg-white', 'text-gray-700', 'font-medium', 'border', 'border-gray-200');
        btnEl.classList.add('bg-black', 'text-white', 'font-semibold');
    }
    loadWhReceipts();
}

async function loadWhReceipts() {
    try {
        const res = await fetch(`/api/wh/receipts?loai_phieu=${currentWhReceiptFilter}`);
        const list = await res.json();
        const tbody = document.getElementById('table-wh-receipts');

        tbody.innerHTML = list.map(r => {
            const isImport = r.LoaiPhieu === 'NHAP_KHO';
            const partnerInfo = isImport
                ? `<p class="font-bold text-gray-900">${r.TenNCC || r.MaNCC}</p><p class="text-[11px] text-gray-500">Nhà cung cấp hàng hóa</p>`
                : `<p class="font-bold text-gray-900">${r.DoiTuongNhan || 'Bộ phận Đóng gói'}</p><p class="text-[11px] text-indigo-600">${r.LyDoXuat || 'Xuất kho nội bộ'}</p>`;

            const itemsStr = (r.items || []).map(i => `<span class="font-mono font-bold">${i.MaSKU}</span>: ${i.SoLuong} chiếc x ${formatVND(i.DonGia)}`).join('<br>');

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-gray-900">#${r.MaPhieuKho}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isImport ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                            ${isImport ? '<i class="fa-solid fa-arrow-down mr-1"></i> Phiếu Nhập Kho' : '<i class="fa-solid fa-arrow-up mr-1"></i> Phiếu Xuất Kho'}
                        </span>
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 text-xs">${r.TenNVKho || 'Thủ kho'}</td>
                    <td class="px-6 py-4 text-xs">${partnerInfo}</td>
                    <td class="px-6 py-4 text-xs leading-relaxed">${itemsStr}</td>
                    <td class="px-6 py-4 font-bold text-black text-sm">${formatVND(r.TongGiaTri)}</td>
                    <td class="px-6 py-4 text-xs">
                        <p class="text-gray-500">${r.NgayLapPhieu}</p>
                        <p class="text-gray-700 font-medium mt-0.5">${r.GhiChu || '---'}</p>
                    </td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-400">Chưa có chứng từ xuất nhập kho nào</td></tr>`;
    } catch (e) {
        console.error(e);
    }
}

function updateReceiptTotalPreview() {
    const qty = parseInt(document.getElementById('receipt-qty')?.value || 0);
    const price = parseFloat(document.getElementById('receipt-unit-price')?.value || 0);
    document.getElementById('receipt-total-preview').textContent = formatVND(qty * price);
}

async function openCreateReceiptModal(type) {
    const isImport = type === 'NHAP_KHO';
    document.getElementById('receipt-type').value = type;
    document.getElementById('receipt-code').value = '';
    document.getElementById('receipt-modal-title').textContent = isImport
        ? 'Lập Phiếu Nhập Kho (Nhập Hàng Từ Nhà Cung Cấp)'
        : 'Lập Phiếu Xuất Kho (Bàn Giao Đóng Gói / Xuất Hàng)';
    document.getElementById('receipt-submit-btn').textContent = isImport
        ? 'Xác Nhận Lưu & Cộng Tồn Kho'
        : 'Xác Nhận Lưu & Khấu Trừ Tồn Kho';

    if (isImport) {
        document.getElementById('receipt-ncc-group').classList.remove('hidden');
        document.getElementById('receipt-export-reason-group').classList.add('hidden');
        document.getElementById('receipt-receiver-group').classList.add('hidden');
    } else {
        document.getElementById('receipt-ncc-group').classList.add('hidden');
        document.getElementById('receipt-export-reason-group').classList.remove('hidden');
        document.getElementById('receipt-receiver-group').classList.remove('hidden');
    }

    try {
        const [skuRes, nccRes] = await Promise.all([
            fetch('/api/wh/skus'),
            fetch('/api/admin/suppliers')
        ]);
        const skus = await skuRes.json();
        const nccs = await nccRes.json();

        document.getElementById('receipt-sku').innerHTML = skus.map(s => `
            <option value="${s.MaSKU}" data-cost="${s.GiaVon}">${s.MaSKU} - ${s.TenSanPham} (${s.KichCo}/${s.MauSac}) [Khả dụng: ${s.SoLuongKhaDung}]</option>
        `).join('');

        document.getElementById('receipt-ncc').innerHTML = nccs.map(n => `
            <option value="${n.MaNCC}">${n.TenNCC} (${n.TrangThaiHopTac === 'DANG_HOP_TAC' ? 'Đang hợp tác' : 'NGỪNG HỢP TÁC'})</option>
        `).join('');

        if (skus.length > 0) {
            document.getElementById('receipt-unit-price').value = skus[0].GiaVon || 200000;
        }
        updateReceiptTotalPreview();
        openModal('modal-create-receipt');
    } catch (err) {
        alert("Lỗi tải dữ liệu: " + err.message);
    }
}

function bindWarehouseForms() {
    document.getElementById('receipt-sku')?.addEventListener('change', (e) => {
        const opt = e.target.selectedOptions[0];
        if (opt && opt.dataset.cost) {
            document.getElementById('receipt-unit-price').value = opt.dataset.cost;
            updateReceiptTotalPreview();
        }
    });

    document.getElementById('form-add-sku').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('sku-edit-mode').value;
        const maSku = document.getElementById('sku-code').value.trim().toUpperCase();

        try {
            let res;
            if (mode === 'EDIT') {
                res = await fetch(`/api/wh/skus/${maSku}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        kich_co: document.getElementById('sku-size').value.trim(),
                        mau_sac: document.getElementById('sku-color').value.trim(),
                        barcode: document.getElementById('sku-barcode').value.trim(),
                        gia_von: parseFloat(document.getElementById('sku-cost').value),
                        gia_ban: parseFloat(document.getElementById('sku-price').value),
                        nguong_canh_bao: parseInt(document.getElementById('sku-min-stock').value || 5)
                    })
                });
            } else {
                res = await fetch('/api/wh/skus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ma_sku: maSku,
                        ma_sp: document.getElementById('sku-prod-id').value,
                        kich_co: document.getElementById('sku-size').value.trim(),
                        mau_sac: document.getElementById('sku-color').value.trim(),
                        barcode: document.getElementById('sku-barcode').value.trim(),
                        gia_von: parseFloat(document.getElementById('sku-cost').value),
                        gia_ban: parseFloat(document.getElementById('sku-price').value),
                        nguong_canh_bao: parseInt(document.getElementById('sku-min-stock').value || 5),
                        ma_vi_tri: document.getElementById('sku-rack').value.trim()
                    })
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-add-sku');
            loadWhSkus();
            loadWhInventory();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-stock-config').addEventListener('submit', async (e) => {
        e.preventDefault();
        const maSku = document.getElementById('stock-cfg-sku').value;
        try {
            const res = await fetch(`/api/wh/inventory/${maSku}/stock-config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gia_von: parseFloat(document.getElementById('stock-cfg-cost').value),
                    gia_ban: parseFloat(document.getElementById('stock-cfg-price').value),
                    nguong_ton_toi_thieu: parseInt(document.getElementById('stock-cfg-min').value)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-stock-config');
            loadWhInventory();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-wh-location').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('loc-edit-mode').value;
        const maVt = document.getElementById('loc-id').value.trim().toUpperCase();
        const payload = {
            ma_vi_tri: maVt,
            khu_vuc: document.getElementById('loc-area').value.trim(),
            tang: document.getElementById('loc-floor').value.trim(),
            ke_hang: document.getElementById('loc-rack').value.trim(),
            ma_sku: document.getElementById('loc-sku-select').value || null
        };
        try {
            const url = mode === 'EDIT' ? `/api/wh/locations/${maVt}` : '/api/wh/locations';
            const method = mode === 'EDIT' ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-wh-location');
            loadWhLocations();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });

    document.getElementById('form-create-receipt').addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('receipt-type').value;
        const payload = {
            ma_phieu: document.getElementById('receipt-code').value.trim() || null,
            loai_phieu: type,
            ma_ncc: type === 'NHAP_KHO' ? document.getElementById('receipt-ncc').value : null,
            ly_do_xuat: type === 'XUAT_KHO' ? document.getElementById('receipt-export-reason').value : "",
            doi_tuong_nhan: type === 'XUAT_KHO' ? (document.getElementById('receipt-receiver').value.trim() || "Bộ phận Đóng gói") : "Kho Trung Tâm",
            ma_nv: currentUser ? currentUser.id : 'NV003',
            ten_nv: currentUser ? currentUser.name : 'Lê Văn Hùng',
            ghi_chu: document.getElementById('receipt-note').value.trim(),
            chi_tiet: [{
                ma_sku: document.getElementById('receipt-sku').value,
                so_luong: parseInt(document.getElementById('receipt-qty').value),
                don_gia: parseFloat(document.getElementById('receipt-unit-price').value),
                ma_vi_tri: "KE-A1-T1"
            }]
        };
        try {
            const res = await fetch('/api/wh/receipts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            alert(data.message);
            closeModal('modal-create-receipt');
            loadWhReceipts();
            loadWhInventory();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    });
}
