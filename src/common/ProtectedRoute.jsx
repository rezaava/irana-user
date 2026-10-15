import React from "react";
import AuthCheck from "./AuthCheck";

// دور هر صفحه‌ای که نیاز به لاگین داره این رو می‌پیچیم.
// AuthCheck خودش اگه توکن نبود کاربر رو به /login می‌فرسته.
class ProtectedRoute extends React.Component {
  render() {
    const isLoggedIn = AuthCheck();
    if (!isLoggedIn) return null;
    return this.props.children;
  }
}

export default ProtectedRoute;
