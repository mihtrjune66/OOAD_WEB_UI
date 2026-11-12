/* ====== UC16 Đặt hàng · UC17 Thanh toán · UC18 COD · UC19 MoMo/VNPay ====== */
const CK = { addrId: null, name: '', phone: '', voucher: '', voucherInput: '', note: '', quote: null, uid: null };

const stepsBar = (n) => `<div class="flex items-center justify-center gap-2 sm:gap-4 text-xs font-semibold">${['Giỏ hàng', 'Đặt hàng', 'Thanh toán', 'Hoàn tất'].map((s, i) => `<div class="flex items-center gap-2 ${i <= n ? 'text-black' : 'text-gray-400'}"><span class="w-7 h-7 rounded-full flex items-center justify-center ${i < n ? 'bg-black text-white' : i === n ? 'bg-black text-white ring-4 ring-gray-200' : 'bg-gray-200'}">${i < n ? '<i class="fa-solid fa-check text-[10px]"></i>' : i + 1}</span><span class="hidden sm:inline">${s}</span></div>${i < 3 ? '<span class="w-6 sm:w-12 h-px bg-gray-300"></span>' : ''}`).join('')}</div>`;

V.checkout = () => {
  const r = DatHangController.chuanBiDatHang();
  if (!r.ok) {
    if (r.code === 'CAN_DANG_NHAP') { setTimeout(() => go('#/dang-nhap?next=' + encodeURIComponent('#/dat-hang')), 0); return ''; }
    return `<div class="max-w-3xl mx-auto px-4 py-10">${UI.uc('UC16', 'GiaoDienDatHang')}${UI.empty({ icon: 'fa-cart-arrow-down', title: 'Không thể đặt hàng', desc: r.error, action: '<a href="#/san-pham" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Tiếp tục mua sắm</a>' })}</div>`;
  }
  const u = r.u;
  if (CK.uid !== u.id) Object.assign(CK, { uid: u.id, addrId: null, voucher: '', voucherInput: '', note: '', quote: null });
  if (!CK.addrId || !u.addresses.some((a) => a.id === CK.addrId)) {
    const d = u.addresses.find((a) => a.isDefault) || u.addresses[0];
    CK.addrId = d ? d.id : null; CK.name = d ? d.name : u.name; CK.phone = d ? d.phone : u.phone;
  }
  const addr = u.addresses.find((a) => a.id === CK.addrId);
  const nhan = addr ? { ...addr, name: CK.name, phone: CK.phone } : { name: CK.name, phone: CK.phone };
  const t = DatHangController.tinhDonHang(nhan, CK.voucher);
  CK.quote = { tong: t.tong };
  const vsOk = DB.data.vouchers.filter((v) => !KhuyenMaiController.trangThai(v));

  return `<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-wrap items-center justify-between gap-3">${UI.crumbs([['Giỏ hàng', '#/gio-hang'], ['Đặt hàng', '']])}${UI.uc('UC16', 'GiaoDienDatHang')}</div>
    <div class="mt-5">${stepsBar(1)}</div>
    <div class="mt-8 grid lg:grid-cols-[1fr_400px] gap-8 items-start">
      <div class="space-y-6">
        <section class="rounded-2xl border border-gray-200 p-6">
          <div class="flex items-center justify-between"><h3 class="font-bold"><span class="inline-flex w-6 h-6 rounded-full bg-black text-white text-xs items-center justify-center mr-2">1</span>Địa chỉ giao hàng</h3><button onclick="V.addrForm(null, (a)=>{CK.addrId=a.id;CK.name=a.name;CK.phone=a.phone;App.render();})" class="text-sm font-semibold underline">+ Thêm địa chỉ mới</button></div>
          ${u.addresses.length ? `<div class="mt-4 grid sm:grid-cols-2 gap-3">${u.addresses.map((a) => `
            <label class="relative rounded-xl border-2 ${a.id === CK.addrId ? 'border-black' : 'border-gray-200 hover:border-gray-400'} p-4 cursor-pointer text-sm">
              <input type="radio" name="ck-addr" class="hidden" onchange="CK.addrId='${a.id}';CK.name='${esc(a.name)}';CK.phone='${a.phone}';App.render()" ${a.id === CK.addrId ? 'checked' : ''}>
              <p class="font-bold">${esc(a.label)} ${a.isDefault ? '<span class="text-[10px] bg-black text-white rounded-full px-2 py-0.5 ml-1">Mặc định</span>' : ''}</p>
              <p class="text-gray-600 mt-1">${esc(`${a.line}, ${a.ward}, ${a.district}, ${a.city}`)}</p>
              ${a.id === CK.addrId ? '<i class="fa-solid fa-circle-check absolute top-3 right-3"></i>' : ''}
            </label>`).join('')}</div>` : `<div class="mt-4">${UI.alert('warn', 'Bạn chưa có địa chỉ giao hàng. Vui lòng <b>thêm địa chỉ mới</b> để tiếp tục.')}</div>`}
          <div class="mt-4 grid sm:grid-cols-2 gap-4">
            ${UI.field({ id: 'ck-name', label: 'Họ tên người nhận *', value: CK.name, err: t.nhanLoi.name && CK.touched ? t.nhanLoi.name : '', attrs: 'onchange="CK.name=this.value;CK.touched=1;App.render()"' })}
            ${UI.field({ id: 'ck-phone', label: 'Số điện thoại nhận hàng *', value: CK.phone, err: t.nhanLoi.phone && CK.touched ? t.nhanLoi.phone : '', attrs: 'onchange="CK.phone=this.value.trim();CK.touched=1;App.render()"' })}
          </div>
          ${t.nhanLoi.address && addr ? '' : t.nhanLoi.address ? `<p class="text-xs text-red-600 mt-2">${t.nhanLoi.address}</p>` : ''}
          <textarea onchange="CK.note=this.value" rows="2" placeholder="Ghi chú cho đơn hàng (giao giờ hành chính, gọi trước khi giao...)" class="mt-4 w-full border border-gray-200 rounded-xl p-3 text-sm">${esc(CK.note)}</textarea>
        </section>

        <section class="rounded-2xl border border-gray-200">
          <div class="flex items-center justify-between px-6 pt-5"><h3 class="font-bold"><span class="inline-flex w-6 h-6 rounded-full bg-black text-white text-xs items-center justify-center mr-2">2</span>Sản phẩm (${t.gio.soLuong})</h3><a href="#/gio-hang" class="text-sm font-semibold underline">Sửa giỏ hàng</a></div>
          <div class="divide-y divide-gray-100 mt-2">${t.gio.lines.map((l) => `<div class="flex items-center gap-4 px-6 py-3 ${l.warn ? 'bg-red-50/50' : ''}"><img src="${Catalog.img(l.p, 0, 120, 150)}" class="w-14 h-16 rounded-lg object-cover" alt=""><div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate">${esc(l.p.name)}</p><p class="text-xs text-gray-500">${l.color.name} / ${l.size} · ${fmt(l.price)} × ${l.qty}</p>${l.warn ? `<p class="text-xs text-red-600 font-semibold">${l.warn}</p>` : ''}</div><p class="text-sm font-semibold">${fmt(l.lineTotal)}</p></div>`).join('')}</div>
        </section>

        <section class="rounded-2xl border border-gray-200 p-6">
          <h3 class="font-bold"><span class="inline-flex w-6 h-6 rounded-full bg-black text-white text-xs items-center justify-center mr-2">3</span>Mã giảm giá (Voucher)</h3>
          <div class="mt-4 flex gap-2">
            <input id="ck-voucher" value="${esc(CK.voucherInput)}" placeholder="Nhập mã voucher, vd: SALE50K" class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm uppercase" onkeydown="if(event.key==='Enter'){event.preventDefault();V.applyVoucher()}">
            <button onclick="V.applyVoucher()" class="bg-black text-white rounded-xl px-5 text-sm font-bold">Áp dụng</button>
          </div>
          ${t.voucher ? `<div class="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 text-emerald-800 px-4 py-2.5 text-sm"><span><i class="fa-solid fa-ticket mr-2"></i>Đã áp dụng <b>${t.voucher.code}</b> – ${KhuyenMaiController.moTa(t.voucher)}</span><button onclick="CK.voucher='';CK.voucherInput='';App.render()" class="text-xs font-bold underline">Bỏ mã</button></div>` : ''}
          ${t.loiVoucher ? `<div class="mt-3">${UI.alert('error', `${t.loiVoucher} <button onclick="CK.voucher='';CK.voucherInput='';App.render()" class="underline font-bold ml-1">Bỏ mã</button> hoặc chọn mã khác bên dưới.`)}</div>` : ''}
          <p class="text-xs text-gray-500 mt-4 mb-2">Mã đang có hiệu lực:</p>
          <div class="flex flex-wrap gap-2">${vsOk.map((v) => `<button onclick="CK.voucher='${v.code}';CK.voucherInput='${v.code}';App.render()" class="text-xs border ${CK.voucher === v.code ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'} rounded-full px-3 py-1.5"><b>${v.code}</b> · ${v.title}</button>`).join('')}</div>
        </section>
      </div>

      <aside class="rounded-2xl bg-gray-50 p-6 lg:sticky lg:top-28">
        <h3 class="font-bold text-lg">Bảng tính tiền</h3>
        <div class="mt-4 space-y-2.5 text-sm">
          <div class="flex justify-between"><span class="text-gray-600">Tiền hàng (${t.gio.soLuong} sp)</span><span>${fmt(t.gio.tamTinh)}</span></div>
          ${t.giam ? `<div class="flex justify-between"><span class="text-gray-600">Giảm giá voucher</span><span class="text-red-600">-${fmt(t.giam)}</span></div>` : ''}
          <div class="flex justify-between"><span class="text-gray-600">Phí vận chuyển <span class="block text-[11px] text-gray-400">${addr ? t.ship.note : 'Chọn địa chỉ để tính phí'}</span></span><span>${t.ship.fee ? fmt(t.ship.fee) : 'Miễn phí'}</span></div>
          ${t.giamShip ? `<div class="flex justify-between"><span class="text-gray-600">Giảm phí vận chuyển</span><span class="text-red-600">-${fmt(t.giamShip)}</span></div>` : ''}
        </div>
        <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline"><span class="font-bold">Tổng thanh toán</span><span class="text-2xl font-bold">${fmt(t.tong)}</span></div>
        <p class="text-[11px] text-gray-500 text-right">(Đã bao gồm VAT)</p>
        ${t.loi.length ? `<div class="mt-3 space-y-2">${t.loi.map((x) => UI.alert('error', x)).join('')}</div>` : ''}
        <button onclick="V.reviewOrder()" class="mt-5 w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800">Xác nhận đặt hàng</button>
        <p class="text-[11px] text-gray-500 mt-3 text-center">Sau khi xác nhận, hệ thống tạo đơn & giữ tồn kho, sau đó chuyển sang bước <b>Thanh toán</b>.</p>
      </aside>
    </div>
  </div>`;
};
V.applyVoucher = () => { CK.voucherInput = $('#ck-voucher').value.trim().toUpperCase(); CK.voucher = CK.voucherInput; App.render(); const t = $('#ck-voucher'); if (t) t.focus(); };
V.ckReceiver = () => { const u = Session.user(); const a = u.addresses.find((x) => x.id === CK.addrId); return a ? { ...a, name: CK.name, phone: CK.phone } : { name: CK.name, phone: CK.phone }; };
V.reviewOrder = () => {
  CK.touched = 1;
  const nhan = V.ckReceiver();
  const t = DatHangController.tinhDonHang(nhan, CK.voucher);
  if (!t.hopLe) { App.render(); return UI.toast(t.loiVoucher || t.loi[0] || Object.values(t.nhanLoi)[0], 'error', 4500); }
  UI.modal({
    title: 'Kiểm tra & xác nhận đặt hàng', icon: '<i class="fa-solid fa-clipboard-check"></i>', size: 'max-w-lg',
    body: `<div class="space-y-3 text-sm">
      <div class="rounded-xl bg-gray-50 p-3"><p class="text-xs text-gray-500">Giao tới</p><p class="font-semibold">${esc(nhan.name)} · ${nhan.phone}</p><p class="text-gray-600">${esc(`${nhan.line}, ${nhan.ward}, ${nhan.district}, ${nhan.city}`)}</p></div>
      <div>${t.gio.lines.map((l) => `<div class="flex justify-between py-1"><span>${esc(l.p.name)} <span class="text-gray-500">(${l.color.name}/${l.size}) ×${l.qty}</span></span><span>${fmt(l.lineTotal)}</span></div>`).join('')}</div>
      <div class="border-t pt-2 space-y-1"><div class="flex justify-between"><span class="text-gray-500">Tiền hàng</span><span>${fmt(t.gio.tamTinh)}</span></div>${t.giam ? `<div class="flex justify-between"><span class="text-gray-500">Voucher ${t.voucher.code}</span><span class="text-red-600">-${fmt(t.giam)}</span></div>` : ''}<div class="flex justify-between"><span class="text-gray-500">Phí vận chuyển</span><span>${fmt(t.ship.fee - t.giamShip)}</span></div><div class="flex justify-between font-bold text-base"><span>Tổng thanh toán</span><span>${fmt(t.tong)}</span></div></div>
    </div>`,
    actions: [{ label: 'Quay lại chỉnh sửa' }, { label: 'Đặt hàng', primary: true, onClick: () => V.placeOrder() }],
  });
};
V.placeOrder = () => {
  const r = DatHangController.xacNhanDatHang(V.ckReceiver(), CK.voucher, CK.quote, CK.note);
  UI.closeModal();
  if (!r.ok) {
    if (r.code === 'CAN_XAC_NHAN_LAI') {
      App.render();
      return UI.modal({ title: 'Thông tin đơn hàng đã thay đổi', icon: '<i class="fa-solid fa-triangle-exclamation text-amber-500"></i>', size: 'max-w-md', body: UI.alert('warn', `${r.error}<br>Tổng thanh toán: <s>${fmt(r.truoc)}</s> → <b>${fmt(r.sau)}</b>`), actions: [{ label: 'Xem lại', primary: true }] });
    }
    App.render();
    return UI.toast(r.error, 'error', 5000);
  }
  CK.voucher = ''; CK.voucherInput = ''; CK.note = ''; CK.touched = 0;
  App.renderHeader();
  UI.toast(`Đã tạo đơn hàng #${r.maDon} và giữ tồn kho. Vui lòng chọn phương thức thanh toán.`, 'success', 4500);
  go('#/thanh-toan/' + r.maDon);
};

