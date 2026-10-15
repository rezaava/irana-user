import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { fileUrl, apiGet } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";
import moment from "moment-jalaali";

class NotificationDetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { notification: null, loading: true };
    this.handleBack = this.handleBack.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.params;

    apiGet(`/ano?id=${id}`)
      .then((json) => {
        this.setState({
          notification: json.anos || null,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  handleBack() {
    this.props.navigate(-1);
  }

  formatDate(date) {
    if (!date) {
      return "";
    }

    return moment(date)
      .locale("fa")
      .format("jYYYY/jMM/jDD - HH:mm");
  }

  render() {
    const {
      notification,
      loading,
    } = this.state;

    return (
      <div className="container">
        {loading && <Loader />}

        <div
          className="container-fluid px-3 pt-4 pb-5"
          style={{
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div className="d-flex align-items-start mb-3">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
              }}
            >
              <FaChevronLeft size={14} />
            </button>

            {notification && (
              <div className="me-4">
                <div className="text-dark fw-semibold">
                  اطلاعیه #{notification.id}
                </div>

                <div className="text-muted small mt-1">
                  {this.formatDate(
                    notification.created_at
                  )}
                </div>
              </div>
            )}
          </div>

          {notification && (
            <>
              {notification.file && (
                <img
                  src={fileUrl(notification.file)}
                  alt={notification.title}
                  className="w-100 rounded-4 mb-3"
                  style={{
                    height: 260,
                    objectFit: "cover",
                  }}
                />
              )}

              <h2 className="fs-6 fw-semibold text-dark text-end mb-3">
                {notification.title}
              </h2>

              <p
                className="text-dark text-end mb-0"
                style={{
                  lineHeight: 2,
                  whiteSpace: "pre-line",
                }}
              >
                {notification.text}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(
  NotificationDetailPage
);