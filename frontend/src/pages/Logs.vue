<template>
  <section class="space-y-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold">Audit Logs</h2>
        <div class="flex items-center gap-2">
          <label class="text-xs text-slate-500">Page size</label>
          <select
            v-model.number="pageSize"
            class="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option v-for="s in [10, 20, 30, 50]" :key="s" :value="s">
              {{ s }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="py-8 text-center text-sm text-slate-500">
        Loading logs…
      </div>
      <div v-else-if="error" class="py-8 text-center text-sm text-rose-700">
        {{ error }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr>
              <th class="px-3 py-2">When</th>
              <th class="px-3 py-2">Actor</th>
              <th class="px-3 py-2">Action</th>
              <th class="px-3 py-2">Entity</th>
              <th class="px-3 py-2">Changes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in pagedRows"
              :key="row.id"
              class="border-t border-slate-100 hover:bg-slate-50/60"
            >
              <td class="px-3 py-2">
                <div class="font-medium text-slate-800">{{ rel(row.at) }}</div>
                <div class="text-xs text-slate-500">{{ exact(row.at) }}</div>
              </td>
              <td class="px-3 py-2">
                <div class="font-medium text-slate-800">
                  {{ row.actor?.email || "—" }}
                </div>
                <div class="text-xs text-slate-500">
                  ID: {{ row.actor?.id ?? "—" }}
                </div>
              </td>
              <td class="px-3 py-2">
                <code
                  class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
                  >{{ row.action }}</code
                >
              </td>
              <td class="px-3 py-2">
                <div class="font-medium text-slate-800">
                  {{ row.entity || "—" }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ row.entityId ?? "—" }}
                </div>
              </td>
              <td class="px-3 py-2 break-all">
                <ul
                  v-if="row.changes && Object.keys(row.changes).length"
                  class="space-y-1"
                >
                  <li
                    v-for="(chg, key) in row.changes"
                    :key="key"
                    class="text-xs"
                  >
                    <span class="font-medium text-slate-700">{{ key }}</span
                    >:
                    <span class="line-through text-slate-400">{{
                      s(chg.from)
                    }}</span>
                    <span class="mx-1 text-slate-400">→</span>
                    <span class="text-slate-800">{{ s(chg.to) }}</span>
                  </li>
                </ul>
                <span v-else class="text-xs text-slate-500">—</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            Showing
            <span class="font-medium text-slate-700">{{ start + 1 }}</span
            >–
            <span class="font-medium text-slate-700">{{
              Math.min(end, rows.length)
            }}</span>
            of <span class="font-medium text-slate-700">{{ rows.length }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prev"
              :disabled="page === 1"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span class="text-sm text-slate-700"
              >Page {{ page }} / {{ pages }}</span
            >
            <button
              @click="next"
              :disabled="page >= pages"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import http from "@lib/http";

const rows = ref([]);
const loading = ref(true);
const error = ref("");

const page = ref(1);
const pageSize = ref(20);

const pages = computed(() =>
  Math.max(1, Math.ceil(rows.value.length / pageSize.value))
);
const start = computed(() => (page.value - 1) * pageSize.value);
const end = computed(() => start.value + pageSize.value);
const pagedRows = computed(() => rows.value.slice(start.value, end.value));

watch(pageSize, () => {
  page.value = 1;
});

onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await http.get("/audit/logs", { params: { limit: 200 } });
    rows.value = Array.isArray(data) ? data : [];
  } catch {
    error.value = "Failed to load logs.";
  } finally {
    loading.value = false;
  }
});

function next() {
  if (page.value < pages.value) page.value++;
}
function prev() {
  if (page.value > 1) page.value--;
}

function exact(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}
function rel(ts) {
  const d = new Date(ts).getTime(),
    diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
function s(v) {
  return v == null
    ? "—"
    : typeof v === "object"
    ? JSON.stringify(v)
    : String(v);
}
</script>