/* --------------------------- UC17 THANH TOÁN --------------------------- */
const PAY = { method: null, err: '' };
V.payment = ([id]) => {
  const r = ThanhToanController.layThongTinThanhToan(id);
  const head = `<div class="flex flex-wrap items-center justify-between gap-3">${UI.crumbs([['Đơn hàng của tôi', '#/tai-khoan/don-hang'], ['Thanh toán', '']])}${UI.uc('UC17', 'GiaoDienThanhToan')}</div><div class="mt-5">${stepsBar(2)}</div>`;
  if (!r.ok) {
    return `<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">${head}<div class="mt-8 rounded-2xl border border-gray-200 p-8 text-center">
      <div class="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl mb-3"><i class="fa-solid fa-circle-info"></i></div>
      <p class="font-bold">Không thể thực hiện thanh toán cho đơn này</p><p class="text-sm text-gray-600 mt-1">${r.error}</p>
      ${r.o ? `<p class="text-sm mt-3">Trạng thái hiện tại: ${UI.badgeOrder(r.o.status)} · ${UI.payStatus(r.o.payStatus)}</p>` : ''}
      <a href="#/tai-khoan/don-hang${r.o ? '/' + r.o.id : ''}" class="inline-block mt-5 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Xem đơn hàng</a></div></div>`;
  }
  const o = r.o;
  if (PAY.order !== id) Object.assign(PAY, { order: id, method: null, err: '' });
  const methods = [
    ['COD', 'Thanh toán tiền mặt khi nhận hàng (COD)', 'Trả tiền mặt cho nhân viên giao hàng khi nhận sản phẩm.', '<i class="fa-solid fa-money-bill-wave text-emerald-600 text-xl"></i>'],
    ['MOMO', 'Ví điện tử MoMo', 'Quét mã QR hoặc xác nhận trên ứng dụng MoMo.', '<span class="w-9 h-9 rounded-lg bg-[#A50064] text-white text-[10px] font-black flex items-center justify-center">MoMo</span>'],
    ['VNPAY', 'VNPay (QR / Thẻ ATM / Visa)', 'Thanh toán qua cổng VNPay bằng QR ngân hàng hoặc thẻ.', '<span class="w-9 h-9 rounded-lg bg-white ring-1 ring-gray-200 text-[9px] font-black flex items-center justify-center"><span class="text-[#005BAA]">VN</span><span class="text-[#ED1C24]">PAY</span></span>'],
  ];
  return `<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">${head}
    ${o.payStatus === 'THAT_BAI' ? `<div class="mt-6">${UI.alert('error', 'Giao dịch điện tử trước đó <b>chưa thành công</b>. Đơn hàng chưa được ghi nhận là đã thanh toán – bạn có thể thử lại hoặc chọn phương thức khác.')}</div>` : ''}
    ${r.dangCho ? `<div class="mt-6">${UI.alert('warn', `Đơn đang có giao dịch ${PAY_LABEL[r.dangCho.cong]} chờ cổng xác nhận (mã ${r.dangCho.ref}). <a class="underline font-bold" href="#/ket-qua-thanh-toan/${r.dangCho.ref}">Tra cứu kết quả</a> hoặc chọn lại phương thức bên dưới.`)}</div>` : ''}
    <div class="mt-8 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <section class="rounded-2xl border border-gray-200 p-6">
        <h3 class="font-bold text-lg">Chọn phương thức thanh toán</h3>
        <div class="mt-4 space-y-3">${methods.map(([k, t, d, ic]) => `
          <label class="flex items-center gap-4 rounded-xl border-2 ${PAY.method === k ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'} p-4 cursor-pointer">
            <input type="radio" name="pm" value="${k}" ${PAY.method === k ? 'checked' : ''} onchange="PAY.method='${k}';PAY.err='';App.render()" class="accent-black w-4 h-4">
            <span class="w-10 flex justify-center">${ic}</span>
            <span class="flex-1"><span class="block font-semibold text-sm">${t}</span><span class="block text-xs text-gray-500">${d}</span></span>
            ${k !== 'COD' ? `<span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">${UI.uc(k === 'MOMO' || k === 'VNPAY' ? 'UC19' : '', '')}</span>` : `<span>${UI.uc('UC18', '')}</span>`}
          </label>`).join('')}</div>
        ${PAY.err ? `<div class="mt-4">${UI.alert('error', PAY.err)}</div>` : ''}
        <button onclick="V.confirmPay('${o.id}')" class="mt-6 w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800">${PAY.method === 'COD' ? 'Xác nhận thanh toán khi nhận hàng' : PAY.method ? `Thanh toán ${fmt(o.total)} qua ${PAY_LABEL[PAY.method]}` : 'Xác nhận thanh toán'}</button>
        <p class="text-[11px] text-gray-500 mt-3 text-center"><i class="fa-solid fa-lock mr-1"></i>Giao dịch điện tử được xử lý qua API Cổng thanh toán MoMo/VNPay. Urban Chic không lưu thông tin thẻ của bạn.</p>
      </section>
      <aside class="rounded-2xl bg-gray-50 p-6">
        <p class="text-xs text-gray-500">Đơn hàng</p><p class="font-bold text-lg">#${o.id}</p>
        <div class="mt-3 space-y-1.5 text-sm">
          <div class="flex justify-between"><span class="text-gray-600">Tiền hàng</span><span>${fmt(o.subtotal)}</span></div>
          ${o.discount ? `<div class="flex justify-between"><span class="text-gray-600">Giảm giá (${o.voucher})</span><span class="text-red-600">-${fmt(o.discount)}</span></div>` : ''}
          <div class="flex justify-between"><span class="text-gray-600">Phí vận chuyển</span><span>${o.shipFee ? fmt(o.shipFee) : 'Miễn phí'}</span></div>
        </div>
        <div class="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline"><span class="font-bold">Số tiền cần thanh toán</span><span class="text-2xl font-bold">${fmt(o.total)}</span></div>
        <div class="mt-4 text-xs text-gray-600 rounded-xl bg-white p-3"><p class="font-semibold text-gray-900">${esc(o.receiver.name)} · ${o.receiver.phone}</p><p>${esc(o.receiver.address)}</p></div>
        <p class="mt-3 text-xs text-gray-500"><i class="fa-solid fa-box-archive mr-1"></i>Tồn kho đã được giữ cho đơn hàng này.</p>
      </aside>
    </div></div>`;
};
V.confirmPay = async (id) => {
  const c = ThanhToanController.chonPhuongThuc(id, PAY.method);
  if (!c.ok) { PAY.err = c.error; return App.render(); }
  const o = DonHangController.xemChiTietDon(id).o;
  if (PAY.method === 'COD') {
    const yes = await UI.confirm({ title: 'Xác nhận thanh toán COD', icon: '<i class="fa-solid fa-money-bill-wave text-emerald-600"></i>', message: `<p>Bạn sẽ thanh toán <b class="text-lg">${fmt(o.total)}</b> bằng tiền mặt cho nhân viên giao hàng khi nhận sản phẩm.</p><p class="text-xs text-gray-500 mt-2">Đơn hàng được ghi nhận trạng thái <b>Chưa thanh toán</b> và chuyển sang quy trình xử lý.</p><div class="mt-3">${UI.uc('UC18', 'ThanhToanController.xacNhanCOD')}</div>`, okLabel: 'Xác nhận COD' });
    if (!yes) return;
    const r = ThanhToanController.xacNhanCOD(id);
    if (!r.ok) { PAY.err = r.error; return App.render(); }
    return go('#/dat-hang-thanh-cong/' + id);
  }
  const r = ThanhToanController.taoThanhToan(id, PAY.method);
  if (!r.ok) { PAY.err = `${r.error} Vui lòng thử lại hoặc chọn phương thức khác.`; UI.toast('Không khởi tạo được giao dịch', 'error'); return App.render(); }
  UI.toast(`Đang chuyển tới cổng ${PAY_LABEL[PAY.method]}…`, 'info', 1500);
  setTimeout(() => go(r.link), 600);
};

