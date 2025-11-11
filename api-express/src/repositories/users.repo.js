import bcrypt from "bcryptjs";

const seed = [
  {
    id: 1,
    email: "demo@demo.com",
    name: "Demo User",
    passwordHash: bcrypt.hashSync("password", 10),
    roles: ["user"],
  },
];

export const UsersRepo = {
  async findByEmail(email) {
    return seed.find(u => u.email === String(email).toLowerCase()) || null;
  },
  async findById(id) {
    return seed.find(u => u.id === Number(id)) || null;
  },
};
