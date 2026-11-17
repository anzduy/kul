/* KUL V250 — cầu nối trang tĩnh ↔ Apps Script. Đổi link triển khai thì sửa đúng 1 dòng dưới. */
var KUL_EXEC = "https://script.google.com/macros/s/AKfycby7h3_ftSmk8bwBvyURr2_8HyDRCIhkoV2UMQ8zDd7JXWdOJaTA-WD6IsWOcrjd34ztIA/exec";
var KUL_QS = new URLSearchParams(location.search);
(function () {
  function goi(ten, args, ok, fail, user) {
    fetch(KUL_EXEC, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn: ten, args: args }) })
      .then(function (r) { if (!r.ok) throw new Error('Máy chủ đang bận (' + r.status + '). Thử lại sau vài giây.'); return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'Lỗi máy chủ.'); return j.result === undefined ? null : j.result; })
      .then(function (kq) { if (ok) ok(kq, user); }, function (e) { if (fail) fail(e instanceof Error ? e : new Error(String(e)), user); });
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
