import { Router } from "express";
import { AuthController } from "#controllers/auth.controller.js";
import { requireAuth } from "#middlewares/auth.js";
import AuthYup from "#validators/auth.yup.js";

const r = Router();

r.post("/signup", AuthYup.signup, AuthController.signup);
r.post("/login", AuthYup.login, AuthController.login);
r.get("/me", requireAuth, AuthController.me);
r.put("/me", requireAuth, AuthYup.updateSelf, AuthController.updateSelf);

export default r;
