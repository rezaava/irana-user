import React from "react";
import { Link } from "react-router-dom";
import {
  FaUserEdit,
  FaUserShield,
  FaCalendarAlt,
  FaIdCard,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaPhone,
  FaImage,
  FaUsers,
  FaGraduationCap,
  FaBook,
  FaChevronLeft,
} from "react-icons/fa";
import { apiGet, fileUrl } from "../common/api";
import InfoField from "../components/InfoField";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

// صفحه‌ی اطلاعات شخصی — وایر شده به GET /profile
class PersonalInfoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { person: null, loading: true };
    this.handleBack = this.handleBack.bind(this);
  }

  componentDidMount() {
    apiGet("/profile")
      .then((json) => {
        this.setState({ person: json.user || null, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleBack() {
    this.props.navigate(-1);
  }

  render() {
    const { person, loading } = this.state;

    return (
      <div>
        {loading && <Loader />}

        <div className="container px-3 pt-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button
              type="button"
              onClick={this.handleBack}
              className="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36 }}
            >
              <FaChevronLeft size={14} />
            </button>
            <h1 className="fs-6 fw-semibold text-dark m-0">اطلاعات شخصی</h1>
            <div style={{ width: 36 }} />
          </div>

          {person && (
            <>
              <InfoField icon={<FaUserEdit size={18} />} label="نام" value={person.name} />
              <InfoField icon={<FaUserShield size={18} />} label="نام خانوادگی" value={person.family} />
              <InfoField icon={<FaCalendarAlt size={18} />} label="تاریخ تولد" value={person.birthdate} />
              <InfoField icon={<FaIdCard size={18} />} label="کد ملی" value={person.national_code} />
              <InfoField icon={<FaMapMarkerAlt size={18} />} label="محل تولد" value={person.birth_city} />

              {person.national_image && (
                <div className="d-flex align-items-start justify-content-between gap-3 border rounded-4 px-3 py-3 mb-3 bg-white">
                  <span className="text-muted">تصویر کارت ملی:</span>
                  <img
                    src={fileUrl('files/user'+person.national_image)}
                    alt="تصویر کارت ملی"
                    className="rounded-3 border"
                    style={{ width: 160, height: 110, objectFit: "cover" }}
                  />
                </div>
              )}

              <InfoField icon={<FaShieldAlt size={18} />} label="وضعیت نظام وظیفه" value={person.sarbazi} />
              <InfoField icon={<FaPhone size={18} />} label="شماره تماس" value={person.mobile} />
              <InfoField icon={<FaImage size={18} />} label="آدرس" value={person.address} />
              <InfoField
                icon={<FaUsers size={18} />}
                label="وضعیت تاهل"
                value={Number(person.married) === 1 ? "متاهل" : "مجرد"}
              />

              <h2 className="fs-6 fw-semibold text-dark mt-4 mb-3 text-end">سوابق تحصیلی:</h2>
              <InfoField icon={<FaGraduationCap size={18} />} label="مدرک تحصیلی" value={person.degree} />
              <InfoField icon={<FaBook size={18} />} label="رشته تحصیلی" value={person.reshte} />

              {person.image && (
                <div className="d-flex align-items-start justify-content-between gap-3 border rounded-4 px-3 py-3 mb-3 bg-white">
                  <span className="text-muted">تصویر سلفی:</span>
                  <img
                    src={fileUrl('files/user'+person.image)}
                    alt="تصویر سلفی"
                    className="rounded-3 border"
                    style={{ width: 160, height: 140, objectFit: "cover" }}
                  />
                </div>
              )}

              <h2 className="fs-6 fw-semibold text-dark mt-4 mb-3 text-end">استان و شهر:</h2>
              <InfoField
                icon={<FaMapMarkerAlt size={18} />}
                label="استان"
                value={person.state_model ? person.state_model.name : ""}
              />
              <InfoField
                icon={<FaImage size={18} />}
                label="شهر"
                value={person.city_model ? person.city_model.name : ""}
              />

              {/* دکمه‌ی ویرایش — همون فرم ثبت‌نام رو تو حالت ویرایش باز می‌کنه، از قبل پر شده با اطلاعات فعلی */}
              <Link
                to="/profile/edit"
                className="btn btn-primary w-100 rounded-3 py-3 mt-2 d-block text-center"
              >
                ویرایش
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(PersonalInfoPage);