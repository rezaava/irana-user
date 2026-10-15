import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./../css/all.css";

function HomeButtonComponent() {
  const location = useLocation();

  const hiddenPaths = [
    "/login",
    "/welcome",
    "/verify-code",
    "/register"
  ];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <Link
      to="/"
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: 9999,
        background: "transparent",
        border: "none",
        padding: "5px",
        cursor: "pointer",
        fontSize: "24px",
        color: "inherit",
        textDecoration: "none"
      }}
    >
      <i className="fa-duotone fa-solid fa-house"></i>
    </Link>
  );
}

export default HomeButtonComponent;