/* =================== TIỆN ÍCH GIAO DIỆN DÙNG CHUNG =================== */
const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fdt = (iso, withTime = true) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}${withTime ? ` ${p(d.getHours())}:${p(d.getMinutes())}` : ''}`;
};
const go = (hash) => { if (location.hash === hash) App.render(); else location.hash = hash; };
const qsStr = (o) => { const u = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== '' && v != null) u.set(k, v); }); const s = u.toString(); return s ? '?' + s : ''; };

const ORDER_STATUS = {
  CHO_DUYET: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: 'fa-hourglass-half' },
  DANG_DONG_GOI: { label: 'Đang đóng gói', cls: 'bg-blue-50 text-blue-700 ring-blue-200', icon: 'fa-box' },
  DANG_GIAO: { label: 'Đang giao', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200', icon: 'fa-truck-fast' },
  HEN_GIAO_LAI: { label: 'Hẹn giao lại', cls: 'bg-orange-50 text-orange-700 ring-orange-200', icon: 'fa-clock-rotate-left' },
  GIAO_THAT_BAI: { label: 'Giao thất bại', cls: 'bg-red-50 text-red-700 ring-red-200', icon: 'fa-triangle-exclamation' },
  DA_GIAO: { label: 'Hoàn tất', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: 'fa-circle-check' },
  DA_HUY: { label: 'Đã hủy', cls: 'bg-gray-100 text-gray-600 ring-gray-200', icon: 'fa-ban' },
};
const PAY_STATUS = {
  CHO_CHON_PT: { label: 'Chờ chọn phương thức thanh toán', cls: 'text-amber-700' },
  CHO_THANH_TOAN: { label: 'Đang chờ cổng thanh toán xác nhận', cls: 'text-amber-700' },
  THAT_BAI: { label: 'Thanh toán thất bại – chưa thanh toán', cls: 'text-red-600' },
  CHUA_THANH_TOAN: { label: 'Chưa thanh toán (thu khi giao hàng)', cls: 'text-gray-700' },
  DA_THANH_TOAN: { label: 'Đã thanh toán', cls: 'text-emerald-700' },
  CHO_HOAN_TIEN: { label: 'Đang xử lý hoàn tiền', cls: 'text-blue-700' },
  DA_HOAN_TIEN: { label: 'Đã hoàn tiền', cls: 'text-emerald-700' },
  DA_HUY_GD: { label: 'Không phát sinh thanh toán', cls: 'text-gray-500' },
};

const UI = {
  _cb: {}, _n: 0,
  cb(fn) { const id = 'c' + (++this._n); this._cb[id] = fn; return `UI.run('${id}')`; },
  run(id, ...a) { const f = this._cb[id]; if (f) f(...a); },

  toast(msg, type = 'success', ms = 3200) {
    const icons = { success: 'fa-circle-check text-emerald-400', error: 'fa-circle-xmark text-red-400', info: 'fa-circle-info text-sky-300', warn: 'fa-triangle-exclamation text-amber-300' };
    const el = document.createElement('div');
    el.className = 'toast-in flex items-start gap-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl px-4 py-3 max-w-sm';
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} mt-0.5"></i><div class="leading-snug">${msg}</div>`;
    $('#toast-root').appendChild(el);
    setTimeout(() => { el.classList.add('opacity-0', 'translate-x-4'); setTimeout(() => el.remove(), 300); }, ms);
  },

  modal({ title, body, actions = [], size = 'max-w-lg', icon = '', onClose }) {
    this.closeModal();
    const btns = actions.map((a) => `<button type="button" onclick="${this.cb(a.onClick || (() => UI.closeModal()))}" class="${a.primary ? 'bg-black text-white hover:bg-gray-800' : a.danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white border border-gray-300 hover:bg-gray-50'} px-5 py-2.5 rounded-xl text-sm font-semibold transition">${a.label}</button>`).join('');
    this._onClose = onClose;
    $('#modal-root').innerHTML = `
      <div class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-black/50 fade-in" onclick="UI.closeModal()"></div>
        <div class="relative w-full ${size} bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl pop-in max-h-[92vh] flex flex-col">
          <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
            <h3 class="text-base font-bold flex items-center gap-2">${icon}${title}</h3>
            <button onclick="UI.closeModal()" class="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="px-6 py-5 overflow-y-auto text-sm text-gray-700" id="modal-body">${body}</div>
          ${btns ? `<div class="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-2">${btns}</div>` : ''}
        </div>
      </div>`;
  },
  closeModal() { $('#modal-root').innerHTML = ''; const f = this._onClose; this._onClose = null; if (f) f(); },

  confirm({ title, message, okLabel = 'Xác nhận', danger = false, icon = '' }) {
    return new Promise((res) => {
      let done = false;
      this.modal({
        title, icon, body: message, size: 'max-w-md',
        onClose: () => { if (!done) res(false); },
        actions: [
          { label: 'Không', onClick: () => { done = true; UI.closeModal(); res(false); } },
          { label: okLabel, primary: !danger, danger, onClick: () => { done = true; UI.closeModal(); res(true); } },
        ],
      });
    });
  },

  /* Nhãn Use Case – giúp chụp hình báo cáo (bật/tắt ở bảng Demo) */
  uc(code, boundary) {
    if (!DB.data.ui.showUC) return '';
    return `<span class="uc-tag inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 ring-1 ring-violet-200 rounded-full px-2.5 py-1"><i class="fa-solid fa-diagram-project"></i>${code}${boundary ? ` · ${boundary}` : ''}</span>`;
  },

  badgeOrder(st) { const s = ORDER_STATUS[st] || { label: st, cls: 'bg-gray-100', icon: 'fa-circle' }; return `<span class="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ring-1 ${s.cls}"><i class="fa-solid ${s.icon} text-[10px]"></i>${s.label}</span>`; },
  payStatus(st) { const s = PAY_STATUS[st] || { label: st, cls: '' }; return `<span class="font-semibold ${s.cls}">${s.label}</span>`; },

  stars(r) { const f = Math.round(r); return `<span class="text-amber-400 text-[11px] tracking-tight">${'★'.repeat(f)}<span class="text-gray-300">${'★'.repeat(5 - f)}</span></span>`; },

  price(p, big = false) {
    const u = Catalog.unitPrice(p);
    if (u !== p.price) return `<span class="${big ? 'text-2xl' : 'text-sm'} font-bold text-red-600">${fmt(u)}</span> <span class="${big ? 'text-base' : 'text-xs'} text-gray-400 line-through">${fmt(p.price)}</span>`;
    return `<span class="${big ? 'text-2xl' : 'text-sm'} font-bold">${fmt(p.price)}</span>`;
  },

  productCard(p) {
    const fav = YeuThichController.co(p.id);
    const out = Catalog.totalStock(p) === 0;
    const promo = Catalog.promoActive(p);
    return `
    <div class="group relative">
      <a href="#/san-pham/${p.id}" class="block">
        <div class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
          <img src="${Catalog.img(p, 0, 600, 750)}" alt="${esc(p.name)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'" class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105 ${p.images[1] ? 'group-hover:opacity-0' : ''} ${out ? 'grayscale-[40%]' : ''}">
          ${p.images[1] ? `<img src="${Catalog.img(p, 1, 600, 750)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-0 transition duration-500 group-hover:opacity-100">` : ''}
          <div class="absolute top-3 left-3 flex flex-col gap-1.5">
            ${promo ? `<span class="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">-${p.promo.percent}%</span>` : ''}
            ${p.isNew ? '<span class="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-md">MỚI</span>' : ''}
            ${out ? '<span class="bg-white/90 text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded-md">HẾT HÀNG</span>' : ''}
          </div>
        </div>
      </a>
      <button onclick="App.toggleFav('${p.id}', event)" title="Thêm vào mục yêu thích" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:scale-110 transition ${fav ? 'text-red-500' : 'text-gray-700'}"><i class="fa-${fav ? 'solid' : 'regular'} fa-heart"></i></button>
      <a href="#/san-pham/${p.id}" class="block pt-3">
        <div class="flex items-center gap-1 mb-1">${p.colors.map((c) => `<span class="w-3 h-3 rounded-full ring-1 ring-gray-300" style="background:${c.hex}" title="${esc(c.name)}"></span>`).join('')}<span class="ml-auto text-[11px] text-gray-400">${p.cat}</span></div>
        <h3 class="text-sm font-medium text-gray-900 line-clamp-1">${esc(p.name)}</h3>
        <div class="mt-1 flex items-baseline gap-1.5">${this.price(p)}</div>
        <div class="mt-1 flex items-center gap-1 text-[11px] text-gray-400">${this.stars(p.rating)} <span>(${p.reviews})</span> · Đã bán ${p.sold}</div>
      </a>
    </div>`;
  },

  empty({ icon, title, desc = '', action = '' }) {
    return `<div class="text-center py-16 px-6">
      <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400 mb-4"><i class="fa-solid ${icon}"></i></div>
      <h3 class="font-bold text-gray-900">${title}</h3>
      ${desc ? `<p class="text-sm text-gray-500 mt-1 max-w-md mx-auto">${desc}</p>` : ''}
      ${action ? `<div class="mt-5">${action}</div>` : ''}
    </div>`;
  },

  crumbs(items) {
    return `<nav class="text-xs text-gray-500 flex flex-wrap items-center gap-1.5">${items.map((it, i) => i < items.length - 1 ? `<a href="${it[1]}" class="hover:text-black">${it[0]}</a><i class="fa-solid fa-chevron-right text-[8px] text-gray-300"></i>` : `<span class="text-gray-900 font-medium">${it[0]}</span>`).join('')}</nav>`;
  },

  field({ id, label, type = 'text', value = '', placeholder = '', err = '', attrs = '', icon = '' }) {
    return `<div>
      <label for="${id}" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">${label}</label>
      <div class="relative">
        ${icon ? `<i class="fa-solid ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>` : ''}
        <input id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${attrs}
          class="w-full ${icon ? 'pl-10' : 'pl-3.5'} ${type === 'password' ? 'pr-10' : 'pr-3.5'} py-3 bg-gray-50 border ${err ? 'border-red-400 bg-red-50/40' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-black transition">
        ${type === 'password' ? `<button type="button" onclick="UI.togglePw('${id}', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" tabindex="-1"><i class="fa-regular fa-eye text-xs"></i></button>` : ''}
      </div>
      <p class="field-err text-xs text-red-600 mt-1 ${err ? '' : 'hidden'}" data-for="${id}">${err}</p>
    </div>`;
  },
  togglePw(id, btn) { const i = document.getElementById(id); i.type = i.type === 'password' ? 'text' : 'password'; btn.innerHTML = `<i class="fa-regular ${i.type === 'password' ? 'fa-eye' : 'fa-eye-slash'} text-xs"></i>`; },
  showErrors(fields = {}, scope = document) {
    $$('.field-err', scope).forEach((p) => { const m = fields[p.dataset.for]; p.textContent = m || ''; p.classList.toggle('hidden', !m); const inp = document.getElementById(p.dataset.for); if (inp) { inp.classList.toggle('border-red-400', !!m); inp.classList.toggle('border-gray-200', !m); } });
  },
  alert(type, html) {
    const s = { error: 'bg-red-50 text-red-700 border-red-200 fa-circle-exclamation', success: 'bg-emerald-50 text-emerald-700 border-emerald-200 fa-circle-check', info: 'bg-sky-50 text-sky-800 border-sky-200 fa-circle-info', warn: 'bg-amber-50 text-amber-800 border-amber-200 fa-triangle-exclamation' }[type].split(' ');
    const icon = s.pop();
    return `<div class="p-3.5 rounded-xl border text-sm flex gap-2.5 ${s.join(' ')}"><i class="fa-solid ${icon} mt-0.5 shrink-0"></i><div class="leading-relaxed">${html}</div></div>`;
  },
  pager(trang, soTrang, onPage) {
    if (soTrang <= 1) return '';
    const b = (n, lbl, dis, act) => `<button ${dis ? 'disabled' : ''} onclick="${onPage}(${n})" class="min-w-9 h-9 px-3 rounded-lg text-sm font-semibold ${act ? 'bg-black text-white' : 'bg-white border border-gray-200 hover:border-black'} disabled:opacity-40">${lbl}</button>`;
    let h = b(trang - 1, '<i class="fa-solid fa-chevron-left text-xs"></i>', trang === 1);
    for (let i = 1; i <= soTrang; i++) h += b(i, i, false, i === trang);
    return `<div class="flex justify-center gap-1.5 mt-10">${h + b(trang + 1, '<i class="fa-solid fa-chevron-right text-xs"></i>', trang === soTrang)}</div>`;
  },
};

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#f3f4f6"/><text x="200" y="260" text-anchor="middle" font-family="Inter,Arial" font-size="22" fill="#9ca3af">URBAN CHIC</text></svg>');

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Bà Rịa - Vũng Tàu', 'Long An', 'Thừa Thiên Huế', 'Nghệ An', 'Quảng Ninh'];

/* Mã QR giả lập (chỉ để minh họa cổng thanh toán) */
function fakeQR(seed, size = 25) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  let cells = '';
  const finder = (x, y) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!finder(x, y) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 ${size + 2} ${size + 2}" class="w-full h-full" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="#fff"/><g fill="#111">${cells}${f(0, 0)}${f(size - 7, 0)}${f(0, size - 7)}</g></svg>`;
}
