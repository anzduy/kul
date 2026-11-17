/* KUL THCS-1 — cầu nối trang tĩnh ↔ Apps Script. Đổi link triển khai thì sửa đúng 1 dòng dưới. */
var KUL_EXEC = "DAN_LINK_EXEC_THCS_VAO_DAY";
var KUL_QS = new URLSearchParams(location.search);
(function () {
  /* HIỆN NGAY dữ liệu lần trước (lưu trên máy này) rồi mới thay bằng dữ liệu mới từ máy chủ → mở link không phải chờ màn hình "Đang tải".
     Chỉ áp dụng cho lượt ĐẦU của các hàm đọc dưới đây; mọi lượt ghi và lượt đọc sau đó luôn hỏi thẳng máy chủ. */
  var DOC_NHANH = { layTran: 1, tnTongQuan: 1, tdLayDanhSach: 1, ctDoi: 1, kulDanhMucDoi: 1, kulTomTatCauThu: 1 }, daGoi = {}, dangCho = 0, the = null;
  function nhan(text, loi) {
    if (!the) { the = document.createElement('div'); the.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99;padding:calc(env(safe-area-inset-top,0px) + 4px) 10px 4px;font:600 12px -apple-system,system-ui,sans-serif;text-align:center;color:#2A1A00;background:#FFB62E;transition:opacity .3s'; document.body.appendChild(the); }
    the.textContent = text; the.style.background = loi ? '#FF453A' : '#FFB62E'; the.style.color = loi ? '#fff' : '#2A1A00'; the.style.opacity = text ? '1' : '0'; the.style.pointerEvents = 'none';
  }
  function doc(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function luu(k, v) { try { var j = JSON.stringify(v); if (j.length < 400000) localStorage.setItem(k, j); } catch (e) {} }
  function goi(ten, args, ok, fail, user) {
    if (!/^https://script.google.com/macros/s/[w-]+/exec$/.test(KUL_EXEC)) { if (fail) setTimeout(function () { fail(new Error('BTC chưa gắn link máy chủ cho trang này (sửa dòng KUL_EXEC trong kul-api.js).'), user); }); return; }
    var k = "KULTHCS:" + ten + ':' + JSON.stringify(args), nhanh = DOC_NHANH[ten] && !daGoi[k], cu = nhanh ? doc(k) : null, coCu = !!(cu && cu.v !== undefined);
    daGoi[k] = 1;
    if (coCu && ok) {
      dangCho++; nhan('Đang cập nhật dữ liệu mới…');
      try { window.KUL_TU_BO_DEM = true; ok(cu.v, user); } catch (e) { coCu = false; } finally { window.KUL_TU_BO_DEM = false; }
    }
    fetch(KUL_EXEC, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn: ten, args: args }) })
      .then(function (r) { if (!r.ok) throw new Error('Máy chủ đang bận (' + r.status + '). Thử lại sau vài giây.'); return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'Lỗi máy chủ.'); return j.result === undefined ? null : j.result; })
      .then(function (kq) {
        if (DOC_NHANH[ten]) luu(k, { v: kq, t: Date.now() });
        if (coCu && --dangCho <= 0) nhan('');
        if (ok) { try { window.KUL_SAU_BO_DEM = coCu; ok(kq, user); } finally { window.KUL_SAU_BO_DEM = false; } }
      }, function (e) {
        if (coCu) { dangCho--; try { localStorage.removeItem(k); } catch (x) {} nhan('Chưa lấy được dữ liệu mới — đang hiện dữ liệu lần trước', true); }
        if (fail) fail(e instanceof Error ? e : new Error(String(e)), user);
      });
  }
  function run(ok, fail, user) {
    return new Proxy({}, { get: function (_, ten) {
      if (ten === 'withSuccessHandler') return function (f) { return run(f, fail, user); };
      if (ten === 'withFailureHandler') return function (f) { return run(ok, f, user); };
      if (ten === 'withUserObject') return function (u) { return run(ok, fail, u); };
      return function () { goi(String(ten), Array.prototype.slice.call(arguments), ok, fail, user); };
    } });
  }
  window.google = { script: { run: run(null, null, null) } };
})();
