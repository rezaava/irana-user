import React from "react";
import {
  FaClone,
  FaPercentage,
  FaFolderOpen,
  FaChevronLeft,
} from "react-icons/fa";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

const API_URL = "https://iranaserviceapp.ir/test/api";

class SettleRequestPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      request: null,
      clear: null,
      loading: true,
      submitting: false,
      message: "",
      imageFile: null,
      imagePreview: "",
      card: null,
    };
    this.fileInputRef = React.createRef();
    this.handleBack = this.handleBack.bind(this);
    this.handleChooseFile = this.handleChooseFile.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.getRequestDetail();
  }

  getRequestDetail = () => {
    const { id } = this.props.params;
    const token = localStorage.getItem("token");
    this.setState({ loading: true });

    fetch(`${API_URL}/detail?id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("خطا در دریافت اطلاعات درخواست");
        }
        return response.json();
      })
      .then((data) => {
        console.log("REQUEST DETAIL API:", data);
        if (String(data.status) !== "1" || !data.request) {
          throw new Error(data.message || "درخواست پیدا نشد.");
        }
        this.setState({
          request: data.request,
          clear: data.clear || null,
          loading: false,
        });
      })
      .catch((error) => {
        console.error("GET REQUEST DETAIL ERROR:", error);
        this.setState({
          loading: false,
          message: error.message || "دریافت اطلاعات درخواست انجام نشد.",
        });
      });
  };

  handleBack() {
    this.props.navigate(-1);
  }

  handleChooseFile() {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  }

  handleFileChange(e) {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      this.setState({
        message: "لطفاً یک فایل تصویری انتخاب کنید.",
        imageFile: null,
        imagePreview: "",
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.setState({
        imageFile: file,
        imagePreview: reader.result,
        message: "",
      });
    };

    reader.readAsDataURL(file);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { request, imageFile } = this.state;
    const token = localStorage.getItem("token");

    if (!request) {
      this.setState({ message: "اطلاعات درخواست پیدا نشد." });
      return;
    }

    if (!imageFile) {
      this.setState({ message: "لطفاً عکس فیش واریزی را انتخاب کنید." });
      return;
    }

    const totalReceived = Number(request.sum || 0);
    const suppliesCost = Number(request.abzar || 0);
    const totalFee = totalReceived - suppliesCost;
    const commissionAmount = totalFee / 2;
    const formData = new FormData();

    formData.append("text1", request.code || "");
    formData.append("sum", commissionAmount);
    formData.append("file1", imageFile);
    formData.append("desc", "");
    formData.append("text2", "");
    formData.append("text3", "");

    this.setState({
      submitting: true,
      message: "",
    });

    fetch(`${API_URL}/clear`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("ثبت تسویه انجام نشد.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("CLEAR POST API:", data);

        if (String(data.status) === "1") {
          this.props.navigate(`/requests/history/${request.id}`);
          return;
        }

        this.setState({
          submitting: false,
          message: data.message || "ثبت تسویه انجام نشد.",
        });
      })
      .catch((error) => {
        console.error("CLEAR POST ERROR:", error);
        this.setState({
          submitting: false,
          message: error.message || "ارتباط با سرور برقرار نشد.",
        });
      });
  }

  render() {
    const {
      request,
      loading,
      submitting,
      message,
      imagePreview,
    } = this.state;

    if (loading) {
      return <Loader />;
    }

    if (!request) {
      return (
        <div dir="rtl" className="container px-3 py-5">
          <div className="text-center text-danger">
            {message || "درخواست پیدا نشد."}
          </div>
          <div className="text-center mt-3">
            <button className="btn btn-light" onClick={this.handleBack}>
              بازگشت
            </button>
          </div>
        </div>
      );
    }

    const totalReceived = Number(request.sum || 0);
    const suppliesCost = Number(request.abzar || 0);
    const totalFee = totalReceived - suppliesCost;
    const commissionAmount = totalFee / 2;

    return (
      <div dir="rtl">
        {submitting && <Loader />}

        <div className="container px-3 pt-4 pb-5">
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}
            >
              <FaChevronLeft size={14} />
            </button>
          </div>

          {/* باکس شماره کارت ثابت */}
          <div
            className="border rounded-4 bg-white mb-5"
            style={{
              padding: "25px 20px",
              borderColor: "#eeeeee",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted" style={{ fontSize: 12 }}>
                شماره کارت واریزی:
              </span>
              <FaClone
                style={{
                  color: "#383080",
                  fontSize: 24,
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigator.clipboard.writeText("6037-9981-5629-6021");
                }}
              />
            </div>

            <div
              dir="ltr"
              className="text-center fw-bold mb-3"
              style={{
                fontSize: "clamp(22px, 5.5vw, 36px)",
                color: "#111",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              6037-9981-5629-6021
            </div>

            <div className="text-end text-muted" style={{ fontSize: 12 }}>
              فرشاد نجفی / بانک ملی
            </div>
          </div>

          <h2 className="fs-6 fw-bold text-dark text-center mb-2">
            تسویه درخواست
          </h2>

          <p className="text-dark text-center mb-4" style={{ fontSize: 14 }}>
            درخواست تسویه ثبت نشده است،
            <br />
            هم اکنون میتوانید ثبت کنید.
          </p>

          <form onSubmit={this.handleSubmit}>
            <div className="mb-3">
              <label className="d-block text-muted text-end mb-1" style={{ fontSize: 11 }}>
                کد درخواست
              </label>

              <div
                className="d-flex align-items-center justify-content-between gap-2 border rounded-4 px-3 py-3 bg-white"
                style={{ minHeight: 66, borderColor: "#c9c9c9" }}
              >
                <FaClone className="text-secondary" size={20} />
                <span className="text-secondary" style={{ fontSize: 16 }}>
                  {request.code || "—"}
                </span>
              </div>
            </div>

            <div className="mb-1">
              <label className="d-block text-muted text-end mb-1" style={{ fontSize: 11 }}>
                پورسانت شرکت (%50)
              </label>

              <div
                className="d-flex align-items-center justify-content-between gap-2 border rounded-4 px-3 py-3 bg-white"
                style={{ minHeight: 66, borderColor: "#c9c9c9" }}
              >
                <FaClone className="text-secondary" size={21} />
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary">
                    {commissionAmount.toLocaleString("fa-IR")} تومان
                  </span>
                  <FaPercentage className="text-secondary" size={18} />
                </div>
              </div>
            </div>

            <div className="text-muted small text-end mb-4 mt-2">
              مبلغ به تومان وارد شود
            </div>

            <div className="mb-4">
              <label className="d-block text-muted text-end mb-2" style={{ fontSize: 11 }}>
                عکس فیش واریزی
              </label>

              <div
                className="border rounded-4 p-3 d-flex align-items-start justify-content-between gap-3"
                style={{ minHeight: 225, borderColor: "#c9c9c9" }}
              >
                <div
                  className="rounded-4 bg-light flex-shrink-0"
                  style={{
                    width: "58%",
                    aspectRatio: "16 / 10",
                    backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="d-flex flex-column align-items-center gap-3">
                  <button
                    type="button"
                    onClick={this.handleChooseFile}
                    className="btn btn-outline-primary rounded-4 d-flex align-items-center gap-2 px-3 py-3"
                    style={{ fontSize: 12, whiteSpace: "nowrap" }}
                  >
                    <span>انتخاب فایل</span>
                    <FaFolderOpen size={18} />
                  </button>

                  <input
                    ref={this.fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={this.handleFileChange}
                    className="d-none"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className="text-center text-danger small mb-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn w-100 rounded-4 py-3 text-white"
              disabled={submitting}
              style={{
                background: "#4e83f7",
                border: "none",
                boxShadow: "0 3px 5px rgba(0,0,0,0.18)",
              }}
            >
              {submitting ? "در حال ثبت..." : "ثبت"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(SettleRequestPage);