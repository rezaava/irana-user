import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEdit } from "react-icons/fa";
import TechnicianNavbar from "../components/TechnicianNavbar";
import withRouter from "../common/withRouter";

// صفحه‌ی منوی حساب — پروفایل، بلاگ، دکمه‌ی شناور پشتیبانی
class AccountMenuPage extends React.Component {
  render() {
    return (
      <div>
        <div className="container px-3 pt-4">
          <Link
            to="/profile"
            className="d-flex align-items-center gap-3 border rounded-4 px-3 py-3 mb-3 text-decoration-none"
          >
            <FaUser className="text-primary" size={22} />
            <span className="text-primary fw-semibold">پروفایل</span>
          </Link>

          <Link
            to="/blog"
            className="d-flex align-items-center gap-3 border rounded-4 px-3 py-3 mb-3 text-decoration-none"
          >
            <FaEdit className="text-primary" size={22} />
            <span className="text-primary fw-semibold">بلاگ</span>
          </Link>
        </div>
        <TechnicianNavbar />
      </div>
    );
  }
}

export default withRouter(AccountMenuPage);