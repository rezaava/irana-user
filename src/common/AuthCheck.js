const AuthCheck = () => {
  const token = localStorage.getItem("token");

  console.log("Token:", token);

  if (!token) {
    window.location.href = "/login";
    return false;
  }

  return true;
};

export default AuthCheck;
