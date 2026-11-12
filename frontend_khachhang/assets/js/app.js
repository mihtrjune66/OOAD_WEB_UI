/* =================== ĐIỀU HƯỚNG, HEADER, FOOTER, DEMO =================== */
const App = {
  routes: [
    [/^\/$/, () => V.home()],
    [/^\/san-pham$/, (m, q) => V.shop(m, q)],
    [/^\/san-pham\/(\w+)$/, (m) => V.product(m)],
    [/^\/gio-hang$/, () => V.cart()],
    [/^\/dang-nhap$/, (m, q) => V.login(m, q)],
    [/^\/dang-ky$/, () => V.register()],
    [/^\/quen-mat-khau$/, () => V.forgot()],
    [/^\/dat-lai-mat-khau\/([\w-]+)$/, (m) => V.reset(m)],
    [/^\/hop-thu$/, () => V.mailbox()],
    [/^\/use-case$/, () => V.usecases()],
    [/^\/tai-khoan$/, () => V.profile(), true],
    [/^\/tai-khoan\/dia-chi$/, () => V.addresses(), true],
    [/^\/tai-khoan\/mat-khau$/, () => V.password(), true],
    [/^\/tai-khoan\/yeu-thich$/, () => V.wishlist(), true],
    [/^\/tai-khoan\/don-hang$/, (m, q) => V.orders(m, q), true],
    [/^\/tai-khoan\/don-hang\/(\w+)$/, (m) => V.orderDetail(m), true],
    [/^\/tai-khoan\/don-hang\/(\w+)\/van-chuyen$/, (m) => V.tracking(m), true],
    [/^\/dat-hang$/, () => V.checkout(), true],
    [/^\/thanh-toan\/(\w+)$/, (m) => V.payment(m), true],
    [/^\/cong-thanh-toan\/([\w-]+)$/, (m) => V.gateway(m), true],
    [/^\/ket-qua-thanh-toan\/([\w-]+)$/, (m) => V.payResult(m), true],
    [/^\/dat-hang-thanh-cong\/(\w+)$/, (m) => V.orderSuccess(m), true],
  ],
  route() {
    const h = decodeURI(location.hash.slice(1) || '/');
    const [path, qs] = h.split('?');
    return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs || '')) };
  },
  lastPath: null,
  render() {
    const { path, query } = this.route();
    let html = ''; let after = null; let bare = false; let found = false;
    for (const [re, fn, auth] of this.routes) {
      const m = path.match(re);
      if (!m) continue;
      found = true;
      if (auth && !Session.user()) { UI.toast('Vui lòng đăng nhập tài khoản thành viên để tiếp tục.', 'info'); location.replace('#/dang-nhap?next=' + encodeURIComponent(location.hash)); return; }
      const out = fn(m.slice(1), query);
      if (out && typeof out === 'object') { html = out.html; after = out.after; bare = !!out.bare; } else html = out;
      break;
    }
    if (!found) html = `<div class="max-w-3xl mx-auto px-4 py-10">${UI.empty({ icon: 'fa-compass', title: 'Không tìm thấy trang', desc: 'Đường dẫn không tồn tại.', action: '<a href="#/" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Về trang chủ</a>' })}</div>`;
    $('#app').innerHTML = html;
    document.body.classList.toggle('bare', bare);
    if (path !== this.lastPath) { window.scrollTo(0, 0); this.lastPath = path; }
    this.renderHeader();
    if (after) after();
  },

  renderHeader() {
    const u = Session.user();
    const nCart = GioHangController.soLuong();
    const nFav = YeuThichController.ds().length;
    const { path, query } = this.route();
    const nav = [['Trang chủ', '#/', path === '/'], ['Sản phẩm', '#/san-pham', path === '/san-pham' && !query.cat && !query.sale], ...SEED.categories.slice(0, 3).map((c) => [c.name, `#/san-pham?cat=${encodeURIComponent(c.name)}`, query.cat === c.name]), ['Khuyến mãi', '#/san-pham?sale=1', !!query.sale]];
    $('#site-header').innerHTML = `
      <div class="bg-black text-white text-[11px] sm:text-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-center gap-6 overflow-hidden whitespace-nowrap">
          <span><i class="fa-solid fa-truck-fast mr-1.5"></i>Miễn phí vận chuyển đơn từ 500.000₫</span><span class="hidden sm:inline">·</span>
          <span class="hidden sm:inline"><i class="fa-solid fa-rotate-left mr-1.5"></i>Đổi trả trong 7 ngày</span><span class="hidden md:inline">·</span>
          <span class="hidden md:inline"><i class="fa-solid fa-ticket mr-1.5"></i>Nhập <b>NEWMEM10</b> giảm 10%</span>
        </div>
      </div>
      <div class="bg-white/95 backdrop-blur border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button class="lg:hidden w-9 h-9 -ml-2" onclick="$('#mnav').classList.toggle('hidden')" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
          <a href="#/" class="flex items-center gap-2 shrink-0"><span class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center"><i class="fa-solid fa-layer-group text-xs"></i></span><span class="font-black tracking-[.2em] text-lg hidden sm:inline">URBAN CHIC<sup class="text-[9px] text-gray-400">®</sup></span></a>
          <nav class="hidden lg:flex items-center gap-4 xl:gap-5 ml-2 xl:ml-4 text-sm shrink-0">${nav.map(([l, h, a]) => `<a href="${h}" class="${a ? 'font-bold text-black' : 'text-gray-600 hover:text-black'} ${l === 'Khuyến mãi' ? 'text-red-600' : ''} whitespace-nowrap">${l}</a>`).join('')}</nav>
          <div class="flex-1"></div>
          <form onsubmit="App.search(event)" class="relative hidden md:block w-56 xl:w-64 shrink-0">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input id="hdr-search" autocomplete="off" value="${esc(query.q || '')}" oninput="App.suggest(this.value)" onfocus="App.suggest(this.value)" onblur="setTimeout(()=>{const s=$('#sugg');if(s)s.classList.add('hidden')},200)" placeholder="Tìm áo thun, hoodie, jeans..." class="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <div id="sugg" class="hidden absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 overflow-hidden z-50"></div>
          </form>
          <button onclick="go('#/san-pham')" class="md:hidden w-9 h-9"><i class="fa-solid fa-magnifying-glass"></i></button>
          <div class="relative group">
            <a href="${u ? '#/tai-khoan' : '#/dang-nhap'}" class="flex items-center gap-2 h-10 px-2 rounded-full hover:bg-gray-100"><i class="fa-regular fa-user"></i><span class="hidden 2xl:inline text-sm font-medium max-w-[120px] truncate">${u ? esc(u.name || u.username) : 'Đăng nhập'}</span></a>
            <div class="hidden group-hover:block absolute right-0 top-full pt-2 z-50"><div class="w-60 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 p-2 text-sm">
              ${u ? `<div class="px-3 py-2 border-b border-gray-100 mb-1"><p class="font-bold truncate">${esc(u.name || u.username)}</p><p class="text-xs text-gray-500 truncate">${esc(u.email)}</p></div>
                ${[['#/tai-khoan', 'fa-user', 'Hồ sơ cá nhân'], ['#/tai-khoan/dia-chi', 'fa-location-dot', 'Sổ địa chỉ'], ['#/tai-khoan/don-hang', 'fa-receipt', 'Đơn hàng của tôi'], ['#/tai-khoan/yeu-thich', 'fa-heart', 'Sản phẩm yêu thích'], ['#/tai-khoan/mat-khau', 'fa-key', 'Đổi mật khẩu']].map(([h, i, l]) => `<a href="${h}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"><i class="fa-solid ${i} w-4 text-gray-400"></i>${l}</a>`).join('')}
                <button onclick="App.logout()" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"><i class="fa-solid fa-right-from-bracket w-4"></i>Đăng xuất</button>`
              : `<p class="px-3 py-2 text-xs text-gray-500">Đăng nhập để theo dõi đơn hàng và lưu sản phẩm yêu thích.</p><a href="#/dang-nhap" class="block text-center bg-black text-white rounded-xl py-2.5 font-bold">Đăng nhập</a><a href="#/dang-ky" class="block text-center border border-gray-300 rounded-xl py-2.5 font-bold mt-2">Đăng ký tài khoản</a>`}
            </div></div>
          </div>
          <a href="#/tai-khoan/yeu-thich" class="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" title="Sản phẩm yêu thích"><i class="fa-regular fa-heart"></i>${nFav ? `<span class="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">${nFav}</span>` : ''}</a>
          <a href="#/gio-hang" class="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" title="Giỏ hàng"><i class="fa-solid fa-bag-shopping"></i>${nCart ? `<span class="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">${nCart}</span>` : ''}</a>
        </div>
        <div id="mnav" class="hidden lg:hidden border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-2 text-sm">${nav.map(([l, h]) => `<a href="${h}" onclick="$('#mnav').classList.add('hidden')" class="py-2">${l}</a>`).join('')}</div>
      </div>`;
    this.renderDemo();
  },

  renderFooter() {
    $('#site-footer').innerHTML = `
      <div class="bg-gray-950 text-gray-400 text-sm mt-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div><p class="font-black tracking-[.2em] text-white text-lg">URBAN CHIC®</p><p class="mt-3 leading-relaxed">Thời trang ứng dụng Streetwear & Minimalist cho người trẻ thành thị. Bán lẻ trực tuyến D2C – từ thương hiệu đến tay bạn.</p>
            <div class="flex gap-3 mt-4 text-white">${['fa-facebook-f', 'fa-instagram', 'fa-tiktok'].map((i) => `<span class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><i class="fa-brands ${i}"></i></span>`).join('')}</div></div>
          <div><p class="text-white font-bold mb-3">Mua sắm</p><ul class="space-y-2">${SEED.categories.map((c) => `<li><a href="#/san-pham?cat=${encodeURIComponent(c.name)}" class="hover:text-white">${c.name}</a></li>`).join('')}</ul></div>
          <div><p class="text-white font-bold mb-3">Tài khoản</p><ul class="space-y-2"><li><a href="#/tai-khoan" class="hover:text-white">Hồ sơ cá nhân</a></li><li><a href="#/tai-khoan/don-hang" class="hover:text-white">Đơn hàng của tôi</a></li><li><a href="#/tai-khoan/yeu-thich" class="hover:text-white">Sản phẩm yêu thích</a></li><li><a href="#/gio-hang" class="hover:text-white">Giỏ hàng</a></li><li><a href="#/use-case" class="hover:text-white">Danh mục Use Case (đồ án)</a></li><li><a href="../" class="hover:text-white"><i class="fa-solid fa-lock mr-1.5 text-xs"></i>Cổng quản trị nội bộ (Admin)</a></li></ul></div>
          <div><p class="text-white font-bold mb-3">Hỗ trợ</p><ul class="space-y-2"><li><i class="fa-solid fa-phone mr-2"></i>1900 6868</li><li><i class="fa-regular fa-envelope mr-2"></i>cskh@urbanchic.vn</li><li><i class="fa-solid fa-location-dot mr-2"></i>273 An Dương Vương, Q.5, TP.HCM</li></ul>
            <div class="flex flex-wrap gap-2 mt-4 text-[11px] font-bold"><span class="bg-white text-black rounded px-2 py-1">COD</span><span class="bg-[#A50064] text-white rounded px-2 py-1">MoMo</span><span class="bg-white rounded px-2 py-1"><span class="text-[#005BAA]">VN</span><span class="text-[#ED1C24]">PAY</span></span><span class="bg-white/10 text-white rounded px-2 py-1">GHN</span><span class="bg-white/10 text-white rounded px-2 py-1">GHTK</span></div></div>
        </div>
        <div class="border-t border-white/10 py-5 text-center text-xs">© 2026 Urban Chic® · Đồ án Phân tích & Thiết kế Hướng đối tượng – Phân hệ 1: Quản lý mua sắm online (Khách hàng)</div>
      </div>`;
  },

  /* Bảng điều khiển kịch bản demo – mô phỏng lỗi hệ thống ngoài để chụp luồng phụ */
  renderDemo() {
    const d = DB.data;
    const root = $('#demo-root');
    if (d.ui.hideDemo) { root.innerHTML = ''; return; }
    const open = root.dataset.open === '1';
    const sw = (k, label, sub) => `<label class="flex items-start gap-3 py-2 cursor-pointer"><input type="checkbox" ${d.sim[k] ? 'checked' : ''} onchange="DB.data.sim['${k}']=this.checked;DB.save();App.renderDemo();UI.toast(this.checked?'Đã BẬT mô phỏng: ${label}':'Đã TẮT mô phỏng: ${label}','info')" class="accent-violet-600 w-4 h-4 mt-0.5"><span><span class="block font-semibold">${label}</span><span class="block text-[11px] text-gray-500">${sub}</span></span></label>`;
    root.innerHTML = `<div class="no-print fixed bottom-4 left-4 z-[80]">
      ${open ? `<div class="mb-3 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 p-4 text-sm pop-in">
        <div class="flex items-center justify-between"><p class="font-bold"><i class="fa-solid fa-flask text-violet-600 mr-1.5"></i>Kịch bản demo (đồ án)</p><button onclick="$('#demo-root').dataset.open='0';App.renderDemo()" class="w-7 h-7 rounded-full hover:bg-gray-100"><i class="fa-solid fa-xmark"></i></button></div>
        <label class="flex items-center gap-3 py-2 border-b border-gray-100 cursor-pointer"><input type="checkbox" ${d.ui.showUC ? 'checked' : ''} onchange="DB.data.ui.showUC=this.checked;DB.save();App.render()" class="accent-violet-600 w-4 h-4"><span class="font-semibold">Hiện nhãn Use Case trên màn hình</span></label>
        <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-3">Mô phỏng lỗi hệ thống ngoài</p>
        ${sw('emailFail', 'Email Service API lỗi', 'UC01 Đăng ký, UC03 Quên mật khẩu')}
        ${sw('payInitFail', 'API Cổng thanh toán lỗi khởi tạo', 'UC19 MoMo/VNPay')}
        ${sw('slowCallback', 'Cổng thanh toán phản hồi chậm', 'UC19 – trang kết quả “đang chờ”')}
        ${sw('shipFail', 'API Đơn vị vận chuyển không phản hồi', 'UC15 Xem quá trình vận chuyển')}
        <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-3 mb-2">Lối tắt</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="App.quickLogin('minhquan')" class="border rounded-lg py-2 font-semibold hover:border-black">Đăng nhập demo</button>
          <button onclick="App.quickLogin('vankiet')" class="border rounded-lg py-2 font-semibold hover:border-black">Điền TK bị khóa</button>
          <a href="#/hop-thu" class="border rounded-lg py-2 font-semibold text-center hover:border-black">Hộp thư mô phỏng</a>
          <a href="#/use-case" class="border rounded-lg py-2 font-semibold text-center hover:border-black">Danh mục UC</a>
          <button onclick="App.resetData()" class="border border-red-200 text-red-600 rounded-lg py-2 font-semibold hover:bg-red-50">Khôi phục dữ liệu</button>
          <button onclick="DB.data.ui.hideDemo=true;DB.save();App.renderDemo();UI.toast('Đã ẩn nút Demo – nhấn Shift + D để hiện lại','info',4500)" class="border rounded-lg py-2 font-semibold hover:border-black">Ẩn nút Demo</button>
        </div>
      </div>` : ''}
      <button onclick="$('#demo-root').dataset.open='${open ? '0' : '1'}';App.renderDemo()" class="h-11 px-4 rounded-full bg-violet-600 text-white shadow-xl text-sm font-bold flex items-center gap-2 hover:bg-violet-700"><i class="fa-solid fa-flask"></i>Demo${Object.values(d.sim).some(Boolean) ? '<span class="w-2 h-2 rounded-full bg-amber-300"></span>' : ''}</button>
    </div>`;
  },

  quickLogin(user) {
    $('#demo-root').dataset.open = '0';
    if (user === 'vankiet' || !location.hash.startsWith('#/dang-nhap')) { if (Session.user()) XacThucController.dangXuat(); go('#/dang-nhap'); }
    setTimeout(() => { const a = $('#login-account'); const p = $('#login-password'); if (a && p) { a.value = user; p.value = 'Demo@123'; UI.toast('Đã điền tài khoản demo – nhấn Đăng nhập', 'info'); } }, 50);
  },
  async resetData() {
    if (!(await UI.confirm({ title: 'Khôi phục dữ liệu mẫu', message: 'Xóa mọi thay đổi (tài khoản mới, đơn hàng, giỏ hàng...) và đưa về dữ liệu mẫu ban đầu?', okLabel: 'Khôi phục', danger: true }))) return;
    DB.reset(); Object.assign(PD, { id: null }); CK.uid = null; UI.toast('Đã khôi phục dữ liệu mẫu.'); go('#/');
  },
  logout() { XacThucController.dangXuat(); UI.toast('Bạn đã đăng xuất.', 'info'); go('#/'); App.renderHeader(); },

  search(e) { e.preventDefault(); const q = $('#hdr-search').value.trim(); go('#/san-pham' + qsStr({ q })); },
  suggest(v) {
    const box = $('#sugg'); if (!box) return;
    const ds = SanPhamController.goiY(v);
    if (!v.trim()) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    box.innerHTML = ds.length ? ds.map((p) => `<a href="#/san-pham/${p.id}" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"><img src="${Catalog.img(p, 0, 80, 100)}" class="w-9 h-11 rounded object-cover" alt=""><span class="flex-1 min-w-0"><span class="block text-sm truncate">${esc(p.name)}</span><span class="block text-xs">${UI.price(p)}</span></span></a>`).join('') + `<a href="#/san-pham?q=${encodeURIComponent(v)}" class="block text-center text-xs font-bold py-2.5 bg-gray-50 hover:bg-gray-100">Xem tất cả kết quả cho “${esc(v)}”</a>`
      : `<p class="px-4 py-3 text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp với “${esc(v)}”.</p>`;
  },

  /* UC10 THÊM VÀO MỤC YÊU THÍCH (từ thẻ SP / trang chi tiết) */
  toggleFav(id, ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    if (YeuThichController.co(id)) { YeuThichController.boYeuThich(id); UI.toast('Đã bỏ khỏi danh sách yêu thích.', 'info'); App.render(); return; }
    const r = YeuThichController.themYeuThich(id);
    if (!r.ok) {
      if (r.code === 'CAN_DANG_NHAP') {
        return UI.modal({ title: 'Đăng nhập để lưu yêu thích', icon: '<i class="fa-regular fa-heart text-red-500"></i>', size: 'max-w-sm', body: `<div class="flex justify-end mb-2">${UI.uc('UC10', 'YeuThichController')}</div>${UI.alert('info', 'Tính năng <b>Danh sách yêu thích</b> dành cho Khách thành viên. Vui lòng đăng nhập để lưu sản phẩm và theo dõi khi có hàng / giảm giá.')}`, actions: [{ label: 'Để sau' }, { label: 'Đăng nhập', primary: true, onClick: () => { UI.closeModal(); go('#/dang-nhap?next=' + encodeURIComponent(location.hash)); } }] });
      }
      return UI.toast(r.error, 'error');
    }
    UI.toast(r.daTonTai ? 'Sản phẩm đã có trong danh sách yêu thích.' : `Đã thêm vào mục yêu thích <a href="#/tai-khoan/yeu-thich" class="underline font-bold ml-1">Xem</a>`);
    App.render();
  },
  copy(text, msg) {
    const done = () => UI.toast(msg || 'Đã sao chép');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done); else done();
  },
};

/* --------------------------------- KHỞI ĐỘNG --------------------------------- */
DB.load();
Catalog.init();
App.renderFooter();
window.addEventListener('hashchange', () => { UI.closeModal(); App.render(); });
window.addEventListener('keydown', (e) => { if (e.shiftKey && (e.key === 'D' || e.key === 'd') && !/input|textarea|select/i.test(e.target.tagName)) { DB.data.ui.hideDemo = !DB.data.ui.hideDemo; DB.save(); App.renderDemo(); } });
App.render();
