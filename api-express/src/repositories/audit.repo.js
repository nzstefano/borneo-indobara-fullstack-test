const _audit = { rows: [], nextId: 1 };

export const AuditRepo = {
  async insert(row) {
    const rec = { id: _audit.nextId++, ...row };
    _audit.rows.push(rec);
    return rec;
  },
  async list({ limit = 100 } = {}) {
    const out = _audit.rows.slice(-limit);
    return out.reverse();
  },
};
