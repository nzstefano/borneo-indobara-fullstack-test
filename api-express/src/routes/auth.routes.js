import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

r.post("/login", AuthController.login);
r.get("/me", requireAuth, AuthController.me);

export default r;
