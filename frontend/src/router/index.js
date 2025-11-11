import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@pages/Dashboard.vue";
import Todos from "@pages/Todos.vue";
import Logs from "@pages/Logs.vue";
import Login from "@pages/Login.vue";
import Register from "@pages/Register.vue";
import { authState, fetchMe, isAuthed } from "@lib/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: Login, meta: { public: true } },
    { path: "/dashboard", component: Dashboard },
    { path: "/todos", component: Todos },
    { path: "/logs", component: Logs }, // ← after Todos
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: { public: true },
    },
  ],
});

// Ensure we know auth state once, then guard
let authBootstrapped = false;
router.beforeEach(async (to, _from, next) => {
  if (!authBootstrapped) {
    authBootstrapped = true;
    if (!authState.ready) await fetchMe();
  }
  if (to.meta?.public) return next();
  if (!isAuthed())
    return next({ path: "/login", query: { redirect: to.fullPath } });
  next();
});

export default router;
