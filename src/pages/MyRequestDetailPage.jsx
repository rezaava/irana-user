import React from "react";
import {
  FaClone,
  FaUserCog,
  FaUserEdit,
  FaPhoneAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaMicrochip,
  FaTag,
  FaQuestionCircle,
  FaClock,
  FaSyncAlt,
  FaCoins,
  FaBoxOpen,
  FaFileInvoice,
  FaExclamationCircle,
  FaChevronLeft,
  FaCommentDots,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaPlayCircle,
  FaTrashAlt,
} from "react-icons/fa";

import InfoField from "../components/InfoField";
import withRouter from "../common/withRouter";
import AuthCheck from "../common/AuthCheck";
import Loader from "../common/Loader";
import { Link } from "react-router-dom";

const API_URL = "https://iranaserviceapp.ir/test/api";
const CLEAR_IMAGE_URL = "https://iranaserviceapp.ir/test/files/clear";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigits(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[Number(digit)]
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const parts = String(dateString).split("/");

  if (parts.length !== 3) {
    return dateString;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (year < 1700) {
    return `${toPersianDigits(year)}/${toPersianDigits(
      String(month).padStart(2, "0")
    )}/${toPersianDigits(String(day).padStart(2, "0"))}`;
  }

  try {
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("DATE FORMAT ERROR:", error);
    return dateString;
  }
}

// دقیقاً همون منطق وضعیت‌دهیِ RequestDetailPage — چون قوانین وضعیت
// درخواست فرقی نمی‌کنه که از سمت ادمین نگاهش کنی یا سمت تعمیرکار
function getRequestStatus(request, clear) {
  const status = Number(request.status);
  const end = Number(request.end);
  const cleared = Number(request.cleared);
  const deleted = Number(request.deleted);

  if (deleted === 1 || (status === 4 && end === 2)) {
    return {
      type: "admin_deleted",
      text: "حذف توسط ادمین",
      className: "text-danger fw-semibold",
      icon: <FaTrashAlt />,
    };
  }

  if (status === 4) {
    return {
      type: "canceled",
      text: "کنسل توسط تعمیرکار",
      className: "text-danger fw-semibold",
      icon: <FaTimesCircle />,
    };
  }

  if (status === -1) {
    return {
      type: "canceled",
      text: "کنسل توسط تعمیرکار",
      className: "text-danger fw-semibold",
      icon: <FaTimesCircle />,
    };
  }

  if (status === 1 && end === 2) {
    return {
      type: "canceled",
      text: "کنسل توسط تعمیرکار",
      className: "text-danger fw-semibold",
      icon: <FaTimesCircle />,
    };
  }

  if (status === 1 && end === 1 && cleared === 1) {
    return {
      type: "settled",
      text: "تسویه شده",
      className: "text-primary fw-semibold",
      icon: <FaCheckCircle />,
    };
  }

  // end شده ولی ادمین هنوز cleared رو ۱ نکرده — اینجا دو زیرحالت داریم:
  // خودِ فیش (clear) رو تعمیرکار فرستاده یا نه
  if (status === 1 && end === 1 && cleared === 0) {
    if (clear) {
      return {
        type: "waiting_approval",
        text: "به اتمام رسیده (تسویه ثبت شده است)",
        className: "text-success fw-semibold",
        icon: <FaCoins />,
      };
    }

    return {
      type: "waiting_payment",
      text: "به اتمام رسیده (تسویه ثبت نشده است)",
      className: "text-success fw-semibold",
      icon: <FaCoins />,
    };
  }

  if (status === 1 && end === 0) {
    return {
      type: "running",
      text: "درحال اجرا",
      className: "text-warning fw-semibold",
      icon: <FaPlayCircle />,
    };
  }

  return {
    type: "unknown",
    text: "وضعیت نامشخص",
    className: "text-muted fw-semibold",
    icon: <FaExclamationCircle />,

  };
}

// صفحه‌ی جزئیات یک سابقه (سمت تعمیرکار) — دقیقاً همون معماری/منطق RequestDetailPage:
// AuthCheck قبل از هرچیز، بعد گرفتن جزئیات از /detail، همون تابع وضعیت،
// همون فرمت تاریخ، همون چیدمان InfoField. تفاوت اصلی: اینجا دکمه‌ی
// «افزودن درخواست مرتبط» نیست (اون کار ادمینه) و به‌جاش وقتی درخواست
// هنوز تسویه نشده یه دکمه‌ی «تسویه درخواست» اضافه شده.
class MyRequestDetailPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      request: null,
      clear: null,
      loading: true,
      authenticated: false,
      error: "",
    };

    this.handleBack = this.handleBack.bind(this);
    this.handleChat = this.handleChat.bind(this);
  }

  componentDidMount() {
    if (!AuthCheck()) {
      return;
    }

    this.setState(
      {
        authenticated: true,
      },
      () => {
        this.getRequestDetail();
      }
    );
  }

  getRequestDetail = async () => {
    const { id } = this.props.params;

    const token = localStorage.getItem("token");

    console.log("REQUEST ID:", id);

    if (!id) {
      this.setState({
        loading: false,
        error: "شناسه درخواست پیدا نشد.",
      });

      return;
    }

    if (!token) {
      this.setState({
        loading: false,
        error: "توکن ورود پیدا نشد.",
      });

      return;
    }

    const url = `${API_URL}/detail?id=${encodeURIComponent(id)}`;

    console.log("REQUEST DETAIL URL:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("HTTP STATUS:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log("REQUEST DETAIL API:", data);

      if (String(data.status) !== "1") {
        this.setState({
          request: null,
          clear: null,
          loading: false,
          error: data.message || "اطلاعات درخواست پیدا نشد.",
        });

        return;
      }

      const request = data.request || null;
      const clear = data.clear || null;

      if (!request) {
        this.setState({
          request: null,
          clear: null,
          loading: false,
          error: "درخواست پیدا نشد.",
        });

        return;
      }

      this.setState({
        request,
        clear,
        loading: false,
        error: "",
      });
    } catch (error) {
      console.error("GET REQUEST DETAIL ERROR:", error);

      this.setState({
        request: null,
        clear: null,
        loading: false,
        error: "خطا در دریافت اطلاعات درخواست.",
      });
    }
  };

  handleBack() {
    this.props.navigate(-1);
  }

  handleChat() {
    console.log("رفتن به گفتگو");
  }

  render() {
    const {
      authenticated,
      request,
      clear,
      loading,
      error,
    } = this.state;

    if (!authenticated) {
      return null;
    }

    if (loading) {
      return <Loader />;
    }

    if (error) {
      return (
        <div dir="rtl" className="container px-3 py-5">
          <div className="text-center text-danger">{error}</div>
        </div>
      );
    }

    if (!request) {
      return (
        <div dir="rtl" className="container px-3 py-5">
          <div className="text-center text-muted">درخواست پیدا نشد.</div>
        </div>
      );
    }

    const technician = request.repairman_model;

    const technicianName = technician
      ? `${technician.name || ""} ${technician.family || ""}`.trim()
      : "—";

    const requestStatus = getRequestStatus(request, clear);

    const totalReceived = Number(request.sum || 0);
    const suppliesCost = Number(request.abzar || 0);
    const totalFee = totalReceived - suppliesCost;
    const commissionPercent = 50;
    const commissionAmount = Number(totalFee / 2 || 0);

    const receiptImage =
      request.file1 && request.file1 !== ""
        ? `${CLEAR_IMAGE_URL}/${request.file1}`
        : null;

    const relatedRequests = Array.isArray(request.siblings)
      ? request.siblings
      : [];

    // وقتی هنوز کار تموم نشده (در حال اجرا) → دکمه‌ی «اتمام درخواست»
    // وقتی کار تموم شده ولی هنوز ادمین تسویه رو تایید نکرده (حتی اگه فیش هم آپلود شده باشه) → دکمه‌ی «تسویه»
    const showEndButton = Number(request.end) === 0;
    const showSettleButton =
      requestStatus.type === "waiting_payment";
    const showBottomButton = showEndButton || showSettleButton;
    return (
      <div dir="rtl">
        <div
          className="container px-3 pt-4"
          style={{ paddingBottom: showBottomButton ? 100 : 40 }}
        >
          <div className="d-flex align-items-center justify-content-between mb-4">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}
>            
              <FaChevronLeft size={14} />
            </button>

            <button
              type="button"
              onClick={this.handleChat}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center text-danger"
              style={{ width: 36, height: 36 }}
            >
              <FaCommentDots size={16} />
            </button>
          </div>

          <InfoField
            icon={<FaClone size={18} />}
            label="شماره درخواست"
            value={request.code || "—"}
          />

          <InfoField
            icon={<FaUserCog size={18} />}
            label="نام تعمیرکار"
            value={technicianName}
          />

          <InfoField
            icon={<FaUserEdit size={18} />}
            label="نام مشتری"
            value={request.name || "—"}
          />

          <InfoField
            icon={<FaPhoneAlt size={18} />}
            label="شماره تماس مشتری"
            value={request.mobile || "—"}
          />

          <InfoField
            icon={<FaPhone size={18} />}
            label="تلفن ثابت"
            value={request.mobile2 || "—"}
          />

          <InfoField
            icon={<FaMapMarkerAlt size={18} />}
            label="استان"
            value={request.state_model?.name || "—"}
          />

          <InfoField
            icon={<FaMapMarkerAlt size={18} />}
            label="آدرس"
            value={request.address || "—"}
          />

          <InfoField
            icon={<FaMicrochip size={18} />}
            label="نوع دستگاه"
            value={request.device_type || "—"}
          />

          <InfoField
            icon={<FaTag size={18} />}
            label="برند دستگاه"
            value={request.device_brand || "—"}
          />

          <InfoField
            icon={<FaQuestionCircle size={18} />}
            label="ایراد دستگاه"
            value={request.problem || "—"}
          />

          <InfoField
            icon={<FaClock size={18} />}
            label="زمان مراجعه"
            value={formatDate(request.time)}
          />

          <InfoField
            icon={<FaSyncAlt size={18} />}
            label="توضیحات"
            value={request.description || "—"}
          />

          <InfoField icon={requestStatus.icon} label="وضعیت">
            <span className={requestStatus.className}>
              {requestStatus.text}
            </span>
          </InfoField>

          {request.end_description && (
            <InfoField
              icon={<FaExclamationCircle size={18} />}
              label={requestStatus.type === "canceled" ? "دلیل کنسلی" : "توضیحات وضعیت"}
              value={request.end_description}
            />
          )}

          {(requestStatus.type === "waiting_payment" ||
            requestStatus.type === "waiting_approval" ||
            requestStatus.type === "settled") && (
            <>
              <InfoField icon={<FaCoins size={18} />} label="کل دریافتی">
                <span className="fw-semibold">
                  {totalReceived.toLocaleString("fa-IR")} تومان
                </span>
              </InfoField>

              <InfoField
                icon={<FaCoins size={18} />}
                label="هزینه لوازم مصرفی"
              >
                <span className="fw-semibold">
                  {suppliesCost.toLocaleString("fa-IR")} تومان
                </span>
              </InfoField>

              <InfoField
                icon={<FaBoxOpen size={18} />}
                label="لوازم مصرفی"
                value={request.abzar_details || "—"}
              />

              <InfoField icon={<FaFileInvoice size={18} />} label="کل اجرت">
                <span className="fw-semibold">
                  {totalFee.toLocaleString("fa-IR")} تومان
                </span>
              </InfoField>

              <InfoField
                icon={<FaFileInvoice size={18} />}
                label={`پورسانت (%${commissionPercent})`}
              >
                <span className="fw-semibold">
                  {commissionAmount.toLocaleString("fa-IR")} تومان
                </span>
              </InfoField>

              {/* فیش واریزی فقط وقتی نشون داده می‌شه که رکورد clear واقعاً از سرور اومده باشه */}
              {clear && receiptImage && (
                <div className="d-flex align-items-center justify-content-between gap-3 border rounded-4 px-3 py-3 mb-3 bg-white">
                  <span className="text-muted">فیش واریزی:</span>

                  <img
                    src={receiptImage}
                    alt="فیش واریزی"
                    className="rounded-3 border"
                    style={{
                      width: 140,
                      height: 110,
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                  />
                </div>
              )}

              {clear && (clear.description || clear.desc) && (
                <InfoField
                  icon={<FaExclamationCircle size={18} />}
                  label="توضیحات تایید تسویه"
                  value={clear.description || clear.desc}
                />
              )}
            </>
          )}
        </div>

        {/* دکمه‌ی پایین صفحه — بسته به وضعیت، «اتمام درخواست» یا «تسویه» */}
        {showEndButton && (
          <div
            className="position-fixed bottom-0 start-0 w-100 px-3 pb-4 pt-2 bg-white"
            style={{ maxWidth: 576, margin: "0 auto", right: 0 }}
          >
            <Link
              to={`/requests/history/${request.id}/end`}
              className="btn btn-primary w-100 rounded-3 py-3 text-white text-decoration-none d-block text-center"
            >
              اتمام درخواست
            </Link>
          </div>
        )}

        {showSettleButton && (
          <div
            className="position-fixed bottom-0 start-0 w-100 px-3 pb-4 pt-2 bg-white"
            style={{ maxWidth: 576, margin: "0 auto", right: 0 }}
          >
            <Link
              to={`/requests/history/${request.id}/settle`}
              className="btn btn-primary w-100 rounded-3 py-3 text-white text-decoration-none d-block text-center"
            >
              تسویه
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(MyRequestDetailPage);