import React from "react";
import { Link } from "react-router-dom";

// صفحه‌ی خوش‌آمدگویی — اولین صفحه‌ای که تعمیرکار قبل از ورود/ثبت‌نام می‌بینه
class WelcomePage extends React.Component {
  componentDidMount() {
    document.body.style.margin = "0";
  }

  componentWillUnmount() {
    document.body.style.margin = "";
  }
  render() {
    return (
      <div dir="rtl" lang="fa" className="bg-white min-vh-100 d-flex flex-column">
        <div className="container-fluid px-3 pt-4 flex-grow-1 d-flex flex-column justify-content-between" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div>
            <div className="d-flex justify-content-start mb-5">
              <span className="fw-bold text-primary fs-5">ایرانا سرویس</span>
            </div>

            <div className="text-center my-5 py-5">
              <div
                className="rounded-circle mx-auto mb-4"
                style={{
                  width: 220,
                  height: 220,
                  backgroundColor: "#f1f3f9",
                }}>
                </div>
              <p className="text-dark fs-6">
                سرویسی امن و راحت برای خدمت‌رسانی به مشتریان
              </p>
            </div>
          </div>

          <div className="pb-5">
            <Link
              to="/login"
              className="btn btn-primary w-100 rounded-3 py-3 mb-3 d-block"
            >
              ورود
            </Link>
            <Link
              to="/register"
              className="btn btn-primary w-100 rounded-3 py-3 d-block"
            >
              ثبت نام
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default WelcomePage;