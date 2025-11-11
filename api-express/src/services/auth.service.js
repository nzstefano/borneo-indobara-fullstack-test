import bcrypt from "bcryptjs";
import { UsersRepo } from "#repositories/users.repo.js";
import { issueToken } from "#utils/jwt.js";
import { normalizeEmail } from "#utils/normalize.js";
import { log as auditLog } from "#services/audit.service.js";
import { diffFields } from "#utils/diff.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUserDTO(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    roles: u.roles,
    profilePicture: u.profilePicture || "",
  };
}
function toUserWithToken(u, token) {
  return { token, user: toUserDTO(u) };
}

export const AuthService = {
  async signup({ name, email, password }) {
    const em = normalizeEmail(email);
    if (!name || !em || !password)
      return {
        ok: false,
        status: 400,
        error: "name, email, password are required",
      };

    if (!EMAIL_RE.test(em))
      return { ok: false, status: 400, error: "invalid email format" };

    const exists = await UsersRepo.findByEmail(em);
    if (exists)
      return { ok: false, status: 409, error: "email already registered" };

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await UsersRepo.create({
      name: String(name).trim(),
      email: em, // LOWERCASE
      passwordHash,
      roles: ["user"],
      profilePicture: "",
    });

    // AUDIT: signup (minimal, no sensitive fields)
    await auditLog({
      actor: { id: user.id, email: user.email },
      action: "auth.signup",
      entity: "user",
      entityId: user.id,
      changes: {
        name: { from: null, to: user.name },
        email: { from: null, to: user.email },
        profilePicture: { from: null, to: user.profilePicture || "" },
      },
    });

    const token = issueToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { ok: true, data: toUserWithToken(user, token) };
  },

  async login(email, password) {
    const em = normalizeEmail(email);
    const user = await UsersRepo.findByEmail(em);
    if (!user) return { ok: false, status: 401, error: "invalid credentials" };

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return { ok: false, status: 401, error: "invalid credentials" };

    // AUDIT: login
    await auditLog({
      actor: { id: user.id, email: user.email },
      action: "auth.login",
      entity: "user",
      entityId: user.id,
      meta: { method: "password" },
    });

    const token = issueToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    return { ok: true, data: toUserWithToken(user, token) };
  },

  async me(userId) {
    const user = await UsersRepo.findById(userId);
    if (!user) return { ok: false, status: 404, error: "not found" };
    return { ok: true, data: toUserDTO(user) };
  },

  async updateSelf(userId, patch) {
    if (!userId) return { ok: false, status: 401, error: "unauthorized" };

    const before = await UsersRepo.findById(userId);
    if (!before) return { ok: false, status: 404, error: "not found" };

    const data = {};
    if (patch.name !== undefined) data.name = String(patch.name).trim();
    if (patch.email !== undefined) {
      const em = normalizeEmail(patch.email);

      if (!EMAIL_RE.test(em))
        return { ok: false, status: 400, error: "invalid email format" };

      const owner = await UsersRepo.findByEmail(em);
      if (owner && Number(owner.id) !== Number(userId))
        return { ok: false, status: 409, error: "email already in use" };

      // demo account rule unchanged
      if (Number(userId) === 1 && em !== "demo@demo.com")
        return {
          ok: false,
          status: 403,
          error: "Demo account email cannot be changed",
        };

      data.email = em; // LOWERCASE
    }
    if (patch.profilePicture !== undefined)
      data.profilePicture = String(patch.profilePicture || "").trim();

    // AUDIT: only record real changes
    const changes = diffFields(
      {
        name: before.name,
        email: before.email,
        profilePicture: before.profilePicture || "",
      },
      {
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture || "",
      }
    );

    if (Object.keys(changes).length) {
      await auditLog({
        actor: { id: userId, email: data.email },
        action: "user.update",
        entity: "user",
        entityId: userId,
        changes,
      });
    }
    const updated = await UsersRepo.updateById(userId, data);
    if (!updated) return { ok: false, status: 404, error: "not found" };

    return { ok: true, data: toUserDTO(updated) };
  },
};
