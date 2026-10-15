import React from "react";
import {
  FaUserEdit,
  FaUserShield,
  FaCalendarAlt,
  FaIdCard,
  FaMapMarkerAlt,
  FaFolderOpen,
  FaShieldAlt,
  FaMobileAlt,
  FaImage,
  FaGraduationCap,
  FaBook,
  FaChevronRight,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { apiGet, apiPost, fileUrl } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

function StepHeader({ step }) {
  const steps = [
    { number: 1, label: "اطلاعات شخصی" },
    { number: 2, label: "سوابق" },
    { number: 3, label: "انتخاب شهر" },
  ];

  return (
    <div className="d-flex align-items-center justify-content-between mb-4">
      {steps.map((s, idx) => (
        <React.Fragment key={s.number}>
          {idx > 0 && (
            <span
              className="text-primary"
              style={{ fontSize: 18 }}
            >
              &#8592;
            </span>
          )}

          <div className="d-flex flex-column align-items-center gap-1">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 34,
                height: 34,
                backgroundColor:
                  s.number === step ? "#4f5bd5" : "#d9dbe9",
                color:
                  s.number === step ? "#fff" : "#8a8fa3",
                fontWeight: "bold",
                transition: "background-color 0.2s ease",
              }}
            >
              {s.number}
            </div>

            <span
              className={`small ${
                s.number === step
                  ? "text-dark fw-semibold"
                  : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

const SARBAZI_OPTIONS = [
  { value: "1", label: "پایان خدمت" },
  { value: "0", label: "اعزام نشده" },
];

const DEGREE_OPTIONS = [
  "دیپلم",
  "فوق دیپلم",
  "لیسانس",
  "فوق لیسانس",
];

class TechnicianRegisterWizard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      loading: false,
      errorMessage: "",
      isSpecialsModalOpen: false,

      // مرحله ۱
      name: "",
      family: "",
      birthdate: "",
      national_code: "",
      birth_city: "",
      national_image_file: null,
      national_image_preview: "",
      mobile: "",
      address: "",
      sarbazi: "",
      married: 0,

      // مرحله ۲
      degree: "",
      reshte: "",
      selfie_file: null,
      selfie_preview: "",
      allSpecials: [],
      selectedSpecials: [],

      // مرحله ۳
      states: [],
      cities: [],
      state: "",
      city: "",
    };

    this.nationalImageRef = React.createRef();
    this.selfieRef = React.createRef();

    this.handleField = this.handleField.bind(this);
    this.handleNationalImageChange =
      this.handleNationalImageChange.bind(this);
    this.handleSelfieChange =
      this.handleSelfieChange.bind(this);

    this.goToStep2 = this.goToStep2.bind(this);
    this.goToStep3 = this.goToStep3.bind(this);
    this.goBack = this.goBack.bind(this);

    this.handleToggleSpecial =
      this.handleToggleSpecial.bind(this);
    this.handleRemoveSpecial =
      this.handleRemoveSpecial.bind(this);
    this.handleStateChange =
      this.handleStateChange.bind(this);

    this.handleSubmit =
      this.handleSubmit.bind(this);
    this.loadProfileForEdit =
      this.loadProfileForEdit.bind(this);

    this.validateStep1 =
      this.validateStep1.bind(this);
    this.validateStep2 =
      this.validateStep2.bind(this);
    this.validateStep3 =
      this.validateStep3.bind(this);
  }

  componentDidMount() {
    Promise.all([
      apiGet("/specials"),
      apiGet("/cities"),
    ])
      .then(([specialsJson, citiesJson]) => {
        this.setState(
          {
            allSpecials: specialsJson.specials || [],
            states: citiesJson.states || [],
          },
          () => {
            if (this.props.editMode) {
              this.loadProfileForEdit();
            }
          }
        );
      })
      .catch(() => {
        this.setState({
          errorMessage:
            "خطا در دریافت اطلاعات اولیه",
        });
      });
  }

  loadProfileForEdit() {
    this.setState({ loading: true });

    apiGet("/profile")
      .then((json) => {
        const person = json.user || {};
        const { allSpecials } = this.state;

        let personSpecialIds = [];

        try {
          const raw = person.specials;

          if (Array.isArray(raw)) {
            personSpecialIds = raw;
          } else if (
            typeof raw === "string" &&
            raw.trim()
          ) {
            personSpecialIds = JSON.parse(raw);
          }
        } catch (error) {
          personSpecialIds = [];
        }

        const selectedSpecials =
          allSpecials.filter((sp) =>
            personSpecialIds
              .map(String)
              .includes(String(sp.id))
          );

        this.setState(
          {
            name: person.name || "",
            family: person.family || "",
            birthdate: person.birthdate || "",
            national_code:
              person.national_code || "",
            birth_city: person.birth_city || "",

            national_image_preview:
              person.national_image
                ? fileUrl(
                    "files/user" +
                      person.national_image
                  )
                : "",

            mobile: person.mobile || "",
            address: person.address || "",

            sarbazi:
              person.sarbazi !== undefined &&
              person.sarbazi !== null
                ? String(person.sarbazi)
                : "",

            married:
              Number(person.married) === 1
                ? 1
                : 0,

            degree: person.degree || "",
            reshte: person.reshte || "",

            selfie_preview: person.image
              ? fileUrl(
                  "files/user" + person.image
                )
              : "",

            selectedSpecials,

            state: person.state || "",
            city: person.city || "",

            loading: false,
          },
          () => {
            if (this.state.state) {
              apiGet(
                `/cities?id=${this.state.state}`
              ).then((cityJson) => {
                this.setState({
                  cities:
                    cityJson.cities || [],
                });
              });
            }
          }
        );
      })
      .catch(() => {
        this.setState({
          loading: false,
          errorMessage:
            "خطا در دریافت اطلاعات پروفایل",
        });
      });
  }

  handleField(field) {
    return (e) => {
      let value = e.target.value;

      if (
        field === "national_code" ||
        field === "mobile"
      ) {
        value = value.replace(/\D/g, "");
      }

      if (field === "national_code") {
        value = value.slice(0, 10);
      }

      if (field === "mobile") {
        value = value.slice(0, 11);
      }

      this.setState({
        [field]: value,
        errorMessage: "",
      });
    };
  }

  handleNationalImageChange(e) {
    const file =
      e.target.files &&
      e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      this.setState({
        errorMessage:
          "فایل کارت ملی باید تصویر باشد",
      });

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.setState({
        national_image_file: file,
        national_image_preview:
          reader.result,
        errorMessage: "",
      });
    };

    reader.readAsDataURL(file);
  }

  handleSelfieChange(e) {
    const file =
      e.target.files &&
      e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      this.setState({
        errorMessage:
          "فایل سلفی باید تصویر باشد",
      });

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.setState({
        selfie_file: file,
        selfie_preview: reader.result,
        errorMessage: "",
      });
    };

    reader.readAsDataURL(file);
  }

  validateStep1() {
    const {
      name,
      family,
      birthdate,
      national_code,
      birth_city,
      national_image_file,
      national_image_preview,
      mobile,
      address,
      sarbazi,
    } = this.state;

    const isEdit = !!this.props.editMode;

    if (!name.trim()) {
      return "نام الزامی است";
    }

    if (!family.trim()) {
      return "نام خانوادگی الزامی است";
    }

    if (!birthdate) {
      return "تاریخ تولد الزامی است";
    }

    if (!national_code) {
      return "کد ملی الزامی است";
    }

    if (!/^\d+$/.test(national_code)) {
      return "کد ملی باید فقط شامل عدد باشد";
    }

    if (national_code.length !== 10) {
      return "کد ملی باید دقیقاً ۱۰ رقم باشد";
    }

    if (!birth_city.trim()) {
      return "محل تولد الزامی است";
    }

    if (
      !isEdit &&
      !national_image_file &&
      !national_image_preview
    ) {
      return "تصویر کارت ملی الزامی است";
    }

    if (!mobile) {
      return "شماره موبایل الزامی است";
    }

    if (!/^\d+$/.test(mobile)) {
      return "شماره موبایل باید فقط شامل عدد باشد";
    }

    if (mobile.length !== 11) {
      return "شماره موبایل باید دقیقاً ۱۱ رقم باشد";
    }

    if (!mobile.startsWith("09")) {
      return "شماره موبایل باید با ۰۹ شروع شود";
    }

    if (!address.trim()) {
      return "آدرس الزامی است";
    }

    if (sarbazi === "") {
      return "وضعیت نظام وظیفه را انتخاب کنید";
    }

    return "";
  }

  validateStep2() {
    const {
      degree,
      reshte,
      selfie_file,
      selfie_preview,
    } = this.state;

    const isEdit = !!this.props.editMode;

    if (!degree) {
      return "مدرک تحصیلی را انتخاب کنید";
    }

    if (!reshte.trim()) {
      return "رشته تحصیلی الزامی است";
    }

    if (
      !isEdit &&
      !selfie_file &&
      !selfie_preview
    ) {
      return "تصویر سلفی الزامی است";
    }

    /*
     * تخصص عمداً اینجا بررسی نمی‌شود.
     * انتخاب تخصص اختیاری است.
     */

    return "";
  }

  validateStep3() {
    const { state, city } = this.state;

    if (!state) {
      return "استان را انتخاب کنید";
    }

    if (!city) {
      return "شهر را انتخاب کنید";
    }

    return "";
  }

  goToStep2(e) {
    e.preventDefault();

    const error = this.validateStep1();

    if (error) {
      this.setState({
        errorMessage: error,
      });

      return;
    }

    this.setState({
      step: 2,
      errorMessage: "",
    });
  }

  goToStep3(e) {
    e.preventDefault();

    const error = this.validateStep2();

    if (error) {
      this.setState({
        errorMessage: error,
      });

      return;
    }

    this.setState({
      step: 3,
      errorMessage: "",
    });
  }

  goBack() {
    this.setState((prev) => ({
      step: Math.max(
        1,
        prev.step - 1
      ),
      errorMessage: "",
    }));
  }

  handleToggleSpecial(special) {
    this.setState((prev) => {
      const exists =
        prev.selectedSpecials.find(
          (s) => s.id === special.id
        );

      if (exists) {
        return {
          selectedSpecials:
            prev.selectedSpecials.filter(
              (s) => s.id !== special.id
            ),
        };
      }

      return {
        selectedSpecials: [
          ...prev.selectedSpecials,
          special,
        ],
      };
    });
  }

  handleRemoveSpecial(id) {
    this.setState((prev) => ({
      selectedSpecials:
        prev.selectedSpecials.filter(
          (s) => s.id !== id
        ),
    }));
  }

  handleStateChange(e) {
    const stateId = e.target.value;

    this.setState({
      state: stateId,
      city: "",
      cities: [],
      errorMessage: "",
    });

    if (stateId) {
      apiGet(`/cities?id=${stateId}`).then(
        (json) => {
          this.setState({
            cities: json.cities || [],
          });
        }
      );
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const error = this.validateStep3();

    if (error) {
      this.setState({
        errorMessage: error,
      });

      return;
    }

    const s = this.state;
    const isEdit = !!this.props.editMode;

    this.setState({
      loading: true,
      errorMessage: "",
    });

    const formData = new FormData();

    formData.append("name", s.name);
    formData.append("family", s.family);
    formData.append(
      "birthdate",
      s.birthdate
    );
    formData.append(
      "national_code",
      s.national_code
    );
    formData.append(
      "birth_city",
      s.birth_city
    );
    formData.append("mobile", s.mobile);
    formData.append("address", s.address);
    formData.append("sarbazi", s.sarbazi);
    formData.append("married", s.married);
    formData.append("degree", s.degree);
    formData.append("reshte", s.reshte);
    formData.append("state", s.state);
    formData.append("city", s.city);

    /*
     * تخصص اختیاری است.
     * اگر چیزی انتخاب نشده باشد [] ارسال می‌شود.
     */
    formData.append(
      "specials",
      JSON.stringify(
        s.selectedSpecials.map(
          (sp) => sp.id
        )
      )
    );

    if (s.national_image_file) {
      formData.append(
        "national_image",
        s.national_image_file
      );
    }

    if (s.selfie_file) {
      formData.append(
        "image",
        s.selfie_file
      );
    }

    const endpoint = isEdit
      ? "/change"
      : "/register";

    apiPost(
      endpoint,
      formData,
      true
    )
      .then((json) => {
        this.setState({
          loading: false,
        });

        if (json.status === "1") {
          if (isEdit) {
            this.props.navigate(
              "/profile"
            );
          } else {
            this.props.navigate(
              "/login"
            );
          }
        } else {
          this.setState({
            errorMessage:
              json.message ||
              "خطا در ثبت اطلاعات",
          });
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
          errorMessage:
            "ارتباط با سرور برقرار نشد",
        });
      });
  }

  renderStep1() {
    const {
      name,
      family,
      birthdate,
      national_code,
      birth_city,
      national_image_preview,
      mobile,
      address,
      sarbazi,
      married,
    } = this.state;

    return (
      <form onSubmit={this.goToStep2}>
        <h2 className="fs-6 fw-semibold text-dark text-center mb-4">
          اطلاعات خود را با دقت وارد کنید
        </h2>

        <Field
          icon={<FaUserEdit size={18} />}
          placeholder="نام"
          value={name}
          onChange={this.handleField("name")}
        />

        <Field
          icon={<FaUserShield size={18} />}
          placeholder="نام خانوادگی"
          value={family}
          onChange={this.handleField("family")}
        />

        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={birthdate}
            onChange={(date) => {
              this.setState({
                birthdate: date
                  ? date.format(
                      "YYYY/MM/DD"
                    )
                  : "",
                errorMessage: "",
              });
            }}
            format="YYYY/MM/DD"
            calendarPosition="bottom-right"
            inputClass="form-control border-0 shadow-none text-end p-0"
            placeholder="تاریخ تولد"
          />

          <FaCalendarAlt
            className="text-secondary"
            size={18}
          />
        </div>

        <Field
          icon={<FaIdCard size={18} />}
          placeholder="کد ملی"
          value={national_code}
          onChange={this.handleField(
            "national_code"
          )}
          type="tel"
          inputMode="numeric"
          maxLength={10}
        />

        <Field
          icon={
            <FaMapMarkerAlt size={18} />
          }
          placeholder="محل تولد"
          value={birth_city}
          onChange={this.handleField(
            "birth_city"
          )}
        />

        <ImagePicker
          label="تصویر کارت ملی"
          preview={national_image_preview}
          inputRef={this.nationalImageRef}
          onChange={
            this.handleNationalImageChange
          }
        />

        <Field
          icon={<FaMobileAlt size={18} />}
          placeholder="شماره موبایل"
          value={mobile}
          onChange={this.handleField(
            "mobile"
          )}
          type="tel"
          inputMode="numeric"
          maxLength={11}
        />

        <div className="text-muted small text-end mb-3">
          بعد از ثبت نام نمی‌توانید شماره
          موبایل را تغییر دهید
        </div>

        <Field
          icon={<FaImage size={18} />}
          placeholder="آدرس"
          value={address}
          onChange={this.handleField(
            "address"
          )}
        />

        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
          <FaShieldAlt
            className="text-secondary"
            size={18}
          />

          <select
            value={sarbazi}
            onChange={this.handleField(
              "sarbazi"
            )}
            className="form-select border-0 bg-transparent text-end shadow-none flex-grow-1"
          >
            <option value="">
              وضعیت نظام وظیفه
            </option>

            {SARBAZI_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
              >
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <span className="text-muted">
            وضعیت تاهل:
          </span>

          <div className="d-flex align-items-center gap-4">
            <label className="d-flex align-items-center gap-2">
              <span>مجرد</span>

              <input
                type="radio"
                name="married"
                checked={married === 0}
                onChange={() =>
                  this.setState({
                    married: 0,
                  })
                }
              />
            </label>

            <label className="d-flex align-items-center gap-2">
              <span>متاهل</span>

              <input
                type="radio"
                name="married"
                checked={married === 1}
                onChange={() =>
                  this.setState({
                    married: 1,
                  })
                }
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 rounded-3 py-3"
        >
          مرحله بعد
        </button>
      </form>
    );
  }

  renderStep2() {
    const {
      degree,
      reshte,
      selfie_preview,
      selectedSpecials,
    } = this.state;

    return (
      <form onSubmit={this.goToStep3}>
        <h2 className="fs-6 fw-semibold text-dark text-center mb-4">
          سوابق خود را با دقت وارد کنید
        </h2>

        <div className="text-muted small text-end mb-2">
          سوابق تحصیلی:
        </div>

        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
          <FaGraduationCap
            className="text-secondary"
            size={18}
          />

          <select
            value={degree}
            onChange={this.handleField(
              "degree"
            )}
            className="form-select border-0 bg-transparent text-end shadow-none flex-grow-1"
          >
            <option value="">
              مدرک تحصیلی
            </option>

            {DEGREE_OPTIONS.map((d) => (
              <option
                key={d}
                value={d}
              >
                {d}
              </option>
            ))}
          </select>
        </div>

        <Field
          icon={<FaBook size={18} />}
          placeholder="رشته تحصیلی"
          value={reshte}
          onChange={this.handleField(
            "reshte"
          )}
        />

        <ImagePicker
          label="تصویر سلفی"
          preview={selfie_preview}
          inputRef={this.selfieRef}
          onChange={
            this.handleSelfieChange
          }
        />

        <div className="border rounded-3 px-3 py-3 mb-4">
          <div className="text-muted small text-end mb-2">
            تخصص ها
          </div>

          {selectedSpecials.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3 justify-content-end">
              {selectedSpecials.map((sp) => (
                <span
                  key={sp.id}
                  className="badge bg-light text-dark border d-flex align-items-center gap-2 py-2 px-3"
                >
                  {sp.name}

                  <FaTimes
                    size={11}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      this.handleRemoveSpecial(
                        sp.id
                      )
                    }
                  />
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              this.setState({
                isSpecialsModalOpen: true,
              })
            }
            className="btn btn-primary rounded-pill w-100 py-2 d-flex align-items-center justify-content-center gap-2"
          >
            <FaPlus size={14} />
            <span>افزودن</span>
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 rounded-3 py-3"
        >
          مرحله بعد
        </button>
      </form>
    );
  }

  renderStep3() {
    const {
      states,
      cities,
      state,
      city,
    } = this.state;

    const isEdit =
      !!this.props.editMode;

    return (
      <form onSubmit={this.handleSubmit}>
        <h2 className="fs-6 fw-semibold text-dark text-center mb-4">
          استان و شهر خود را برای فعالیت انتخاب کنید
        </h2>

        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
          <FaMapMarkerAlt
            className="text-secondary"
            size={18}
          />

          <select
            value={state}
            onChange={
              this.handleStateChange
            }
            className="form-select border-0 bg-transparent text-end shadow-none flex-grow-1"
          >
            <option value="">
              استان
            </option>

            {states.map((st) => (
              <option
                key={st.id}
                value={st.id}
              >
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-4 bg-white">
          <FaImage
            className="text-secondary"
            size={18}
          />

          <select
            value={city}
            onChange={this.handleField(
              "city"
            )}
            className="form-select border-0 bg-transparent text-end shadow-none flex-grow-1"
          >
            <option value="">
              شهر
            </option>

            {cities.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 rounded-3 py-3"
        >
          {isEdit
            ? "ذخیره تغییرات"
            : "ورود به سیستم"}
        </button>
      </form>
    );
  }

  renderSpecialsModal() {
    const {
      isSpecialsModalOpen,
      allSpecials,
      selectedSpecials,
    } = this.state;

    if (!isSpecialsModalOpen) {
      return null;
    }

    const isChecked = (id) =>
      !!selectedSpecials.find(
        (s) => s.id === id
      );

    const close = () =>
      this.setState({
        isSpecialsModalOpen: false,
      });

    return (
      <>
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            background:
              "rgba(0,0,0,0.5)",
            zIndex: 1040,
          }}
          onClick={close}
        />

        <div
          className="position-fixed bottom-0 start-0 w-100 bg-white rounded-top-4 px-3 pt-3 pb-4"
          style={{
            zIndex: 1050,
            maxWidth: 480,
            margin: "0 auto",
            right: 0,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button
              type="button"
              onClick={close}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
              }}
            >
              <FaTimes size={14} />
            </button>

            <span className="fw-semibold text-dark">
              انتخاب تخصص‌ها
            </span>
          </div>

          {allSpecials.length === 0 ? (
            <div className="text-center text-muted py-4">
              تخصصی برای نمایش وجود ندارد.
            </div>
          ) : (
            allSpecials.map((sp) => (
              <label
                key={sp.id}
                className="d-flex align-items-center justify-content-between border-bottom py-3"
                style={{
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked(sp.id)}
                  onChange={() =>
                    this.handleToggleSpecial(
                      sp
                    )
                  }
                />

                <span className="text-dark">
                  {sp.name}
                </span>
              </label>
            ))
          )}

          <button
            type="button"
            onClick={close}
            className="btn btn-primary w-100 rounded-3 py-3 mt-3"
          >
            تایید
          </button>
        </div>
      </>
    );
  }

  render() {
    const {
      step,
      loading,
      errorMessage,
    } = this.state;

    return (
      <div>
        {loading && <Loader />}

        <div
          className="container-fluid px-3 pt-4 pb-5"
          style={{
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              onClick={this.goBack}
              className="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
              }}
            >
              <FaChevronRight size={14} />
            </button>
          </div>

          <StepHeader step={step} />

          {errorMessage && (
            <div className="text-danger small text-center mb-3">
              {errorMessage}
            </div>
          )}

          {step === 1 &&
            this.renderStep1()}

          {step === 2 &&
            this.renderStep2()}

          {step === 3 &&
            this.renderStep3()}
        </div>

        {this.renderSpecialsModal()}
      </div>
    );
  }
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
}) {
  return (
    <div className="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-3 mb-3 bg-white">
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="form-control border-0 shadow-none text-end p-0"
      />

      {icon}
    </div>
  );
}

function ImagePicker({
  label,
  preview,
  inputRef,
  onChange,
}) {
  return (
    <div className="mb-3">
      <div className="text-muted small text-end mb-2">
        {label}
      </div>

      <div className="border rounded-3 p-3 d-flex align-items-start justify-content-between gap-3">
        <div
          className="rounded-3 bg-light flex-shrink-0"
          style={{
            width: 140,
            height: 100,
            backgroundImage: preview
              ? `url(${preview})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition:
              "center",
          }}
        />

        <button
          type="button"
          onClick={() =>
            inputRef.current &&
            inputRef.current.click()
          }
          className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-3 py-2"
        >
          <span>انتخاب فایل</span>
          <FaFolderOpen size={16} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="d-none"
        />
      </div>
    </div>
  );
}

export default withRouter(
  TechnicianRegisterWizard
);