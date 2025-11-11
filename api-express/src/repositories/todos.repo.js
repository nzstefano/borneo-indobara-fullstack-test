let TODOS = [];
let nextId = 1;

export const TodosRepo = {
  async create({ title, done = false }) {
    const todo = { id: nextId++, title: String(title), done: Boolean(done), createdAt: new Date().toISOString() };
    TODOS.push(todo);
    return todo;
  },
  async list() {
    return TODOS;
  },
  async findById(id) {
    return TODOS.find(t => t.id === Number(id)) || null;
  },
  async update(id, patch) {
    const idx = TODOS.findIndex(t => t.id === Number(id));
    if (idx === -1) return null;
    TODOS[idx] = { ...TODOS[idx], ...patch };
    return TODOS[idx];
  },
  async remove(id) {
    const before = TODOS.length;
    TODOS = TODOS.filter(t => t.id !== Number(id));
    return TODOS.length < before;
  },
};
