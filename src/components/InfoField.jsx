import React from "react";

// یک ردیف اطلاعات به‌صورت باکس بوردردار: آیکون سمت راست، برچسب و مقدار
// props:
//   icon: JSX آیکون (از react-icons/fa)
//   label: متن برچسب، مثلاً "نام"
//   value: مقدار متنی (اختیاری اگر children داده بشه)
//   children: برای محتوای سفارشی به‌جای value ساده (مثل تصویر یا لینک رنگی)
//   valueClassName: کلاس اضافه برای استایل مقدار (مثلاً رنگ آبی برای "تسویه شده")
function InfoField({ icon, label, value, children, valueClassName = "" }) {
  return (
    <div className="d-flex align-items-center justify-content-between gap-3 border rounded-4 px-3 py-3 mb-3 bg-white">
      <div className="text-primary" style={{ opacity: 0.75 }}>
        {icon}
      </div>

      <div className="d-flex align-items-center gap-2 flex-grow-1 text-end">
        <span className="text-muted">{label}:</span>
        {children ? (
          children
        ) : (
          <span className={`text-dark ${valueClassName}`}>{value}</span>
        )}
      </div>
    </div>
  );
}

export default InfoField;
