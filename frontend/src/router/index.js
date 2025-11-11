import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "../lib/http";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Dashboard from "../pages/Dashboard.vue";
import Todos from "../pages/Todos.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/todos", component: Todos, meta: { requiresAuth: true } }
];

const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getToken()) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});
export default router;
