import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaBars,
  FaThLarge,
  FaSlidersH,
} from "react-icons/fa";
import { apiGet } from "../common/api";
import GenericTable from "../components/GenericTable";
import Loader from "../common/Loader";
import TechnicianNavbar from "../components/TechnicianNavbar";

// =========================================================
// رنگ وضعیت بر اساس فیلدهای درخواست
// =========================================================

function statusColor(request) {
  const status = Number(request?.status);
  const end = Number(request?.end);
  const cleared = Number(request?.cleared);
  const deleted = Number(request?.deleted);

  // حذف شده توسط ادمین
  if (deleted === 1) {
    return "#dc3545";
  }

  // فعال‌سازی مجدد
  if (status === 4) {
    return "#000000";
  }

  // رد شده
  if (status === -1) {
    return "#dc3545";
  }

  // لغو شده
  if (status === 3 || end === 2) {
    return "#dc3545";
  }

  // =====================================================
  // پایان یافته
  // =====================================================

  if (
    status === 2 ||
    (status === 1 && end === 1)
  ) {
    // تسویه شده
    if (cleared === 1) {
      return "#0d6efd";
    }

    // در انتظار پرداخت
    return "#198754";
  }

  // =====================================================
  // در حال انجام
  // =====================================================

  if (
    status === 1 &&
    end === 0
  ) {
    return "#ffc107";
  }

  // =====================================================
  // ایجاد شده
  // =====================================================

  if (status === 0) {
    return "#6c757d";
  }

  // وضعیت نامشخص
  return "#6c757d";
}

// =========================================================
// متن وضعیت برای title
// =========================================================

function statusText(request) {
  const status = Number(request?.status);
  const end = Number(request?.end);
  const cleared = Number(request?.cleared);
  const deleted = Number(request?.deleted);

  if (deleted === 1) {
    return "حذف شده توسط ادمین";
  }

  if (status === 4) {
    return "فعال شده مجدد";
  }

  if (status === -1) {
    return "رد شده";
  }

  if (status === 3 || end === 2) {
    return "لغو شده";
  }

  if (
    status === 2 ||
    (status === 1 && end === 1)
  ) {
    if (cleared === 1) {
      return "تسویه شده";
    }

    return "در انتظار پرداخت";
  }

  if (
    status === 1 &&
    end === 0
  ) {
    return "در حال انجام";
  }

  if (status === 0) {
    return "ایجاد شده";
  }

  return "وضعیت نامشخص";
}

// =========================================================
// کارت یک سابقه، برای حالت گرید
// =========================================================

function HistoryCard({ request }) {
  return (
    <div className="border rounded-4 p-3 bg-white h-100 d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-dark">
          {request.name}
        </span>

        <span className="text-muted small">
          مشتری
        </span>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-dark">
          {request.device_type}
        </span>

        <span className="text-muted small">
          نوع دستگاه
        </span>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-dark">
          {request.problem}
        </span>

        <span className="text-muted small">
          ایراد دستگاه
        </span>
      </div>

      {/* جزئیات + وضعیت */}

      <div className="d-flex align-items-center gap-2 mt-auto">
        <span
          className="rounded-circle flex-shrink-0"
          title={statusText(request)}
          style={{
            width: 16,
            height: 16,
            backgroundColor: statusColor(request),
            display: "inline-block",
          }}
        />

        <Link
          to={`/requests/history/${request.id}`}
          className="btn btn-outline-primary rounded-3 flex-grow-1"
        >
          دیدن جزئیات
        </Link>
      </div>
    </div>
  );
}

// =========================================================
// صفحه سوابق
// =========================================================

class MyRequestsHistoryPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      loading: true,
      searchTerm: "",
      viewMode: "list",
    };

    this.handleSearchChange =
      this.handleSearchChange.bind(this);
  }

  // =========================================================
  // دریافت سوابق
  // =========================================================

  componentDidMount() {
    apiGet("/my-list")
      .then((json) => {
        this.setState({
          requests: Array.isArray(json.requests)
            ? json.requests
            : [],
          loading: false,
        });
      })
      .catch((error) => {
        console.error(
          "GET MY REQUESTS HISTORY ERROR:",
          error
        );

        this.setState({
          requests: [],
          loading: false,
        });
      });
  }

  // =========================================================
  // Search
  // =========================================================

  handleSearchChange(e) {
    this.setState({
      searchTerm: e.target.value,
    });
  }

  // =========================================================
  // Render
  // =========================================================

  render() {
    const {
      requests,
      loading,
      searchTerm,
      viewMode,
    } = this.state;

    const filtered = requests.filter((r) => {
      const term = searchTerm.trim();

      if (!term) {
        return true;
      }

      return (
        (r.name || "").includes(term) ||
        (r.device_type || "").includes(term) ||
        (r.device_brand || "").includes(term) ||
        (r.problem || "").includes(term)
      );
    });

    // =========================================================
    // جدول
    // =========================================================

    const columns = [
      {
        key: "name",
        label: "نام مشتری",
        headerClassName: "text-primary",
      },

      {
        key: "device_type",
        label: "نوع دستگاه",
        headerClassName: "text-primary",
      },

      {
        key: "problem",
        label: "ایراد دستگاه",
        headerClassName: "text-primary",
      },

      {
        key: "details",
        label: "جزئیات",
        width: "0.6fr",
        headerClassName: "text-primary",

        render: (row) => (
          <div className="d-flex align-items-center justify-content-center gap-2">
            {/* دایره وضعیت */}

            <span
              className="rounded-circle flex-shrink-0"
              title={statusText(row)}
              style={{
                width: 16,
                height: 16,
                backgroundColor:
                  statusColor(row),
                display: "inline-block",
              }}
            />

            {/* آیکن جزئیات */}

            <FaSlidersH
              className="text-secondary"
              size={13}
              style={{
                transform: "rotate(90deg)",
              }}
            />
          </div>
        ),
      },
    ];

    return (
      <div>
        {loading && <Loader />}

        <div
          className="container-fluid px-3 pt-4"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            paddingBottom: 100,
          }}
        >
          {/* =====================================================
              Search
          ===================================================== */}

          <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2 mb-3 bg-white" style={{ marginLeft: "40px" }}>
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={
                this.handleSearchChange
              }
              className="form-control border-0 shadow-none text-end p-0"
            />

            <FaSearch
              className="text-secondary"
              size={16}
            />
          </div>

          {/* =====================================================
              View Mode
          ===================================================== */}

          <div className="d-flex align-items-center gap-2 mb-3">
            {/* List */}

            <button
              type="button"
              onClick={() =>
                this.setState({
                  viewMode: "list",
                })
              }
              className={`btn ${
                viewMode === "list"
                  ? "btn-light border-primary text-primary"
                  : "btn-light border"
              } rounded-3 p-2`}
            >
              <FaBars size={16} />
            </button>

            {/* Grid */}

            <button
              type="button"
              onClick={() =>
                this.setState({
                  viewMode: "grid",
                })
              }
              className={`btn ${
                viewMode === "grid"
                  ? "btn-light border-primary text-primary"
                  : "btn-light border"
              } rounded-3 p-2`}
            >
              <FaThLarge size={16} />
            </button>
          </div>

          {/* =====================================================
              Empty
          ===================================================== */}

          {filtered.length === 0 &&
            !loading && (
              <div className="text-center text-muted py-5">
                موردی برای نمایش وجود ندارد.
              </div>
            )}

          {/* =====================================================
              Grid
          ===================================================== */}

          {viewMode === "grid" ? (
            <div className="row g-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="col-6"
                >
                  <HistoryCard
                    request={r}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* =====================================================
               List
            ===================================================== */

            <GenericTable
              columns={columns}
              rows={filtered}
              getRowLink={(row) =>
                `/requests/history/${row.id}`
              }
            />
          )}
        </div>

        <TechnicianNavbar />
      </div>
    );
  }
}

export default MyRequestsHistoryPage;