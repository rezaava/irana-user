import React from "react";
import {
  FaUserEdit,
  FaMapMarkerAlt,
  FaImage,
  FaMicrochip,
  FaTag,
  FaQuestionCircle,
  FaClock,
  FaSyncAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { apiGet, apiPost } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";
import moment from "moment-jalaali";

// یک ردیف اطلاعات ساده — برای جلوگیری از تکرار کد
function Row({ icon, label, value }) {
  return (
    <div className="d-flex align-items-center border gap-2 rounded-4 px-3 py-3 mb-3">
      {icon}
      <div className="d-flex align-items-center gap-2 text-end">
        <span className="text-muted">{label}:</span>
        <span className="text-dark">{value || "—"}</span>
      </div>
    </div>
  );
}

// صفحه‌ی جزئیات یک درخواستِ باز — با دکمه‌ی سبز «تایید درخواست»
// وایر شده به GET /detail?id= و POST /accept
class RequestOpenDetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { request: null, loading: true, message: "" };
    this.handleBack = this.handleBack.bind(this);
    this.handleApprove = this.handleApprove.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.params;
    apiGet(`/detail?id=${id}`)
      .then((json) => {
        this.setState({ request: json.request || null, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleBack() {
    this.props.navigate(-1);
  }

  handleApprove() {
    const { id } = this.props.params;
    this.setState({ loading: true, message: "" });

    apiPost("/accept", { id, status: 1 })
      .then((json) => {
        this.setState({ loading: false, message: json.message || "" });
        if (json.status === "1") {
          this.props.navigate("/requests/open");
        }
      })
      .catch(() => {
        this.setState({ loading: false, message: "ارتباط با سرور برقرار نشد" });
      });
  }

  handleJalaliDate(date) {
    if (!date) return "—";

    const englishDate = date.toString().replace(/[۰-۹٠-٩]/g, (digit) => {
      const persian = "۰۱۲۳۴۵۶۷۸۹";
      const arabic = "٠١٢٣٤٥٦٧٨٩";
      return String(
        persian.indexOf(digit) !== -1
          ? persian.indexOf(digit)
          : arabic.indexOf(digit)
      );
    });

    const parsedDate = moment(englishDate, "YYYY-MM-DD", true);

    if (!parsedDate.isValid()) return "—";

    return parsedDate.format("jYYYY/jMM/jDD");
  }
  render() {
    const { request, loading, message } = this.state;

    if (!request && !loading) {
      return (
        <div dir="rtl" lang="fa" className="bg-white min-vh-100 d-flex align-items-center justify-content-center">
          <span className="text-muted">درخواست پیدا نشد.</span>
        </div>
      );
    }

    return (
      <div>
        {loading && <Loader />}

        <div className="container-fluid px-3 pt-4" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
          <div className="d-flex justify-content-start mb-3">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}
            >
              <FaChevronLeft size={14} />
            </button>
          </div>

          {request && (
            <>
              <Row icon={<FaUserEdit className="text-primary" size={18} />} label="نام مشتری" value={request.name} />
              <Row
                icon={<FaMapMarkerAlt className="text-primary" size={18} />}
                label="استان"
                value={request.state_model ? request.state_model.name : ""}
              />
              <Row icon={<FaImage className="text-primary" size={18} />} label="آدرس" value={request.address} />
              <Row icon={<FaMicrochip className="text-primary" size={18} />} label="نوع دستگاه" value={request.device_type} />
              <Row icon={<FaTag className="text-primary" size={18} />} label="برند دستگاه" value={request.device_brand} />
              <Row icon={<FaQuestionCircle className="text-primary" size={18} />} label="ایراد دستگاه" value={request.problem} />
              <Row icon={<FaClock className="text-primary" size={18} />} label="زمان مراجعه" value={this.handleJalaliDate(request.time)} />
              <Row icon={<FaSyncAlt className="text-primary" size={18} />} label="توضیحات" value={request.description} />
            </>
          )}

          {message && <div className="text-danger small text-center mb-3">{message}</div>}
        </div>

        <div
          className="position-fixed bottom-0 start-0 w-100 px-3 pb-4 pt-2 bg-white"
          style={{ maxWidth: 480, margin: "0 auto", right: 0 }}
        >
          <button
            type="button"
            onClick={this.handleApprove}
            className="btn w-100 rounded-3 py-3 text-white fw-semibold"
            style={{ backgroundColor: "#4cd964", border: "none" }}
          >
            تایید درخواست
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(RequestOpenDetailPage);
