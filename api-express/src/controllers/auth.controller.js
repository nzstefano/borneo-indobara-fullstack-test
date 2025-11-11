import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });
    const result = await AuthService.login(email, password);
    if (!result.ok) return res.status(401).json({ error: result.error });
    res.json(result.data);
  },
  async me(req, res) {
    const result = await AuthService.me(req.user?.sub);
    if (!result.ok) return res.status(404).json({ error: result.error });
    res.json(result.data);
  },
};
