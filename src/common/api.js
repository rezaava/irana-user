// آدرس پایه‌ی API — طبق فایل‌های ارسالی (لینک آپدیت اپ) دامنه‌ی سرور همینه.
// اگه سرور واقعی فرق داره، فقط همین یک خط رو تغییر بده، بقیه‌ی کدها دست نمی‌خوره.
export const BASE_URL = "https://iranaserviceapp.ir/test/api";

// فایل‌هایی که سرور آپلود می‌کنه (عکس کارت ملی، سلفی، فیش واریزی و ...) با همین مسیر پایه ساخته می‌شن
export const FILES_BASE_URL = "https://iranaserviceapp.ir/test/";

// ساخت هدرهای درخواست — توکن رو خودکار از localStorage می‌خونه
function buildHeaders(isFormData) {
  const headers = { Accept: "application/json" };
  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  // برای FormData (آپلود فایل) نباید Content-Type دستی ست بشه،
  // مرورگر خودش boundary رو درست می‌سازه
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

// درخواست GET — همیشه جواب سرور رو با response.json() پارس می‌کنه، نه به‌صورت خام/آرایه
export function apiGet(path) {
  return fetch(BASE_URL + path, {
    method: "GET",
    headers: buildHeaders(false),
  })
    .then((response) => response.json())
    .then((json) => json);
}

// درخواست POST — body می‌تونه آبجکت ساده باشه (JSON.stringify می‌شه)
// یا FormData باشه (وقتی isFormData=true بدی، مثلاً برای آپلود عکس)
export function apiPost(path, body, isFormData) {
  return fetch(BASE_URL + path, {
    method: "POST",
    headers: buildHeaders(!!isFormData),
    body: isFormData ? body : JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((json) => json);
}

// کمکی برای ساخت آدرس کامل یک فایل آپلودشده روی سرور
export function fileUrl(path) {
  if (!path) return "";
  return FILES_BASE_URL + String(path).replace(/^\//, "");
}
