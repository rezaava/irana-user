import React from "react";
import { fileUrl, apiGet } from "../common/api";
import NotificationCard from "../components/NotificationCard";
import Loader from "../common/Loader";
import TechnicianNavbar from "../components/TechnicianNavbar";

// صفحه‌ی لیست اطلاعیه‌ها — وایر شده به GET /ano
class NotificationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { notifications: [], loading: true };
  }

  componentDidMount() {
    apiGet("/ano")
      .then((json) => {
        const anos = json.anos || [];
        const mapped = anos.map((a) => ({
          id: a.id,
          title: a.title,
          excerpt: a.text,
          image: fileUrl(a.file),
        }));
        this.setState({ notifications: mapped, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { notifications, loading } = this.state;

    return (
      <div>
        {loading && <Loader />}

        <div className="container-fluid px-3 pt-4" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
          {notifications.length === 0 && !loading ? (
            <div className="text-center text-muted py-5">اطلاعیه‌ای برای نمایش وجود ندارد.</div>
          ) : (
            notifications.map((n) => <NotificationCard key={n.id} notification={n} />)
          )}
        </div>

        <TechnicianNavbar />
      </div>
    );
  }
}

export default NotificationsPage;
