/* ============ MÀN HÌNH MUA SẮM: Trang chủ, UC04–UC11 ============ */
const V = window.V || (window.V = {});

/* ----------------------------- TRANG CHỦ ----------------------------- */
V.home = () => {
  const ps = Catalog.all();
  const sale = ps.filter((p) => Catalog.promoActive(p)).slice(0, 4);
  const news = ps.filter((p) => p.isNew).slice(0, 4);
  const best = [...ps].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const vs = DB.data.vouchers.filter((v) => !KhuyenMaiController.trangThai(v)).slice(0, 4);
  const B = SEED.banners;
  return `
  <section class="relative">
    <div class="relative h-[460px] sm:h-[560px] overflow-hidden">
      <img src="${IMG(B.hero, 1800, 1100)}" class="absolute inset-0 w-full h-full object-cover" alt="">
      <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center text-white">
        <p class="text-xs font-bold tracking-[.3em] uppercase text-white/70">Streetwear & Minimalist · Thu Đông 2026</p>
        <h1 class="font-display text-4xl sm:text-6xl font-bold leading-tight mt-3 max-w-2xl">Tự tin khẳng định<br>bản sắc thành thị.</h1>
        <p class="mt-4 max-w-lg text-white/80 text-sm sm:text-base">Chất liệu bền màu, đường may sắc sảo, giá hợp lý – mua sắm trực tuyến mượt mà, theo dõi đơn hàng minh bạch.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a href="#/san-pham" class="bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-100">Mua sắm ngay</a>
          <a href="#/san-pham?sale=1" class="border border-white/60 px-6 py-3 rounded-full text-sm font-bold hover:bg-white hover:text-black transition">Đang giảm giá</a>
        </div>
      </div>
    </div>
  </section>

  <section class="border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 text-sm">
      ${[['fa-truck-fast', 'Freeship đơn từ 500K', 'Giao nhanh toàn quốc qua GHN/GHTK'], ['fa-rotate-left', 'Đổi trả trong 7 ngày', 'Kể từ khi nhận hàng'], ['fa-wallet', 'COD · MoMo · VNPay', 'Thanh toán linh hoạt, an toàn'], ['fa-location-dot', 'Theo dõi đơn realtime', 'Từ Chờ duyệt đến Hoàn tất']].map(([i, t, d]) => `
        <div class="flex items-center gap-3"><div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"><i class="fa-solid ${i}"></i></div><div><p class="font-bold">${t}</p><p class="text-xs text-gray-500">${d}</p></div></div>`).join('')}
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
    <div class="flex items-end justify-between mb-6"><h2 class="font-display text-2xl sm:text-3xl font-bold">Danh mục sản phẩm</h2><a href="#/san-pham" class="text-sm font-semibold underline underline-offset-4">Xem tất cả</a></div>
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      ${SEED.categories.map((c) => `
        <a href="#/san-pham?cat=${encodeURIComponent(c.name)}" class="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
          <img src="${IMG(c.cover, 400, 540)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div class="absolute bottom-3 left-3 right-3 text-white"><p class="text-sm font-bold leading-tight">${c.name}</p><p class="text-[11px] text-white/70">${Catalog.all().filter((p) => p.cat === c.name).length} sản phẩm</p></div>
        </a>`).join('')}
    </div>
  </section>

  <section class="bg-[#f6f3ee]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="flex flex-wrap items-end justify-between gap-2 mb-5"><div><p class="text-xs font-bold tracking-widest text-gray-500 uppercase">Ưu đãi đang diễn ra</p><h2 class="font-display text-2xl font-bold">Mã giảm giá dành cho bạn</h2></div><a href="#/san-pham?sale=1" class="text-sm font-semibold underline underline-offset-4">Sản phẩm khuyến mãi</a></div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${vs.map((v) => V.voucherTicket(v)).join('')}</div>
    </div>
  </section>

  ${V.productSection('Đang giảm giá', 'Giá tốt mùa Thu Đông', sale, '#/san-pham?sale=1')}

  <section class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="grid md:grid-cols-2 gap-4">
      <a href="#/san-pham?cat=${encodeURIComponent('Áo thun')}" class="relative h-72 rounded-3xl overflow-hidden group">
        <img src="${IMG(B.hero2, 1000, 700)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="">
        <div class="absolute inset-0 bg-black/35"></div>
        <div class="absolute bottom-6 left-6 text-white"><p class="text-xs tracking-widest uppercase text-white/80">Bộ sưu tập khởi đầu</p><p class="font-display text-3xl font-bold">T-Shirt Collection</p><span class="inline-block mt-3 text-sm font-semibold underline underline-offset-4">Khám phá</span></div>
      </a>
      <a href="#/dang-ky" class="relative h-72 rounded-3xl overflow-hidden group bg-black">
        <img src="${IMG(B.lookbook, 1000, 700)}" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" alt="">
        <div class="absolute bottom-6 left-6 text-white"><p class="text-xs tracking-widest uppercase text-white/80">Thành viên Urban Chic</p><p class="font-display text-3xl font-bold">Giảm 10% với NEWMEM10</p><span class="inline-block mt-3 text-sm font-semibold underline underline-offset-4">Đăng ký tài khoản</span></div>
      </a>
    </div>
  </section>

  ${V.productSection('Hàng mới về', 'Vừa cập bến', news, '#/san-pham?sort=moi')}
  ${V.productSection('Bán chạy nhất', 'Được yêu thích nhất', best, '#/san-pham?sort=ban_chay')}

  <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
    <div class="rounded-3xl bg-gray-900 text-white p-8 sm:p-12 grid md:grid-cols-2 gap-8 items-center">
      <div><p class="text-xs tracking-widest uppercase text-white/60">Câu chuyện thương hiệu</p><h3 class="font-display text-3xl font-bold mt-2">Urban Chic® – từ những chiếc T-shirt giới hạn</h3>
      <p class="text-sm text-white/70 mt-3 leading-relaxed">Thành lập đầu năm 2025 bởi 4 nhà sáng lập trẻ, Urban Chic theo đuổi phong cách thời trang thành thị hiện đại, năng động và thanh lịch – dung hòa giữa sáng tạo thiết kế và kỷ luật công nghệ, mang lại hành trình mua sắm trực tuyến mượt mà và minh bạch.</p></div>
      <div class="grid grid-cols-3 gap-4 text-center">${[['2025', 'Năm thành lập'], ['18+', 'Mẫu sản phẩm'], ['4.8★', 'Đánh giá TB']].map(([a, b]) => `<div class="rounded-2xl bg-white/10 py-6"><p class="text-2xl font-bold">${a}</p><p class="text-xs text-white/60 mt-1">${b}</p></div>`).join('')}</div>
    </div>
  </section>`;
};

V.productSection = (title, sub, list, link) => `
  <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
    <div class="flex items-end justify-between mb-6"><div><p class="text-xs font-bold tracking-widest text-gray-500 uppercase">${sub}</p><h2 class="font-display text-2xl sm:text-3xl font-bold">${title}</h2></div><a href="${link}" class="text-sm font-semibold underline underline-offset-4">Xem thêm</a></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">${list.map((p) => UI.productCard(p)).join('')}</div>
  </section>`;

V.voucherTicket = (v, compact = false) => {
  const st = KhuyenMaiController.trangThai(v);
  return `<div class="flex rounded-2xl bg-white ring-1 ${st ? 'ring-gray-200 opacity-60' : 'ring-gray-200'} overflow-hidden">
    <div class="w-20 shrink-0 ${st ? 'bg-gray-400' : 'bg-black'} text-white flex flex-col items-center justify-center text-center px-1"><i class="fa-solid fa-ticket text-lg"></i><span class="text-[10px] font-bold mt-1 tracking-wider">VOUCHER</span></div>
    <div class="flex-1 p-3 border-l-2 border-dashed border-gray-200 min-w-0">
      <p class="font-bold text-sm">${KhuyenMaiController.moTa(v)}</p>
      <p class="text-xs text-gray-500">${v.cats ? `Áp dụng: ${v.cats.join(', ')} · ` : ''}Đơn tối thiểu ${fmt(v.min)}</p>
      <p class="text-[11px] text-gray-400 mt-0.5">HSD: ${fdt(v.end, false)} · Còn ${Math.max(0, v.limit - v.used)}/${v.limit} lượt</p>
      <div class="mt-2 flex items-center justify-between gap-2"><code class="text-xs font-bold bg-gray-100 rounded px-2 py-0.5">${v.code}</code>
      ${st ? `<span class="text-[11px] font-semibold text-red-600">${st}</span>` : `<button onclick="App.copy('${v.code}','Đã sao chép mã ${v.code}')" class="text-xs font-bold underline">Sao chép</button>`}</div>
    </div>
  </div>`;
};

/* ------------------- UC04 TÌM KIẾM + UC05 LỌC SẢN PHẨM ------------------- */
V.shop = (_, q) => {
  const kq = SanPhamController.timKiem(q);
  const colors = q.colors ? q.colors.split(',') : [];
  const sizes = q.sizes ? q.sizes.split(',') : [];
  const hasFilter = !!(q.min || q.max || colors.length || sizes.length || q.instock || q.sale);
  const title = q.q ? `Kết quả tìm kiếm cho “${esc(q.q)}”` : q.cat || (q.sale ? 'Sản phẩm đang khuyến mãi' : 'Tất cả sản phẩm');
  const chips = [];
  if (q.cat && q.q) chips.push(['Danh mục: ' + q.cat, 'cat']);
  if (q.min || q.max) chips.push([`Giá: ${q.min ? fmt(q.min) : '0₫'} – ${q.max ? fmt(q.max) : '∞'}`, 'price']);
  colors.forEach((c) => chips.push(['Màu: ' + c, 'color:' + c]));
  sizes.forEach((s) => chips.push(['Size: ' + s, 'size:' + s]));
  if (q.instock) chips.push(['Còn hàng', 'instock']);
  if (q.sale) chips.push(['Đang khuyến mãi', 'sale']);
  const presets = [['', '200000', 'Dưới 200K'], ['200000', '400000', '200K – 400K'], ['400000', '600000', '400K – 600K'], ['600000', '', 'Trên 600K']];

  let body;
  if (kq.loiLoc) body = `<div class="mt-6">${UI.alert('error', `<b>Điều kiện lọc không hợp lệ:</b> ${kq.loiLoc} Vui lòng sửa lại khoảng giá.`)}</div>`;
  else if (q.q && kq.tongTruocLoc === 0) body = UI.empty({ icon: 'fa-magnifying-glass', title: 'Không tìm thấy sản phẩm phù hợp', desc: `Không có sản phẩm nào khớp với từ khóa “${esc(q.q)}”. Hãy thử từ khóa khác như “áo thun”, “hoodie”, “jeans”…`, action: '<a href="#/san-pham" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Xem tất cả sản phẩm</a>' });
  else if (!kq.tongSo) body = UI.empty({ icon: 'fa-filter-circle-xmark', title: 'Không có sản phẩm đáp ứng tiêu chí lọc', desc: 'Hãy thử thay đổi hoặc bỏ bớt một số bộ lọc để xem thêm sản phẩm.', action: `<button onclick="V.shopClear()" class="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Bỏ bộ lọc</button>` });
  else body = `<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 mt-6">${kq.danhSach.map((p) => UI.productCard(p)).join('')}</div>${UI.pager(kq.trang, kq.soTrang, 'V.shopPage')}`;

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-wrap items-center justify-between gap-2">${UI.crumbs([['Trang chủ', '#/'], ['Sản phẩm', '#/san-pham'], [q.q ? 'Tìm kiếm' : q.cat || 'Tất cả', '']])}<div class="flex gap-2">${UI.uc('UC04', 'GiaoDienTimKiem')}${hasFilter ? UI.uc('UC05', 'Lọc sản phẩm') : ''}</div></div>
    <div class="mt-4 flex flex-wrap items-end justify-between gap-3">
      <div><h1 class="font-display text-3xl font-bold">${title}</h1><p class="text-sm text-gray-500 mt-1">${kq.loiLoc ? '' : `Tìm thấy <b class="text-gray-900">${kq.tongSo}</b> sản phẩm${hasFilter ? ` (lọc từ ${kq.tongTruocLoc})` : ''}`}</p></div>
      <div class="flex items-center gap-2">
        <button onclick="document.getElementById('filter-panel').classList.toggle('hidden')" class="lg:hidden border border-gray-300 rounded-full px-4 py-2 text-sm font-semibold"><i class="fa-solid fa-sliders mr-1.5"></i>Bộ lọc</button>
        <select onchange="V.shopSet({sort:this.value})" class="border border-gray-300 rounded-full px-4 py-2 text-sm font-medium bg-white">
          ${[['moi', 'Mới nhất'], ['ban_chay', 'Bán chạy'], ['gia_tang', 'Giá: thấp → cao'], ['gia_giam', 'Giá: cao → thấp']].map(([k, l]) => `<option value="${k}" ${q.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
    </div>
    ${chips.length ? `<div class="mt-4 flex flex-wrap items-center gap-2">${chips.map(([l, k]) => `<span class="inline-flex items-center gap-2 bg-gray-100 rounded-full pl-3 pr-1.5 py-1 text-xs font-semibold">${esc(l)}<button onclick="V.shopRemove('${esc(k)}')" class="w-5 h-5 rounded-full hover:bg-gray-300"><i class="fa-solid fa-xmark text-[10px]"></i></button></span>`).join('')}<button onclick="V.shopClear()" class="text-xs font-semibold underline ml-1">Xóa tất cả bộ lọc</button></div>` : ''}

    <div class="mt-6 grid lg:grid-cols-[250px_1fr] gap-8">
      <aside id="filter-panel" class="hidden lg:block space-y-7 text-sm">
        <div class="flex items-center justify-between lg:hidden"><b>Bộ lọc sản phẩm</b></div>
        <div>
          <h4 class="font-bold uppercase text-xs tracking-wider mb-3">Danh mục</h4>
          <ul class="space-y-1.5">
            <li><button onclick="V.shopSet({cat:''})" class="${!q.cat ? 'font-bold' : 'text-gray-600 hover:text-black'}">Tất cả sản phẩm</button></li>
            ${SEED.categories.map((c) => `<li><button onclick="V.shopSet({cat:'${c.name}'})" class="${q.cat === c.name ? 'font-bold' : 'text-gray-600 hover:text-black'} flex w-full justify-between"><span>${c.name}</span><span class="text-gray-400">${Catalog.all().filter((p) => p.cat === c.name).length}</span></button></li>`).join('')}
          </ul>
        </div>
        <div>
          <h4 class="font-bold uppercase text-xs tracking-wider mb-3">Khoảng giá</h4>
          <div class="space-y-2">${presets.map(([a, b, l]) => `<label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="pr" ${q.min === a && q.max === b && (a || b) ? 'checked' : ''} onchange="V.shopSet({min:'${a}',max:'${b}'})" class="accent-black"> ${l}</label>`).join('')}</div>
          <div class="flex items-center gap-2 mt-3">
            <input id="f-min" type="number" min="0" step="10000" placeholder="Từ" value="${esc(q.min || '')}" class="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs">
            <span class="text-gray-400">–</span>
            <input id="f-max" type="number" min="0" step="10000" placeholder="Đến" value="${esc(q.max || '')}" class="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs">
          </div>
          <button onclick="V.shopSet({min:document.getElementById('f-min').value,max:document.getElementById('f-max').value})" class="mt-2 w-full bg-black text-white rounded-lg py-2 text-xs font-bold">Áp dụng</button>
        </div>
        <div>
          <h4 class="font-bold uppercase text-xs tracking-wider mb-3">Màu sắc</h4>
          <div class="flex flex-wrap gap-2">${Catalog.allColors().map((c) => `<button onclick="V.shopToggle('colors','${c.name}')" title="${c.name}" class="flex items-center gap-1.5 rounded-full border ${colors.includes(c.name) ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'} pl-1 pr-2.5 py-1 text-xs"><span class="w-4 h-4 rounded-full ring-1 ring-gray-300" style="background:${c.hex}"></span>${c.name}</button>`).join('')}</div>
        </div>
        <div>
          <h4 class="font-bold uppercase text-xs tracking-wider mb-3">Kích cỡ (Size)</h4>
          <div class="grid grid-cols-4 gap-2">${SIZES.map((s) => `<button onclick="V.shopToggle('sizes','${s}')" class="h-10 rounded-lg border text-sm font-semibold ${sizes.includes(s) ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}">${s}</button>`).join('')}</div>
        </div>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" ${q.instock ? 'checked' : ''} onchange="V.shopSet({instock:this.checked?'1':''})" class="accent-black w-4 h-4"> Chỉ hiện sản phẩm còn hàng</label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" ${q.sale ? 'checked' : ''} onchange="V.shopSet({sale:this.checked?'1':''})" class="accent-black w-4 h-4"> Đang khuyến mãi</label>
        </div>
        ${hasFilter ? '<button onclick="V.shopClear()" class="w-full border border-gray-300 rounded-lg py-2 text-xs font-bold hover:border-black">Xóa tất cả bộ lọc</button>' : ''}
      </aside>
      <div>${body}</div>
    </div>
  </div>`;
};
V.shopQ = () => App.route().query;
V.shopSet = (patch) => { const q = { ...V.shopQ(), ...patch }; delete q.page; go('#/san-pham' + qsStr(q)); };
V.shopPage = (n) => { go('#/san-pham' + qsStr({ ...V.shopQ(), page: n })); };
V.shopToggle = (key, val) => { const q = V.shopQ(); const arr = q[key] ? q[key].split(',') : []; const i = arr.indexOf(val); if (i >= 0) arr.splice(i, 1); else arr.push(val); V.shopSet({ [key]: arr.join(',') }); };
V.shopRemove = (k) => {
  if (k === 'price') return V.shopSet({ min: '', max: '' });
  if (k.startsWith('color:')) return V.shopToggle('colors', k.slice(6));
  if (k.startsWith('size:')) return V.shopToggle('sizes', k.slice(5));
  V.shopSet({ [k]: '' });
};
/* Bỏ bộ lọc → khôi phục danh sách theo điều kiện tìm kiếm ban đầu */
V.shopClear = () => { const q = V.shopQ(); go('#/san-pham' + qsStr({ q: q.q, cat: q.cat, sort: q.sort })); };

/* ----------------------- UC06 XEM CHI TIẾT SẢN PHẨM ----------------------- */
const PD = { id: null, color: null, size: null, qty: 1, img: 0, err: '' };
V.product = ([id]) => {
  const r = SanPhamController.xemChiTiet(id);
  if (!r.ok) return `<div class="max-w-3xl mx-auto px-4 py-10">${UI.uc('UC06', 'GiaoDienChiTiet')}${UI.empty({ icon: 'fa-box-open', title: 'Sản phẩm không khả dụng', desc: r.error, action: '<a href="#/san-pham" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Tiếp tục mua sắm</a>' })}</div>`;
  const p = r.p;
  if (PD.id !== id) Object.assign(PD, { id, color: (p.colors.find((c) => p.sizes.some((s) => Catalog.stock(Catalog.sku(p, c.code, s)) > 0)) || p.colors[0]).code, size: null, qty: 1, img: 0, err: '' });
  const color = p.colors.find((c) => c.code === PD.color);
  const sku = PD.size ? Catalog.sku(p, PD.color, PD.size) : null;
  const ton = sku ? Catalog.stock(sku) : null;
  const totalColor = p.sizes.reduce((s, sz) => s + Catalog.stock(Catalog.sku(p, PD.color, sz)), 0);
  const fav = YeuThichController.co(p.id);
  const km = KhuyenMaiController.xemKhuyenMai(p.id);
  const related = Catalog.all().filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const fill = related.length < 4 ? Catalog.all().filter((x) => x.cat !== p.cat && x.id !== p.id).slice(0, 4 - related.length) : [];
  let stockLine;
  if (!sku) stockLine = `<span class="text-gray-500"><i class="fa-regular fa-hand-pointer mr-1"></i>Chọn size để xem tồn kho của biến thể (màu ${color.name} còn tổng ${totalColor} sản phẩm)</span>`;
  else if (ton === 0) stockLine = '<span class="text-red-600 font-semibold"><i class="fa-solid fa-circle-xmark mr-1"></i>Biến thể này đã hết hàng – không thể đặt mua</span>';
  else if (ton <= 5) stockLine = `<span class="text-amber-600 font-semibold"><i class="fa-solid fa-fire mr-1"></i>Chỉ còn ${ton} sản phẩm</span>`;
  else stockLine = `<span class="text-emerald-700 font-semibold"><i class="fa-solid fa-circle-check mr-1"></i>Còn hàng (${ton} sản phẩm)</span>`;
  const canBuy = sku && ton > 0;

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-wrap items-center justify-between gap-2">${UI.crumbs([['Trang chủ', '#/'], [p.cat, `#/san-pham?cat=${encodeURIComponent(p.cat)}`], [p.name, '']])}${UI.uc('UC06', 'GiaoDienChiTiet')}</div>
    <div class="mt-6 grid lg:grid-cols-2 gap-10">
      <div class="flex flex-col-reverse sm:flex-row gap-3">
        <div class="flex sm:flex-col gap-2">${p.images.map((im, i) => `<button onclick="PD.img=${i};App.render()" class="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden ring-2 ${PD.img === i ? 'ring-black' : 'ring-transparent opacity-70 hover:opacity-100'}"><img src="${IMG(im, 160, 200)}" class="w-full h-full object-cover" alt=""></button>`).join('')}</div>
        <div class="relative flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100">
          <img src="${Catalog.img(p, PD.img, 900, 1125)}" class="w-full h-full object-cover" alt="${esc(p.name)}" onerror="this.src='${PLACEHOLDER}'">
          ${Catalog.promoActive(p) ? `<span class="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">-${p.promo.percent}%</span>` : ''}
        </div>
      </div>

      <div>
        <p class="text-xs font-bold tracking-widest text-gray-500 uppercase">${p.cat} · Mã SP ${p.id}</p>
        <h1 class="font-display text-3xl font-bold mt-1">${esc(p.name)}</h1>
        <div class="mt-2 flex items-center gap-2 text-sm">${UI.stars(p.rating)} <span class="font-semibold">${p.rating}</span><span class="text-gray-400">(${p.reviews} đánh giá) · Đã bán ${p.sold}</span></div>
        <div class="mt-4 flex items-baseline gap-2">${UI.price(p, true)}</div>

        <div class="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm"><p class="font-bold text-red-700"><i class="fa-solid fa-tags mr-1.5"></i>Khuyến mãi của sản phẩm</p>
            <p class="text-xs text-gray-600 mt-0.5">${km.chuongTrinh.length ? `${km.chuongTrinh[0].label}: giảm ${km.chuongTrinh[0].percent}% · ` : ''}${km.hieuLuc.length} mã voucher có thể áp dụng</p></div>
            <button onclick="V.showPromo('${p.id}')" class="shrink-0 text-xs font-bold bg-white border border-red-200 text-red-700 rounded-full px-3.5 py-2 hover:bg-red-600 hover:text-white transition">Xem khuyến mãi</button>
          </div>
        </div>

        <div class="mt-6">
          <p class="text-sm font-bold">Màu sắc: <span class="font-normal text-gray-600">${color.name}</span></p>
          <div class="flex flex-wrap gap-2 mt-2">${p.colors.map((c) => `<button onclick="PD.color='${c.code}';PD.err='';App.render()" title="${c.name}" class="flex items-center gap-2 rounded-full border-2 ${PD.color === c.code ? 'border-black' : 'border-gray-200 hover:border-gray-400'} pl-1.5 pr-3 py-1.5 text-sm"><span class="w-6 h-6 rounded-full ring-1 ring-gray-300" style="background:${c.hex}"></span>${c.name}</button>`).join('')}</div>
        </div>
        <div class="mt-5">
          <div class="flex items-center justify-between"><p class="text-sm font-bold">Kích cỡ: <span class="font-normal text-gray-600">${PD.size || 'Chưa chọn'}</span></p><button onclick="V.sizeGuide()" class="text-xs font-semibold underline"><i class="fa-solid fa-ruler mr-1"></i>Bảng size</button></div>
          <div class="grid grid-cols-4 gap-2 mt-2 max-w-sm">${p.sizes.map((s) => { const st = Catalog.stock(Catalog.sku(p, PD.color, s)); return `<button onclick="PD.size='${s}';PD.err='';App.render()" class="relative h-11 rounded-xl border-2 text-sm font-bold ${PD.size === s ? 'border-black bg-black text-white' : st === 0 ? 'border-gray-200 text-gray-300 size-out' : 'border-gray-200 hover:border-black'}">${s}</button>`; }).join('')}</div>
          ${sku ? `<p class="text-[11px] text-gray-400 mt-2">Mã SKU: <b class="text-gray-600">${sku}</b></p>` : ''}
        </div>
        <div class="mt-4 text-sm">${stockLine}</div>

        <div class="mt-5 flex items-center gap-3">
          <div class="flex items-center border-2 border-gray-200 rounded-xl h-12">
            <button onclick="PD.qty=Math.max(1,PD.qty-1);App.render()" class="w-11 h-full text-gray-600 hover:text-black"><i class="fa-solid fa-minus text-xs"></i></button>
            <input type="number" min="1" value="${PD.qty}" onchange="PD.qty=parseInt(this.value,10)||0;App.render()" class="w-12 text-center font-bold outline-none">
            <button onclick="PD.qty=PD.qty+1;App.render()" class="w-11 h-full text-gray-600 hover:text-black"><i class="fa-solid fa-plus text-xs"></i></button>
          </div>
          <button onclick="App.toggleFav('${p.id}')" class="h-12 px-4 rounded-xl border-2 ${fav ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 hover:border-black'} text-sm font-semibold"><i class="fa-${fav ? 'solid' : 'regular'} fa-heart mr-1.5"></i>${fav ? 'Đã yêu thích' : 'Yêu thích'}</button>
        </div>
        ${PD.err ? `<div class="mt-3">${UI.alert('error', PD.err)}</div>` : ''}
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <button onclick="V.addToCart(false)" ${sku && !canBuy ? 'disabled' : ''} class="h-13 py-3.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"><i class="fa-solid fa-bag-shopping mr-2"></i>Thêm vào giỏ hàng</button>
          <button onclick="V.addToCart(true)" ${sku && !canBuy ? 'disabled' : ''} class="h-13 py-3.5 rounded-xl border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition disabled:border-gray-300 disabled:text-gray-300 disabled:hover:bg-white disabled:cursor-not-allowed">Mua ngay</button>
        </div>

        <div class="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600">
          <div class="rounded-xl bg-gray-50 py-3"><i class="fa-solid fa-truck-fast text-base mb-1 block"></i>Freeship đơn từ 500K</div>
          <div class="rounded-xl bg-gray-50 py-3"><i class="fa-solid fa-rotate-left text-base mb-1 block"></i>Đổi trả 7 ngày</div>
          <div class="rounded-xl bg-gray-50 py-3"><i class="fa-solid fa-shield-halved text-base mb-1 block"></i>Thanh toán bảo mật</div>
        </div>

        <div class="mt-6 divide-y divide-gray-100 border-y border-gray-100 text-sm">
          <details open class="py-4"><summary class="font-bold cursor-pointer">Mô tả sản phẩm</summary><p class="mt-2 text-gray-600 leading-relaxed">${esc(p.desc)}</p></details>
          <details class="py-4"><summary class="font-bold cursor-pointer">Chất liệu & bảo quản</summary><p class="mt-2 text-gray-600">${esc(p.material)}</p><ul class="mt-2 text-gray-600 list-disc pl-5 space-y-1"><li>Giặt máy ở nhiệt độ thường, lộn trái khi giặt.</li><li>Không dùng chất tẩy, phơi nơi thoáng mát.</li></ul></details>
          <details class="py-4"><summary class="font-bold cursor-pointer">Thuộc tính & biến thể SKU</summary>
            <div class="mt-3 overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-left text-gray-500"><th class="py-1.5 pr-3">Mã SKU</th><th class="pr-3">Màu</th><th class="pr-3">Size</th><th>Tình trạng</th></tr></thead><tbody>
            ${p.colors.flatMap((c) => p.sizes.map((s) => { const k = Catalog.sku(p, c.code, s); const t = Catalog.stock(k); return `<tr class="border-t border-gray-100"><td class="py-1.5 pr-3 font-mono">${k}</td><td class="pr-3">${c.name}</td><td class="pr-3">${s}</td><td class="${t ? 'text-emerald-700' : 'text-red-600'}">${t ? `Còn ${t}` : 'Hết hàng'}</td></tr>`; })).join('')}
            </tbody></table></div></details>
          <details class="py-4"><summary class="font-bold cursor-pointer">Chính sách đổi trả</summary><p class="mt-2 text-gray-600">Hỗ trợ đổi size/màu hoặc trả hàng trong vòng ${SEED.policy.soNgayDoiTra} ngày kể từ khi nhận hàng, sản phẩm còn nguyên tem mác. Gửi yêu cầu tại mục <a href="#/tai-khoan/don-hang" class="underline">Đơn hàng của tôi</a>.</p></details>
        </div>
      </div>
    </div>

    <section class="mt-16">
      <h2 class="font-display text-2xl font-bold mb-6">Có thể bạn cũng thích</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">${[...related, ...fill].map((x) => UI.productCard(x)).join('')}</div>
    </section>
  </div>`;
};

/* UC08 THÊM VÀO GIỎ HÀNG */
V.addToCart = (buyNow) => {
  const p = Catalog.get(PD.id);
  if (!PD.color || !PD.size) { PD.err = 'Vui lòng chọn đầy đủ <b>màu sắc</b> và <b>kích cỡ (size)</b> trước khi thêm vào giỏ.'; UI.toast('Bạn chưa chọn đủ màu sắc / size', 'warn'); return App.render(); }
  const sku = Catalog.sku(p, PD.color, PD.size);
  const r = GioHangController.themVaoGio(sku, PD.qty);
  if (!r.ok) { PD.err = r.error; UI.toast(r.error, 'error', 4500); return App.render(); }
  PD.err = ''; App.renderHeader();
  if (buyNow) { App.render(); return go('#/gio-hang'); }
  App.render();
  const c = r.i.color;
  UI.modal({
    title: 'Đã thêm vào giỏ hàng', icon: '<i class="fa-solid fa-circle-check text-emerald-500"></i>', size: 'max-w-md',
    body: `<div class="flex gap-4"><img src="${Catalog.img(p, 0, 160, 200)}" class="w-20 h-24 rounded-xl object-cover" alt=""><div><p class="font-bold text-gray-900">${esc(p.name)}</p><p class="text-xs text-gray-500 mt-1">${c.name} / ${PD.size} · SL: ${PD.qty}${r.gop ? ' <span class="text-amber-600">(đã cộng dồn với sản phẩm cùng biến thể trong giỏ)</span>' : ''}</p><p class="text-sm font-bold mt-2">${fmt(Catalog.unitPrice(p) * PD.qty)}</p></div></div>
    <p class="mt-4 text-xs text-gray-500">Giỏ hàng hiện có <b>${GioHangController.soLuong()}</b> sản phẩm.</p>`,
    actions: [{ label: 'Tiếp tục mua sắm' }, { label: 'Xem giỏ hàng', primary: true, onClick: () => { UI.closeModal(); go('#/gio-hang'); } }],
  });
};

/* UC07 XEM KHUYẾN MÃI CỦA SẢN PHẨM */
V.showPromo = (id) => {
  const p = Catalog.get(id); const km = KhuyenMaiController.xemKhuyenMai(id);
  const none = !km.chuongTrinh.length && !km.hieuLuc.length;
  UI.modal({
    title: 'Khuyến mãi của sản phẩm', icon: '<i class="fa-solid fa-tags text-red-600"></i>', size: 'max-w-xl',
    body: `<div class="flex items-center justify-between gap-2 mb-4"><p class="text-xs text-gray-500">Tra cứu lúc ${fdt(nowISO())} · <b>${esc(p.name)}</b></p>${UI.uc('UC07', 'KhuyenMaiController')}</div>
      ${none ? UI.alert('info', 'Sản phẩm hiện <b>chưa có chương trình khuyến mãi</b> nào đang áp dụng.') : ''}
      ${km.chuongTrinh.map((c) => `<div class="rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white p-4 mb-4">
        <p class="text-xs uppercase tracking-widest text-white/80">Chương trình giảm giá trực tiếp</p>
        <p class="text-lg font-bold mt-1">${c.label} – Giảm ${c.percent}%</p>
        <p class="text-sm mt-1">Giá khuyến mãi: <b>${fmt(Catalog.unitPrice(p))}</b> <span class="line-through text-white/70">${fmt(p.price)}</span></p>
        <p class="text-xs text-white/85 mt-2"><i class="fa-regular fa-calendar mr-1"></i>Thời hạn: ${fdt(c.start, false)} – ${fdt(c.end, false)}</p>
        <p class="text-xs text-white/85 mt-1"><i class="fa-solid fa-circle-info mr-1"></i>Điều kiện: ${c.cond}</p></div>`).join('')}
      ${km.hieuLuc.length ? `<p class="font-bold text-gray-900 mb-2">Mã voucher áp dụng được (${km.hieuLuc.length})</p><div class="space-y-2">${km.hieuLuc.map((v) => V.voucherTicket(v)).join('')}</div>` : ''}
      ${km.hetHieuLuc.length ? `<p class="font-bold text-gray-900 mt-5 mb-2">Mã không còn hiệu lực</p><div class="space-y-2">${km.hetHieuLuc.map((v) => V.voucherTicket(v)).join('')}</div>` : ''}
      <p class="text-[11px] text-gray-400 mt-4">* Voucher được nhập ở bước Đặt hàng; hệ thống tự kiểm tra điều kiện áp dụng (giá trị tối thiểu, thời hạn, số lượt).</p>`,
    actions: [{ label: 'Đóng', primary: true }],
  });
};

V.sizeGuide = () => UI.modal({
  title: 'Bảng size Urban Chic', icon: '<i class="fa-solid fa-ruler"></i>',
  body: `<table class="w-full text-sm text-center"><thead><tr class="bg-gray-50"><th class="py-2">Size</th><th>Chiều cao (cm)</th><th>Cân nặng (kg)</th><th>Ngực (cm)</th></tr></thead><tbody>
  ${[['S', '155–162', '45–53', '86–90'], ['M', '163–169', '54–62', '90–96'], ['L', '170–175', '63–70', '96–102'], ['XL', '176–182', '71–80', '102–108']].map((r) => `<tr class="border-t">${r.map((c, i) => `<td class="py-2 ${i ? '' : 'font-bold'}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
  <p class="text-xs text-gray-500 mt-3">Sản phẩm phân loại theo size S/M/L/XL và quản lý theo mã SKU (Màu sắc × Kích cỡ).</p>`,
  actions: [{ label: 'Đã hiểu', primary: true }],
});

/* ------------------------- UC09 QUẢN LÝ GIỎ HÀNG ------------------------- */
V.cart = () => {
  const g = GioHangController.xemGioHang();
  const P = SEED.policy;
  const head = `<div class="flex flex-wrap items-center justify-between gap-2">${UI.crumbs([['Trang chủ', '#/'], ['Giỏ hàng', '']])}${UI.uc('UC09', 'GiaoDienGioHang')}</div>`;
  if (!g.lines.length) return `<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">${head}${UI.empty({ icon: 'fa-bag-shopping', title: 'Giỏ hàng của bạn đang trống', desc: 'Hãy khám phá các sản phẩm và thêm vào giỏ để chuẩn bị đặt hàng nhé.', action: '<a href="#/san-pham" class="inline-block bg-black text-white px-6 py-3 rounded-full text-sm font-semibold">Mua sắm ngay</a>' })}</div>`;
  const remain = Math.max(0, P.mocFreeship - g.tamTinh);
  const hasWarn = g.lines.some((l) => l.warn);
  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    ${head}
    <h1 class="font-display text-3xl font-bold mt-4">Giỏ hàng <span class="text-gray-400 text-xl font-sans font-medium">(${g.soLuong} sản phẩm)</span></h1>
    ${!Session.user() ? `<div class="mt-4">${UI.alert('info', 'Bạn đang mua sắm với tư cách <b>Khách vãng lai</b>. Giỏ hàng sẽ được gộp vào tài khoản khi bạn <a href="#/dang-nhap?next=%23%2Fgio-hang" class="underline font-semibold">đăng nhập</a>.')}</div>` : ''}
    <div class="mt-6 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div class="rounded-2xl border border-gray-200 divide-y divide-gray-100">
        <div class="hidden md:grid grid-cols-[1fr_120px_130px_110px_40px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500"><span>Sản phẩm</span><span class="text-right">Đơn giá</span><span class="text-center">Số lượng</span><span class="text-right">Thành tiền</span><span></span></div>
        ${g.lines.map((l) => `
        <div class="grid md:grid-cols-[1fr_120px_130px_110px_40px] gap-4 px-5 py-5 items-center ${l.warn ? 'bg-red-50/40' : ''}">
          <div class="flex gap-4 min-w-0">
            <a href="#/san-pham/${l.p.id}"><img src="${Catalog.img(l.p, 0, 160, 200)}" class="w-20 h-24 rounded-xl object-cover" alt=""></a>
            <div class="min-w-0">
              <a href="#/san-pham/${l.p.id}" class="font-semibold text-sm hover:underline line-clamp-1">${esc(l.p.name)}</a>
              <p class="text-[11px] text-gray-400 font-mono mt-0.5">${l.sku}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <select onchange="V.cartEdit('BIEN_THE','${l.sku}',{color:this.value})" class="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">${l.p.colors.map((c) => `<option value="${c.code}" ${c.code === l.color.code ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
                <select onchange="V.cartEdit('BIEN_THE','${l.sku}',{size:this.value})" class="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">${l.p.sizes.map((s) => { const t = Catalog.stock(Catalog.sku(l.p, l.color.code, s)); return `<option value="${s}" ${s === l.size ? 'selected' : ''}>Size ${s}${t ? '' : ' (hết)'}</option>`; }).join('')}</select>
              </div>
              ${l.warn ? `<p class="text-xs text-red-600 font-semibold mt-1.5"><i class="fa-solid fa-triangle-exclamation mr-1"></i>${l.warn} – vui lòng điều chỉnh</p>` : `<p class="text-[11px] text-gray-400 mt-1.5">Còn ${l.stock} sản phẩm</p>`}
            </div>
          </div>
          <div class="md:text-right text-sm">${l.price !== l.p.price ? `<p class="font-semibold text-red-600">${fmt(l.price)}</p><p class="text-xs text-gray-400 line-through">${fmt(l.p.price)}</p>` : `<p class="font-semibold">${fmt(l.price)}</p>`}</div>
          <div class="flex md:justify-center"><div class="flex items-center border border-gray-300 rounded-lg h-9">
            <button onclick="V.cartEdit('SO_LUONG','${l.sku}',{qty:${l.qty - 1}})" class="w-8 h-full text-gray-600"><i class="fa-solid fa-minus text-[10px]"></i></button>
            <input value="${l.qty}" onchange="V.cartEdit('SO_LUONG','${l.sku}',{qty:Number(this.value)})" class="w-10 text-center text-sm font-bold outline-none">
            <button onclick="V.cartEdit('SO_LUONG','${l.sku}',{qty:${l.qty + 1}})" class="w-8 h-full text-gray-600"><i class="fa-solid fa-plus text-[10px]"></i></button>
          </div></div>
          <p class="md:text-right font-bold text-sm">${fmt(l.lineTotal)}</p>
          <button onclick="V.cartEdit('XOA','${l.sku}')" title="Xóa khỏi giỏ" class="w-9 h-9 rounded-full hover:bg-red-50 hover:text-red-600 text-gray-400"><i class="fa-regular fa-trash-can"></i></button>
        </div>`).join('')}
        <div class="px-5 py-4 flex justify-between text-sm"><a href="#/san-pham" class="font-semibold underline underline-offset-4"><i class="fa-solid fa-arrow-left mr-1.5"></i>Tiếp tục mua sắm</a><span class="text-gray-500">Giỏ hàng chưa giữ tồn kho – tồn kho được giữ khi đặt hàng.</span></div>
      </div>

      <aside class="rounded-2xl bg-gray-50 p-6 lg:sticky lg:top-28">
        <h3 class="font-bold text-lg">Tóm tắt giỏ hàng</h3>
        <div class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-gray-600">Tạm tính (${g.soLuong} sản phẩm)</span><b>${fmt(g.tamTinh)}</b></div>
          <div class="flex justify-between"><span class="text-gray-600">Phí vận chuyển</span><span class="text-gray-500">Tính ở bước đặt hàng</span></div>
        </div>
        <div class="mt-4 rounded-xl bg-white p-3 text-xs">
          ${remain ? `<p>Mua thêm <b>${fmt(remain)}</b> để được <b>miễn phí vận chuyển</b></p>` : '<p class="text-emerald-700 font-semibold"><i class="fa-solid fa-truck-fast mr-1"></i>Đơn hàng được miễn phí vận chuyển!</p>'}
          <div class="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden"><div class="h-full bg-black rounded-full" style="width:${Math.min(100, (g.tamTinh / P.mocFreeship) * 100)}%"></div></div>
        </div>
        <div class="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline"><span class="font-bold">Tổng tạm tính</span><span class="text-2xl font-bold">${fmt(g.tamTinh)}</span></div>
        ${hasWarn ? `<div class="mt-3">${UI.alert('error', 'Có sản phẩm hết hàng hoặc vượt tồn kho. Vui lòng điều chỉnh trước khi đặt hàng.')}</div>` : ''}
        <button onclick="V.toCheckout()" class="mt-4 w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800">Đặt hàng <i class="fa-solid fa-arrow-right ml-1.5"></i></button>
        <p class="text-[11px] text-gray-500 mt-3 text-center">Nhập mã voucher & chọn phương thức thanh toán ở bước tiếp theo.</p>
      </aside>
    </div>
  </div>`;
};
V.cartEdit = (op, sku, d) => {
  if (op === 'SO_LUONG' && d.qty < 1) return V.cartEdit('XOA', sku);
  const r = GioHangController.suaGio(op, sku, d);
  if (!r.ok) UI.toast(r.error, 'error', 4500);
  else if (op === 'XOA') UI.toast(r.msg, 'info');
  else if (op === 'BIEN_THE') UI.toast(r.gop ? 'Đã đổi biến thể và gộp với dòng cùng SKU trong giỏ.' : 'Đã cập nhật màu/size.', 'success');
  App.render(); App.renderHeader();
};
V.toCheckout = () => {
  const g = GioHangController.xemGioHang();
  if (g.lines.some((l) => l.warn)) return UI.toast('Vui lòng điều chỉnh các sản phẩm hết hàng / vượt tồn kho trước.', 'error');
  if (!Session.user()) { UI.toast('Vui lòng đăng nhập (Khách thành viên) để đặt hàng.', 'info'); return go('#/dang-nhap?next=' + encodeURIComponent('#/dat-hang')); }
  go('#/dat-hang');
};

/* -------------------- UC11 QUẢN LÝ SẢN PHẨM YÊU THÍCH -------------------- */
V.wishlist = () => {
  const ds = YeuThichController.xemYeuThich();
  return V.accountLayout('yeu-thich', `
    <div class="flex flex-wrap items-center justify-between gap-2"><h2 class="text-xl font-bold">Sản phẩm yêu thích <span class="text-gray-400 font-medium">(${ds.length})</span></h2>${UI.uc('UC11', 'GiaoDienYeuThich')}</div>
    <p class="text-sm text-gray-500 mt-1">Theo dõi tình trạng còn hàng và các đợt giảm giá của sản phẩm bạn quan tâm.</p>
    ${!ds.length ? UI.empty({ icon: 'fa-heart', title: 'Danh sách yêu thích trống', desc: 'Nhấn biểu tượng trái tim trên sản phẩm để lưu lại và mua sau.', action: '<a href="#/san-pham" class="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold">Khám phá sản phẩm</a>' }) : `
    <div class="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${ds.map((p) => { const out = Catalog.totalStock(p) === 0; const promo = Catalog.promoActive(p); return `
      <div class="rounded-2xl border border-gray-200 p-3 flex gap-3">
        <a href="#/san-pham/${p.id}" class="shrink-0 relative"><img src="${Catalog.img(p, 0, 200, 250)}" class="w-24 h-30 h-28 rounded-xl object-cover ${out ? 'grayscale' : ''}" alt="">${promo ? `<span class="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 rounded">-${p.promo.percent}%</span>` : ''}</a>
        <div class="min-w-0 flex-1 flex flex-col">
          <a href="#/san-pham/${p.id}" class="text-sm font-semibold hover:underline line-clamp-2">${esc(p.name)}</a>
          <div class="mt-1 flex items-baseline gap-1.5 flex-wrap">${UI.price(p)}</div>
          <p class="text-xs mt-1 ${out ? 'text-red-600 font-semibold' : 'text-emerald-700'}"><i class="fa-solid ${out ? 'fa-circle-xmark' : 'fa-circle-check'} mr-1"></i>${out ? 'Hết hàng – sẽ thông báo khi có lại' : 'Còn hàng'}</p>
          ${promo ? `<p class="text-[11px] text-red-600 mt-0.5"><i class="fa-solid fa-tags mr-1"></i>${p.promo.label}</p>` : ''}
          <div class="mt-auto pt-2 flex gap-2">
            <a href="#/san-pham/${p.id}" class="flex-1 text-center text-xs font-bold bg-black text-white rounded-lg py-2">Xem chi tiết</a>
            <button onclick="V.unfav('${p.id}')" class="text-xs font-bold border border-gray-300 rounded-lg px-3 hover:border-red-500 hover:text-red-600" title="Bỏ yêu thích"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      </div>`; }).join('')}</div>`}
  `);
};
V.unfav = (id) => { YeuThichController.boYeuThich(id); UI.toast('Đã bỏ sản phẩm khỏi danh sách yêu thích.', 'info'); App.render(); App.renderHeader(); };
