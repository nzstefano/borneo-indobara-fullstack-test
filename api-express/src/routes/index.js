import { Router } from "express";
import authRoutes from "./auth.routes.js";
import todosRoutes from "./todos.routes.js";
import auditRoutes from "./audit.routes.js";

const r = Router();
r.get("/health", (_req, res) => res.json({ ok: true }));
r.use("/auth", authRoutes);
r.use("/todos", todosRoutes);
r.use("/audit", auditRoutes);

export default r;
