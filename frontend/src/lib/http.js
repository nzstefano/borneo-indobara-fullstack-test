import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const http = axios.create({ baseURL });

let _token = localStorage.getItem("token") || null;
export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}
export function getToken() {
  return _token;
}
export function clearToken() {
  setToken(null);
}

http.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = "Bearer " + t;
  }
  return cfg;
});

export default http;
