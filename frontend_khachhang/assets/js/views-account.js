/* ====== KHÁCH THÀNH VIÊN: UC12 Hồ sơ, UC13 Đơn hàng, UC14 Hủy đơn, UC15 Vận chuyển ====== */
V.accountLayout = (active, inner) => {
  const u = Session.user();
  const counts = DonHangController.xemDanhSachDon('ALL').counts;
  const menu = [
    ['ho-so', '#/tai-khoan', 'fa-user', 'Hồ sơ cá nhân'],
    ['dia-chi', '#/tai-khoan/dia-chi', 'fa-location-dot', 'Sổ địa chỉ'],
    ['mat-khau', '#/tai-khoan/mat-khau', 'fa-key', 'Đổi mật khẩu'],
    ['don-hang', '#/tai-khoan/don-hang', 'fa-receipt', 'Đơn hàng của tôi', counts.ALL],
    ['yeu-thich', '#/tai-khoan/yeu-thich', 'fa-heart', 'Sản phẩm yêu thích', YeuThichController.ds().length],
  ];
  return `<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    ${UI.crumbs([['Trang chủ', '#/'], ['Tài khoản', '#/tai-khoan'], [menu.find((m) => m[0] === active)?.[3] || '', '']])}
    <div class="mt-6 grid lg:grid-cols-[260px_1fr] gap-8 items-start">
      <aside class="rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-28">
        <div class="p-5 bg-gray-900 text-white flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white text-black font-black flex items-center justify-center text-lg">${esc((u.name || u.username).trim().split(' ').pop()[0].toUpperCase())}</div>
          <div class="min-w-0"><p class="font-bold truncate">${esc(u.name || u.username)}</p><p class="text-xs text-white/60 truncate">${u.id} · Khách thành viên</p></div>
        </div>
        <nav class="p-2 flex lg:flex-col overflow-x-auto">${menu.map(([k, href, icon, label, n]) => `<a href="${href}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap ${active === k ? 'bg-gray-100 font-bold' : 'text-gray-600 hover:bg-gray-50'}"><i class="fa-solid ${icon} w-4 text-center"></i>${label}${n ? `<span class="ml-auto text-[11px] bg-gray-200 rounded-full px-2">${n}</span>` : ''}</a>`).join('')}
          <button onclick="App.logout()" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"><i class="fa-solid fa-right-from-bracket w-4 text-center"></i>Đăng xuất</button>
        </nav>
      </aside>
      <section class="min-w-0">${inner}</section>
    </div>
  </div>`;
};

/* ------------------------ UC12 QUẢN LÝ HỒ SƠ CÁ NHÂN ------------------------ */
V.profile = () => {
  const u = Session.user();
  const def = u.addresses.find((a) => a.isDefault);
  return V.accountLayout('ho-so', `
    <div class="flex flex-wrap items-center justify-between gap-2"><div><h2 class="text-xl font-bold">Hồ sơ cá nhân</h2><p class="text-sm text-gray-500">Quản lý thông tin liên hệ để bảo mật tài khoản và tăng tốc đặt hàng.</p></div>${UI.uc('UC12', 'GiaoDienHoSo')}</div>
    <div class="mt-6 grid xl:grid-cols-[1fr_300px] gap-6">
      <form id="form-pf" onsubmit="V.saveProfile(event)" class="rounded-2xl border border-gray-200 p-6 space-y-4" novalidate>
        <h3 class="font-bold"><i class="fa-solid fa-address-card mr-2 text-gray-400"></i>Thông tin liên hệ</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tên đăng nhập</label><input value="${esc(u.username)}" disabled class="w-full px-3.5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"></div>
          ${UI.field({ id: 'name', label: 'Họ và tên *', value: u.name, placeholder: 'Nguyễn Văn A' })}
          ${UI.field({ id: 'email', label: 'Email *', type: 'email', value: u.email })}
          ${UI.field({ id: 'phone', label: 'Số điện thoại', value: u.phone, placeholder: '09xxxxxxxx' })}
          <div><label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Giới tính</label>
            <div class="flex gap-4 py-3 text-sm">${['Nam', 'Nữ', 'Khác'].map((g) => `<label class="flex items-center gap-1.5"><input type="radio" name="gender" value="${g}" ${u.gender === g ? 'checked' : ''} class="accent-black">${g}</label>`).join('')}</div></div>
          ${UI.field({ id: 'dob', label: 'Ngày sinh', type: 'date', value: u.dob })}
        </div>
        <div id="pf-msg" class="hidden"></div>
        <div class="flex justify-end"><button class="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800">Lưu thay đổi</button></div>
      </form>
      <div class="space-y-4">
        <div class="rounded-2xl bg-gray-50 p-5 text-sm">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Thông tin tài khoản</p>
          <dl class="mt-3 space-y-2"><div class="flex justify-between"><dt class="text-gray-500">Mã khách hàng</dt><dd class="font-semibold">${u.id}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Ngày tham gia</dt><dd class="font-semibold">${fdt(u.joined, false)}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Trạng thái</dt><dd class="font-semibold text-emerald-700">Hoạt động</dd></div></dl>
        </div>
        <div class="rounded-2xl border border-gray-200 p-5 text-sm">
          <div class="flex items-center justify-between"><p class="font-bold">Địa chỉ mặc định</p><a href="#/tai-khoan/dia-chi" class="text-xs font-semibold underline">Quản lý</a></div>
          ${def ? `<p class="mt-2 font-semibold">${esc(def.name)} · ${def.phone}</p><p class="text-gray-600">${esc(`${def.line}, ${def.ward}, ${def.district}, ${def.city}`)}</p>` : '<p class="mt-2 text-gray-500">Chưa có địa chỉ giao hàng.</p>'}
        </div>
        <a href="#/tai-khoan/mat-khau" class="flex items-center justify-between rounded-2xl border border-gray-200 p-5 text-sm hover:border-black"><span><i class="fa-solid fa-shield-halved mr-2"></i><b>Bảo mật:</b> Đổi mật khẩu</span><i class="fa-solid fa-chevron-right text-xs"></i></a>
      </div>
    </div>`);
};
V.saveProfile = (e) => {
  e.preventDefault();
  const d = { name: $('#name').value, email: $('#email').value.trim(), phone: $('#phone').value.trim(), dob: $('#dob').value, gender: ($('input[name=gender]:checked') || {}).value };
  const r = KhachHangController.capNhatHoSo('LIEN_HE', d);
  UI.showErrors(r.fields || {}, $('#form-pf'));
  const b = $('#pf-msg'); b.classList.remove('hidden');
  b.innerHTML = r.ok ? UI.alert('success', r.msg) : UI.alert('error', `${r.error} Thông tin cũ được giữ nguyên.`);
  if (r.ok) { UI.toast(r.msg); App.renderHeader(); }
};

