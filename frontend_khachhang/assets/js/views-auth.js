/* ============== MÀN HÌNH TÀI KHOẢN: UC01, UC02, UC03 ============== */
V.authLayout = (inner, uc) => `
  <div class="min-h-[calc(100vh-140px)] grid lg:grid-cols-2">
    <div class="hidden lg:block relative">
      <img src="${IMG(SEED.banners.auth, 1200, 1400)}" class="absolute inset-0 w-full h-full object-cover" alt="">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
      <div class="absolute bottom-12 left-12 right-12 text-white">
        <p class="text-xs tracking-[.3em] uppercase text-white/70">Urban Chic® Membership</p>
        <p class="font-display text-4xl font-bold mt-3 leading-tight">Lưu giỏ hàng, theo dõi đơn<br>và nhận ưu đãi riêng.</p>
        <ul class="mt-5 space-y-2 text-sm text-white/80"><li><i class="fa-solid fa-check mr-2"></i>Quản lý hồ sơ & sổ địa chỉ giao hàng</li><li><i class="fa-solid fa-check mr-2"></i>Theo dõi đơn hàng & hành trình vận chuyển</li><li><i class="fa-solid fa-check mr-2"></i>Danh sách yêu thích đồng bộ mọi thiết bị</li></ul>
      </div>
    </div>
    <div class="flex items-center justify-center p-6 sm:p-10 bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        <div class="flex justify-end -mt-3 -mr-3 mb-2">${uc}</div>
        ${inner}
      </div>
    </div>
  </div>`;

const brandMark = (sub) => `<div class="text-center mb-7">
  <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white mb-3 shadow-md"><i class="fa-solid fa-layer-group text-lg"></i></div>
  <h2 class="text-2xl font-black tracking-widest uppercase">Urban Chic<span class="text-xs text-gray-400 ml-1">®</span></h2>
  <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">${sub}</p></div>`;

/* ------------------------------ UC02 ĐĂNG NHẬP ------------------------------ */
V.login = (_, q) => {
  if (Session.user()) { setTimeout(() => go(q.next || '#/tai-khoan'), 0); return ''; }
  return V.authLayout(`
    ${brandMark('Đăng nhập tài khoản khách hàng')}
    <div id="login-msg" class="mb-4 ${q.msg ? '' : 'hidden'}">${q.msg === 'reset' ? UI.alert('success', 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.') : q.msg === 'registered' ? UI.alert('success', 'Đăng ký thành công! Mời bạn đăng nhập để bắt đầu mua sắm.') : ''}</div>
    <form id="form-login" onsubmit="V.doLogin(event)" class="space-y-4">
      ${UI.field({ id: 'login-account', label: 'Tên đăng nhập hoặc Email', placeholder: 'Nhập tên đăng nhập hoặc email...', icon: 'fa-user', value: q.u || '', attrs: 'autocomplete="username"' })}
      <div>
        <div class="flex justify-end -mb-5 relative z-10"><a href="#/quen-mat-khau" class="text-xs text-gray-500 hover:text-black font-semibold">Quên mật khẩu?</a></div>
        ${UI.field({ id: 'login-password', label: 'Mật khẩu', type: 'password', placeholder: '••••••••', icon: 'fa-lock', attrs: 'autocomplete="current-password"' })}
      </div>
      <label class="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked class="accent-black"> Ghi nhớ đăng nhập</label>
      <button class="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md"><i class="fa-solid fa-right-to-bracket text-xs mr-2"></i>Đăng nhập</button>
    </form>
    <div class="flex items-center gap-3 my-6 text-xs text-gray-400"><span class="h-px flex-1 bg-gray-200"></span>hoặc<span class="h-px flex-1 bg-gray-200"></span></div>
    <p class="text-center text-sm text-gray-600">Chưa có tài khoản? <a href="#/dang-ky" class="font-bold text-black underline underline-offset-4">Đăng ký ngay</a></p>
    <p class="text-center text-xs text-gray-400 mt-3"><a href="#/" class="hover:text-black">← Tiếp tục mua sắm với tư cách khách vãng lai</a></p>
  `, UI.uc('UC02', 'GiaoDienDangNhap'));
};
V.doLogin = (e) => {
  e.preventDefault();
  const r = XacThucController.dangNhap($('#login-account').value, $('#login-password').value);
  const box = $('#login-msg');
  if (!r.ok) {
    box.classList.remove('hidden');
    box.innerHTML = r.code === 'KHOA' ? UI.alert('warn', `<b>Đăng nhập bị từ chối.</b> ${r.error}`) : UI.alert('error', r.error);
    $('#login-password').value = ''; $('#login-password').focus();
    return;
  }
  UI.toast(`Xin chào ${esc(r.kh.name || r.kh.username)}! Đăng nhập thành công.${r.merged ? ' Đã gộp giỏ hàng của bạn.' : ''}`);
  App.renderHeader();
  go(App.route().query.next || '#/tai-khoan');
};

