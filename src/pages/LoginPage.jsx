import React from "react";
import { FaMobileAlt } from "react-icons/fa";
import { apiPost } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mobile: "",
      loading: false,
      errorMessage: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const navOuter = document.querySelector(".nav-outer");

    if (navOuter) {
      navOuter.style.display = "none";
    }
  }

  componentWillUnmount() {
    const navOuter = document.querySelector(".nav-outer");

    if (navOuter) {
      navOuter.style.display = "";
    }
  }

  handleChange(e) {
    this.setState({
      mobile: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const mobile = this.state.mobile.trim();

    if (!mobile) {
      return;
    }

    this.setState({
      loading: true,
      errorMessage: "",
    });

    apiPost("/login", {
      mobile,
    })
      .then((json) => {
        if (json.status === "1") {
          /*
           * گرفتن ID کاربر از پاسخ API
           */
          const userId =
            json.id ||
            json.user_id ||
            json.data?.id ||
            json.data?.user_id ||
            json.user?.id ||
            json.data?.user?.id;

          if (!userId) {
            console.error("User ID پیدا نشد:", json);

            this.setState({
              loading: false,
              errorMessage:
                "شناسه کاربر از سرور دریافت نشد",
            });

            return;
          }

          /*
           * ذخیره شماره برای مرحله تایید
           */
          localStorage.setItem(
            "pending_mobile",
            mobile
          );

          /*
           * ذخیره ID کاربر
           */
          localStorage.setItem(
            "user_id",
            String(userId)
          );

          this.setState({
            loading: false,
          });

          this.props.navigate("/verify-code");
        } else {
          this.setState({
            loading: false,
            errorMessage:
              json.message || "خطایی رخ داد",
          });
        }
      })
      .catch((error) => {
        console.error("LOGIN ERROR:", error);

        this.setState({
          loading: false,
          errorMessage:
            "ارتباط با سرور برقرار نشد",
        });
      });
  }

  render() {
    const {
      mobile,
      loading,
      errorMessage,
    } = this.state;

    return (
      <div>
        {loading && <Loader />}

        <div
          className="container-fluid px-3 pt-5"
          style={{
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <h1 className="fs-6 fw-semibold text-dark text-center mb-4">
            ورود به سیستم
          </h1>

          <img
            src="../img/login.png"
            alt="logo"
            className="w-100 my-3 rounded"
          />

          <form onSubmit={this.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
              <input
                type="tel"
                placeholder="شماره موبایل"
                value={mobile}
                onChange={this.handleChange}
                className="form-control border-0 shadow-none text-end p-0"
              />

              <FaMobileAlt
                className="text-secondary"
                size={18}
              />
            </div>

            {errorMessage && (
              <div className="text-danger small text-center mb-3">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 rounded-3 py-3"
              disabled={loading}
            >
              {loading
                ? "در حال ارسال..."
                : "دریافت کد تایید"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(LoginPage);