V.addresses = () => {
  const u = Session.user();
  return V.accountLayout('dia-chi', `
    <div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-xl font-bold">Sổ địa chỉ giao hàng</h2><p class="text-sm text-gray-500">Thiết lập địa chỉ mặc định (tối đa một) để tăng tốc điền thông tin khi đặt hàng.</p></div>
      <div class="flex items-center gap-2">${UI.uc('UC12', 'GiaoDienHoSo')}<button onclick="V.addrForm()" class="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold"><i class="fa-solid fa-plus mr-1.5"></i>Thêm địa chỉ mới</button></div></div>
    <div class="mt-6 space-y-3">${u.addresses.length ? u.addresses.map((a) => `
      <div class="rounded-2xl border ${a.isDefault ? 'border-black' : 'border-gray-200'} p-5 flex flex-wrap gap-4 justify-between">
        <div class="text-sm min-w-0">
          <p class="font-bold">${esc(a.name)} <span class="text-gray-400 font-normal">|</span> ${a.phone}
            <span class="ml-2 text-[11px] font-bold rounded-full px-2 py-0.5 bg-gray-100">${esc(a.label)}</span>
            ${a.isDefault ? '<span class="ml-1 text-[11px] font-bold rounded-full px-2 py-0.5 bg-black text-white">Mặc định</span>' : ''}</p>
          <p class="text-gray-600 mt-1">${esc(a.line)}</p><p class="text-gray-600">${esc(`${a.ward}, ${a.district}, ${a.city}`)}</p>
        </div>
        <div class="flex flex-col items-end gap-2 text-sm">
          <div class="flex gap-3"><button onclick="V.addrForm('${a.id}')" class="font-semibold underline">Sửa</button>${!a.isDefault ? `<button onclick="V.addrDel('${a.id}')" class="font-semibold text-red-600 underline">Xóa</button>` : ''}</div>
          ${!a.isDefault ? `<button onclick="V.addrDefault('${a.id}')" class="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold hover:border-black">Đặt làm mặc định</button>` : ''}
        </div>
      </div>`).join('') : UI.empty({ icon: 'fa-map-location-dot', title: 'Chưa có địa chỉ nào', desc: 'Thêm địa chỉ giao hàng để đặt hàng nhanh hơn.' })}</div>`);
};
V.addrFormHtml = (a = {}, prefix = 'ad') => `
  <form id="${prefix}-form" class="grid sm:grid-cols-2 gap-4" novalidate onsubmit="event.preventDefault()">
    ${UI.field({ id: `${prefix}-name`, label: 'Họ tên người nhận *', value: a.name || '' })}
    ${UI.field({ id: `${prefix}-phone`, label: 'Số điện thoại *', value: a.phone || '', placeholder: '09xxxxxxxx' })}
    <div><label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Tỉnh/Thành phố *</label>
      <select id="${prefix}-city" class="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"><option value="">-- Chọn --</option>${PROVINCES.map((p) => `<option ${a.city === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
      <p class="field-err text-xs text-red-600 mt-1 hidden" data-for="${prefix}-city"></p></div>
    ${UI.field({ id: `${prefix}-district`, label: 'Quận/Huyện *', value: a.district || '' })}
    ${UI.field({ id: `${prefix}-ward`, label: 'Phường/Xã *', value: a.ward || '' })}
    ${UI.field({ id: `${prefix}-line`, label: 'Số nhà, tên đường *', value: a.line || '' })}
    <div class="sm:col-span-2 flex flex-wrap items-center gap-5 text-sm">
      <span class="text-xs font-bold uppercase tracking-wider text-gray-700">Loại địa chỉ:</span>
      ${['Nhà riêng', 'Công ty'].map((l) => `<label class="flex items-center gap-1.5"><input type="radio" name="${prefix}-label" value="${l}" ${(a.label || 'Nhà riêng') === l ? 'checked' : ''} class="accent-black">${l}</label>`).join('')}
      <label class="flex items-center gap-1.5 ml-auto"><input id="${prefix}-def" type="checkbox" ${a.isDefault ? 'checked disabled' : ''} class="accent-black w-4 h-4">Đặt làm địa chỉ mặc định</label>
    </div>
    <div id="${prefix}-msg" class="sm:col-span-2 hidden"></div>
  </form>`;
V.readAddr = (prefix) => ({ name: $(`#${prefix}-name`).value, phone: $(`#${prefix}-phone`).value.trim(), city: $(`#${prefix}-city`).value, district: $(`#${prefix}-district`).value, ward: $(`#${prefix}-ward`).value, line: $(`#${prefix}-line`).value, label: ($(`input[name=${prefix}-label]:checked`) || {}).value, isDefault: $(`#${prefix}-def`).checked });
V.addrForm = (id, after) => {
  const u = Session.user(); const a = id ? u.addresses.find((x) => x.id === id) : {};
  UI.modal({
    title: id ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới', icon: '<i class="fa-solid fa-location-dot"></i>', size: 'max-w-2xl',
    body: V.addrFormHtml(a),
    actions: [{ label: 'Hủy' }, { label: 'Lưu địa chỉ', primary: true, onClick: () => {
      const d = { ...V.readAddr('ad'), id };
      const fields = {}; const r = KhachHangController.capNhatHoSo('LUU_DIA_CHI', d);
      if (!r.ok) { Object.entries(r.fields || {}).forEach(([k, v]) => { fields['ad-' + k] = v; }); UI.showErrors(fields, $('#modal-body')); const m = $('#ad-msg'); m.classList.remove('hidden'); m.innerHTML = UI.alert('error', r.error); return; }
      UI.closeModal(); UI.toast(r.msg); if (after) after(r.a); else App.render();
    } }],
  });
};
V.addrDel = async (id) => { if (await UI.confirm({ title: 'Xóa địa chỉ', message: 'Bạn có chắc muốn xóa địa chỉ này khỏi sổ địa chỉ?', okLabel: 'Xóa', danger: true })) { const r = KhachHangController.capNhatHoSo('XOA_DIA_CHI', { id }); UI.toast(r.ok ? r.msg : r.error, r.ok ? 'info' : 'error'); App.render(); } };
V.addrDefault = (id) => { const r = KhachHangController.capNhatHoSo('MAC_DINH', { id }); UI.toast(r.ok ? r.msg : r.error, r.ok ? 'success' : 'error'); App.render(); };

V.password = () => V.accountLayout('mat-khau', `
  <div class="flex flex-wrap items-center justify-between gap-2"><div><h2 class="text-xl font-bold">Đổi mật khẩu</h2><p class="text-sm text-gray-500">Xác nhận mật khẩu hiện tại trước khi thiết lập mật khẩu mới.</p></div>${UI.uc('UC12', 'GiaoDienHoSo')}</div>
  <form id="form-pw" onsubmit="V.savePw(event)" class="mt-6 rounded-2xl border border-gray-200 p-6 space-y-4 max-w-lg" novalidate>
    ${UI.field({ id: 'old', label: 'Mật khẩu hiện tại', type: 'password', icon: 'fa-lock' })}
    ${UI.field({ id: 'new', label: 'Mật khẩu mới', type: 'password', icon: 'fa-key', placeholder: 'Tối thiểu 8 ký tự, gồm chữ và số' })}
    ${UI.field({ id: 'confirm', label: 'Xác nhận mật khẩu mới', type: 'password', icon: 'fa-key' })}
    <div id="pw-msg" class="hidden"></div>
    <div class="flex items-center justify-between"><a href="#/quen-mat-khau" class="text-xs font-semibold underline text-gray-500">Quên mật khẩu hiện tại?</a><button class="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold">Cập nhật mật khẩu</button></div>
  </form>`);
V.savePw = (e) => {
  e.preventDefault();
  const r = KhachHangController.capNhatHoSo('DOI_MAT_KHAU', { old: $('#old').value, new: $('#new').value, confirm: $('#confirm').value });
  UI.showErrors(r.fields || {}, $('#form-pw'));
  const b = $('#pw-msg'); b.classList.remove('hidden'); b.innerHTML = r.ok ? UI.alert('success', r.msg) : UI.alert('error', r.error);
  if (r.ok) { $('#form-pw').reset(); UI.toast(r.msg); }
};

/* ---------------------- UC13 QUẢN LÝ ĐƠN HÀNG CÁ NHÂN ---------------------- */
const itemInfo = (it) => { const i = Catalog.info(it.sku); return { ...it, p: i.p, color: i.color.name, size: i.size }; };
V.orders = (_, q) => {
  const tab = q.tab || 'ALL';
  const kq = DonHangController.xemDanhSachDon(tab, parseInt(q.page || '1', 10));
  const tabs = [['ALL', 'Tất cả'], ['CHO_DUYET', 'Chờ duyệt'], ['DANG_DONG_GOI', 'Đang đóng gói'], ['DANG_GIAO', 'Đang giao'], ['DA_GIAO', 'Hoàn tất'], ['DA_HUY', 'Đã hủy']];
  return V.accountLayout('don-hang', `
    <div class="flex flex-wrap items-center justify-between gap-2"><div><h2 class="text-xl font-bold">Đơn hàng của tôi</h2><p class="text-sm text-gray-500">Theo dõi vòng đời đơn hàng từ Chờ duyệt → Đang đóng gói → Đang giao → Hoàn tất.</p></div>${UI.uc('UC13', 'GiaoDienDonHang')}</div>
    <div class="mt-5 flex gap-1 overflow-x-auto border-b border-gray-200">${tabs.map(([k, l]) => `<a href="#/tai-khoan/don-hang${qsStr({ tab: k === 'ALL' ? '' : k })}" class="whitespace-nowrap px-4 py-3 text-sm border-b-2 -mb-px ${tab === k ? 'border-black font-bold' : 'border-transparent text-gray-500 hover:text-black'}">${l} <span class="text-xs text-gray-400">(${kq.counts[k]})</span></a>`).join('')}</div>
    <div class="mt-5 space-y-4">${kq.danhSach.length ? kq.danhSach.map((o) => V.orderCard(o)).join('') : UI.empty({ icon: 'fa-receipt', title: tab === 'ALL' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng ở trạng thái này', action: '<a href="#/san-pham" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Mua sắm ngay</a>' })}</div>
    ${UI.pager(kq.trang, kq.soTrang, 'V.ordersPage')}`);
};
V.ordersPage = (n) => go('#/tai-khoan/don-hang' + qsStr({ ...App.route().query, page: n }));
V.orderCard = (o) => {
  const items = o.items.map(itemInfo);
  const needPay = ['CHO_CHON_PT', 'THAT_BAI'].includes(o.payStatus) && o.status !== 'DA_HUY';
  return `<div class="rounded-2xl border border-gray-200 overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-gray-50 text-sm">
      <div><b>#${o.id}</b> <span class="text-gray-400 mx-1">·</span> <span class="text-gray-500">${fdt(o.date)}</span></div>
      <div class="flex items-center gap-2">${o.trackingCode ? `<span class="text-xs text-gray-500"><i class="fa-solid fa-barcode mr-1"></i>${o.trackingCode}</span>` : ''}${UI.badgeOrder(o.status)}</div>
    </div>
    <a href="#/tai-khoan/don-hang/${o.id}" class="block px-5 py-4 hover:bg-gray-50/60">
      ${items.slice(0, 2).map((it) => `<div class="flex items-center gap-4 py-1.5"><img src="${Catalog.img(it.p, 0, 120, 150)}" class="w-14 h-16 rounded-lg object-cover" alt=""><div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate">${esc(it.p.name)}</p><p class="text-xs text-gray-500">${it.color} / ${it.size} · x${it.qty}</p></div><p class="text-sm font-semibold">${fmt(it.price * it.qty)}</p></div>`).join('')}
      ${items.length > 2 ? `<p class="text-xs text-gray-500 mt-1">+ ${items.length - 2} sản phẩm khác</p>` : ''}
    </a>
    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
      <div class="text-sm">Tổng thanh toán: <b class="text-lg">${fmt(o.total)}</b> <span class="text-xs text-gray-500 ml-1">${o.payMethod ? PAY_LABEL[o.payMethod] : ''}</span></div>
      <div class="flex flex-wrap gap-2">
        ${needPay ? `<a href="#/thanh-toan/${o.id}" class="text-xs font-bold bg-amber-500 text-white rounded-lg px-3.5 py-2">Thanh toán ngay</a>` : ''}
        ${['CHO_DUYET', 'DANG_DONG_GOI'].includes(o.status) ? `<button onclick="V.cancelOrder('${o.id}')" class="text-xs font-bold border border-gray-300 rounded-lg px-3.5 py-2 hover:border-red-500 hover:text-red-600">Hủy đơn</button>` : ''}
        ${o.status !== 'DA_HUY' ? `<a href="#/tai-khoan/don-hang/${o.id}/van-chuyen" class="text-xs font-bold border border-gray-300 rounded-lg px-3.5 py-2 hover:border-black"><i class="fa-solid fa-truck-fast mr-1"></i>Xem vận chuyển</a>` : ''}
        <a href="#/tai-khoan/don-hang/${o.id}" class="text-xs font-bold bg-black text-white rounded-lg px-3.5 py-2">Xem chi tiết</a>
      </div>
    </div>
  </div>`;
};

V.orderDetail = ([id]) => {
  const r = DonHangController.xemChiTietDon(id);
  if (!r.ok) return V.accountLayout('don-hang', `${UI.uc('UC13', 'GiaoDienDonHang')}${UI.empty({ icon: 'fa-file-circle-xmark', title: 'Không thể xem đơn hàng', desc: r.error, action: '<a href="#/tai-khoan/don-hang" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Về danh sách đơn</a>' })}`);
  const o = r.o; const items = o.items.map(itemInfo);
  const step = ORDER_STEPS.indexOf(['HEN_GIAO_LAI', 'GIAO_THAT_BAI'].includes(o.status) ? 'DANG_GIAO' : o.status);
  const stepLbl = [['Chờ duyệt', 'fa-hourglass-half'], ['Đang đóng gói', 'fa-box'], ['Đang giao', 'fa-truck-fast'], ['Hoàn tất', 'fa-circle-check']];
  const han = DonHangController.hanDoiTra(o); const yc = DonHangController.yeuCauDoiTraCua(o.id);
  const needPay = ['CHO_CHON_PT', 'THAT_BAI'].includes(o.payStatus) && o.status !== 'DA_HUY';
  return V.accountLayout('don-hang', `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div><a href="#/tai-khoan/don-hang" class="text-xs font-semibold text-gray-500 hover:text-black"><i class="fa-solid fa-arrow-left mr-1"></i>Danh sách đơn hàng</a>
      <h2 class="text-xl font-bold mt-1">Đơn hàng #${o.id}</h2><p class="text-sm text-gray-500">Đặt lúc ${fdt(o.date)}</p></div>
      <div class="flex items-center gap-2">${UI.uc('UC13', 'GiaoDienDonHang')}${UI.badgeOrder(o.status)}</div>
    </div>

    ${needPay ? `<div class="mt-4">${UI.alert('warn', `Đơn hàng <b>chưa được thanh toán</b> (${PAY_STATUS[o.payStatus].label.toLowerCase()}). <a href="#/thanh-toan/${o.id}" class="underline font-bold">Tiếp tục thanh toán</a>`)}</div>` : ''}

    ${o.status === 'DA_HUY' ? `<div class="mt-5 rounded-2xl bg-gray-100 p-5 flex gap-4"><i class="fa-solid fa-ban text-2xl text-gray-500"></i><div class="text-sm"><p class="font-bold">Đơn hàng đã bị hủy</p><p class="text-gray-600">Lý do: ${esc(o.cancelReason || '—')}</p>${o.payStatus === 'CHO_HOAN_TIEN' ? `<p class="text-blue-700 mt-1"><i class="fa-solid fa-rotate-left mr-1"></i>Yêu cầu hoàn tiền ${fmt(o.refund?.soTien || o.total)} đang được cổng thanh toán xử lý (mã ${o.refund?.ma || ''}).</p>` : ''}${o.payStatus === 'DA_HOAN_TIEN' ? `<p class="text-emerald-700 mt-1"><i class="fa-solid fa-circle-check mr-1"></i>Đã hoàn tiền ${fmt(o.total)}.</p>` : ''}</div></div>` : `
    <div class="mt-5 rounded-2xl border border-gray-200 p-6">
      <div class="grid grid-cols-4 relative">
        <div class="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-gray-200 rounded"><div class="h-full bg-black rounded" style="width:${(step / 3) * 100}%"></div></div>
        ${stepLbl.map(([l, ic], i) => `<div class="relative text-center"><div class="mx-auto w-11 h-11 rounded-full flex items-center justify-center ${i <= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}"><i class="fa-solid ${ic} text-sm"></i></div><p class="text-xs mt-2 ${i <= step ? 'font-bold' : 'text-gray-400'}">${l}</p></div>`).join('')}
      </div>
    </div>`}

    <div class="mt-5 grid xl:grid-cols-[1fr_320px] gap-5 items-start">
      <div class="space-y-5">
        <div class="rounded-2xl border border-gray-200">
          <p class="px-5 py-3 font-bold border-b border-gray-100">Sản phẩm (${items.length})</p>
          ${items.map((it) => `<div class="flex items-center gap-4 px-5 py-3"><a href="#/san-pham/${it.p.id}"><img src="${Catalog.img(it.p, 0, 120, 150)}" class="w-16 h-20 rounded-lg object-cover" alt=""></a><div class="flex-1 min-w-0"><a href="#/san-pham/${it.p.id}" class="text-sm font-semibold hover:underline">${esc(it.p.name)}</a><p class="text-xs text-gray-500">${it.color} / ${it.size} · <span class="font-mono">${it.sku}</span></p><p class="text-xs text-gray-500">${fmt(it.price)} × ${it.qty}</p></div><p class="font-semibold text-sm">${fmt(it.price * it.qty)}</p></div>`).join('')}
          <div class="px-5 py-4 border-t border-gray-100 text-sm space-y-1.5">
            <div class="flex justify-between"><span class="text-gray-500">Tiền hàng</span><span>${fmt(o.subtotal)}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Phí vận chuyển</span><span>${o.shipFee ? fmt(o.shipFee) : 'Miễn phí'}</span></div>
            ${o.discount ? `<div class="flex justify-between"><span class="text-gray-500">Giảm giá${o.voucher ? ` (${o.voucher})` : ''}</span><span class="text-red-600">-${fmt(o.discount)}</span></div>` : ''}
            <div class="flex justify-between pt-2 border-t border-gray-100"><b>Tổng thanh toán</b><b class="text-lg">${fmt(o.total)}</b></div>
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 p-5">
          <p class="font-bold mb-3">Lịch sử xử lý đơn hàng</p>
          <ol class="relative border-l-2 border-gray-200 ml-2 space-y-4">${[...o.history].reverse().map((h, i) => `<li class="pl-5 relative"><span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-300'}"></span><p class="text-sm ${i === 0 ? 'font-semibold' : 'text-gray-600'}">${esc(h.s)}</p><p class="text-xs text-gray-400">${fdt(h.t)}</p></li>`).join('')}</ol>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-2xl border border-gray-200 p-5 text-sm">
          <p class="font-bold mb-2"><i class="fa-solid fa-location-dot mr-2 text-gray-400"></i>Địa chỉ nhận hàng</p>
          <p class="font-semibold">${esc(o.receiver.name)} · ${o.receiver.phone}</p><p class="text-gray-600">${esc(o.receiver.address)}</p>
        </div>
        <div class="rounded-2xl border border-gray-200 p-5 text-sm space-y-1.5">
          <p class="font-bold mb-1"><i class="fa-solid fa-wallet mr-2 text-gray-400"></i>Thanh toán</p>
          <p>${o.payMethod ? PAY_LABEL[o.payMethod] : 'Chưa chọn phương thức'}</p><p>${UI.payStatus(o.payStatus)}</p>${o.txnId ? `<p class="text-xs text-gray-500">Mã giao dịch: ${o.txnId}</p>` : ''}
        </div>
        <div class="rounded-2xl border border-gray-200 p-5 text-sm">
          <p class="font-bold mb-2"><i class="fa-solid fa-truck mr-2 text-gray-400"></i>Vận chuyển</p>
          <p class="text-gray-600">${o.carrier}</p>
          ${o.trackingCode ? `<div class="mt-2 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"><span>Mã vận đơn: <b class="font-mono">${o.trackingCode}</b></span><button onclick="App.copy('${o.trackingCode}','Đã sao chép mã vận đơn')" class="text-xs font-bold underline">Sao chép</button></div>` : '<p class="text-xs text-gray-500 mt-1">Chưa có mã vận đơn – sẽ cập nhật khi đơn được bàn giao cho đơn vị vận chuyển.</p>'}
        </div>
        <div class="rounded-2xl border border-gray-200 p-5 text-sm space-y-2">
          <p class="font-bold mb-1">Thao tác</p>
          ${needPay ? `<a href="#/thanh-toan/${o.id}" class="block text-center font-bold bg-amber-500 text-white rounded-xl py-2.5">Thanh toán ngay</a>` : ''}
          ${o.status !== 'DA_HUY' ? `<a href="#/tai-khoan/don-hang/${o.id}/van-chuyen" class="block text-center font-bold bg-black text-white rounded-xl py-2.5"><i class="fa-solid fa-truck-fast mr-1.5"></i>Xem quá trình vận chuyển</a>` : ''}
          <button onclick="V.invoice('${o.id}')" class="w-full font-bold border border-gray-300 rounded-xl py-2.5 hover:border-black"><i class="fa-solid fa-file-invoice mr-1.5"></i>Tải hóa đơn điện tử</button>
          ${['CHO_DUYET', 'DANG_DONG_GOI'].includes(o.status) ? `<button onclick="V.cancelOrder('${o.id}')" class="w-full font-bold border border-gray-300 rounded-xl py-2.5 hover:border-red-500 hover:text-red-600"><i class="fa-solid fa-ban mr-1.5"></i>Hủy đơn</button>` : ''}
          ${han ? (yc ? `<div class="rounded-xl bg-blue-50 p-3 text-xs text-blue-800"><b>Yêu cầu đổi trả ${yc.id}</b> – ${esc(yc.option)}<br>Trạng thái: <b>${{ CHO_TIEP_NHAN: 'Chờ tiếp nhận', DA_CHAP_NHAN: 'Đã chấp nhận', TU_CHOI: 'Từ chối' }[yc.status]}</b> · gửi lúc ${fdt(yc.t)}</div>`
            : `<button onclick="V.returnForm('${o.id}')" class="w-full font-bold border border-gray-300 rounded-xl py-2.5 hover:border-black"><i class="fa-solid fa-rotate-left mr-1.5"></i>Yêu cầu đổi trả / khiếu nại</button><p class="text-[11px] ${new Date() > han ? 'text-red-600' : 'text-gray-500'} text-center">${new Date() > han ? 'Đã quá' : 'Còn'} hạn đổi trả đến ${fdt(han)}</p>`) : ''}
          <button onclick="V.reorder('${o.id}')" class="w-full font-bold border border-gray-300 rounded-xl py-2.5 hover:border-black"><i class="fa-solid fa-cart-plus mr-1.5"></i>Mua lại</button>
        </div>
      </div>
    </div>`);
};

/* Tải hóa đơn điện tử (đã phát hành) */
V.invoice = (id) => {
  const r = DonHangController.taiHoaDon(id);
  if (!r.ok) return UI.modal({ title: 'Chưa có hóa đơn', icon: '<i class="fa-solid fa-file-circle-exclamation text-amber-500"></i>', size: 'max-w-md', body: UI.alert('info', r.error), actions: [{ label: 'Đã hiểu', primary: true }] });
  const o = r.o; const items = o.items.map(itemInfo);
  UI.modal({
    title: `Hóa đơn điện tử ${o.invoice.no}`, icon: '<i class="fa-solid fa-file-invoice"></i>', size: 'max-w-2xl',
    body: `<div id="print-area" class="text-sm text-gray-800">
      <div class="flex justify-between items-start border-b pb-4"><div><p class="text-xl font-black tracking-widest">URBAN CHIC®</p><p class="text-xs text-gray-500">Công ty TNHH Thời trang Urban Chic · MST 0318xxxxxx<br>273 An Dương Vương, Q.5, TP.HCM</p></div><div class="text-right"><p class="font-bold">HÓA ĐƠN GTGT</p><p class="text-xs">Số: ${o.invoice.no}</p><p class="text-xs">Ngày: ${fdt(o.invoice.date, false)}</p></div></div>
      <div class="grid grid-cols-2 gap-4 py-4 text-xs"><div><p class="text-gray-500">Khách hàng</p><p class="font-semibold">${esc(o.receiver.name)}</p><p>${esc(o.receiver.address)}</p></div><div><p class="text-gray-500">Đơn hàng</p><p class="font-semibold">#${o.id}</p><p>Thanh toán: ${PAY_LABEL[o.payMethod] || ''}</p></div></div>
      <table class="w-full text-xs"><thead><tr class="bg-gray-100 text-left"><th class="p-2">Sản phẩm</th><th class="p-2 text-center">SL</th><th class="p-2 text-right">Đơn giá</th><th class="p-2 text-right">Thành tiền</th></tr></thead><tbody>
      ${items.map((it) => `<tr class="border-b"><td class="p-2">${esc(it.p.name)} (${it.color}/${it.size})</td><td class="p-2 text-center">${it.qty}</td><td class="p-2 text-right">${fmt(it.price)}</td><td class="p-2 text-right">${fmt(it.price * it.qty)}</td></tr>`).join('')}
      </tbody></table>
      <div class="mt-3 ml-auto max-w-xs text-xs space-y-1"><div class="flex justify-between"><span>Tiền hàng</span><span>${fmt(o.subtotal)}</span></div><div class="flex justify-between"><span>Phí vận chuyển</span><span>${fmt(o.shipFee)}</span></div><div class="flex justify-between"><span>Giảm giá</span><span>-${fmt(o.discount)}</span></div><div class="flex justify-between font-bold text-sm border-t pt-1"><span>Tổng cộng</span><span>${fmt(o.total)}</span></div></div>
    </div>`,
    actions: [{ label: 'Đóng' }, { label: '<i class="fa-solid fa-download mr-1.5"></i>In / Tải PDF', primary: true, onClick: () => window.print() }],
  });
};

/* --------------------------------- UC14 HỦY ĐƠN --------------------------------- */
V.cancelOrder = (id) => {
  const r = DonHangController.xemChiTietDon(id); if (!r.ok) return UI.toast(r.error, 'error');
  const o = r.o;
  if (!DonHangController.coTheHuy(o)) {
    const k = DonHangController.huyDon(id, 'x');
    return UI.modal({ title: 'Không thể hủy đơn hàng', icon: '<i class="fa-solid fa-circle-xmark text-red-500"></i>', size: 'max-w-md', body: `<div class="flex justify-between mb-3"><span>Trạng thái hiện tại: ${UI.badgeOrder(o.status)}</span>${UI.uc('UC14', '')}</div>${UI.alert('error', k.error)}`, actions: [{ label: 'Đã hiểu', primary: true }] });
  }
  const reasons = ['Muốn thay đổi địa chỉ / số điện thoại nhận hàng', 'Muốn thay đổi sản phẩm / size / màu', 'Đặt nhầm sản phẩm / size', 'Tìm được nơi khác giá tốt hơn', 'Không còn nhu cầu mua', 'Lý do khác'];
  const paid = o.payStatus === 'DA_THANH_TOAN' && o.payMethod !== 'COD';
  UI.modal({
    title: `Hủy đơn hàng #${o.id}`, icon: '<i class="fa-solid fa-ban text-red-500"></i>', size: 'max-w-md',
    body: `<div class="flex justify-end mb-2">${UI.uc('UC14', 'GiaoDienDonHang')}</div>
      <p class="mb-3">Vui lòng chọn lý do hủy đơn:</p>
      <div class="space-y-2">${reasons.map((x, i) => `<label class="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer has-[:checked]:border-black"><input type="radio" name="cr" value="${x}" ${i === 0 ? '' : ''} class="accent-black">${x}</label>`).join('')}</div>
      <textarea id="cr-note" rows="2" placeholder="Ghi chú thêm (không bắt buộc)" class="mt-3 w-full border border-gray-200 rounded-xl p-3 text-sm"></textarea>
      <div class="mt-3">${paid ? UI.alert('info', `Đơn đã thanh toán qua <b>${PAY_LABEL[o.payMethod]}</b>. Sau khi hủy, hệ thống sẽ gửi yêu cầu hoàn tiền <b>${fmt(o.total)}</b> tới cổng thanh toán (3–5 ngày làm việc).`) : UI.alert('info', 'Tồn kho đang giữ cho đơn sẽ được giải phóng ngay khi hủy.')}</div>
      <p id="cr-err" class="text-xs text-red-600 mt-2 hidden"></p>`,
    actions: [{ label: 'Không hủy' }, { label: 'Xác nhận hủy đơn', danger: true, onClick: () => {
      const sel = $('input[name=cr]:checked');
      if (!sel) { const e = $('#cr-err'); e.textContent = 'Vui lòng chọn lý do hủy đơn.'; e.classList.remove('hidden'); return; }
      const note = $('#cr-note').value.trim();
      const k = DonHangController.huyDon(o.id, sel.value + (note ? ` (${note})` : ''));
      UI.closeModal();
      if (!k.ok) return UI.modal({ title: 'Không thể hủy đơn', body: UI.alert('error', k.error), actions: [{ label: 'Đóng', primary: true }] });
      App.render(); App.renderHeader();
      UI.modal({ title: 'Đã hủy đơn hàng', icon: '<i class="fa-solid fa-circle-check text-emerald-500"></i>', size: 'max-w-md', body: `<p>Đơn hàng <b>#${o.id}</b> đã chuyển sang trạng thái <b>Đã hủy</b>.</p>${k.hoanTien ? `<div class="mt-3">${UI.alert('info', `Yêu cầu hoàn tiền <b>${fmt(k.hoanTien.soTien)}</b> đã được gửi tới cổng thanh toán – mã <b>${k.hoanTien.ma}</b>. Trạng thái: <b>Đang xử lý hoàn tiền</b>.`)}</div>` : ''}`, actions: [{ label: 'Đóng', primary: true }] });
    } }],
  });
};

