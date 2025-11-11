import bcrypt from "bcryptjs";
import { UsersRepo } from "../repositories/users.repo.js";
import { issueToken } from "../utils/jwt.js";

export const AuthService = {
  async login(email, password) {
    const user = await UsersRepo.findByEmail(email);
    if (!user) return { ok: false, error: "invalid credentials" };
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return { ok: false, error: "invalid credentials" };
    const token = issueToken({ sub: user.id, email: user.email, roles: user.roles });
    return {
      ok: true,
      data: { token, user: { id: user.id, name: user.name, email: user.email, roles: user.roles } },
    };
  },

  async me(userId) {
    const user = await UsersRepo.findById(userId);
    if (!user) return { ok: false, error: "not found" };
    return { ok: true, data: { id: user.id, name: user.name, email: user.email, roles: user.roles } };
  },
};
