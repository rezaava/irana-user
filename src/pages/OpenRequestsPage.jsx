import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaBars, FaThLarge, FaSlidersH } from "react-icons/fa";
import { apiGet } from "../common/api";
import GenericTable from "../components/GenericTable";
import Loader from "../common/Loader";
import moment from "moment-jalaali";
import TechnicianNavbar from "../components/TechnicianNavbar";

function handleJalaliDate(date) {
  if (!date) return "—";

  const englishDate = date.toString().replace(/[۰-۹٠-٩]/g, (digit) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic = "٠١٢٣٤٥٦٧٨٩";
    const index = persian.indexOf(digit);
    return index !== -1 ? index : arabic.indexOf(digit);
  });

  const parsedDate = moment(englishDate, "YYYY-MM-DD", true);

  if (!parsedDate.isValid()) return "—";

  return parsedDate.format("jYYYY/jMM/jDD");
}

// کارت یک درخواست باز
function OpenRequestCard({ request }) {
  return (
    <div className="border rounded-4 p-3 bg-white h-100 d-flex flex-column">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small">استان</span>
        <span className="text-dark">
          {request.state_model ? request.state_model.name : "---"}
        </span>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted small">نوع دستگاه</span>
        <span className="text-dark">{request.device_type}</span>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted small">زمان</span>
        <span className="text-dark">{handleJalaliDate(request.time)}</span>
      </div>

      <Link
        to={`/requests/open/${request.id}`}
        className="btn btn-outline-primary rounded-3 mt-auto"
      >
        دیدن جزئیات
      </Link>
    </div>
  );
}

// صفحه درخواست‌های باز
class OpenRequestsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      loading: true,
      searchTerm: "",
      viewMode: "grid",
    };

    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  componentDidMount() {
    apiGet("/list")
      .then((json) => {
        this.setState({
          requests: json.requests || [],
          loading: false,
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleSearchChange(e) {
    this.setState({ searchTerm: e.target.value });
  }

  render() {
    const { requests, loading, searchTerm, viewMode } = this.state;

    const filtered = requests.filter((r) => {
      const term = searchTerm.trim();

      if (!term) return true;

      return (
        (r.device_type || "").includes(term) ||
        (r.name || "").includes(term)
      );
    });

    const columns = [
      {
        key: "state",
        label: "استان",
        headerClassName: "text-primary",
        render: (row) => (
          <span className="small">
            {row.state_model ? row.state_model.name : "---"}
          </span>
        ),
      },
      {
        key: "device_type",
        label: "نوع دستگاه",
        headerClassName: "text-primary",
      },
      {
        key: "time",
        label: "زمان مراجعه",
        headerClassName: "text-primary",
        render: (row) => <span>{handleJalaliDate(row.time)}</span>,
      },
      {
        key: "details",
        label: "جزئیات",
        width: "0.6fr",
        headerClassName: "text-primary",
        render: () => (
          <FaSlidersH
            className="text-secondary mx-auto"
            size={14}
            style={{ transform: "rotate(90deg)" }}
          />
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
          {/* جستجو */}
          <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2 mb-3 bg-white">
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={this.handleSearchChange}
              className="form-control border-0 shadow-none text-end p-0"
            />
            <FaSearch className="text-secondary" size={16} />
          </div>

          {/* تغییر نمای گرید و لیست */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => this.setState({ viewMode: "list" })}
              className={`btn ${
                viewMode === "list"
                  ? "btn-light border-primary text-primary"
                  : "btn-light border"
              } rounded-3 p-2`}
            >
              <FaBars size={16} />
            </button>

            <button
              type="button"
              onClick={() => this.setState({ viewMode: "grid" })}
              className={`btn ${
                viewMode === "grid"
                  ? "btn-light border-primary text-primary"
                  : "btn-light border"
              } rounded-3 p-2`}
            >
              <FaThLarge size={16} />
            </button>
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center text-muted py-5">
              درخواستی برای نمایش وجود ندارد.
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="row g-3">
              {filtered.map((r) => (
                <div key={r.id} className="col-6">
                  <OpenRequestCard request={r} />
                </div>
              ))}
            </div>
          ) : (
            <GenericTable
              columns={columns}
              rows={filtered}
              getRowLink={(row) => `/requests/open/${row.id}`}
            />
          )}
        </div>

        <TechnicianNavbar />
      </div>
    );
  }
}

export default OpenRequestsPage;