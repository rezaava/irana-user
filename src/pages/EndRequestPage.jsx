import React from "react";
import {
  FaCoins,
  FaBoxOpen,
  FaExclamationTriangle,
  FaChevronLeft,
} from "react-icons/fa";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

const API_URL = "https://iranaserviceapp.ir/test/api";

class EndRequestPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: null,
      sum: "",
      abzar: "",
      abzarDetails: "",
      cancelReason: "",
      submitting: false,
      message: "",
      card: {
        number: "شماره کارت",
        name: "نام صاحب کارت",
        bank: "نام بانک",
      }
    };

    this.handleBack = this.handleBack.bind(this);
    this.handleField = this.handleField.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleBack() {
    this.props.navigate(-1);
  }

  handleField(field) {
    return (e) => {
      this.setState({
        [field]: e.target.value,
      });
    };
  }

  handleSubmit(e) {
    e.preventDefault();

    const { id } = this.props.params;
    const token = localStorage.getItem("token");

    const {
      mode,
      sum,
      abzar,
      abzarDetails,
      cancelReason,
    } = this.state;

    if (!mode) {
      this.setState({
        message: "لطفاً وضعیت اتمام درخواست را انتخاب کنید.",
      });
      return;
    }

    if (mode === "done" && !sum) {
      this.setState({
        message: "لطفاً جمع مبلغ دریافتی را وارد کنید.",
      });
      return;
    }

    if (mode === "cancel" && !cancelReason.trim()) {
      this.setState({
        message: "لطفاً دلیل کنسلی را وارد کنید.",
      });
      return;
    }

    const body =
      mode === "done"
        ? {
            id,
            end: 1,
            sum: Number(sum || 0),
            abzar: Number(abzar || 0),
            abzar_details: abzarDetails,
            end_description: "",
          }
        : {
            id,
            end: 2,
            sum: 0,
            abzar: 0,
            abzar_details: "",
            end_description: cancelReason,
          };

    this.setState({
      submitting: true,
      message: "",
    });

    fetch(`${API_URL}/end-request`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("END REQUEST API:", data);

        if (String(data.status) === "1") {
          this.props.navigate(`/requests/history/${id}`);
          return;
        }

        this.setState({
          submitting: false,
          message: data.message || "ثبت درخواست انجام نشد.",
        });
      })
      .catch((error) => {
        console.error("END REQUEST ERROR:", error);

        this.setState({
          submitting: false,
          message: "ارتباط با سرور برقرار نشد.",
        });
      });
  }

  render() {
    const {
      mode,
      sum,
      abzar,
      abzarDetails,
      cancelReason,
      submitting,
      message,
    } = this.state;

    return (
      <div dir="rtl">
        {submitting && <Loader />}

        <div className="container px-3 pt-4 pb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
              }}
            >
              <FaChevronLeft size={14} />
            </button>

            <h1 className="fs-6 fw-semibold text-dark m-0">
              اتمام درخواست
            </h1>

            <span style={{ width: 36 }}></span>
          </div>

          <form onSubmit={this.handleSubmit}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <span className="text-dark">
                وضعیت اتمام درخواست:
              </span>

              <div className="d-flex align-items-center gap-4">
                <label className="d-flex align-items-center gap-2">
                  <span>انجام شد</span>

                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "done"}
                    onChange={() =>
                      this.setState({
                        mode: "done",
                        message: "",
                      })
                    }
                  />
                </label>

                <label className="d-flex align-items-center gap-2">
                  <span>کنسل شد</span>

                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "cancel"}
                    onChange={() =>
                      this.setState({
                        mode: "cancel",
                        message: "",
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {mode === "done" && (
              <>
                <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-1 bg-white">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="جمع مبلغ دریافتی از مشتری"
                    value={sum}
                    onChange={this.handleField("sum")}
                    className="form-control border-0 shadow-none text-end p-0"
                  />

                  <FaCoins
                    className="text-secondary"
                    size={18}
                  />
                </div>

                <div className="text-muted small text-end mb-3">
                  تمامی مبالغ به تومان وارد شود.
                </div>

                <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-1 bg-white">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="هزینه لوازم مصرفی"
                    value={abzar}
                    onChange={this.handleField("abzar")}
                    className="form-control border-0 shadow-none text-end p-0"
                  />

                  <FaCoins
                    className="text-secondary"
                    size={18}
                  />
                </div>

                <div className="text-muted small text-end mb-3">
                  تمامی مبالغ به تومان وارد شود.
                </div>

                <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-4 bg-white">
                  <input
                    type="text"
                    placeholder="لوازم مصرفی"
                    value={abzarDetails}
                    onChange={this.handleField("abzarDetails")}
                    className="form-control border-0 shadow-none text-end p-0"
                  />

                  <FaBoxOpen
                    className="text-secondary"
                    size={18}
                  />
                </div>
              </>
            )}

            {mode === "cancel" && (
              <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-4 bg-white">
                <input
                  type="text"
                  placeholder="دلیل کنسلی"
                  value={cancelReason}
                  onChange={this.handleField("cancelReason")}
                  className="form-control border-0 shadow-none text-end p-0"
                />

                <FaExclamationTriangle
                  className="text-secondary"
                  size={18}
                />
              </div>
            )}

            {message && (
              <div className="text-center text-danger small mb-3">
                {message}
              </div>
            )}

            {mode && (
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 py-3"
                disabled={submitting}
              >
                ثبت نهایی
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(EndRequestPage);