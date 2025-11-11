import bcrypt from "bcryptjs";
import { normalizeEmail } from "#utils/normalize.js";

let _nextId = 2;

const _db = {
  users: [
    {
      id: 1,
      name: "Demo User",
      email: "demo@demo.com", // stored LOWERCASE
      roles: ["user"],
      passwordHash: "password", // ← plaintext seed; will be auto-hashed below
      profilePicture: "",
    },
  ],
};

// Auto-hash any non-bcrypt password seeds at startup (so you can keep readable seeds)
for (const u of _db.users) {
  if (!u.passwordHash || !String(u.passwordHash).startsWith("$2")) {
    u.passwordHash = bcrypt.hashSync(String(u.passwordHash || "password"), 10);
  }
}

export const UsersRepo = {
  async findByEmail(email) {
    const em = normalizeEmail(email);
    return _db.users.find((u) => u.email === em) || null;
  },
  async findById(id) {
    return _db.users.find((u) => u.id === Number(id)) || null;
  },
  async create({
    name,
    email,
    passwordHash,
    roles = ["user"],
    profilePicture = "",
  }) {
    const em = normalizeEmail(email);
    const u = {
      id: _nextId++,
      name,
      email: em,
      passwordHash,
      roles,
      profilePicture,
    };
    _db.users.push(u);
    return u;
  },
  async updateById(id, patch) {
    const u = _db.users.find((x) => x.id === Number(id));
    if (!u) return null;
    if (patch.name !== undefined) u.name = patch.name;
    if (patch.email !== undefined) u.email = normalizeEmail(patch.email);
    if (patch.profilePicture !== undefined)
      u.profilePicture = patch.profilePicture;
    return u;
  },
};
