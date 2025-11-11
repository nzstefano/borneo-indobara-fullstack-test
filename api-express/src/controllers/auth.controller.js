import { AuthService } from "../services/auth.service.js";

export const AuthController = {
  async signup(req, res) {
    // ← NEW
    const { name, email, password } = req.body || {};
    const result = await AuthService.signup({
      name,
      email,
      password,
    });
    if (!result.ok)
      return res.status(result.status || 400).json({ error: result.error });
    res.status(201).json(result.data);
  },

  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    const result = await AuthService.login(email, password);

    if (!result.ok) return res.status(401).json({ error: result.error });

    res.json(result.data);
  },

  async me(req, res) {
    const out = await AuthService.me(req.user?.sub);
    if (!out.ok)
      return res.status(out.status || 404).json({ error: out.error });
    res.json(out.data);
  },

  async updateSelf(req, res) {
    const { name, email, profilePicture } = req.body || {};
    const out = await AuthService.updateSelf(req.user?.sub, {
      name,
      email,
      profilePicture,
    });
    if (!out.ok)
      return res.status(out.status || 400).json({ error: out.error });
    res.json(out.data);
  },
};