/* Yêu cầu đổi trả / khiếu nại (theo mô tả Phân hệ 1 – BTH2; tiếp nhận ở Phân hệ 2) */
V.returnForm = (id) => {
  const r = DonHangController.xemChiTietDon(id); const o = r.o; const han = DonHangController.hanDoiTra(o);
  if (new Date() > han) return UI.modal({ title: 'Không thể gửi yêu cầu đổi trả', icon: '<i class="fa-solid fa-circle-xmark text-red-500"></i>', size: 'max-w-md', body: UI.alert('error', `Đơn hàng đã quá thời hạn đổi trả ${SEED.policy.soNgayDoiTra} ngày kể từ khi nhận hàng (hạn cuối ${fdt(han)}).`), actions: [{ label: 'Đã hiểu', primary: true }] });
  V._retImgs = [];
  const items = o.items.map(itemInfo);
  UI.modal({
    title: `Yêu cầu đổi trả – đơn #${o.id}`, icon: '<i class="fa-solid fa-rotate-left"></i>', size: 'max-w-xl',
    body: `<p class="text-xs text-gray-500 mb-3">Hạn đổi trả đến ${fdt(han)}. Yêu cầu sẽ được Nhân viên vận hành thẩm định theo chính sách đổi trả.</p>
      <p class="font-bold mb-2">1. Sản phẩm cần đổi/trả</p>
      <div class="space-y-2">${items.map((it) => `<label class="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5 cursor-pointer"><input type="checkbox" name="ri" value="${it.sku}" class="accent-black w-4 h-4"><img src="${Catalog.img(it.p, 0, 80, 100)}" class="w-10 h-12 rounded object-cover" alt=""><span class="text-sm">${esc(it.p.name)} <span class="text-gray-500">(${it.color}/${it.size}) x${it.qty}</span></span></label>`).join('')}</div>
      <p class="font-bold mt-4 mb-2">2. Lý do</p>
      <select id="rr" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"><option value="">-- Chọn lý do --</option>${['Sản phẩm lỗi / hư hỏng', 'Giao sai sản phẩm / màu / size', 'Không vừa size', 'Sản phẩm khác mô tả', 'Khác'].map((x) => `<option>${x}</option>`).join('')}</select>
      <textarea id="rd" rows="2" placeholder="Mô tả chi tiết (vd: đường chỉ ở cổ áo bị sứt...)" class="mt-2 w-full border border-gray-200 rounded-xl p-3 text-sm"></textarea>
      <p class="font-bold mt-4 mb-2">3. Phương án mong muốn</p>
      <div class="grid sm:grid-cols-3 gap-2 text-sm">${['Đổi size / màu', 'Đổi sản phẩm mới cùng mã', 'Trả hàng – hoàn tiền'].map((x, i) => `<label class="border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-2 has-[:checked]:border-black"><input type="radio" name="ro" value="${x}" ${i === 0 ? 'checked' : ''} class="accent-black">${x}</label>`).join('')}</div>
      <p class="font-bold mt-4 mb-2">4. Hình ảnh minh chứng</p>
      <label class="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 cursor-pointer hover:border-black"><i class="fa-solid fa-camera"></i>Tải ảnh lên (tối đa 3 ảnh)<input type="file" accept="image/*" multiple class="hidden" onchange="V.retPick(this.files)"></label>
      <div id="ret-imgs" class="flex gap-2 mt-2"></div>
      <p id="ret-err" class="text-xs text-red-600 mt-2 hidden"></p>`,
    actions: [{ label: 'Hủy' }, { label: 'Gửi yêu cầu', primary: true, onClick: () => {
      const k = DonHangController.guiYeuCauDoiTra(id, { items: $$('input[name=ri]:checked').map((x) => x.value), reason: $('#rr').value, detail: $('#rd').value, option: ($('input[name=ro]:checked') || {}).value, images: V._retImgs });
      if (!k.ok) { const e = $('#ret-err'); e.textContent = k.error; e.classList.remove('hidden'); return; }
      UI.closeModal(); App.render();
      UI.modal({ title: 'Đã gửi yêu cầu đổi trả', icon: '<i class="fa-solid fa-circle-check text-emerald-500"></i>', size: 'max-w-md', body: `<p>Mã yêu cầu <b>${k.yc.id}</b> đã được gửi tới bộ phận vận hành – trạng thái <b>Chờ tiếp nhận</b>.</p><p class="text-xs text-gray-500 mt-2">Nếu hợp lệ, nhân viên sẽ tạo mã vận đơn thu hồi và kích hoạt đổi sản phẩm hoặc hoàn tiền.</p>`, actions: [{ label: 'Đóng', primary: true }] });
    } }],
  });
};
V.retPick = (files) => {
  [...files].slice(0, 3 - V._retImgs.length).forEach((f) => {
    const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); const s = 240 / Math.max(im.width, im.height); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); V._retImgs.push(c.toDataURL('image/jpeg', 0.7)); $('#ret-imgs').innerHTML = V._retImgs.map((u) => `<img src="${u}" class="w-16 h-16 rounded-lg object-cover ring-1 ring-gray-200">`).join(''); }; im.src = rd.result; };
    rd.readAsDataURL(f);
  });
};
V.reorder = (id) => {
  const o = DonHangController.xemChiTietDon(id).o; let n = 0; const errs = [];
  o.items.forEach((it) => { const r = GioHangController.themVaoGio(it.sku, it.qty); if (r.ok) n++; else errs.push(r.error); });
  App.renderHeader();
  if (n) { UI.toast(`Đã thêm ${n} sản phẩm vào giỏ hàng.`); go('#/gio-hang'); } else UI.toast(errs[0] || 'Không thể mua lại', 'error');
};

