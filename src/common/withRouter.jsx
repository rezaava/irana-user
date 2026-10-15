import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// react-router v6 دیگه withRouter نداره، پس خودمون یه نسخه‌ی ساده می‌سازیم
// تا بشه navigate/params/location رو به کامپوننت‌های کلاسی پاس داد.
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    return (
      <Component
        {...props}
        navigate={navigate}
        params={params}
        location={location}
      />
    );
  }
  return ComponentWithRouterProp;
}

export default withRouter;
