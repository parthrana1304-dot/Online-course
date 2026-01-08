import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    return null;
  }
};