/* ------------------------- UC15 XEM QUÁ TRÌNH VẬN CHUYỂN ------------------------- */
V.tracking = ([id]) => ({
  html: V.accountLayout('don-hang', `
    <div class="flex flex-wrap items-center justify-between gap-2"><div><a href="#/tai-khoan/don-hang/${id}" class="text-xs font-semibold text-gray-500 hover:text-black"><i class="fa-solid fa-arrow-left mr-1"></i>Chi tiết đơn #${id}</a><h2 class="text-xl font-bold mt-1">Theo dõi vận chuyển</h2></div>${UI.uc('UC15', 'GiaoDienTheoDoi')}</div>
    <div id="trk" class="mt-5"><div class="rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-3 block text-gray-400"></i>Đang kết nối API Đơn vị vận chuyển để tra cứu hành trình…</div></div>`),
  after: () => V.loadTracking(id),
});
V.loadTracking = async (id) => {
  const k = await VanChuyenController.theoDoiVanChuyen(id);
  const box = $('#trk'); if (!box) return;
  if (k.state === 'KHONG_TIM_THAY') { box.innerHTML = UI.alert('error', `Không thể theo dõi đơn: ${k.error}`); return; }
  const o = k.o;
  const head = `<div class="rounded-2xl bg-gray-900 text-white p-6 flex flex-wrap gap-6 justify-between">
    <div><p class="text-xs text-white/60 uppercase tracking-wider">Đơn vị vận chuyển</p><p class="font-bold text-lg">${o.carrier}</p></div>
    <div><p class="text-xs text-white/60 uppercase tracking-wider">Mã vận đơn</p><p class="font-bold text-lg font-mono">${o.trackingCode || '—'} ${o.trackingCode ? `<button onclick="App.copy('${o.trackingCode}','Đã sao chép mã vận đơn')" class="text-xs underline ml-1 font-sans">Sao chép</button>` : ''}</p></div>
    <div><p class="text-xs text-white/60 uppercase tracking-wider">Trạng thái đơn</p><p class="mt-1">${UI.badgeOrder(o.status)}</p></div>
    <div><p class="text-xs text-white/60 uppercase tracking-wider">Giao tới</p><p class="text-sm max-w-xs">${esc(o.receiver.address)}</p></div></div>`;
  if (k.state === 'DA_HUY') { box.innerHTML = head + `<div class="mt-4">${UI.alert('info', 'Đơn hàng đã bị hủy nên không có hành trình vận chuyển.')}</div>`; return; }
  if (k.state === 'CHUA_CO_MA') {
    box.innerHTML = head + `<div class="mt-4 rounded-2xl border border-gray-200 p-8 text-center"><div class="mx-auto w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3"><i class="fa-solid ${o.status === 'CHO_DUYET' ? 'fa-hourglass-half' : 'fa-box'}"></i></div><p class="font-bold">Chưa có thông tin vận chuyển</p><p class="text-sm text-gray-500 mt-1">Đơn hàng đang ở trạng thái <b>${ORDER_STATUS[o.status].label}</b> và chưa được gán mã vận đơn. Hành trình sẽ hiển thị khi đơn được bàn giao cho đơn vị vận chuyển.</p></div>`;
    return;
  }
  const ev = [...(k.events || [])].reverse();
  box.innerHTML = head + `
    ${k.state === 'LOI_API' ? `<div class="mt-4">${UI.alert('warn', `<b>Tạm thời không thể cập nhật hành trình mới.</b> ${k.error} Đang hiển thị trạng thái gần nhất đã lưu (cập nhật lúc ${fdt(k.updatedAt)}).`)}</div>` : `<p class="text-xs text-gray-500 mt-3"><i class="fa-solid fa-rotate mr-1"></i>Đã đồng bộ từ API ${o.carrier} lúc ${fdt(k.updatedAt)}</p>`}
    <div class="mt-4 rounded-2xl border border-gray-200 p-6">
      ${ev.length ? `<ol class="relative border-l-2 border-gray-200 ml-3 space-y-6">${ev.map((e, i) => `<li class="pl-7 relative"><span class="absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}"><i class="fa-solid ${i === 0 ? (o.status === 'DA_GIAO' ? 'fa-check' : 'fa-truck-fast') : 'fa-circle'} text-[9px]"></i></span><p class="text-sm ${i === 0 ? 'font-bold' : 'text-gray-700'}">${esc(e.s)}</p><p class="text-xs text-gray-500 mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i>${esc(e.loc)} · ${fdt(e.t)}</p></li>`).join('')}</ol>` : '<p class="text-sm text-gray-500">Chưa có dữ liệu hành trình.</p>'}
    </div>
    <div class="mt-4 flex justify-end"><button onclick="App.render()" class="text-sm font-bold border border-gray-300 rounded-xl px-4 py-2.5 hover:border-black"><i class="fa-solid fa-rotate mr-1.5"></i>Làm mới hành trình</button></div>`;
};
