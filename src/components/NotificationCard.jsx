import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";

// یک کارت اطلاعیه در لیست
// props:
//   notification: { id, image, title, excerpt }
//   detailsPathPrefix: مسیر پایه‌ی صفحه‌ی جزئیات (پیش‌فرض '/notifications')
class NotificationCard extends React.Component {
  render() {
    const { notification, detailsPathPrefix = "/notifications" } = this.props;

    return (
      <div
        className="border rounded-4 overflow-hidden bg-white mb-4"
        style={{ transition: "box-shadow 0.15s ease" }}
      >
        <img
          src={notification.image}
          alt={notification.title}
          className="w-100"
          style={{ height: 240, objectFit: "cover" }}
        />

        <div className="p-3">
          <h3 className="fs-6 fw-semibold text-dark text-end mb-2">
            {notification.title}
          </h3>
          <p className="text-muted small text-end mb-3 text-limited" style={{ lineHeight: 1.9 }}>
            {notification.excerpt}
          </p>

          <Link
            to={`${detailsPathPrefix}/${notification.id}`}
            className="d-flex align-items-center gap-1 text-decoration-none text-primary"
            style={{ transition: "opacity 0.15s ease" }}
          >
            <FaChevronLeft size={12} />
            <span>دیدن جزئیات</span>
          </Link>
        </div>
      </div>
    );
  }
}

export default NotificationCard;
