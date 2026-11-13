/* =====================================================================
 * TẦNG ĐIỀU KHIỂN & THỰC THỂ – đặt tên theo sơ đồ tuần tự (BTH6)
 *   Entity/CSDL : DB (localStorage) – KhachHang, SanPham, GioHang, YeuThich,
 *                 DonHang, KhuyenMai...
 *   Control     : TaiKhoanController, XacThucController, SanPhamController,
 *                 KhuyenMaiController, GioHangController, YeuThichController,
 *                 KhachHangController, DonHangController, VanChuyenController,
 *                 DatHangController, ThanhToanController
 *   Hệ thống ngoài (mô phỏng): DichVuEmail, DichVuGiaoHang, DonViVanChuyen,
 *                 CongMoMoVNPay (CongThanhToan)
 * ===================================================================== */

const clone = (o) => JSON.parse(JSON.stringify(o));
const nowISO = () => isoLocal(new Date());
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
const ok = (o = {}) => ({ ok: true, ...o });
const fail = (error, o = {}) => ({ ok: false, error, ...o });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PHONE_RE = /^0\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------ CSDL ------------------------------ */
const DB = {
  KEY: 'urbanchic_khachhang_v2',
  data: null,
  fresh() {
    const s = clone(SEED);
    const stock = {};
    SEED.products.forEach((p) => p.colors.forEach((c) => p.sizes.forEach((sz) => {
      const k = `${c.code}-${sz}`;
      stock[`SKU-${p.code}-${c.code}-${sz}`] = k in (p.stock || {}) ? p.stock[k] : p.defaultStock;
    })));
    return {
      version: 2, stock, customers: s.customers, vouchers: s.vouchers, orders: s.orders, returns: s.returns,
      carts: s.carts, wishlists: s.wishlists, outbox: s.outbox, resetTokens: s.resetTokens, transactions: [], pendingCallbacks: [],
      session: null, sim: { emailFail: false, payInitFail: false, shipFail: false, slowCallback: false },
      seq: { customer: 6, order: 1120, mail: 10, ret: 44, addr: 10, txn: 1000 },
      ui: { showUC: false, hideDemo: true },
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && d.version === 2) {
          // Luôn tắt hiển thị demo và nhãn use case để web hoàn toàn tự nhiên
          if (!d.ui) d.ui = { showUC: false, hideDemo: true };
          else { d.ui.showUC = false; d.ui.hideDemo = true; }
          this.data = d;
          return;
        }
      }
    } catch (e) { /* bỏ qua */ }
    this.reset();
  },
  reset() { const ui = this.data?.ui; this.data = this.fresh(); if (ui) this.data.ui = ui; this.save(); },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { /* bỏ qua */ } },
  next(k) { this.data.seq[k] += 1; return this.data.seq[k]; },
};

/* ----------------- KẾT NỐI ĐỒNG BỘ CSDL SQLITE (FASTAPI BACKEND) ----------------- */
const storeSyncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('urban_chic_sync_channel') : null;

