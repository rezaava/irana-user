import React from "react";
import { NavLink } from "react-router-dom";
import "./../css/nav.css";
import "./../css/all.css";
import { FaHeadset } from "react-icons/fa";
import withRouter from "../common/withRouter";

// ترتیب و آیکون‌ها مطابق طرح تعمیرکار: تنظیمات، اطلاعیه‌ها، درخواست‌ها، سوابق
// از همون کلاس‌های nav.css/all.css که برای نسخه‌ی ادمین استفاده شده بود استفاده می‌کنه
const navItems = [
  { id: "history", icon: "fa-calendar-days", label: "سوابق", path: "/requests/history" },
  { id: "requests", icon: "fa-file-lines", label: "درخواست ها", path: "/requests/open" },
  { id: "notifications", icon: "fa-bell", label: "اطلاعیه ها", path: "/notifications" },
  { id: "settings", icon: "fa-gear", label: "تنظیمات", path: "/setting" },
];

class TechnicianNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSupportClick = this.handleSupportClick.bind(this);
  }

  handleSupportClick() {
    this.props.navigate("/chat");
  }

  render() {
    return (
      <>
        <div className="nav-outer">
          <nav className="dark-navbar" id="mainNavbar">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `text-decoration-none nav-item ${isActive ? "active" : ""}`}
                data-icon={item.icon}
                data-label={item.label}
              >
                <div className="icon-circle">
                  <i className={`fa-duotone fa-solid ${item.icon}`}></i>
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
                <button
                  type="button"
                  onClick={this.handleSupportClick}
                  className="btn btn-primary rounded-pill d-flex align-items-center gap-2 px-4 py-2 position-absolute"
                  style={{ bottom: 95, right: 24 }}
                >
                  <span>پشتیبانی</span>
                  <FaHeadset size={18} />
                </button>
        </div>
        
      </>
    );
  }
}

export default withRouter(TechnicianNavbar);