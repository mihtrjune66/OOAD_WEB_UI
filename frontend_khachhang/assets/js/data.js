/* =====================================================================
 * URBAN CHIC® – PHÂN HỆ 1: QUẢN LÝ MUA SẮM ONLINE (KHÁCH HÀNG)
 * Dữ liệu mẫu – đồng bộ mã SP / SKU / Voucher / trạng thái đơn với phần
 * Admin (github.com/mihtrjune66/OOAD_WEB_UI – backend_admin/database.py)
 * và tài liệu đồ án (BTH2 mô tả dự án, BTH4 Use case, BTH5–7 đặc tả,
 * sequence, activity).
 *
 * TÀI KHOẢN DEMO (chỉ để chạy thử & chụp màn hình đồ án):
 *   - minhquan / Demo@123  Nguyễn Minh Quân – có sẵn đơn hàng, giỏ, yêu thích
 *   - thuha    / Demo@123  Phạm Thu Hà
 *   - vankiet  / Demo@123  Tài khoản BỊ KHÓA (luồng phụ UC02 Đăng nhập)
 * ===================================================================== */

const IMG = (id, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=75`;

/* Ngày giờ mẫu tính tương đối theo thời điểm chạy để demo luôn hợp lệ
 * (hạn đổi trả 7 ngày, hạn liên kết khôi phục mật khẩu...). */
const pad2 = (n) => String(n).padStart(2, '0');
const isoLocal = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
const T = (daysAgo, hh, mm = 0) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hh, mm, 0, 0); return isoLocal(d); };
const H = (hoursAgo) => isoLocal(new Date(Date.now() - hoursAgo * 3600e3));

const SIZES = ['S', 'M', 'L', 'XL'];

window.SEED = {
  /* CHINH_SACH_HE_THONG (Admin cấu hình) */
  policy: { phiShipNoiThanh: 30000, phiShipTinh: 40000, mocFreeship: 500000, soNgayDoiTra: 7, hanLinkKhoiPhucPhut: 15 },

  categories: [
    { name: 'Áo thun', cover: '1581655353564-df123a1eb820' },
    { name: 'Áo Polo', cover: '1586363104862-3a5e2ab60d99' },
    { name: 'Hoodie & Sweater', cover: '1556821840-3a63f95609a7' },
    { name: 'Áo sơ mi', cover: '1611312449412-6cefac5dc3e4' },
    { name: 'Áo khoác', cover: '1617114919297-3c8ddb01f599' },
    { name: 'Quần Shorts', cover: '1576995853123-5a10305d93c0' },
    { name: 'Quần dài', cover: '1552902865-b72c031ac5ea' },
  ],

  banners: {
    hero: '1512436991641-6745cdb1723f',
    hero2: '1516826957135-700dedea698c',
    store: '1560243563-062bfc001d68',
    lookbook: '1617137968427-85924c800a22',
    auth: '1490481651871-ab68de25d43d',
  },

  /* SAN_PHAM + BIEN_THE_SKU  (mã SKU = SKU-{code}-{mã màu}-{size}) */
  products: [
    {
      id: 'SP001', code: 'AK01', name: 'Áo Khoác Kaki Basic', cat: 'Áo khoác', price: 450000,
      promo: { percent: 15, label: 'Ưu đãi Thu Đông', start: '2026-11-01', end: '2027-01-31', cond: 'Giảm trực tiếp 15% cho mọi màu/size, không cộng dồn với chương trình giảm giá trực tiếp khác.' },
      images: ['1617114919297-3c8ddb01f599'],
      colors: [{ name: 'Đen', code: 'DEN', hex: '#111827' }, { name: 'Kem', code: 'KEM', hex: '#EDE4D3' }],
      sizes: SIZES, defaultStock: 15, stock: { 'DEN-L': 23, 'KEM-M': 14, 'KEM-S': 0 },
      rating: 4.8, reviews: 126, sold: 842,
      desc: 'Áo khoác kaki dáng suông basic, cổ bẻ, hai túi hộp phía trước. Dễ phối cùng áo thun, sơ mi và quần jeans cho phong cách thành thị thanh lịch.',
      material: '100% Cotton Kaki 2 da, độ dày vừa phải, giữ form tốt.',
    },
    {
      id: 'SP002', code: 'AK02', name: 'Áo Khoác Bomber', cat: 'Áo khoác', price: 520000,
      promo: { percent: 10, label: 'Flash Sale cuối tuần', start: '2026-11-10', end: '2027-01-15', cond: 'Giảm trực tiếp 10%, số lượng có hạn.' },
      images: ['1591047139829-d91aecb6caea'],
      colors: [{ name: 'Nâu Bò', code: 'NAU', hex: '#9A5B3C' }, { name: 'Rêu', code: 'REU', hex: '#4B5D3A' }],
      sizes: SIZES, defaultStock: 10, stock: { 'REU-XL': 12, 'NAU-S': 0 },
      rating: 4.7, reviews: 88, sold: 515,
      desc: 'Bomber cổ điển với bo tay, bo gấu và khóa kéo kim loại. Lớp lót mỏng thoáng khí, phù hợp thời tiết se lạnh.',
      material: 'Polyester cao cấp chống gió nhẹ, lót lưới thoáng khí.',
    },
    {
      id: 'SP003', code: 'AT05', name: 'Áo Thun Cotton Compact', cat: 'Áo thun', price: 180000, promo: null,
      images: ['1521572163474-6864f9cf17ab', '1581655353564-df123a1eb820', '1562157873-818bc0726f68'],
      colors: [{ name: 'Trắng', code: 'TRG', hex: '#F9FAFB' }, { name: 'Đen', code: 'DEN', hex: '#111827' }, { name: 'Xám', code: 'XAM', hex: '#9CA3AF' }],
      sizes: SIZES, defaultStock: 30, stock: { 'TRG-M': 50, 'DEN-L': 38 },
      rating: 4.9, reviews: 412, sold: 1250,
      desc: 'Dòng áo T-shirt khởi đầu của Urban Chic. Cổ tròn form regular, cotton compact mịn, ít xù lông, thấm hút mồ hôi tốt – món đồ cơ bản không thể thiếu.',
      material: '100% Cotton Compact 250gsm.',
    },
    {
      id: 'SP004', code: 'SM04', name: 'Áo Sơ Mi Lụa Dài Tay', cat: 'Áo sơ mi', price: 360000, promo: null,
      images: ['1596755094514-f87e34085b2c', '1602810316693-3667c854239a', '1603252109303-2751441dd157'],
      colors: [{ name: 'Xanh Nhạt', code: 'XNH', hex: '#A5C8E4' }, { name: 'Trắng', code: 'TRG', hex: '#F9FAFB' }],
      sizes: SIZES, defaultStock: 12, stock: { 'XNH-M': 18, 'TRG-XL': 0 },
      rating: 4.6, reviews: 64, sold: 301,
      desc: 'Sơ mi lụa dài tay mềm rủ, ít nhăn, phù hợp đi làm và đi chơi. Thiết kế cúc ẩn tối giản.',
      material: 'Lụa Satin pha Polyester, mặt vải bóng nhẹ.',
    },
    {
      id: 'SP005', code: 'QJ02', name: 'Quần Jeans Slimfit', cat: 'Quần dài', price: 490000, promo: null,
      images: ['1624378439575-d8705ad7ae80', '1555689502-c4b22d76c56f', '1542272604-787c3835535d'],
      colors: [{ name: 'Xanh Đậm', code: 'XANH', hex: '#1E3A5F' }, { name: 'Đen', code: 'DEN', hex: '#111827' }],
      sizes: SIZES, defaultStock: 9, stock: { 'XANH-L': 3, 'DEN-S': 0 },
      rating: 4.7, reviews: 201, sold: 760,
      desc: 'Quần jeans slimfit ôm vừa vặn, co giãn nhẹ thoải mái vận động. Wash màu bền, không phai.',
      material: '98% Cotton, 2% Spandex – Denim 12oz.',
    },
    {
      id: 'SP006', code: 'HD01', name: 'Áo Hoodie Nỉ Bông', cat: 'Hoodie & Sweater', price: 390000,
      promo: { percent: 20, label: 'Black Friday sớm', start: '2026-11-08', end: '2027-01-31', cond: 'Giảm trực tiếp 20% trên giá niêm yết.' },
      images: ['1556821840-3a63f95609a7', '1620799140408-edc6dcb6d633'],
      colors: [{ name: 'Xám', code: 'XAM', hex: '#9CA3AF' }, { name: 'Trắng Kem', code: 'TRG', hex: '#F5F1E8' }],
      sizes: SIZES, defaultStock: 20, stock: {},
      rating: 4.8, reviews: 154, sold: 690,
      desc: 'Hoodie nỉ bông dày dặn, mũ trùm 2 lớp, túi kangaroo phía trước. Ấm áp mà vẫn thoáng.',
      material: 'Nỉ bông 80% Cotton 20% Polyester.',
    },
    {
      id: 'SP007', code: 'QK03', name: 'Quần Jogger Cargo', cat: 'Quần dài', price: 420000, promo: null,
      images: ['1552902865-b72c031ac5ea', '1506629082955-511b1aa562c8'],
      colors: [{ name: 'Xanh Rêu', code: 'REU', hex: '#4B5D3A' }, { name: 'Xám', code: 'XAM', hex: '#9CA3AF' }],
      sizes: SIZES, defaultStock: 14, stock: {},
      rating: 4.5, reviews: 47, sold: 233,
      desc: 'Jogger cargo lưng thun, bo gấu, túi hộp hai bên – năng động cho phong cách streetwear.',
      material: 'Kaki Cotton pha Spandex co giãn 4 chiều.',
    },
    {
      id: 'SP008', code: 'SW01', name: 'Áo Sweater Pastel', cat: 'Hoodie & Sweater', price: 340000, promo: null, isNew: true,
      images: ['1516826957135-700dedea698c'],
      colors: [{ name: 'Hồng Pastel', code: 'HPT', hex: '#F4C7D0' }, { name: 'Kem', code: 'KEM', hex: '#EDE4D3' }],
      sizes: SIZES, defaultStock: 16, stock: {},
      rating: 4.6, reviews: 39, sold: 120,
      desc: 'Sweater nỉ da cá form rộng, tông pastel nhẹ nhàng – phối cùng jeans rách cho outfit đường phố.',
      material: 'Nỉ da cá 100% Cotton.',
    },
    {
      id: 'SP009', code: 'PL01', name: 'Áo Polo Pique Basic', cat: 'Áo Polo', price: 260000,
      promo: { percent: 15, label: 'Ưu đãi Thu Đông', start: '2026-11-01', end: '2027-01-31', cond: 'Giảm trực tiếp 15% cho mọi màu/size.' },
      images: ['1586363104862-3a5e2ab60d99', '1523381210434-271e8be1f52b'],
      colors: [{ name: 'San Hô', code: 'SHO', hex: '#F87171' }, { name: 'Xanh Lá', code: 'XLA', hex: '#10B981' }],
      sizes: SIZES, defaultStock: 18, stock: { 'XLA-XL': 0 },
      rating: 4.8, reviews: 98, sold: 410,
      desc: 'Polo vải pique thoáng khí, cổ dệt bo chắc chắn, logo thêu nhỏ tinh tế trên ngực trái.',
      material: 'Cotton Pique 95%, Spandex 5%.',
    },
    {
      id: 'SP010', code: 'AT08', name: 'Áo Thun Graphic Oversize', cat: 'Áo thun', price: 220000, promo: null, isNew: true,
      images: ['1618354691373-d851c5c3a990', '1503342217505-b0a15ec3261c', '1564859228273-274232fdb516'],
      colors: [{ name: 'Đen', code: 'DEN', hex: '#111827' }, { name: 'Trắng', code: 'TRG', hex: '#F9FAFB' }],
      sizes: SIZES, defaultStock: 25, stock: {},
      rating: 4.7, reviews: 175, sold: 980,
      desc: 'Áo thun form oversize in graphic cá tính, công nghệ in lụa bền màu sau nhiều lần giặt.',
      material: '100% Cotton 2 chiều 230gsm.',
    },
    {
      id: 'SP011', code: 'QS02', name: 'Quần Shorts Kẻ Sọc Lưng Thun', cat: 'Quần Shorts', price: 250000, promo: null,
      images: ['1598522325074-042db73aa4e6'],
      colors: [{ name: 'Xám Kẻ', code: 'XKE', hex: '#A3A3A3' }],
      sizes: SIZES, defaultStock: 11, stock: {},
      rating: 4.5, reviews: 52, sold: 198,
      desc: 'Quần shorts kẻ sọc lưng thun dây rút, chất liệu thoáng mát cho những ngày năng động.',
      material: 'Linen pha Cotton.',
    },
    {
      id: 'SP012', code: 'AK05', name: 'Áo Khoác Da Biker', cat: 'Áo khoác', price: 890000, promo: null,
      images: ['1551028719-00167b16eac5'],
      colors: [{ name: 'Đen', code: 'DEN', hex: '#111827' }],
      sizes: SIZES, defaultStock: 0, stock: {},
      rating: 4.9, reviews: 73, sold: 260,
      desc: 'Áo khoác da biker khóa lệch, đinh tán kim loại, phong cách rock cá tính. (Đang tạm hết hàng – thêm vào Yêu thích để theo dõi khi có hàng trở lại.)',
      material: 'Da PU cao cấp, lót satin.',
    },
    {
      id: 'SP013', code: 'AK06', name: 'Áo Khoác Denim Wash', cat: 'Áo khoác', price: 550000, promo: null, isNew: true,
      images: ['1611312449408-fcece27cdbb7', '1495105787522-5334e3ffa0ef'],
      colors: [{ name: 'Xanh Denim', code: 'XDN', hex: '#5B7FA6' }],
      sizes: SIZES, defaultStock: 10, stock: { 'XDN-XL': 2 },
      rating: 4.6, reviews: 41, sold: 150,
      desc: 'Áo khoác denim wash cổ điển, cổ nhung tương phản, hai túi ngực nắp cài.',
      material: 'Denim cotton 12oz.',
    },
    {
      id: 'SP014', code: 'SM07', name: 'Áo Sơ Mi Flannel Caro', cat: 'Áo sơ mi', price: 320000, promo: null,
      images: ['1611312449412-6cefac5dc3e4', '1607345366928-199ea26cfe3e'],
      colors: [{ name: 'Caro Xám', code: 'CXA', hex: '#4B5563' }, { name: 'Caro Vàng', code: 'CVA', hex: '#CA8A04' }],
      sizes: SIZES, defaultStock: 13, stock: {},
      rating: 4.4, reviews: 29, sold: 96,
      desc: 'Sơ mi flannel kẻ caro mặc như áo khoác nhẹ, phối cùng áo thun trơn bên trong.',
      material: 'Flannel 100% Cotton chải lông mềm.',
    },
    {
      id: 'SP015', code: 'QS01', name: 'Quần Short Jeans Rách', cat: 'Quần Shorts', price: 290000, promo: null,
      images: ['1591195853828-11db59a44f6b', '1576995853123-5a10305d93c0'],
      colors: [{ name: 'Xanh Nhạt', code: 'XNH', hex: '#A5C8E4' }],
      sizes: SIZES, defaultStock: 15, stock: {},
      rating: 4.5, reviews: 33, sold: 140,
      desc: 'Short jeans wash nhạt, chi tiết rách nhẹ phong cách, gấu lật cá tính.',
      material: '100% Cotton Denim.',
    },
    {
      id: 'SP016', code: 'AT09', name: 'Áo Thun Typography', cat: 'Áo thun', price: 200000, promo: null, isNew: true,
      images: ['1627225924765-552d49cf47ad', '1622470953794-aa9c70b0fb9d'],
      colors: [{ name: 'Trắng', code: 'TRG', hex: '#F9FAFB' }, { name: 'Hồng', code: 'HNG', hex: '#E9A8C6' }],
      sizes: SIZES, defaultStock: 22, stock: {},
      rating: 4.7, reviews: 61, sold: 205,
      desc: 'Áo thun in chữ typography tối giản – tinh thần Minimalist đặc trưng của Urban Chic.',
      material: '100% Cotton Compact 220gsm.',
    },
    {
      id: 'SP017', code: 'QA01', name: 'Quần Âu Ống Đứng', cat: 'Quần dài', price: 450000, promo: null,
      images: ['1584865288642-42078afe6942'],
      colors: [{ name: 'Đen', code: 'DEN', hex: '#111827' }],
      sizes: SIZES, defaultStock: 12, stock: {},
      rating: 4.6, reviews: 44, sold: 177,
      desc: 'Quần âu ống đứng cạp cao, ly trước gọn gàng – lịch sự mà vẫn thoải mái.',
      material: 'Tuyết mưa Hàn Quốc, ít nhăn.',
    },
    {
      id: 'SP018', code: 'AK07', name: 'Áo Khoác Dạ Kẻ Caro', cat: 'Áo khoác', price: 790000, isNew: true,
      promo: { percent: 10, label: 'Ưu đãi Thu Đông', start: '2026-11-01', end: '2027-01-31', cond: 'Giảm trực tiếp 10% cho mọi size.' },
      images: ['1485968579580-b6d095142e6e'],
      colors: [{ name: 'Xanh Rêu Caro', code: 'CRO', hex: '#2F4A3F' }],
      sizes: SIZES, defaultStock: 6, stock: {},
      rating: 4.8, reviews: 58, sold: 175,
      desc: 'Áo khoác dạ dáng dài họa tiết kẻ caro, ve áo rộng, giữ ấm tốt cho những ngày lạnh.',
      material: 'Dạ Tweed 60% Wool, lót lụa.',
    },
  ],

  /* KHUYEN_MAI (đồng bộ mã với phần Admin) */
  vouchers: [
    { id: 'KM001', code: 'SALE50K', type: 'SO_TIEN', value: 50000, max: null, min: 500000, limit: 200, used: 78, start: '2026-11-01', end: '2027-01-31', status: 'DANG_HOAT_DONG', cats: null, title: 'Giảm 50K cho đơn từ 500K' },
    { id: 'KM002', code: 'NEWMEM10', type: 'PHAN_TRAM', value: 10, max: 100000, min: 300000, limit: 500, used: 142, start: '2026-11-01', end: '2027-03-31', status: 'DANG_HOAT_DONG', cats: null, title: 'Giảm 10% (tối đa 100K) cho đơn từ 300K' },
    { id: 'KM003', code: 'VIPMEMBER', type: 'SO_TIEN', value: 100000, max: null, min: 1000000, limit: 50, used: 19, start: '2026-11-01', end: '2027-02-15', status: 'DANG_HOAT_DONG', cats: null, title: 'Giảm 100K cho đơn từ 1 triệu' },
    { id: 'KM005', code: 'AOKHOAC30', type: 'SO_TIEN', value: 30000, max: null, min: 400000, limit: 300, used: 51, start: '2026-11-01', end: '2027-01-31', status: 'DANG_HOAT_DONG', cats: ['Áo khoác'], title: 'Giảm 30K khi mua Áo khoác từ 400K' },
    { id: 'KM006', code: 'FREESHIP', type: 'FREESHIP', value: 40000, max: null, min: 200000, limit: 1000, used: 388, start: '2026-11-01', end: '2027-01-31', status: 'DANG_HOAT_DONG', cats: null, title: 'Miễn phí vận chuyển cho đơn từ 200K' },
    { id: 'KM004', code: 'FLASH100', type: 'SO_TIEN', value: 100000, max: null, min: 800000, limit: 100, used: 100, start: '2026-10-01', end: '2026-10-31', status: 'VO_HIEU_HOA', cats: null, title: 'Flash Sale tháng 10 giảm 100K' },
  ],

  /* KHACH_HANG + sổ địa chỉ */
  customers: [
    {
      id: 'KH001', username: 'minhquan', name: 'Nguyễn Minh Quân', email: 'quan.nguyen@gmail.com', phone: '0908123456',
      password: 'Demo@123', status: 'HOAT_DONG', gender: 'Nam', dob: '2003-05-14', joined: '2026-09-15',
      addresses: [
        { id: 'DC01', name: 'Nguyễn Minh Quân', phone: '0908123456', line: '273 An Dương Vương', ward: 'Phường 3', district: 'Quận 5', city: 'TP. Hồ Chí Minh', label: 'Nhà riêng', isDefault: true },
        { id: 'DC02', name: 'Nguyễn Minh Quân', phone: '0908123456', line: '125 Lê Duẩn', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', label: 'Công ty', isDefault: false },
      ],
    },
    {
      id: 'KH002', username: 'thuha', name: 'Phạm Thu Hà', email: 'thuha.pham@gmail.com', phone: '0987654321',
      password: 'Demo@123', status: 'HOAT_DONG', gender: 'Nữ', dob: '2002-11-02', joined: '2026-09-20',
      addresses: [{ id: 'DC03', name: 'Phạm Thu Hà', phone: '0987654321', line: '88 Trần Hưng Đạo', ward: 'Phường 7', district: 'Quận 5', city: 'TP. Hồ Chí Minh', label: 'Nhà riêng', isDefault: true }],
    },
    {
      id: 'KH005', username: 'vankiet', name: 'Trương Văn Kiệt', email: 'kiet.truong@gmail.com', phone: '0977889900',
      password: 'Demo@123', status: 'KHOA', gender: 'Nam', dob: '2001-01-20', joined: '2026-10-18',
      addresses: [{ id: 'DC04', name: 'Trương Văn Kiệt', phone: '0977889900', line: '12 Hòa Bình', ward: 'Phường 5', district: 'Quận 11', city: 'TP. Hồ Chí Minh', label: 'Nhà riêng', isDefault: true }],
    },
  ],

  carts: { KH001: [{ sku: 'SKU-AT05-TRG-M', qty: 2 }, { sku: 'SKU-HD01-XAM-L', qty: 1 }] },
  wishlists: { KH001: ['SP009', 'SP012', 'SP004', 'SP018'] },

  /* DON_HANG + CHI_TIET_DON_HANG của khách KH001 */
  orders: [
    {
      id: 'DH20261110', customerId: 'KH001', date: H(3),
      items: [{ sku: 'SKU-PL01-SHO-M', qty: 1, price: 221000 }, { sku: 'SKU-AT05-DEN-L', qty: 1, price: 180000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 401000, shipFee: 30000, discount: 40100, voucher: 'NEWMEM10', total: 390900,
      payMethod: 'VNPAY', payStatus: 'DA_THANH_TOAN', txnId: 'VNP14582233', status: 'CHO_DUYET',
      trackingCode: null, carrier: 'Giao Hàng Nhanh (GHN)', invoice: null,
      history: [{ t: H(3), s: 'Đặt hàng thành công – giữ tồn kho cho đơn' }, { t: H(2.95), s: 'Thanh toán VNPay thành công – Mã GD VNP14582233' }],
      tracking: [],
    },
    {
      id: 'DH20261105', customerId: 'KH001', date: T(1, 8, 30),
      items: [{ sku: 'SKU-AK01-DEN-L', qty: 1, price: 450000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 450000, shipFee: 30000, discount: 0, voucher: null, total: 480000,
      payMethod: 'COD', payStatus: 'CHUA_THANH_TOAN', status: 'CHO_DUYET',
      trackingCode: null, carrier: 'Giao Hàng Nhanh (GHN)', invoice: null,
      history: [{ t: T(1, 8, 30), s: 'Đặt hàng thành công – Thanh toán khi nhận hàng (COD)' }],
      tracking: [],
    },
    {
      id: 'DH20261104', customerId: 'KH001', date: T(2, 19, 45),
      items: [{ sku: 'SKU-HD01-XAM-M', qty: 1, price: 312000 }, { sku: 'SKU-QJ02-XANH-L', qty: 1, price: 490000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '125 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
      subtotal: 802000, shipFee: 0, discount: 50000, voucher: 'SALE50K', total: 752000,
      payMethod: 'MOMO', payStatus: 'DA_THANH_TOAN', txnId: 'MM2611109981', status: 'DANG_DONG_GOI',
      trackingCode: null, carrier: 'Giao Hàng Nhanh (GHN)', invoice: null,
      history: [
        { t: T(2, 19, 45), s: 'Đặt hàng thành công' },
        { t: T(2, 19, 46), s: 'Thanh toán MoMo thành công – Mã GD MM2611109981' },
        { t: T(1, 9, 20), s: 'Nhân viên vận hành đã duyệt đơn – Đang đóng gói' },
      ],
      tracking: [],
    },
    {
      id: 'DH20261103', customerId: 'KH001', date: T(3, 10, 0),
      items: [{ sku: 'SKU-SM04-XNH-M', qty: 1, price: 360000 }, { sku: 'SKU-AT08-DEN-L', qty: 1, price: 220000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 580000, shipFee: 0, discount: 0, voucher: null, total: 580000,
      payMethod: 'COD', payStatus: 'CHUA_THANH_TOAN', status: 'DANG_GIAO',
      trackingCode: 'GHTK992031', carrier: 'Giao Hàng Tiết Kiệm (GHTK)', invoice: null,
      history: [
        { t: T(3, 10, 0), s: 'Đặt hàng thành công – COD' },
        { t: T(3, 14, 30), s: 'Đã duyệt đơn – Đang đóng gói' },
        { t: T(2, 9, 0), s: 'Đã bàn giao cho GHTK – Mã vận đơn GHTK992031' },
      ],
      tracking: [
        { t: T(2, 9, 0), loc: 'Kho Urban Chic – Q.5, TP.HCM', s: 'Đơn vị vận chuyển đã lấy hàng' },
        { t: T(2, 16, 20), loc: 'Bưu cục GHTK Quận 5', s: 'Đã nhập kho phân loại' },
        { t: T(1, 7, 45), loc: 'Trung tâm khai thác Tân Bình', s: 'Đang luân chuyển' },
        { t: H(1), loc: 'Bưu cục GHTK Quận 5', s: 'Bưu tá đang giao hàng – SĐT bưu tá 0901 222 333' },
      ],
    },
    {
      id: 'DH20261101', customerId: 'KH001', date: T(5, 10, 15),
      items: [{ sku: 'SKU-AK01-DEN-L', qty: 1, price: 450000 }, { sku: 'SKU-AT05-TRG-M', qty: 2, price: 180000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 810000, shipFee: 0, discount: 50000, voucher: 'SALE50K', total: 760000,
      payMethod: 'VNPAY', payStatus: 'DA_THANH_TOAN', txnId: 'VNP14290077', status: 'DA_GIAO', deliveredAt: T(4, 15, 30),
      trackingCode: 'VNPOST1101', carrier: 'VNPost Express', invoice: { no: 'HD-0001101', date: T(4, 16, 0) },
      history: [
        { t: T(5, 10, 15), s: 'Đặt hàng thành công' },
        { t: T(5, 10, 16), s: 'Thanh toán VNPay thành công – Mã GD VNP14290077' },
        { t: T(5, 11, 0), s: 'Đã duyệt & đóng gói' },
        { t: T(4, 8, 0), s: 'Đang giao hàng – VNPost Express' },
        { t: T(4, 15, 30), s: 'Giao hàng thành công – Hoàn tất' },
        { t: T(4, 16, 0), s: 'Đã phát hành hóa đơn điện tử HD-0001101' },
      ],
      tracking: [
        { t: T(4, 8, 0), loc: 'Kho Urban Chic – Q.5, TP.HCM', s: 'Đã lấy hàng' },
        { t: T(4, 11, 10), loc: 'Bưu cục VNPost Quận 5', s: 'Đang phát hàng' },
        { t: T(4, 15, 30), loc: '273 An Dương Vương, Q.5', s: 'Giao hàng thành công – Người nhận: Minh Quân' },
      ],
    },
    {
      id: 'DH20261088', customerId: 'KH001', date: T(18, 20, 10),
      items: [{ sku: 'SKU-AT08-TRG-M', qty: 1, price: 220000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 220000, shipFee: 30000, discount: 0, voucher: null, total: 250000,
      payMethod: 'COD', payStatus: 'DA_THANH_TOAN', status: 'DA_GIAO', deliveredAt: T(16, 11, 0),
      trackingCode: 'GHN8849188', carrier: 'Giao Hàng Nhanh (GHN)', invoice: { no: 'HD-0001088', date: T(16, 12, 0) },
      history: [
        { t: T(18, 20, 10), s: 'Đặt hàng thành công – COD' },
        { t: T(17, 9, 0), s: 'Đã duyệt & đóng gói' },
        { t: T(17, 15, 0), s: 'Đang giao hàng – GHN' },
        { t: T(16, 11, 0), s: 'Giao hàng thành công – Đã thu COD 250.000₫' },
      ],
      tracking: [
        { t: T(17, 15, 0), loc: 'Kho Urban Chic – Q.5, TP.HCM', s: 'Đã lấy hàng' },
        { t: T(16, 11, 0), loc: '273 An Dương Vương, Q.5', s: 'Giao hàng thành công' },
      ],
    },
    {
      id: 'DH20261020', customerId: 'KH001', date: T(14, 21, 5),
      items: [{ sku: 'SKU-QS01-XNH-M', qty: 1, price: 290000 }],
      receiver: { name: 'Nguyễn Minh Quân', phone: '0908123456', address: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh' },
      subtotal: 290000, shipFee: 30000, discount: 0, voucher: null, total: 320000,
      payMethod: 'MOMO', payStatus: 'DA_HOAN_TIEN', txnId: 'MM2610281204', status: 'DA_HUY', cancelReason: 'Đặt nhầm sản phẩm / size',
      trackingCode: null, carrier: 'Giao Hàng Nhanh (GHN)', invoice: null,
      history: [
        { t: T(14, 21, 5), s: 'Đặt hàng thành công' },
        { t: T(14, 21, 6), s: 'Thanh toán MoMo thành công' },
        { t: T(14, 21, 30), s: 'Khách hàng hủy đơn – Lý do: Đặt nhầm sản phẩm / size – Đã giải phóng tồn kho' },
        { t: T(12, 10, 0), s: 'Cổng thanh toán xác nhận hoàn tiền 320.000₫ về ví MoMo' },
      ],
      tracking: [],
    },
  ],

  /* YEU_CAU_DOI_TRA (gửi sang Phân hệ 2 – Xử lý khiếu nại & đổi trả) */
  returns: [],

  /* Hộp thư mô phỏng – Email Service API */
  outbox: [
    { id: 'M1', to: 'quan.nguyen@gmail.com', type: 'WELCOME', t: '2026-09-15T09:00:00', subject: 'Chào mừng bạn đến với Urban Chic®', body: 'Tài khoản minhquan đã được tạo thành công. Nhập mã NEWMEM10 để được giảm 10% cho đơn từ 300K.' },
    { id: 'M2', to: 'quan.nguyen@gmail.com', type: 'RESET', t: T(2, 7, 0), subject: 'Yêu cầu đặt lại mật khẩu', body: 'Nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong 15 phút và chỉ dùng một lần.', token: 'demo-expired-token' },
  ],
  resetTokens: [{ token: 'demo-expired-token', customerId: 'KH001', expires: T(2, 7, 15), used: false }],
};
