import { reactive } from "vue";
import http, { setToken, clearToken, getToken } from "./http";

// Reactive auth state for header & guards
export const authState = reactive({
  me: null, // { id, name, email, roles }
  ready: false,
});

export async function login(email, password) {
  const { data } = await http.post("/auth/login", { email, password });
  setToken(data.token);
  authState.me = data.user || null; // optimistic
  return data;
}

export async function fetchMe() {
  const t = getToken();
  if (!t) {
    authState.me = null;
    authState.ready = true;
    return null;
  }
  try {
    const { data } = await http.get("/auth/me");
    authState.me = data;
    authState.ready = true;
    return data;
  } catch {
    clearToken();
    authState.me = null;
    authState.ready = true;
    return null;
  }
}

export async function updateMe(patch = {}) {
  const payload = {
    ...(patch.name != null ? { name: String(patch.name).trim() } : {}),
    ...(patch.email != null ? { email: String(patch.email).trim() } : {}),
    ...(patch.profilePicture != null
      ? { profilePicture: String(patch.profilePicture).trim() }
      : {}),
  };
  const { data } = await http.put("/auth/me", payload);
  authState.me = data; // server is source of truth
  return data;
}

export async function updateMeNoState(patch = {}) {
  const payload = {
    ...(patch.name != null ? { name: String(patch.name).trim() } : {}),
    ...(patch.email != null ? { email: String(patch.email).trim() } : {}),
    ...(patch.profilePicture != null
      ? { profilePicture: String(patch.profilePicture).trim() }
      : {}),
  };
  const { data } = await http.put("/auth/me", payload);
  return data; // DO NOT mutate authState here
}

export function logout() {
  clearToken();
  authState.me = null;
}

export function isAuthed() {
  return !!authState.me;
}
