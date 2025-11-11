import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as Audit from "../services/audit.service.js";

const r = Router();

// GET /logs?limit=100
r.get("/logs", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const rows = await Audit.list({ limit });
  res.json(rows);
});

export default r;