const StoreAPI = {
  _resolvedBaseUrl: null,
  _resolvingPromise: null,
  _writeQueue: Promise.resolve(),

  notifyPeers() {
    try {
      if (storeSyncChannel) {
        storeSyncChannel.postMessage({ type: 'STORE_EVENT', t: Date.now() });
      }
    } catch (e) { /* bỏ qua */ }
  },

  getBaseUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('api')) {
      const apiParam = urlParams.get('api').replace(/\/+$/, '');
      localStorage.setItem('urban_chic_api_url', apiParam);
      return apiParam;
    }
    if (window.API_BASE_URL !== undefined) return window.API_BASE_URL;
    if (this._resolvedBaseUrl !== null) return this._resolvedBaseUrl;
    const h = window.location.hostname;
    const p = window.location.port;
    if (h === '127.0.0.1' || h === 'localhost') {
      if (p === '8000') return '';
      return 'http://127.0.0.1:8000';
    }
    if (window.location.pathname.startsWith('/khach-hang')) {
      return '';
    }
    const saved = localStorage.getItem('urban_chic_api_url');
    if (saved !== null) return saved;
    // Mặc định thử gọi ngay cùng domain hiện tại (vì FastAPI có thể chạy ngay trên domain này)
    return '';
  },

  async resolveBackendUrl() {
    if (this._resolvedBaseUrl !== null) return this._resolvedBaseUrl;
    if (this._resolvingPromise) return this._resolvingPromise;

    this._resolvingPromise = (async () => {
      const h = window.location.hostname;
      const p = window.location.port;
      if (h === '127.0.0.1' || h === 'localhost') {
        this._resolvedBaseUrl = p === '8000' ? '' : 'http://127.0.0.1:8000';
        return this._resolvedBaseUrl;
      }

      const candidates = [''];
      const saved = localStorage.getItem('urban_chic_api_url');
      if (saved && !candidates.includes(saved)) candidates.push(saved);
      if (h.includes('urban-chic-store')) {
        candidates.push(`https://${h.replace('urban-chic-store', 'urban-chic-admin')}`);
      }
      if (h.includes('store')) {
        candidates.push(`https://${h.replace('store', 'admin')}`);
      }
      candidates.push('https://urban-chic-store.onrender.com');
      candidates.push('https://urban-chic-admin.onrender.com');
      candidates.push('https://ooad-web-ui.onrender.com');

      for (const base of candidates) {
        try {
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 3500);
          const res = await fetch(`${base}/api/store/sync`, { method: 'GET', signal: ctrl.signal });
          clearTimeout(tid);
          if (res.ok) {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              this._resolvedBaseUrl = base;
              localStorage.setItem('urban_chic_api_url', base);
              return base;
            }
          }
        } catch (e) { /* thử ứng viên tiếp theo */ }
      }
      this._resolvedBaseUrl = '';
      return '';
    })();

    return this._resolvingPromise;
  },

  _enqueue(fn) {
    this._writeQueue = this._writeQueue.then(async () => {
      await fn();
      this.notifyPeers();
    }).catch((err) => {
      console.warn('StoreAPI queue error:', err.message);
    });
    return this._writeQueue;
  },

  async syncWithBackend() {
    try {
      await this._writeQueue;
      const base = await this.resolveBackendUrl();
      const res = await fetch(`${base}/api/store/sync`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      let changed = false;

      // 0. Đồng bộ Chính sách hệ thống (CHINH_SACH_HE_THONG) từ Admin
      if (data.policy) {
        const pol = data.policy;
        if (pol.SoNgayDoiTraToiDa && SEED.policy.soNgayDoiTra !== pol.SoNgayDoiTraToiDa) {
          SEED.policy.soNgayDoiTra = pol.SoNgayDoiTraToiDa;
          changed = true;
        }
        if (pol.PhiShipMacDinh != null && SEED.policy.phiShipNoiThanh !== pol.PhiShipMacDinh) {
          SEED.policy.phiShipNoiThanh = pol.PhiShipMacDinh;
          changed = true;
        }
        if (pol.MocFreeship != null && SEED.policy.mocFreeship !== pol.MocFreeship) {
          SEED.policy.mocFreeship = pol.MocFreeship;
          changed = true;
        }
      }

      // 1. Đồng bộ số lượng tồn khả dụng thực tế từ kho SQLite
      if (data.stock && Object.keys(data.stock).length) {
        Object.entries(data.stock).forEach(([sku, qty]) => {
          if (DB.data.stock[sku] !== qty) {
            DB.data.stock[sku] = qty;
            changed = true;
          }
        });
      }

      // 1b. Đồng bộ thông tin SKU & Giá bán từ Phân hệ Thủ kho (BIEN_THE_SKU)
      if (data.skus && data.skus.length && typeof Catalog !== 'undefined') {
        data.skus.forEach((bs) => {
          if (bs.TrangThaiSKU === 'TAM_AN') {
            if (DB.data.stock[bs.MaSKU] !== 0) {
              DB.data.stock[bs.MaSKU] = 0;
              changed = true;
            }
          }
          const existingInfo = Catalog.skuIndex[bs.MaSKU];
          if (existingInfo && existingInfo.p && bs.GiaBanSKU > 0) {
            if (existingInfo.p.id === bs.MaSanPham && existingInfo.p.price !== bs.GiaBanSKU) {
              existingInfo.p.price = bs.GiaBanSKU;
              changed = true;
            }
          } else if (!existingInfo) {
            const p = Catalog.get(bs.MaSanPham) || SEED.products[0];
            Catalog.skuIndex[bs.MaSKU] = {
              p: { ...p, id: bs.MaSanPham || p.id, name: bs.TenSanPham || p.name, price: bs.GiaBanSKU || p.price },
              color: { name: bs.MauSac || 'Tiêu chuẩn', code: (bs.MauSac || 'STD').slice(0, 3).toUpperCase(), hex: '#111827' },
              size: bs.KichCo || 'M',
            };
          }
        });
      }

      // 1c. Đồng bộ chương trình khuyến mãi (Voucher) từ Phân hệ Admin
      if (data.vouchers && data.vouchers.length) {
        data.vouchers.forEach((bv) => {
          let lv = DB.data.vouchers.find((v) => v.code === bv.CodeVoucher || v.id === bv.MaKhuyenMai);
          const title = bv.LoaiGiam === 'PHAN_TRAM'
            ? `Giảm ${bv.GiaTriGiam}% cho đơn từ ${Number(bv.DonToiThieu || 0).toLocaleString('vi-VN')}₫`
            : `Giảm ${Number(bv.GiaTriGiam || 0).toLocaleString('vi-VN')}₫ cho đơn từ ${Number(bv.DonToiThieu || 0).toLocaleString('vi-VN')}₫`;
          if (!lv) {
            DB.data.vouchers.unshift({
              id: bv.MaKhuyenMai,
              code: bv.CodeVoucher,
              type: bv.LoaiGiam,
              value: bv.GiaTriGiam,
              max: bv.LoaiGiam === 'PHAN_TRAM' ? 100000 : null,
              min: bv.DonToiThieu || 0,
              limit: bv.SoLuotToiDa || 100,
              used: bv.SoLuotDaDung || 0,
              start: bv.NgayBatDau || '2026-01-01',
              end: bv.NgayKetThuc || '2027-12-31',
              status: bv.TrangThaiKM || 'DANG_HOAT_DONG',
              cats: null,
              title,
            });
            changed = true;
          } else {
            if (
              lv.status !== bv.TrangThaiKM ||
              lv.value !== bv.GiaTriGiam ||
              lv.min !== bv.DonToiThieu ||
              lv.limit !== bv.SoLuotToiDa ||
              lv.used !== bv.SoLuotDaDung ||
              lv.end !== bv.NgayKetThuc
            ) {
              lv.status = bv.TrangThaiKM;
              lv.type = bv.LoaiGiam;
              lv.value = bv.GiaTriGiam;
              lv.min = bv.DonToiThieu;
              lv.limit = bv.SoLuotToiDa;
              lv.used = bv.SoLuotDaDung;
              lv.start = bv.NgayBatDau;
              lv.end = bv.NgayKetThuc;
              lv.title = title;
              changed = true;
            }
          }
        });
      }

      // 2. Đồng bộ trạng thái đơn hàng (Được nhân viên vận hành duyệt, đóng gói, giao, hủy...)
      if (data.orders && data.orders.length) {
        data.orders.forEach((bo) => {
          let lo = DB.data.orders.find((o) => o.id === bo.MaDonHang);
          const normPayMethod = !bo.PhuongThucTT || bo.PhuongThucTT === 'CHO_CHON_PT'
            ? null
            : bo.PhuongThucTT.toUpperCase();
          const normPayStatus = bo.TrangThaiTT || 'CHUA_THANH_TOAN';
          const normStatus = bo.TrangThaiDon === 'DOI_TRA' ? 'DA_GIAO' : bo.TrangThaiDon;
          const histArr = (bo.LichSuHanhTrinh || '')
            .split(' | ')
            .filter(Boolean)
            .map((s) => ({ t: (bo.NgayDat || nowISO()).replace(' ', 'T'), s }));
          const trkEvents = histArr.map((h) => ({
            t: h.t,
            loc: bo.DonViVanChuyen || 'Kho Trung Tâm Urban Chic – TP.HCM',
            s: h.s,
          }));

          if (!lo) {
            lo = {
              id: bo.MaDonHang,
              customerId: bo.MaKhachHang,
              date: (bo.NgayDat || nowISO()).replace(' ', 'T'),
              items: (bo.items || []).map((it) => ({
                sku: it.MaSKU,
                qty: it.SoLuongMua,
                price: it.DonGiaBan,
                name: it.TenSanPham,
              })),
              receiver: {
                name: bo.TenKhachHang,
                phone: bo.SoDienThoai,
                address: bo.DiaChiGiao,
              },
              subtotal: bo.TongTienHang,
              shipFee: bo.PhiVanChuyen,
              discount: bo.TienGiamGia,
              voucher: bo.CodeVoucher || bo.MaKhuyenMai || null,
              total: bo.TongThanhToan,
              payMethod: normPayMethod,
              payStatus: normPayStatus,
              status: normStatus,
              cancelReason: bo.LyDoHuy || null,
              deliveredAt: normStatus === 'DA_GIAO' ? (bo.NgayDat || nowISO()).replace(' ', 'T') : null,
              invoice: normStatus === 'DA_GIAO' ? { no: 'HD-' + bo.MaDonHang.slice(-7), date: (bo.NgayDat || nowISO()).replace(' ', 'T') } : null,
              trackingCode: bo.MaVanDon,
              carrier: bo.DonViVanChuyen || 'Giao Hàng Nhanh (GHN)',
              history: histArr.length ? histArr : [{ t: nowISO(), s: 'Đặt hàng thành công' }],
              tracking: trkEvents,
            };
            DB.data.orders.unshift(lo);
            changed = true;
          } else {
            // Không ghi đè trạng thái chờ chọn phương thức thanh toán khi khách đang ở bước thanh toán
            const keepLocalCheckoutState = (lo.payStatus === 'CHO_CHON_PT' || lo.payStatus === 'CHO_THANH_TOAN') && (!bo.TrangThaiTT || bo.TrangThaiTT === 'CHO_CHON_PT');
            const newPayStatus = keepLocalCheckoutState ? lo.payStatus : normPayStatus;
            const newPayMethod = keepLocalCheckoutState ? lo.payMethod : (normPayMethod || lo.payMethod);

            if (
              lo.status !== normStatus ||
              lo.payStatus !== newPayStatus ||
              lo.trackingCode !== bo.MaVanDon ||
              (histArr.length && lo.history.length !== histArr.length)
            ) {
              lo.status = normStatus;
              lo.payStatus = newPayStatus;
              lo.payMethod = newPayMethod;
              if (bo.LyDoHuy) lo.cancelReason = bo.LyDoHuy;
              if (bo.MaVanDon) lo.trackingCode = bo.MaVanDon;
              if (bo.DonViVanChuyen) lo.carrier = bo.DonViVanChuyen;
              if (normStatus === 'DA_GIAO' && !lo.deliveredAt) {
                lo.deliveredAt = nowISO();
                lo.invoice = lo.invoice || { no: 'HD-' + bo.MaDonHang.slice(-7), date: nowISO() };
              }
              if (histArr.length) {
                lo.history = histArr;
                lo.tracking = trkEvents;
              }
              changed = true;
            }
          }
        });
      }

      // 3. Đồng bộ yêu cầu đổi trả từ SQLite
      if (data.returns && data.returns.length) {
        data.returns.forEach((br) => {
          let lr = DB.data.returns.find((r) => r.id === br.MaYeuCau);
          if (!lr) {
            lr = {
              id: br.MaYeuCau,
              orderId: br.MaDonHang,
              t: (br.NgayGuiYeuCau || nowISO()).replace(' ', 'T'),
              items: [],
              reason: br.LyDoDoiTra,
              detail: br.GhiChuXuLy || '',
              option: br.PhuongAnXuLy || 'Đổi sản phẩm mới',
              images: br.HinhAnhMinhChung ? [br.HinhAnhMinhChung] : [],
              status: br.TrangThaiYC,
            };
            DB.data.returns.push(lr);
            changed = true;
          } else if (lr.status !== br.TrangThaiYC || (br.PhuongAnXuLy && lr.option !== br.PhuongAnXuLy)) {
            lr.status = br.TrangThaiYC;
            if (br.PhuongAnXuLy) lr.option = br.PhuongAnXuLy;
            if (br.GhiChuXuLy) lr.detail = br.GhiChuXuLy;
            changed = true;
          }
        });
      }

      // 4. Đồng bộ Blacklist / Mở khóa tài khoản từ SQLite (BLACKLIST <-> KHOA)
      if (data.customers && Object.keys(data.customers).length) {
        DB.data.customers.forEach((c) => {
          const dbSt = data.customers[c.id];
          if (dbSt) {
            const mapped = dbSt === 'BLACKLIST' || dbSt === 'KHOA' ? 'KHOA' : 'HOAT_DONG';
            if (c.status !== mapped) {
              c.status = mapped;
              changed = true;
            }
          }
        });
      }

      // 5. Đồng bộ ngược đơn hàng vừa tạo ở local nếu chưa có trên SQLite
      if (data.orders) {
        const backendOrderIds = new Set(data.orders.map((bo) => bo.MaDonHang));
        const missingLocalOrders = DB.data.orders.filter(
          (lo) => !backendOrderIds.has(lo.id) && Number(lo.id.replace(/\D/g, '')) >= 20261121
        );
        for (const mo of missingLocalOrders) {
          await this._sendOrderToBackend(mo);
        }
      }

      if (changed) {
        DB.save();
        if (window.App && typeof App.render === 'function') {
          const activeEl = document.activeElement;
          const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
          const modalOpen = document.getElementById('modal-root') && document.getElementById('modal-root').innerHTML.trim() !== '';
          if (!isTyping && !modalOpen) {
            App.render();
          }
        }
      }
    } catch (err) {
      console.warn('StoreAPI syncWithBackend skipped:', err.message);
    }
  },

  async _sendOrderToBackend(o) {
    const base = await this.resolveBackendUrl();
    const payload = {
      order_id: o.id,
      customer_id: o.customerId,
      customer_name: o.receiver.name,
      phone: o.receiver.phone,
      address: o.receiver.address,
      items: o.items.map((it) => {
        const info = typeof Catalog !== 'undefined' ? Catalog.info(it.sku) : null;
        return {
          sku: it.sku,
          name: info?.p?.name ? `${info.p.name} (${info.color.name}/${info.size})` : (it.name || it.sku),
          qty: it.qty,
          price: it.price,
        };
      }),
      subtotal: o.subtotal,
      ship_fee: o.shipFee || 0,
      discount: o.discount || 0,
      voucher_code: o.voucher || null,
      total: o.total,
      pay_method: o.payMethod || 'CHO_CHON_PT',
      pay_status: o.payStatus || 'CHO_CHON_PT',
      note: o.note || '',
    };
    await fetch(`${base}/api/store/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  createOrder(o) {
    return this._enqueue(async () => {
      await this._sendOrderToBackend(o);
    });
  },

  cancelOrder(orderId, reason) {
    return this._enqueue(async () => {
      const base = await this.resolveBackendUrl();
      await fetch(`${base}/api/store/order/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    });
  },

  updatePayment(orderId, payMethod, payStatus, txnId) {
    return this._enqueue(async () => {
      const base = await this.resolveBackendUrl();
      const res = await fetch(`${base}/api/store/order/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pay_method: payMethod,
          pay_status: payStatus,
          txn_id: txnId || null,
        }),
      });
      // Nếu đơn chưa kịp tạo trên backend thì tạo đơn rồi cập nhật lại thanh toán
      if (res.status === 404) {
        const lo = DB.data.orders.find((x) => x.id === orderId);
        if (lo) {
          await this._sendOrderToBackend(lo);
          await fetch(`${base}/api/store/order/${orderId}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pay_method: payMethod,
              pay_status: payStatus,
              txn_id: txnId || null,
            }),
          });
        }
      }
    });
  },

  createReturn(yc) {
    return this._enqueue(async () => {
      const base = await this.resolveBackendUrl();
      const payload = {
        return_id: yc.id,
        order_id: yc.orderId,
        customer_name: (Session.user()?.name || Session.user()?.username || 'Khách hàng'),
        reason: yc.reason,
        detail: yc.detail || '',
        option: yc.option || '',
        image_url: yc.images?.[0] || '',
      };
      await fetch(`${base}/api/store/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  },

  registerCustomer(kh) {
    return this._enqueue(async () => {
      const base = await this.resolveBackendUrl();
      const payload = {
        customer_id: kh.id,
        username: kh.username,
        email: kh.email,
        password: kh.password,
        phone: kh.phone || '',
        name: kh.name || '',
        address: kh.addresses?.[0]?.line || '',
      };
      await fetch(`${base}/api/store/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  },

  updateCustomer(kh) {
    return this._enqueue(async () => {
      const base = await this.resolveBackendUrl();
      const defAddr = kh.addresses?.find((a) => a.isDefault) || kh.addresses?.[0];
      const fullAddr = defAddr ? `${defAddr.line}, ${defAddr.ward}, ${defAddr.district}, ${defAddr.city}` : '';
      const payload = {
        customer_id: kh.id,
        name: kh.name || kh.username,
        email: kh.email || '',
        phone: kh.phone || defAddr?.phone || '',
        address: fullAddr,
      };
      await fetch(`${base}/api/store/customer/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  },
};


/* --------------------------- Danh mục SP --------------------------- */
const Catalog = {
  byId: {}, skuIndex: {},
  init() {
    SEED.products.forEach((p) => {
      this.byId[p.id] = p;
      p.colors.forEach((c) => p.sizes.forEach((sz) => { this.skuIndex[this.sku(p, c.code, sz)] = { p, color: c, size: sz }; }));
    });
  },
  all() { return SEED.products; },
  get(id) { return this.byId[id] || null; },
  sku(p, colorCode, size) { return `SKU-${p.code}-${colorCode}-${size}`; },
  info(sku) {
    if (this.skuIndex[sku]) return this.skuIndex[sku];
    // Fallback an toàn cho các SKU đồng bộ từ CSDL SQLite (vd: SKU-QJ02-XANH-32 hoặc SKU mới do Thủ kho tạo)
    const parts = String(sku || '').split('-');
    const code = parts[1] || '';
    const colorCode = parts[2] || 'STD';
    const size = parts.slice(3).join('-') || 'M';
    const matchedProd = SEED.products.find((p) => p.code === code) || SEED.products[0];
    const matchedColor = matchedProd.colors.find((c) => c.code === colorCode) || { name: colorCode, code: colorCode, hex: '#111827' };
    const fallback = { p: matchedProd, color: matchedColor, size };
    this.skuIndex[sku] = fallback;
    return fallback;
  },
  stock(sku) { return DB.data.stock[sku] ?? 0; },
  totalStock(p) { let t = 0; p.colors.forEach((c) => p.sizes.forEach((sz) => { t += this.stock(this.sku(p, c.code, sz)); })); return t; },
  promoActive(p) {
    if (!p.promo) return false;
    const d = nowISO().slice(0, 10);
    return d >= p.promo.start && d <= p.promo.end;
  },
  unitPrice(p) { return this.promoActive(p) ? Math.round(p.price * (100 - p.promo.percent) / 100) : p.price; },
  img(p, i = 0, w, h) { return IMG(p.images[i % p.images.length], w, h); },
  allColors() {
    const m = new Map();
    SEED.products.forEach((p) => p.colors.forEach((c) => { if (!m.has(c.name)) m.set(c.name, c.hex); }));
    return [...m.entries()].map(([name, hex]) => ({ name, hex }));
  },
};

/* ===================== HỆ THỐNG NGOÀI (mô phỏng) ===================== */
const DichVuEmail = {
  gui(to, subject, body, extra = {}) {
    if (DB.data.sim.emailFail) return fail('Email Service API tạm thời không phản hồi.');
    const m = { id: 'M' + DB.next('mail'), to, t: nowISO(), subject, body, ...extra };
    DB.data.outbox.unshift(m); DB.save();
    return ok({ mail: m });
  },
  guiEmailXacNhanDangKy(kh) {
    return this.gui(kh.email, 'Đăng ký tài khoản Urban Chic® thành công', `Xin chào ${kh.username}, tài khoản của bạn đã được tạo thành công. Nhập mã NEWMEM10 để được giảm 10% cho đơn từ 300K.`, { type: 'WELCOME' });
  },
  guiLienKetKhoiPhuc(kh, token) {
    return this.gui(kh.email, 'Yêu cầu đặt lại mật khẩu', `Xin chào ${kh.name || kh.username}, nhấn vào liên kết bên dưới để đặt lại mật khẩu. Liên kết có hiệu lực trong ${SEED.policy.hanLinkKhoiPhucPhut} phút và chỉ dùng một lần.`, { type: 'RESET', token });
  },
};

const DichVuGiaoHang = {
  /* tinhPhiVanChuyen(diaChi, gioHang) */
  tinhPhiVanChuyen(city, tamTinh) {
    const P = SEED.policy;
    if (tamTinh >= P.mocFreeship) return { fee: 0, note: `Miễn phí cho đơn từ ${fmt(P.mocFreeship)}` };
    const noiThanh = norm(city).includes('ho chi minh');
    return { fee: noiThanh ? P.phiShipNoiThanh : P.phiShipTinh, note: noiThanh ? 'Nội thành TP.HCM (GHN)' : 'Liên tỉnh (GHN)' };
  },
};

const DonViVanChuyen = {
  async traCuuHanhTrinh(maVanDon, order) {
    await sleep(900);
    if (DB.data.sim.shipFail) return fail('API Đơn vị vận chuyển không phản hồi (timeout).');
    return ok({ events: clone(order.tracking), carrier: order.carrier });
  },
};

const sign = (s) => { let h = 2166136261; for (const ch of s + '|URBANCHIC_SECRET') { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };

const CongMoMoVNPay = {
  /* taoGiaoDich(maThamChieu, maDon, soTien) */
  taoGiaoDich(ref, maDon, soTien, cong) {
    if (DB.data.sim.payInitFail) return fail(`Không tạo được giao dịch tại cổng ${cong === 'MOMO' ? 'MoMo' : 'VNPay'} (lỗi kết nối API Cổng thanh toán).`);
    const gd = (cong === 'MOMO' ? 'MM' : 'VNP') + Date.now().toString().slice(-8);
    return ok({ maGD: gd, link: `#/cong-thanh-toan/${ref}` });
  },
  /* Cổng gửi thông báo kết quả (callback/IPN) độc lập với trang kết quả */
  guiThongBao(txn, trangThai, { fake = false, delayMs = 0 } = {}) {
    const payload = { maThamChieu: txn.ref, maGD: txn.maGD, trangThai, soTien: txn.amount };
    payload.chuKy = fake ? 'deadbeef' : sign(`${payload.maThamChieu}|${payload.maGD}|${trangThai}|${payload.soTien}`);
    if (delayMs) { DB.data.pendingCallbacks.push({ payload, due: Date.now() + delayMs }); DB.save(); return; }
    return ThanhToanController.thongBaoKetQua(payload);
  },
  yeuCauHoanTien(maGD, soTien) { return ok({ maHoanTien: 'RF' + Date.now().toString().slice(-7), maGD, soTien }); },
};

/* =========================== CONTROLLERS =========================== */
const Session = {
  user() { const id = DB.data.session?.customerId; return id ? DB.data.customers.find((c) => c.id === id) || null : null; },
  cartKey() { return DB.data.session?.customerId || 'GUEST'; },
};

/* UC01 */
const TaiKhoanController = {
  kiemTraDuLieu(t) {
    const e = {};
    if (!/^[a-z0-9_.]{4,20}$/.test(t.username || '')) e.username = 'Tên đăng nhập 4–20 ký tự, chỉ gồm chữ thường không dấu, số, dấu chấm hoặc gạch dưới.';
    if (!EMAIL_RE.test(t.email || '')) e.email = 'Địa chỉ email không đúng định dạng.';
    if (!(t.password || '').match(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)) e.password = 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số.';
    if (t.password !== t.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.';
    if (!t.agree) e.agree = 'Bạn cần đồng ý với Điều khoản sử dụng.';
    return e;
  },
  dangKy(t) {
    t.username = (t.username || '').trim().toLowerCase(); t.email = (t.email || '').trim().toLowerCase();
    const e = this.kiemTraDuLieu(t);
    if (Object.keys(e).length) return fail('Dữ liệu không hợp lệ, vui lòng kiểm tra lại.', { code: 'LOI_DU_LIEU', fields: e });
    const cs = DB.data.customers;
    const dup = {};
    if (cs.some((c) => c.username === t.username)) dup.username = 'Tên đăng nhập đã được sử dụng.';
    if (cs.some((c) => c.email.toLowerCase() === t.email)) dup.email = 'Email đã được sử dụng cho tài khoản khác.';
    if (Object.keys(dup).length) return fail('Tên đăng nhập hoặc email đã tồn tại. Vui lòng nhập lại.', { code: 'DA_TON_TAI', fields: dup });
    const kh = { id: 'KH' + String(DB.next('customer')).padStart(3, '0'), username: t.username, name: '', email: t.email, phone: '', password: t.password, status: 'HOAT_DONG', gender: '', dob: '', joined: nowISO().slice(0, 10), addresses: [] };
    cs.push(kh); DB.save();
    StoreAPI.registerCustomer(kh);
    const mail = DichVuEmail.guiEmailXacNhanDangKy(kh);
    return ok({ maKhachHang: kh.id, emailSent: mail.ok, kh });
  },
};

/* UC02, UC03 */
const XacThucController = {
  dangNhap(ten, matKhau) {
    const k = (ten || '').trim().toLowerCase();
    if (!k || !matKhau) return fail('Vui lòng nhập tên đăng nhập/email và mật khẩu.', { code: 'THIEU' });
    const kh = DB.data.customers.find((c) => c.username === k || c.email.toLowerCase() === k);
    if (!kh || kh.password !== matKhau) return fail('Tên đăng nhập hoặc mật khẩu không chính xác.', { code: 'SAI' });
    if (kh.status === 'KHOA') return fail('Tài khoản của bạn đang bị khóa. Vui lòng liên hệ CSKH 1900 6868 để được hỗ trợ.', { code: 'KHOA' });
    DB.data.session = { customerId: kh.id, created: nowISO() };
    // gộp giỏ của khách vãng lai vào giỏ thành viên
    const guest = DB.data.carts.GUEST || [];
    if (guest.length) {
      const cart = (DB.data.carts[kh.id] ||= []);
      guest.forEach((g) => {
        const ex = cart.find((x) => x.sku === g.sku);
        const max = Catalog.stock(g.sku);
        if (ex) ex.qty = Math.min(max, ex.qty + g.qty); else cart.push({ ...g, qty: Math.min(max, g.qty) });
      });
      delete DB.data.carts.GUEST;
    }
    DB.save();
    return ok({ kh, merged: guest.length });
  },
  dangXuat() { DB.data.session = null; DB.save(); },
  yeuCauKhoiPhuc(email) {
    email = (email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail('Email không đúng định dạng, vui lòng sửa lại.', { code: 'LOI_DINH_DANG' });
    const kh = DB.data.customers.find((c) => c.email.toLowerCase() === email && c.status === 'HOAT_DONG');
    if (kh) {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const exp = new Date(Date.now() + SEED.policy.hanLinkKhoiPhucPhut * 60e3);
      DB.data.resetTokens.push({ token, customerId: kh.id, expires: isoLocal(exp), used: false });
      DB.save();
      const r = DichVuEmail.guiLienKetKhoiPhuc(kh, token);
      if (!r.ok) return fail('Hệ thống chưa thể gửi email lúc này (Email Service API gặp sự cố). Vui lòng gửi lại sau ít phút.', { code: 'LOI_EMAIL' });
    }
    // Không tiết lộ email có tài khoản hay không (ghi chú Activity UC03)
    return ok({ message: 'Yêu cầu đã được tiếp nhận. Nếu email hợp lệ, hãy kiểm tra hộp thư để nhận liên kết đặt lại mật khẩu.' });
  },
  kiemTraToken(token) {
    const t = DB.data.resetTokens.find((x) => x.token === token);
    if (!t) return fail('Liên kết khôi phục không hợp lệ.', { code: 'SAI' });
    if (t.used) return fail('Liên kết khôi phục đã được sử dụng.', { code: 'DA_DUNG' });
    if (new Date(t.expires) < new Date()) return fail('Liên kết khôi phục đã hết hiệu lực.', { code: 'HET_HAN' });
    return ok({ t });
  },
  datLaiMatKhau(token, mk, xn) {
    const v = this.kiemTraToken(token);
    if (!v.ok) return v;
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(mk || '')) return fail('Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số.', { code: 'MK' });
    if (mk !== xn) return fail('Mật khẩu xác nhận không khớp.', { code: 'MK' });
    const kh = DB.data.customers.find((c) => c.id === v.t.customerId);
    kh.password = mk; v.t.used = true; DB.save();
    return ok();
  },
};

/* UC04, UC05, UC06 */
const SanPhamController = {
  kiemTraBoLoc(b) {
    const min = b.min === '' || b.min == null ? null : Number(b.min);
    const max = b.max === '' || b.max == null ? null : Number(b.max);
    if ((min != null && (isNaN(min) || min < 0)) || (max != null && (isNaN(max) || max < 0))) return fail('Khoảng giá phải là số không âm.');
    if (min != null && max != null && min > max) return fail('Giá tối thiểu không được lớn hơn giá tối đa.');
    return ok({ min, max });
  },
  timKiem(q = {}) {
    const tk = norm(q.q);
    let ds = Catalog.all().filter((p) => (!q.cat || p.cat === q.cat) && (!tk || norm(p.name + ' ' + p.cat).includes(tk) || tk.split(/\s+/).every((w) => norm(p.name + ' ' + p.cat).includes(w))));
    const tongTruocLoc = ds.length;
    const colors = q.colors ? q.colors.split(',') : [];
    const sizes = q.sizes ? q.sizes.split(',') : [];
    const kt = this.kiemTraBoLoc(q);
    let loiLoc = null;
    if (!kt.ok) loiLoc = kt.error;
    else {
      const { min, max } = kt;
      ds = ds.filter((p) => {
        const gia = Catalog.unitPrice(p);
        if (min != null && gia < min) return false;
        if (max != null && gia > max) return false;
        if (q.sale === '1' && !Catalog.promoActive(p)) return false;
        if (colors.length || sizes.length || q.instock === '1') {
          // đối chiếu theo biến thể SKU (màu × size)
          return p.colors.some((c) => (!colors.length || colors.includes(c.name)) && p.sizes.some((sz) => (!sizes.length || sizes.includes(sz)) && (q.instock !== '1' || Catalog.stock(Catalog.sku(p, c.code, sz)) > 0)));
        }
        return true;
      });
    }
    const sorters = {
      moi: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id.localeCompare(a.id),
      ban_chay: (a, b) => b.sold - a.sold,
      gia_tang: (a, b) => Catalog.unitPrice(a) - Catalog.unitPrice(b),
      gia_giam: (a, b) => Catalog.unitPrice(b) - Catalog.unitPrice(a),
    };
    ds = [...ds].sort(sorters[q.sort] || sorters.moi);
    const per = 8; const tongSo = ds.length; const soTrang = Math.max(1, Math.ceil(tongSo / per));
    const trang = Math.min(soTrang, Math.max(1, parseInt(q.page || '1', 10)));
    return { danhSach: ds.slice((trang - 1) * per, trang * per), tongSo, trang, soTrang, tongTruocLoc, loiLoc };
  },
  goiY(q) { const tk = norm(q); if (!tk) return []; return Catalog.all().filter((p) => norm(p.name + ' ' + p.cat).includes(tk)).slice(0, 5); },
  xemChiTiet(maSP) { const p = Catalog.get(maSP); return p ? ok({ p }) : fail('Sản phẩm không tồn tại hoặc đã ngừng bán.'); },
};

/* UC07 + kiểm tra Voucher */
const KhuyenMaiController = {
  trangThai(v) {
    const d = nowISO().slice(0, 10);
    if (v.status !== 'DANG_HOAT_DONG') return 'Đã bị vô hiệu hóa';
    if (d < v.start) return 'Chưa đến thời gian áp dụng';
    if (d > v.end) return 'Đã hết hạn sử dụng';
    if (v.used >= v.limit) return 'Đã hết lượt sử dụng';
    return null;
  },
  xemKhuyenMai(maSP) {
    const p = Catalog.get(maSP);
    const chuongTrinh = p && Catalog.promoActive(p) ? [p.promo] : [];
    const vs = DB.data.vouchers.filter((v) => !v.cats || (p && v.cats.includes(p.cat)));
    return { chuongTrinh, hieuLuc: vs.filter((v) => !this.trangThai(v)), hetHieuLuc: vs.filter((v) => this.trangThai(v)).map((v) => ({ ...v, lyDo: this.trangThai(v) })) };
  },
  kiemTraVoucher(code, lines, tamTinh, phiShip) {
    code = (code || '').trim().toUpperCase();
    const v = DB.data.vouchers.find((x) => x.code === code);
    if (!v) return fail(`Mã "${code}" không tồn tại.`);
    const st = this.trangThai(v);
    if (st) return fail(`Mã ${code} không còn hiệu lực: ${st.toLowerCase()}.`);
    const base = v.cats ? lines.filter((l) => v.cats.includes(l.p.cat)).reduce((s, l) => s + l.lineTotal, 0) : tamTinh;
    if (v.cats && base === 0) return fail(`Mã ${code} chỉ áp dụng cho nhóm ${v.cats.join(', ')}.`);
    if (base < v.min) return fail(`Mã ${code} yêu cầu giá trị ${v.cats ? 'sản phẩm áp dụng' : 'đơn hàng'} tối thiểu ${fmt(v.min)}.`);
    let giam = 0; let giamShip = 0;
    if (v.type === 'SO_TIEN') giam = Math.min(v.value, base);
    else if (v.type === 'PHAN_TRAM') giam = Math.min(Math.round(base * v.value / 100), v.max || Infinity);
    else if (v.type === 'FREESHIP') { if (!phiShip) return fail('Đơn hàng đã được miễn phí vận chuyển, không cần dùng mã FREESHIP.'); giamShip = Math.min(v.value, phiShip); }
    return ok({ v, giam, giamShip });
  },
  moTa(v) {
    if (v.type === 'SO_TIEN') return `Giảm ${fmt(v.value)}`;
    if (v.type === 'PHAN_TRAM') return `Giảm ${v.value}%${v.max ? ` (tối đa ${fmt(v.max)})` : ''}`;
    return `Miễn phí vận chuyển (tối đa ${fmt(v.value)})`;
  },
};

/* UC08, UC09 */
const GioHangController = {
  gio() { return (DB.data.carts[Session.cartKey()] ||= []); },
  soLuong() { return this.gio().reduce((s, x) => s + x.qty, 0); },
  xemGioHang() {
    const lines = this.gio().map((x) => {
      const i = Catalog.info(x.sku); if (!i) return null;
      const price = Catalog.unitPrice(i.p); const stock = Catalog.stock(x.sku);
      return { ...x, p: i.p, color: i.color, size: i.size, price, stock, lineTotal: price * x.qty, warn: stock === 0 ? 'Biến thể này đã hết hàng' : x.qty > stock ? `Chỉ còn ${stock} sản phẩm` : null };
    }).filter(Boolean);
    return { lines, tamTinh: lines.reduce((s, l) => s + l.lineTotal, 0), soLuong: lines.reduce((s, l) => s + l.qty, 0) };
  },
  themVaoGio(maSKU, soLuong) {
    if (!maSKU) return fail('Vui lòng chọn đầy đủ màu sắc và kích cỡ (size).', { code: 'LOI_DU_LIEU' });
    if (!Number.isInteger(soLuong) || soLuong < 1) return fail('Số lượng phải là số nguyên dương.', { code: 'LOI_DU_LIEU' });
    const i = Catalog.info(maSKU); if (!i) return fail('Biến thể không tồn tại.');
    const gio = this.gio(); const ex = gio.find((x) => x.sku === maSKU); const daCo = ex ? ex.qty : 0;
    const ton = Catalog.stock(maSKU);
    if (ton <= 0) return fail('Biến thể đã hết hàng, không thể đặt mua.', { code: 'KHONG_THE_THEM', kd: 0 });
    if (daCo + soLuong > ton) return fail(`Số lượng vượt tồn kho khả dụng. Bạn chỉ có thể thêm tối đa ${Math.max(0, ton - daCo)} sản phẩm${daCo ? ` (giỏ đã có ${daCo})` : ''}.`, { code: 'KHONG_THE_THEM', kd: Math.max(0, ton - daCo) });
    if (ex) ex.qty += soLuong; else gio.unshift({ sku: maSKU, qty: soLuong });
    DB.save();
    return ok({ gop: !!ex, i });
  },
  suaGio(thaoTac, maDong, duLieu = {}) {
    const gio = this.gio(); const idx = gio.findIndex((x) => x.sku === maDong);
    if (idx < 0) return fail('Dòng hàng không còn trong giỏ.');
    if (thaoTac === 'XOA') { const i = Catalog.info(maDong); gio.splice(idx, 1); DB.save(); return ok({ msg: `Đã xóa "${i.p.name}" khỏi giỏ hàng.` }); }
    if (thaoTac === 'SO_LUONG') {
      const q = Number(duLieu.qty);
      if (!Number.isInteger(q) || q < 1) return fail('Số lượng phải là số nguyên dương.');
      const ton = Catalog.stock(maDong);
      if (q > ton) return fail(`Không đủ tồn kho – biến thể này chỉ còn ${ton} sản phẩm.`);
      gio[idx].qty = q; DB.save(); return ok();
    }
    if (thaoTac === 'BIEN_THE') {
      const i = Catalog.info(maDong);
      const color = i.p.colors.find((c) => c.code === (duLieu.color || i.color.code));
      const newSku = Catalog.sku(i.p, color.code, duLieu.size || i.size);
      if (newSku === maDong) return ok();
      const exIdx = gio.findIndex((x) => x.sku === newSku);
      const soLuongSauGop = gio[idx].qty + (exIdx >= 0 ? gio[exIdx].qty : 0);
      const ton = Catalog.stock(newSku);
      if (ton <= 0) return fail(`Biến thể ${color.name} / ${duLieu.size || i.size} đã hết hàng.`);
      if (soLuongSauGop > ton) return fail(`Biến thể ${color.name} / ${duLieu.size || i.size} chỉ còn ${ton} sản phẩm (sau khi gộp cần ${soLuongSauGop}).`);
      if (exIdx >= 0) { gio[exIdx].qty = soLuongSauGop; gio.splice(idx, 1); } else gio[idx].sku = newSku;
      DB.save(); return ok({ gop: exIdx >= 0 });
    }
    return fail('Thao tác không hợp lệ.');
  },
};

/* UC10, UC11 */
const YeuThichController = {
  ds() { const u = Session.user(); return u ? (DB.data.wishlists[u.id] ||= []) : []; },
  co(maSP) { return this.ds().includes(maSP); },
  themYeuThich(maSP) {
    if (!Session.user()) return fail('Vui lòng đăng nhập để lưu sản phẩm yêu thích.', { code: 'CAN_DANG_NHAP' });
    if (!Catalog.get(maSP)) return fail('Sản phẩm không còn khả dụng.', { code: 'KHONG_KHA_DUNG' });
    const ds = this.ds();
    if (ds.includes(maSP)) return ok({ daTonTai: true });
    ds.unshift(maSP); DB.save(); return ok({ daTonTai: false });
  },
  boYeuThich(maSP) { const ds = this.ds(); const i = ds.indexOf(maSP); if (i >= 0) ds.splice(i, 1); DB.save(); return ok(); },
  xemYeuThich() { return this.ds().map((id) => Catalog.get(id)).filter(Boolean); },
};

/* UC12 */
const KhachHangController = {
  capNhatHoSo(thaoTac, d = {}) {
    const kh = Session.user(); if (!kh) return fail('Phiên đăng nhập đã hết hạn.');
    const e = {};
    if (thaoTac === 'LIEN_HE') {
      if (!(d.name || '').trim()) e.name = 'Vui lòng nhập họ tên.';
      if (!EMAIL_RE.test(d.email || '')) e.email = 'Email không đúng định dạng.';
      else if (DB.data.customers.some((c) => c.id !== kh.id && c.email.toLowerCase() === d.email.toLowerCase())) e.email = 'Email đã được tài khoản khác sử dụng.';
      if (d.phone && !PHONE_RE.test(d.phone)) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.';
      if (Object.keys(e).length) return fail('Thông tin chưa hợp lệ.', { fields: e });
      Object.assign(kh, { name: d.name.trim(), email: d.email.trim().toLowerCase(), phone: d.phone || '', gender: d.gender || '', dob: d.dob || '' });
      DB.save();
      StoreAPI.updateCustomer(kh);
      return ok({ msg: 'Đã cập nhật thông tin liên hệ.' });
    }
    if (thaoTac === 'LUU_DIA_CHI') {
      if (!(d.name || '').trim()) e.name = 'Nhập tên người nhận.';
      if (!PHONE_RE.test(d.phone || '')) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0.';
      if (!d.city) e.city = 'Chọn Tỉnh/Thành phố.';
      if (!(d.district || '').trim()) e.district = 'Nhập Quận/Huyện.';
      if (!(d.ward || '').trim()) e.ward = 'Nhập Phường/Xã.';
      if (!(d.line || '').trim()) e.line = 'Nhập số nhà, tên đường.';
      if (Object.keys(e).length) return fail('Địa chỉ thiếu thông tin bắt buộc.', { fields: e });
      let a = d.id ? kh.addresses.find((x) => x.id === d.id) : null;
      if (d.id && !a) return fail('Không có quyền thao tác trên địa chỉ này.');
      if (!a) { a = { id: 'DC' + DB.next('addr') }; kh.addresses.push(a); }
      Object.assign(a, { name: d.name.trim(), phone: d.phone, city: d.city, district: d.district.trim(), ward: d.ward.trim(), line: d.line.trim(), label: d.label || 'Nhà riêng' });
      if (d.isDefault || kh.addresses.length === 1) kh.addresses.forEach((x) => { x.isDefault = x.id === a.id; }); else a.isDefault = !!a.isDefault;
      DB.save();
      StoreAPI.updateCustomer(kh);
      return ok({ msg: d.id ? 'Đã cập nhật địa chỉ.' : 'Đã thêm địa chỉ mới vào sổ địa chỉ.', a });
    }
    if (thaoTac === 'XOA_DIA_CHI') {
      const i = kh.addresses.findIndex((x) => x.id === d.id); if (i < 0) return fail('Không có quyền thao tác trên địa chỉ này.');
      const wasDef = kh.addresses[i].isDefault; kh.addresses.splice(i, 1);
      if (wasDef && kh.addresses[0]) kh.addresses[0].isDefault = true;
      DB.save();
      StoreAPI.updateCustomer(kh);
      return ok({ msg: 'Đã xóa địa chỉ.' });
    }
    if (thaoTac === 'MAC_DINH') {
      if (!kh.addresses.some((x) => x.id === d.id)) return fail('Không có quyền thao tác trên địa chỉ này.');
      kh.addresses.forEach((x) => { x.isDefault = x.id === d.id; });
      DB.save();
      StoreAPI.updateCustomer(kh);
      return ok({ msg: 'Đã đặt làm địa chỉ mặc định.' });
    }
    if (thaoTac === 'DOI_MAT_KHAU') {
      if (d.old !== kh.password) e.old = 'Mật khẩu hiện tại không đúng.';
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(d.new || '')) e.new = 'Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số.';
      else if (d.new === d.old) e.new = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
      if (d.new !== d.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.';
      if (Object.keys(e).length) return fail('Không thể đổi mật khẩu.', { fields: e });
      kh.password = d.new; DB.save(); return ok({ msg: 'Đổi mật khẩu thành công.' });
    }
    return fail('Thao tác không hợp lệ.');
  },
};

/* UC13, UC14 (+ yêu cầu đổi trả theo mô tả BTH2) */
const ORDER_STEPS = ['CHO_DUYET', 'DANG_DONG_GOI', 'DANG_GIAO', 'DA_GIAO'];
const DonHangController = {
  cuaToi() { const u = Session.user(); return u ? DB.data.orders.filter((o) => o.customerId === u.id).sort((a, b) => b.date.localeCompare(a.date)) : []; },
  xemDanhSachDon(boLoc = 'ALL', trang = 1) {
    const all = this.cuaToi();
    const groups = { ALL: () => true, CHO_DUYET: (o) => o.status === 'CHO_DUYET', DANG_DONG_GOI: (o) => o.status === 'DANG_DONG_GOI', DANG_GIAO: (o) => ['DANG_GIAO', 'HEN_GIAO_LAI', 'GIAO_THAT_BAI'].includes(o.status), DA_GIAO: (o) => o.status === 'DA_GIAO', DA_HUY: (o) => o.status === 'DA_HUY' };
    const ds = all.filter(groups[boLoc] || groups.ALL);
    const counts = Object.fromEntries(Object.keys(groups).map((k) => [k, all.filter(groups[k]).length]));
    const per = 5; const soTrang = Math.max(1, Math.ceil(ds.length / per)); const t = Math.min(soTrang, Math.max(1, trang));
    return { danhSach: ds.slice((t - 1) * per, t * per), tongSo: ds.length, counts, trang: t, soTrang };
  },
  xemChiTietDon(maDon) {
    const u = Session.user(); const o = DB.data.orders.find((x) => x.id === maDon);
    if (!o || !u || o.customerId !== u.id) return fail('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.');
    return ok({ o });
  },
  taiHoaDon(maDon) {
    const r = this.xemChiTietDon(maDon); if (!r.ok) return r;
    if (!r.o.invoice) return fail('Đơn hàng chưa được phát hành hóa đơn điện tử. Hóa đơn sẽ có sau khi đơn hoàn tất.');
    return ok({ o: r.o });
  },
  coTheHuy(o) { return o.status === 'CHO_DUYET'; },
  huyDon(maDon, lyDo) {
    const r = this.xemChiTietDon(maDon); if (!r.ok) return r;
    const o = r.o;
    if (!this.coTheHuy(o)) {
      const why = { DANG_DONG_GOI: 'Đơn hàng đã được duyệt và đang đóng gói', DANG_GIAO: 'Đơn hàng đã bàn giao cho đơn vị vận chuyển', DA_GIAO: 'Đơn hàng đã giao thành công', DA_HUY: 'Đơn hàng đã được hủy trước đó' }[o.status] || 'Trạng thái hiện tại không cho phép hủy';
      return fail(`${why} nên không thể hủy trực tiếp. Vui lòng liên hệ CSKH hoặc gửi yêu cầu đổi trả sau khi nhận hàng.`, { code: 'KHONG_THE_HUY' });
    }
    if (!lyDo) return fail('Vui lòng chọn lý do hủy đơn.');
    // hủy có điều kiện & giải phóng tồn đang giữ (cùng giao dịch)
    o.items.forEach((it) => { DB.data.stock[it.sku] = (DB.data.stock[it.sku] || 0) + it.qty; });
    o.status = 'DA_HUY'; o.cancelReason = lyDo;
    o.history.push({ t: nowISO(), s: `Khách hàng hủy đơn – Lý do: ${lyDo} – Đã giải phóng tồn kho` });
    let hoanTien = null;
    if (o.payStatus === 'DA_THANH_TOAN' && o.payMethod !== 'COD') {
      const rf = CongMoMoVNPay.yeuCauHoanTien(o.txnId, o.total);
      o.payStatus = 'CHO_HOAN_TIEN'; o.refund = { ma: rf.maHoanTien, soTien: o.total, t: nowISO() };
      o.history.push({ t: nowISO(), s: `Đã gửi yêu cầu hoàn tiền ${fmt(o.total)} tới cổng ${o.payMethod === 'MOMO' ? 'MoMo' : 'VNPay'} – Mã ${rf.maHoanTien} (3–5 ngày làm việc)` });
      hoanTien = o.refund;
    } else if (['CHO_CHON_PT', 'CHO_THANH_TOAN', 'THAT_BAI'].includes(o.payStatus)) o.payStatus = 'DA_HUY_GD';
    DB.save();
    StoreAPI.cancelOrder(o.id, lyDo);
    return ok({ o, hoanTien });
  },
  hanDoiTra(o) { if (o.status !== 'DA_GIAO' || !o.deliveredAt) return null; const d = new Date(o.deliveredAt); d.setDate(d.getDate() + SEED.policy.soNgayDoiTra); return d; },
  yeuCauDoiTraCua(maDon) { return DB.data.returns.find((r) => r.orderId === maDon) || null; },
  guiYeuCauDoiTra(maDon, d) {
    const r = this.xemChiTietDon(maDon); if (!r.ok) return r;
    const o = r.o; const han = this.hanDoiTra(o);
    if (!han) return fail('Chỉ có thể gửi yêu cầu đổi trả cho đơn đã giao thành công.');
    if (new Date() > han) return fail(`Đơn hàng đã quá thời hạn đổi trả ${SEED.policy.soNgayDoiTra} ngày kể từ khi nhận hàng.`);
    if (this.yeuCauDoiTraCua(maDon)) return fail('Đơn hàng này đã có yêu cầu đổi trả đang được xử lý.');
    if (!d.items?.length) return fail('Chọn ít nhất một sản phẩm cần đổi/trả.');
    if (!d.reason) return fail('Vui lòng chọn lý do đổi trả.');
    if (!d.images?.length) return fail('Vui lòng đính kèm ít nhất 1 hình ảnh minh chứng.');
    const yc = { id: 'DT-' + String(DB.next('ret')).padStart(4, '0'), orderId: maDon, t: nowISO(), items: d.items, reason: d.reason, detail: d.detail || '', option: d.option, images: d.images, status: 'CHO_TIEP_NHAN' };
    DB.data.returns.push(yc);
    o.history.push({ t: nowISO(), s: `Khách hàng gửi yêu cầu đổi trả ${yc.id} – ${d.option}` });
    DB.save();
    StoreAPI.createReturn(yc);
    return ok({ yc });
  },
};

/* UC15 */
const VanChuyenController = {
  async theoDoiVanChuyen(maDon) {
    const r = DonHangController.xemChiTietDon(maDon);
    if (!r.ok) return { state: 'KHONG_TIM_THAY', error: r.error };
    const o = r.o;
    if (o.status === 'DA_HUY') return { state: 'DA_HUY', o };
    if (!o.trackingCode) return { state: 'CHUA_CO_MA', o };
    const kq = await DonViVanChuyen.traCuuHanhTrinh(o.trackingCode, o);
    if (kq.ok) { o.trackingSyncedAt = nowISO(); DB.save(); return { state: 'OK', o, events: kq.events, updatedAt: o.trackingSyncedAt }; }
    return { state: 'LOI_API', o, error: kq.error, events: o.trackingSyncedAt ? o.tracking : o.tracking, updatedAt: o.trackingSyncedAt || o.history[o.history.length - 1].t };
  },
};

/* UC16 */
const DatHangController = {
  chuanBiDatHang() {
    const u = Session.user(); if (!u) return fail('Vui lòng đăng nhập để đặt hàng.', { code: 'CAN_DANG_NHAP' });
    const gio = GioHangController.xemGioHang();
    if (!gio.lines.length) return fail('Giỏ hàng trống, không thể đặt hàng.', { code: 'GIO_RONG' });
    return ok({ u, gio, diaChi: u.addresses });
  },
  /* tinhDonHang(thongTinNhan, voucher) */
  tinhDonHang(nhan, voucherCode) {
    const gio = GioHangController.xemGioHang(); const loi = [];
    if (!gio.lines.length) loi.push('Giỏ hàng trống.');
    gio.lines.forEach((l) => { if (l.warn) loi.push(`${l.p.name} (${l.color.name}/${l.size}): ${l.warn.toLowerCase()} – vui lòng điều chỉnh giỏ hàng.`); });
    const ship = DichVuGiaoHang.tinhPhiVanChuyen(nhan?.city || '', gio.tamTinh);
    let giam = 0; let giamShip = 0; let voucher = null; let loiVoucher = null;
    if (voucherCode) {
      const kv = KhuyenMaiController.kiemTraVoucher(voucherCode, gio.lines, gio.tamTinh, ship.fee);
      if (kv.ok) { voucher = kv.v; giam = kv.giam; giamShip = kv.giamShip; } else loiVoucher = kv.error;
    }
    const nhanLoi = {};
    if (!nhan || !(nhan.name || '').trim()) nhanLoi.name = 'Nhập họ tên người nhận.';
    if (!nhan || !PHONE_RE.test(nhan.phone || '')) nhanLoi.phone = 'Số điện thoại nhận hàng gồm 10 số, bắt đầu bằng 0.';
    if (!nhan || !nhan.city || !(nhan.line || '').trim()) nhanLoi.address = 'Chọn hoặc nhập địa chỉ giao hàng đầy đủ.';
    const tong = Math.max(0, gio.tamTinh - giam) + ship.fee - giamShip;
    return { gio, ship, giam, giamShip, voucher, loiVoucher, loi, nhanLoi, tong, hopLe: !loi.length && !loiVoucher && !Object.keys(nhanLoi).length };
  },
  /* xacNhanDatHang: kiểm tra lại giá, tồn, voucher rồi tạo đơn & giữ tồn trong một giao dịch */
  xacNhanDatHang(nhan, voucherCode, banTinhDaXem, ghiChu) {
    const u = Session.user(); if (!u) return fail('Phiên đăng nhập đã hết hạn.', { code: 'CAN_DANG_NHAP' });
    if (u.status === 'KHOA' || u.status === 'BLACKLIST') return fail('Tài khoản của bạn đang nằm trong danh sách hạn chế (Blacklist). Không thể thực hiện đặt hàng.', { code: 'KHOA' });
    const t = this.tinhDonHang(nhan, voucherCode);
    if (!t.hopLe) return fail(t.loiVoucher || t.loi[0] || Object.values(t.nhanLoi)[0], { code: 'DIEU_CHINH', t });
    if (banTinhDaXem && banTinhDaXem.tong !== t.tong) return fail('Giá, tồn kho hoặc điều kiện voucher đã thay đổi. Vui lòng kiểm tra và xác nhận lại.', { code: 'CAN_XAC_NHAN_LAI', truoc: banTinhDaXem.tong, sau: t.tong });
    const maxExist = DB.data.orders.reduce((mx, x) => {
      const num = parseInt(String(x.id || '').replace(/^DH2026/, ''), 10);
      return !isNaN(num) && num > mx ? num : mx;
    }, DB.data.seq.order || 1120);
    DB.data.seq.order = Math.max(DB.data.seq.order || 1120, maxExist);
    const id = 'DH2026' + DB.next('order');
    const addr = `${nhan.line}, ${nhan.ward}, ${nhan.district}, ${nhan.city}`;
    const o = {
      id, customerId: u.id, date: nowISO(),
      items: t.gio.lines.map((l) => ({ sku: l.sku, qty: l.qty, price: l.price })),
      receiver: { name: nhan.name.trim(), phone: nhan.phone, address: addr },
      subtotal: t.gio.tamTinh, shipFee: t.ship.fee - t.giamShip, discount: t.giam, voucher: t.voucher?.code || null, total: t.tong,
      payMethod: null, payStatus: 'CHO_CHON_PT', status: 'CHO_DUYET', note: ghiChu || '',
      trackingCode: null, carrier: 'Giao Hàng Nhanh (GHN)', invoice: null,
      history: [{ t: nowISO(), s: 'Tạo đơn hàng thành công – Đã giữ tồn kho cho đơn' }], tracking: [],
    };
    t.gio.lines.forEach((l) => { DB.data.stock[l.sku] -= l.qty; });
    if (t.voucher) t.voucher.used += 1;
    DB.data.orders.unshift(o);
    DB.data.carts[u.id] = [];
    DB.save();
    StoreAPI.createOrder(o);
    return ok({ maDon: id, o });
  },
};

/* UC17, UC18, UC19 */
const PAY_LABEL = { COD: 'Tiền mặt khi nhận hàng (COD)', MOMO: 'Ví MoMo', VNPAY: 'VNPay' };
const ThanhToanController = {
  layThongTinThanhToan(maDon) {
    this.xuLyCallbackDenHan();
    const r = DonHangController.xemChiTietDon(maDon); if (!r.ok) return fail(r.error, { code: 'KHONG_QUYEN' });
    const o = r.o;
    if (o.status === 'DA_HUY') return fail('Đơn hàng đã bị hủy, không thể thanh toán.', { code: 'KHONG_THE', o });
    if (o.payStatus === 'DA_THANH_TOAN') return fail('Đơn hàng đã được thanh toán thành công trước đó.', { code: 'KHONG_THE', o });
    if (o.payMethod === 'COD' && o.payStatus === 'CHUA_THANH_TOAN') return fail('Đơn hàng đã xác nhận thanh toán tiền mặt khi nhận hàng (COD).', { code: 'KHONG_THE', o });
    if (o.payStatus === 'CHO_THANH_TOAN' && this.giaoDichDangCho(o.id)) return ok({ o, dangCho: this.giaoDichDangCho(o.id) });
    return ok({ o });
  },
  giaoDichDangCho(maDon) { return DB.data.transactions.find((x) => x.orderId === maDon && x.status === 'CHO') || null; },
  chonPhuongThuc(maDon, pt) {
    if (!pt) return fail('Vui lòng chọn phương thức thanh toán trước khi xác nhận.');
    return ok({ pt });
  },
  /* UC18 */
  xacNhanCOD(maDon) {
    const r = this.layThongTinThanhToan(maDon); if (!r.ok) return r;
    const o = r.o;
    if (!o.receiver?.address || !o.receiver?.phone) return fail('Thông tin giao nhận chưa đầy đủ, vui lòng cập nhật trước khi hoàn tất.');
    o.payMethod = 'COD'; o.payStatus = 'CHUA_THANH_TOAN';
    o.history.push({ t: nowISO(), s: `Xác nhận thanh toán tiền mặt khi nhận hàng (COD) – Số tiền phải thu ${fmt(o.total)}` });
    DB.save();
    StoreAPI.updatePayment(o.id, 'COD', 'CHUA_THANH_TOAN');
    return ok({ o });
  },
  /* UC19 – khởi tạo giao dịch */
  taoThanhToan(maDon, cong) {
    const r = this.layThongTinThanhToan(maDon); if (!r.ok) return r;
    const o = r.o;
    const ref = 'UC' + o.id.slice(2) + '-' + DB.next('txn');
    const kq = CongMoMoVNPay.taoGiaoDich(ref, o.id, o.total, cong);
    if (!kq.ok) {
      o.history.push({ t: nowISO(), s: `Khởi tạo giao dịch ${PAY_LABEL[cong]} thất bại` });
      DB.save();
      return fail(kq.error, { code: 'LOI_KHOI_TAO' });
    }
    DB.data.transactions.forEach((x) => { if (x.orderId === o.id && x.status === 'CHO') x.status = 'HUY'; });
    const txn = { ref, maGD: kq.maGD, orderId: o.id, amount: o.total, cong, status: 'CHO', t: nowISO() };
    DB.data.transactions.push(txn);
    o.payMethod = cong; o.payStatus = 'CHO_THANH_TOAN';
    o.history.push({ t: nowISO(), s: `Khởi tạo giao dịch ${PAY_LABEL[cong]} – Mã tham chiếu ${ref}` });
    DB.save();
    return ok({ txn, link: kq.link });
  },
  layGiaoDich(ref) { return DB.data.transactions.find((x) => x.ref === ref) || null; },
  /* Cổng thông báo kết quả: xác minh chữ ký, mã đơn, số tiền, chống ghi trùng */
  thongBaoKetQua(p) {
    const txn = this.layGiaoDich(p.maThamChieu);
    const hopLe = txn && p.maGD === txn.maGD && p.soTien === txn.amount && p.chuKy === sign(`${p.maThamChieu}|${p.maGD}|${p.trangThai}|${p.soTien}`);
    if (!hopLe) { DB.data.callbackLog = [...(DB.data.callbackLog || []), { t: nowISO(), ref: p.maThamChieu, kq: 'TU_CHOI' }]; DB.save(); return fail('Thông báo không hợp lệ (sai chữ ký / số tiền) – hệ thống từ chối cập nhật.', { code: 'TU_CHOI' }); }
    if (txn.status !== 'CHO') return ok({ trungLap: true });
    const o = DB.data.orders.find((x) => x.id === txn.orderId);
    if (p.trangThai === 'THANH_CONG') {
      txn.status = 'THANH_CONG'; o.payStatus = 'DA_THANH_TOAN'; o.txnId = txn.maGD;
      o.history.push({ t: nowISO(), s: `Thanh toán ${PAY_LABEL[txn.cong]} thành công – Mã GD ${txn.maGD}` });
      StoreAPI.updatePayment(o.id, txn.cong, 'DA_THANH_TOAN', txn.maGD);
    } else {
      txn.status = p.trangThai === 'HUY' ? 'HUY' : 'THAT_BAI'; o.payStatus = 'THAT_BAI';
      o.history.push({ t: nowISO(), s: `Giao dịch ${PAY_LABEL[txn.cong]} ${p.trangThai === 'HUY' ? 'bị khách hủy' : 'thất bại'} – Đơn chưa được thanh toán` });
      StoreAPI.updatePayment(o.id, txn.cong, 'THAT_BAI', txn.maGD);
    }
    DB.save();
    return ok({ txn });
  },
  xuLyCallbackDenHan() {
    const due = DB.data.pendingCallbacks.filter((c) => c.due <= Date.now());
    if (!due.length) return;
    DB.data.pendingCallbacks = DB.data.pendingCallbacks.filter((c) => c.due > Date.now());
    DB.save();
    due.forEach((c) => this.thongBaoKetQua(c.payload));
  },
  /* traCuuKetQua(maDon) – trang kết quả (độc lập với callback) */
  traCuuKetQua(ref) {
    this.xuLyCallbackDenHan();
    const txn = this.layGiaoDich(ref); if (!txn) return fail('Không tìm thấy giao dịch.');
    const r = DonHangController.xemChiTietDon(txn.orderId); if (!r.ok) return r;
    return ok({ txn, o: r.o });
  },
};