/* ------------- Trang cổng thanh toán MoMo/VNPay (hệ thống ngoài, mô phỏng) ------------- */
V.gateway = ([ref]) => {
  const txn = ThanhToanController.layGiaoDich(ref);
  if (!txn) return `<div class="p-10 text-center">Giao dịch không tồn tại.</div>`;
  const momo = txn.cong === 'MOMO';
  const theme = momo ? { bg: 'bg-[#A50064]', text: 'text-[#A50064]', name: 'MoMo', logo: '<span class="font-black text-xl">mo<span class="opacity-80">mo</span></span>' } : { bg: 'bg-[#005BAA]', text: 'text-[#005BAA]', name: 'VNPAY', logo: '<span class="font-black text-xl"><span>VN</span><span class="text-[#ED1C24] bg-white rounded px-1 ml-0.5">PAY</span></span>' };
  const done = txn.status !== 'CHO';
  return {
    bare: true,
    html: `<div class="min-h-screen ${momo ? 'bg-pink-50' : 'bg-sky-50'}">
      <header class="${theme.bg} text-white"><div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">${theme.logo}<span class="text-xs text-white/80"><i class="fa-solid fa-lock mr-1"></i>Cổng thanh toán an toàn · ${momo ? 'payment.momo.vn' : 'sandbox.vnpayment.vn'}</span></div></header>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="mb-3 flex flex-wrap gap-2 items-center justify-between"><span class="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full px-2.5 py-1"><i class="fa-solid fa-flask mr-1"></i>Trang mô phỏng «hệ thống ngoài» CongMoMoVNPay – không phát sinh giao dịch thật</span>${UI.uc('UC19', 'Thanh toán điện tử')}</div>
        <div class="grid md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-xl overflow-hidden">
          <div class="p-7">
            <p class="text-xs text-gray-500 uppercase tracking-wider">Thông tin đơn hàng</p>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between"><dt class="text-gray-500">Nhà cung cấp</dt><dd class="font-bold">URBAN CHIC®</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Mã đơn hàng</dt><dd class="font-semibold">${txn.orderId}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Mã tham chiếu</dt><dd class="font-mono text-xs">${txn.ref}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Mã giao dịch cổng</dt><dd class="font-mono text-xs">${txn.maGD}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">Mô tả</dt><dd>Thanh toán đơn hàng ${txn.orderId}</dd></div>
            </dl>
            <div class="mt-6 rounded-2xl ${momo ? 'bg-pink-50' : 'bg-sky-50'} p-4"><p class="text-xs text-gray-500">Số tiền thanh toán</p><p class="text-3xl font-black ${theme.text}">${fmt(txn.amount)}</p></div>
            <p class="mt-4 text-xs text-gray-500"><i class="fa-regular fa-clock mr-1"></i>Giao dịch hết hạn sau <b id="gw-count">10:00</b></p>
          </div>
          <div class="p-7 ${theme.bg} text-white flex flex-col items-center justify-center text-center">
            <p class="font-bold">Quét mã để thanh toán</p>
            <div class="w-52 h-52 bg-white rounded-2xl p-3 mt-4 shadow-lg">${fakeQR(txn.ref)}</div>
            <p class="text-xs text-white/80 mt-3">Mở ứng dụng ${theme.name} → Quét mã QR → Xác nhận</p>
          </div>
        </div>
        ${done ? `<div class="mt-6">${UI.alert('info', 'Giao dịch này đã được xử lý. <a class="underline font-bold" href="#/ket-qua-thanh-toan/' + ref + '">Xem kết quả</a>')}</div>` : `
        <div class="mt-6 bg-white rounded-2xl p-6 shadow">
          <p class="text-sm font-bold">Giả lập thao tác của khách trên cổng ${theme.name}</p>
          <div class="mt-4 grid sm:grid-cols-3 gap-3">
            <button onclick="V.gwAct('${ref}','THANH_CONG')" class="py-3 rounded-xl ${theme.bg} text-white font-bold text-sm"><i class="fa-solid fa-circle-check mr-1.5"></i>Xác nhận thanh toán</button>
            <button onclick="V.gwAct('${ref}','THAT_BAI')" class="py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm"><i class="fa-solid fa-circle-xmark mr-1.5"></i>Thanh toán thất bại</button>
            <button onclick="V.gwAct('${ref}','HUY')" class="py-3 rounded-xl border-2 border-gray-200 font-bold text-sm">Hủy giao dịch</button>
          </div>
          <details class="mt-4 text-xs text-gray-600"><summary class="cursor-pointer font-semibold">Công cụ kiểm thử luồng phụ</summary>
            <div class="mt-3 flex flex-wrap gap-2">
              <label class="flex items-center gap-2 border rounded-lg px-3 py-2"><input type="checkbox" ${DB.data.sim.slowCallback ? 'checked' : ''} onchange="DB.data.sim.slowCallback=this.checked;DB.save()" class="accent-black"> Cổng gửi thông báo kết quả chậm (~6 giây)</label>
              <button onclick="V.gwFake('${ref}')" class="border rounded-lg px-3 py-2 hover:border-black">Gửi thông báo giả mạo (sai chữ ký)</button>
            </div></details>
        </div>`}
        <p class="text-center text-xs text-gray-500 mt-6"><a href="#/thanh-toan/${txn.orderId}" class="underline">← Quay lại Urban Chic</a></p>
      </div></div>`,
    after: () => {
      let s = 600; clearInterval(V._gwT);
      V._gwT = setInterval(() => { const el = $('#gw-count'); if (!el) return clearInterval(V._gwT); s--; el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    },
  };
};
V.gwAct = (ref, st) => {
  const txn = ThanhToanController.layGiaoDich(ref);
  CongMoMoVNPay.guiThongBao(txn, st, { delayMs: DB.data.sim.slowCallback ? 6000 : 0 });
  go('#/ket-qua-thanh-toan/' + ref);
};
V.gwFake = (ref) => {
  const txn = ThanhToanController.layGiaoDich(ref);
  const r = CongMoMoVNPay.guiThongBao(txn, 'THANH_CONG', { fake: true });
  UI.toast(r.ok ? 'Đã xử lý' : r.error, r.ok ? 'success' : 'warn', 5000);
};

/* Trang kết quả – tra cứu trạng thái đã xác minh (độc lập với callback) */
V.payResult = ([ref]) => {
  const r = ThanhToanController.traCuuKetQua(ref);
  if (!r.ok) return `<div class="max-w-xl mx-auto px-4 py-10">${UI.alert('error', r.error)}</div>`;
  const { txn, o } = r;
  const map = {
    THANH_CONG: ['fa-circle-check', 'text-emerald-500', 'Thanh toán thành công', `Đơn hàng #${o.id} đã được ghi nhận <b>Đã thanh toán</b> qua ${PAY_LABEL[txn.cong]}. Cảm ơn bạn đã mua sắm tại Urban Chic!`],
    THAT_BAI: ['fa-circle-xmark', 'text-red-500', 'Thanh toán thất bại', 'Giao dịch không thành công. Đơn hàng <b>chưa được thanh toán</b> – bạn có thể thử lại hoặc chọn phương thức khác.'],
    HUY: ['fa-ban', 'text-gray-500', 'Bạn đã hủy giao dịch', 'Đơn hàng chưa được thanh toán. Bạn có thể thử thanh toán lại hoặc chuyển sang COD.'],
    CHO: ['fa-hourglass-half', 'text-amber-500', 'Đang chờ cổng thanh toán xác nhận', 'Hệ thống chưa nhận được kết quả từ cổng thanh toán nên <b>chưa đánh dấu giao dịch thành công</b>. Trang sẽ tự làm mới…'],
  }[txn.status];
  return {
    html: `<div class="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div class="flex justify-between items-center">${stepsBar(txn.status === 'THANH_CONG' ? 3 : 2)}</div>
      <div class="mt-8 rounded-3xl border border-gray-200 p-8 text-center">
        <div class="flex justify-end -mt-4 -mr-4">${UI.uc('UC19', 'traCuuKetQua')}</div>
        <i class="fa-solid ${map[0]} ${map[1]} text-6xl ${txn.status === 'CHO' ? 'animate-pulse' : ''}"></i>
        <h1 class="text-2xl font-bold mt-4">${map[2]}</h1>
        <p class="text-sm text-gray-600 mt-2">${map[3]}</p>
        <dl class="mt-6 text-sm text-left rounded-2xl bg-gray-50 p-4 space-y-1.5">
          <div class="flex justify-between"><dt class="text-gray-500">Mã đơn hàng</dt><dd class="font-semibold">#${o.id}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Phương thức</dt><dd>${PAY_LABEL[txn.cong]}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Mã giao dịch</dt><dd class="font-mono text-xs">${txn.maGD}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Số tiền</dt><dd class="font-bold">${fmt(txn.amount)}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">Trạng thái thanh toán</dt><dd>${UI.payStatus(o.payStatus)}</dd></div>
        </dl>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          ${txn.status === 'CHO' ? `<button onclick="App.render()" class="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold"><i class="fa-solid fa-rotate mr-1.5"></i>Làm mới kết quả</button>` : ''}
          ${['THAT_BAI', 'HUY'].includes(txn.status) ? `<a href="#/thanh-toan/${o.id}" class="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold">Thử lại / chọn phương thức khác</a>` : ''}
          <a href="#/tai-khoan/don-hang/${o.id}" class="border border-gray-300 px-5 py-3 rounded-xl text-sm font-bold hover:border-black">Xem đơn hàng</a>
          ${txn.status === 'THANH_CONG' ? '<a href="#/san-pham" class="border border-gray-300 px-5 py-3 rounded-xl text-sm font-bold hover:border-black">Tiếp tục mua sắm</a>' : ''}
        </div>
      </div></div>`,
    after: () => { clearTimeout(V._prT); if (txn.status === 'CHO') V._prT = setTimeout(() => { if (location.hash === '#/ket-qua-thanh-toan/' + ref) App.render(); }, 2000); },
  };
};

V.orderSuccess = ([id]) => {
  const r = DonHangController.xemChiTietDon(id);
  if (!r.ok) return `<div class="max-w-xl mx-auto px-4 py-10">${UI.alert('error', r.error)}</div>`;
  const o = r.o;
  return `<div class="max-w-xl mx-auto px-4 sm:px-6 py-10">
    ${stepsBar(3)}
    <div class="mt-8 rounded-3xl border border-gray-200 p-8 text-center">
      <div class="flex justify-end -mt-4 -mr-4">${UI.uc('UC18', 'COD')}</div>
      <i class="fa-solid fa-circle-check text-emerald-500 text-6xl"></i>
      <h1 class="text-2xl font-bold mt-4">Đặt hàng thành công!</h1>
      <p class="text-sm text-gray-600 mt-2">Đơn hàng <b>#${o.id}</b> đã được ghi nhận với phương thức <b>thanh toán tiền mặt khi nhận hàng (COD)</b>. Vui lòng chuẩn bị <b>${fmt(o.total)}</b> khi nhận hàng.</p>
      <div class="mt-6 text-left rounded-2xl bg-gray-50 p-4 text-sm space-y-1.5">
        <div class="flex justify-between"><span class="text-gray-500">Trạng thái đơn</span>${UI.badgeOrder(o.status)}</div>
        <div class="flex justify-between"><span class="text-gray-500">Thanh toán</span>${UI.payStatus(o.payStatus)}</div>
        <div class="flex justify-between"><span class="text-gray-500">Giao tới</span><span class="text-right max-w-[60%]">${esc(o.receiver.address)}</span></div>
      </div>
      <div class="mt-6 flex flex-wrap justify-center gap-3"><a href="#/tai-khoan/don-hang/${o.id}" class="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold">Theo dõi đơn hàng</a><a href="#/san-pham" class="border border-gray-300 px-5 py-3 rounded-xl text-sm font-bold hover:border-black">Tiếp tục mua sắm</a></div>
    </div></div>`;
};

/* --------------------- Danh mục Use Case – hỗ trợ chụp báo cáo --------------------- */
V.usecases = () => {
  const L = [
    ['UC01', 'Đăng ký tài khoản', 'Khách vãng lai', 'GiaoDienDangKy', '#/dang-ky', 'Trùng tên/email; mật khẩu yếu; Email API lỗi (bật ở bảng Demo)'],
    ['UC02', 'Đăng nhập', 'Khách vãng lai / Khách hàng', 'GiaoDienDangNhap', '#/dang-nhap', 'Sai mật khẩu; tài khoản bị khóa (vankiet)'],
    ['UC03', 'Quên mật khẩu', 'Khách hàng', 'GiaoDienKhoiPhuc', '#/quen-mat-khau', 'Email sai định dạng; liên kết hết hạn (Hộp thư mô phỏng); Email API lỗi'],
    ['UC04', 'Tìm kiếm sản phẩm', 'Khách hàng', 'GiaoDienTimKiem', '#/san-pham?q=áo', 'Từ khóa không có kết quả (vd: "vest")'],
    ['UC05', 'Lọc sản phẩm', 'Khách hàng', 'GiaoDienTimKiem', '#/san-pham?colors=Đen&sizes=L&max=500000', 'Khoảng giá sai (từ > đến); không có kết quả; bỏ bộ lọc'],
    ['UC06', 'Xem chi tiết sản phẩm', 'Khách hàng', 'GiaoDienChiTiet', '#/san-pham/SP001', 'Biến thể hết hàng (Kem/S); sản phẩm không tồn tại'],
    ['UC07', 'Xem khuyến mãi của sản phẩm', 'Khách hàng', 'GiaoDienChiTiet', '#/san-pham/SP001', 'Sản phẩm không có KM; mã hết hạn/hết lượt (FLASH100)'],
    ['UC08', 'Thêm vào giỏ hàng', 'Khách hàng', 'GiaoDienChiTiet', '#/san-pham/SP005', 'Chưa chọn size; vượt tồn (Jeans Xanh Đậm/L còn 3)'],
    ['UC09', 'Quản lý giỏ hàng', 'Khách hàng', 'GiaoDienGioHang', '#/gio-hang', 'Giỏ trống; đổi sang biến thể hết hàng; gộp dòng cùng SKU'],
    ['UC10', 'Thêm vào mục yêu thích', 'Khách hàng', 'GiaoDienChiTiet', '#/san-pham/SP006', 'Chưa đăng nhập; sản phẩm đã có trong danh sách'],
    ['UC11', 'Quản lý sản phẩm yêu thích', 'Khách thành viên', 'GiaoDienYeuThich', '#/tai-khoan/yeu-thich', 'Danh sách trống; sản phẩm hết hàng (Áo Khoác Da Biker)'],
    ['UC12', 'Quản lý hồ sơ cá nhân', 'Khách thành viên', 'GiaoDienHoSo', '#/tai-khoan', 'Thiếu trường bắt buộc; sai mật khẩu cũ; một địa chỉ mặc định'],
    ['UC13', 'Quản lý đơn hàng cá nhân', 'Khách thành viên', 'GiaoDienDonHang', '#/tai-khoan/don-hang', 'Chưa có hóa đơn; tải hóa đơn đơn đã giao; đổi trả'],
    ['UC14', 'Hủy đơn', 'Khách thành viên', 'GiaoDienDonHang', '#/tai-khoan/don-hang/DH20261105', 'Đơn đang đóng gói bị từ chối (DH20261104); đơn VNPay → hoàn tiền (DH20261110)'],
    ['UC15', 'Xem quá trình vận chuyển', 'Khách thành viên', 'GiaoDienTheoDoi', '#/tai-khoan/don-hang/DH20261103/van-chuyen', 'Chưa có mã vận đơn (DH20261104); API vận chuyển lỗi'],
    ['UC16', 'Đặt hàng', 'Khách thành viên', 'GiaoDienDatHang', '#/dat-hang', 'Giỏ trống; voucher không hợp lệ; thiếu tồn; SĐT sai'],
    ['UC17', 'Thanh toán', 'Khách thành viên', 'GiaoDienThanhToan', '#/tai-khoan/don-hang', 'Chưa chọn phương thức; đơn đã thanh toán'],
    ['UC18', 'Thanh toán tiền mặt (COD)', 'Khách thành viên', 'GiaoDienThanhToan', '#/tai-khoan/don-hang', 'Đổi phương thức trước khi xác nhận'],
    ['UC19', 'Thanh toán điện tử MoMo/VNPay', 'Khách thành viên', 'GiaoDienThanhToan', '#/tai-khoan/don-hang', 'Thất bại/hủy; cổng lỗi khởi tạo; callback chậm; chữ ký sai'],
  ];
  return `<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    ${UI.crumbs([['Trang chủ', '#/'], ['Danh mục Use Case', '']])}
    <h1 class="font-display text-3xl font-bold mt-4">Phân hệ 1 – Quản lý mua sắm online (Khách hàng)</h1>
    <p class="text-sm text-gray-500 mt-1">Bản đồ 19 use case → màn hình giao diện (lớp Boundary theo sơ đồ tuần tự). Bấm “Mở màn hình” để chụp hình minh họa cho báo cáo.</p>
    <div class="mt-6 overflow-x-auto rounded-2xl border border-gray-200"><table class="w-full text-sm">
      <thead class="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500"><tr><th class="px-4 py-3">Mã</th><th class="px-4 py-3">Use case</th><th class="px-4 py-3">Tác nhân</th><th class="px-4 py-3">Boundary</th><th class="px-4 py-3">Gợi ý chụp luồng phụ</th><th class="px-4 py-3"></th></tr></thead>
      <tbody class="divide-y divide-gray-100">${L.map(([c, n, a, b, h, alt]) => `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold">${c}</td><td class="px-4 py-3 font-semibold">${n}</td><td class="px-4 py-3 text-gray-600">${a}</td><td class="px-4 py-3 font-mono text-xs">${b}</td><td class="px-4 py-3 text-xs text-gray-600">${alt}</td><td class="px-4 py-3"><a href="${h}" class="whitespace-nowrap text-xs font-bold bg-black text-white rounded-lg px-3 py-2">Mở màn hình</a></td></tr>`).join('')}</tbody>
    </table></div>
    <div class="mt-6 grid md:grid-cols-3 gap-4 text-sm">
      <div class="rounded-2xl bg-gray-50 p-5"><p class="font-bold">Tác nhân</p><p class="text-gray-600 mt-1">Khách vãng lai → Khách hàng → Khách thành viên (tổng quát hóa). Khách vãng lai vẫn tìm kiếm, xem chi tiết và dùng giỏ hàng; đặt hàng, hồ sơ, đơn hàng, yêu thích cần đăng nhập.</p></div>
      <div class="rounded-2xl bg-gray-50 p-5"><p class="font-bold">Hệ thống ngoài (mô phỏng)</p><p class="text-gray-600 mt-1">Email Service API (Hộp thư), API Đơn vị vận chuyển (GHN/GHTK/VNPost), API Cổng thanh toán (MoMo/VNPay). Bật lỗi ở nút <b>Demo</b> góc dưới trái.</p></div>
      <div class="rounded-2xl bg-gray-50 p-5"><p class="font-bold">Quan hệ</p><p class="text-gray-600 mt-1">«extend»: Quên mật khẩu, Lọc SP, Thêm giỏ, Xem KM, Yêu thích, Hủy đơn, Xem vận chuyển. «include»: Đặt hàng → Thanh toán; Thanh toán tổng quát hóa COD & MoMo/VNPay.</p></div>
    </div>
  </div>`;
};