/* ---------------------------- UC01 ĐĂNG KÝ TÀI KHOẢN ---------------------------- */
V.register = () => {
  if (Session.user()) return V.authLayout(`${brandMark('Đăng ký tài khoản')}${UI.alert('info', 'Bạn đang đăng nhập. Vui lòng <a class="underline font-semibold" href="javascript:App.logout()">đăng xuất</a> trước khi đăng ký tài khoản mới.')}`, UI.uc('UC01', 'GiaoDienDangKy'));
  return V.authLayout(`
    ${brandMark('Tạo tài khoản khách hàng mới')}
    <div id="reg-msg" class="mb-4 hidden"></div>
    <form id="form-reg" onsubmit="V.doRegister(event)" class="space-y-4" novalidate>
      ${UI.field({ id: 'username', label: 'Tên đăng nhập', placeholder: 'vd: minhquan2026', icon: 'fa-user', attrs: 'autocomplete="username"' })}
      ${UI.field({ id: 'email', label: 'Địa chỉ Email', type: 'email', placeholder: 'ban@example.com', icon: 'fa-envelope' })}
      ${UI.field({ id: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Tối thiểu 8 ký tự, gồm chữ và số', icon: 'fa-lock', attrs: 'oninput="V.pwMeter(this.value)" autocomplete="new-password"' })}
      <div id="pw-meter" class="grid grid-cols-3 gap-1.5 text-[11px] text-gray-400 -mt-2">
        <span data-r="len"><i class="fa-regular fa-circle mr-1"></i>≥ 8 ký tự</span><span data-r="let"><i class="fa-regular fa-circle mr-1"></i>Có chữ cái</span><span data-r="num"><i class="fa-regular fa-circle mr-1"></i>Có chữ số</span>
      </div>
      ${UI.field({ id: 'confirm', label: 'Xác nhận mật khẩu', type: 'password', placeholder: 'Nhập lại mật khẩu', icon: 'fa-lock', attrs: 'autocomplete="new-password"' })}
      <div><label class="flex items-start gap-2 text-xs text-gray-600"><input id="agree" type="checkbox" class="accent-black mt-0.5"> <span>Tôi đồng ý với <a href="javascript:void(0)" class="underline">Điều khoản sử dụng</a> và <a href="javascript:void(0)" class="underline">Chính sách bảo mật</a> của Urban Chic.</span></label><p class="field-err text-xs text-red-600 mt-1 hidden" data-for="agree"></p></div>
      <button class="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md"><i class="fa-solid fa-user-plus text-xs mr-2"></i>Đăng ký</button>
    </form>
    <p class="text-center text-sm text-gray-600 mt-6">Đã có tài khoản? <a href="#/dang-nhap" class="font-bold text-black underline underline-offset-4">Đăng nhập</a></p>
  `, UI.uc('UC01', 'GiaoDienDangKy'));
};
V.pwMeter = (v) => {
  const rs = { len: v.length >= 8, let: /[A-Za-z]/.test(v), num: /\d/.test(v) };
  $$('#pw-meter span').forEach((s) => { const okk = rs[s.dataset.r]; s.className = okk ? 'text-emerald-600 font-semibold' : 'text-gray-400'; s.querySelector('i').className = `fa-${okk ? 'solid fa-circle-check' : 'regular fa-circle'} mr-1`; });
};
V.doRegister = (e) => {
  e.preventDefault();
  const t = { username: $('#username').value, email: $('#email').value, password: $('#password').value, confirm: $('#confirm').value, agree: $('#agree').checked };
  const r = TaiKhoanController.dangKy(t);
  const box = $('#reg-msg');
  UI.showErrors(r.fields || {}, $('#form-reg'));
  if (!r.ok) { box.classList.remove('hidden'); box.innerHTML = UI.alert('error', r.error); return; }
  box.classList.add('hidden');
  UI.modal({
    title: 'Đăng ký tài khoản thành công', icon: '<i class="fa-solid fa-circle-check text-emerald-500"></i>', size: 'max-w-md',
    body: `<p>Tài khoản <b>${esc(r.kh.username)}</b> (mã khách hàng <b>${r.maKhachHang}</b>) đã được tạo và có thể dùng để đăng nhập ngay.</p>
      <div class="mt-4">${r.emailSent ? UI.alert('success', `Email Service API đã gửi thông báo đăng ký tới <b>${esc(r.kh.email)}</b>. <a href="#/hop-thu" onclick="UI.closeModal()" class="underline font-semibold">Mở hộp thư mô phỏng</a>`) : UI.alert('warn', 'Email Service API tạm thời không hoạt động – hệ thống đã ghi nhận <b>gửi email thất bại</b>, tài khoản của bạn vẫn được tạo thành công.')}</div>`,
    actions: [{ label: 'Đăng nhập ngay', primary: true, onClick: () => { UI.closeModal(); go('#/dang-nhap?msg=registered&u=' + encodeURIComponent(r.kh.username)); } }],
  });
};

