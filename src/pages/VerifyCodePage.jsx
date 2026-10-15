import React from "react";
import { FaKey } from "react-icons/fa";
import { apiPost } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

// صفحه‌ی تایید کد پیامک — با /check-code توکن می‌گیره و ذخیره می‌کنه
class VerifyCodePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { code: "", loading: false, errorMessage: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ code: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { code } = this.state;
    const mobile = localStorage.getItem("pending_mobile");

    if (!mobile) {
      this.props.navigate("/login");
      return;
    }
    if (!code.trim()) return;

    this.setState({ loading: true, errorMessage: "" });

    apiPost("/check-code", { mobile, sms: code })
      .then((json) => {
        this.setState({ loading: false });

        if (json.status === "1") {
          localStorage.setItem("token", json.token);
          localStorage.setItem("role", json.role);
          localStorage.removeItem("pending_mobile");
          this.props.navigate("/notifications");
        } else {
          this.setState({ errorMessage: json.message || "کد وارد شده اشتباه است" });
        }
      })
      .catch(() => {
        this.setState({ loading: false, errorMessage: "ارتباط با سرور برقرار نشد" });
      });
  }

  render() {
    const { code, loading, errorMessage } = this.state;

    return (
      <div>
        {loading && <Loader />}

        <div className="container-fluid px-3 pt-5" style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 className="fs-6 fw-semibold text-dark text-center mb-4">کد تایید را وارد کنید</h1>
          <img
            src="../img/login.png"
            alt="logo"
            className="w-100 my-3 rounded"
          />

          <form onSubmit={this.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
              <input
                type="text"
                inputMode="numeric"
                placeholder="کد پیامک شده"
                value={code}
                onChange={this.handleChange}
                className="form-control border-0 shadow-none text-end p-0"
              />
              <FaKey className="text-secondary" size={18} />
            </div>

            {errorMessage && (
              <div className="text-danger small text-center mb-3">{errorMessage}</div>
            )}

            <button type="submit" className="btn btn-primary w-100 rounded-3 py-3">
              تایید و ورود
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(VerifyCodePage);
