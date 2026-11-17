# kul

Bộ trang tĩnh của KUL Tournament (GitHub Pages): `trongtai`, `thungan`, `thuedo`, `dk`.
Giao diện tải từ đây; dữ liệu lấy từ Google Apps Script qua `kul-api.js`.
Đổi link triển khai Apps Script thì sửa dòng `KUL_EXEC` trong `kul-api.js`.

## Thư mục `thcs/` — giải THCS (file Google Sheet + Apps Script riêng)

Link dạng `https://anzduy.github.io/kul/thcs/dk?k=...`. Sau khi triển khai Apps Script của file THCS,
mở `thcs/kul-api.js` trên GitHub (bút chì ✏️) và thay `DAN_LINK_EXEC_THCS_VAO_DAY` bằng link `/exec` của bản THCS.