/* ---------------------------- UC03 QUÊN MẬT KHẨU ---------------------------- */
V.forgot = () => V.authLayout(`
  ${brandMark('Khôi phục mật khẩu')}
  <p class="text-sm text-gray-600 mb-5 text-center">Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu (hiệu lực ${SEED.policy.hanLinkKhoiPhucPhut} phút, dùng một lần).</p>
  <div id="fg-msg" class="mb-4 hidden"></div>
  <form id="form-fg" onsubmit="V.doForgot(event)" class="space-y-4" novalidate>
    ${UI.field({ id: 'fg-email', label: 'Email đã đăng ký', type: 'email', placeholder: 'ban@example.com', icon: 'fa-envelope' })}
    <button class="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md"><i class="fa-solid fa-paper-plane text-xs mr-2"></i>Gửi yêu cầu khôi phục</button>
  </form>
  <p class="text-center text-sm text-gray-600 mt-6"><a href="#/dang-nhap" class="font-semibold underline underline-offset-4">← Quay lại đăng nhập</a></p>
`, UI.uc('UC03', 'GiaoDienKhoiPhuc'));
V.doForgot = (e) => {
  e.preventDefault();
  const r = XacThucController.yeuCauKhoiPhuc($('#fg-email').value);
  const box = $('#fg-msg'); box.classList.remove('hidden');
  if (!r.ok) { box.innerHTML = UI.alert(r.code === 'LOI_EMAIL' ? 'warn' : 'error', r.error); return; }
  box.innerHTML = UI.alert('success', `${r.message}<div class="mt-2"><a href="#/hop-thu" class="font-bold underline">Mở hộp thư mô phỏng (Email Service API) →</a></div>`);
  $('#form-fg').reset();
};

