import React from "react";
import { Link } from "react-router-dom";

// جدول عمومی و قابل استفاده‌ی مجدد
// props:
//   columns: [{ key, label, width?, headerClassName?, render?(row) }]
//     - ترتیب آرایه از راست به چپ رندر می‌شود (چون dir="rtl")
//   rows: آرایه‌ی داده‌ها؛ هر ردیف باید id داشته باشد (یا index استفاده می‌شود)
//   getRowLink?(row): اگر داده بشه، کل ردیف داخل Link قرار می‌گیرد و با کلیک ناوبری می‌کند
//   emptyMessage?: متن حالت خالی
class GenericTable extends React.Component {
  render() {
    const { columns, rows, getRowLink, emptyMessage } = this.props;
    const gridTemplateColumns = columns.map((c) => c.width || "1fr").join(" ");

    const headerRow = (
      <div
        className="bg-light py-3 px-2"
        style={{ display: "grid", gridTemplateColumns, alignItems: "center" }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            className={`small fw-semibold text-center ${col.headerClassName || "text-muted"}`}
          >
            {col.label}
          </span>
        ))}
      </div>
    );

    return (
      <div dir="rtl" className="border rounded-4 overflow-hidden bg-white">
        {headerRow}

        {rows.length === 0 ? (
          <div className="text-center text-muted py-5">
            {emptyMessage || "موردی برای نمایش وجود ندارد."}
          </div>
        ) : (
          rows.map((row, idx) => {
            const rowKey = row.id ?? idx;
            const content = (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns,
                  alignItems: "center",
                  transition: "background-color 0.15s ease",
                }}
                className="py-3 px-2 border-top"
              >
                {columns.map((col) => (
                  <div key={col.key} className="text-center px-1">
                    {col.render ? (
                      col.render(row)
                    ) : (
                      <span className="small text-dark">{row[col.key]}</span>
                    )}
                  </div>
                ))}
              </div>
            );

            if (getRowLink) {
              return (
                <Link
                  key={rowKey}
                  to={getRowLink(row)}
                  className="text-decoration-none text-reset d-block"
                >
                  {content}
                </Link>
              );
            }

            return <React.Fragment key={rowKey}>{content}</React.Fragment>;
          })
        )}
      </div>
    );
  }
}

export default GenericTable;
