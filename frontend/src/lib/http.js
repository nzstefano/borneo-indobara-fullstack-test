import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const http = axios.create({ baseURL });

let _token = localStorage.getItem("token");
export function setToken(t){ _token=t; t?localStorage.setItem("token",t):localStorage.removeItem("token"); }
export function getToken(){ return _token; }

http.interceptors.request.use(cfg => {
  const t = getToken();
  if (t) cfg.headers.Authorization = \`Bearer \${t}\`;
  return cfg;
});
export default http;