V.reset = ([token]) => {
  const v = XacThucController.kiemTraToken(token);
  if (!v.ok) return V.authLayout(`${brandMark('Đặt lại mật khẩu')}${UI.alert('error', `<b>${v.error}</b><br>Vui lòng thực hiện lại thao tác Quên mật khẩu để nhận liên kết mới.`)}<a href="#/quen-mat-khau" class="mt-5 block text-center w-full py-3.5 bg-black text-white rounded-xl text-sm font-bold">Gửi lại yêu cầu khôi phục</a>`, UI.uc('UC03', 'GiaoDienKhoiPhuc'));
  const kh = DB.data.customers.find((c) => c.id === v.t.customerId);
  return V.authLayout(`
    ${brandMark('Thiết lập mật khẩu mới')}
    <p class="text-sm text-gray-600 mb-5 text-center">Tài khoản: <b>${esc(kh.email)}</b><br><span class="text-xs text-gray-400">Liên kết hết hạn lúc ${fdt(v.t.expires)}</span></p>
    <div id="rs-msg" class="mb-4 hidden"></div>
    <form onsubmit="V.doReset(event,'${token}')" class="space-y-4">
      ${UI.field({ id: 'rs-pw', label: 'Mật khẩu mới', type: 'password', placeholder: 'Tối thiểu 8 ký tự, gồm chữ và số', icon: 'fa-lock' })}
      ${UI.field({ id: 'rs-cf', label: 'Xác nhận mật khẩu mới', type: 'password', placeholder: 'Nhập lại mật khẩu mới', icon: 'fa-lock' })}
      <button class="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md">Đặt lại mật khẩu</button>
    </form>`, UI.uc('UC03', 'GiaoDienKhoiPhuc'));
};
V.doReset = (e, token) => {
  e.preventDefault();
  const r = XacThucController.datLaiMatKhau(token, $('#rs-pw').value, $('#rs-cf').value);
  if (!r.ok) { const b = $('#rs-msg'); b.classList.remove('hidden'); b.innerHTML = UI.alert('error', r.error); return; }
  UI.toast('Đặt lại mật khẩu thành công!');
  go('#/dang-nhap?msg=reset');
};

/* ------------------ Hộp thư thông báo Email ------------------ */
V.mailbox = () => {
  const ms = DB.data.outbox;
  return `<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-wrap items-center justify-between gap-2">${UI.crumbs([['Trang chủ', '#/'], ['Hộp thư thông báo', '']])}</div>
    <h1 class="font-display text-3xl font-bold mt-4">Hộp thư thông báo Email</h1>
    <p class="text-sm text-gray-500 mt-1">Danh sách email xác nhận tài khoản và khôi phục mật khẩu từ hệ thống Urban Chic®.</p>
    <div class="mt-6 space-y-3">${ms.length ? ms.map((m) => {
      const tk = m.token ? DB.data.resetTokens.find((t) => t.token === m.token) : null;
      const stt = tk ? (tk.used ? 'Đã sử dụng' : new Date(tk.expires) < new Date() ? 'Đã hết hạn' : `Còn hiệu lực đến ${fdt(tk.expires)}`) : '';
      return `<div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500"><span><i class="fa-regular fa-envelope mr-1"></i>Từ: <b>no-reply@urbanchic.vn</b> → <b>${esc(m.to)}</b></span><span>${fdt(m.t)}</span></div>
        <p class="font-bold mt-2">${esc(m.subject)}</p>
        <p class="text-sm text-gray-600 mt-1">${esc(m.body)}</p>
        ${m.token ? `<div class="mt-3 flex flex-wrap items-center gap-3"><a href="#/dat-lai-mat-khau/${m.token}" class="inline-block bg-black text-white text-sm font-bold px-4 py-2 rounded-lg">Đặt lại mật khẩu</a><span class="text-xs ${stt.startsWith('Còn') ? 'text-emerald-700' : 'text-red-600'} font-semibold">${stt}</span></div>` : ''}
      </div>`;
    }).join('') : UI.empty({ icon: 'fa-inbox', title: 'Chưa có email nào' })}</div>
  </div>`;
};
