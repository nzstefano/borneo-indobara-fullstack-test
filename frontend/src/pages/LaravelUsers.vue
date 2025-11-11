<!-- src/pages/LaravelUsers.vue -->
<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold">Laravel Users</h2>

    <div class="flex items-center gap-2">
      <button
        @click="prev"
        :disabled="!meta || meta.current_page <= 1"
        class="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span class="text-sm text-slate-600"
        >Page {{ meta?.current_page || 1 }} / {{ meta?.last_page || 1 }}</span
      >
      <button
        @click="next"
        :disabled="!meta || meta.current_page >= meta.last_page"
        class="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>

    <div class="grid gap-3">
      <div v-for="u in rows" :key="u.id" class="rounded-xl border bg-white p-4">
        <div class="font-medium">{{ u.name }}</div>
        <div class="text-sm text-slate-600 mb-2">{{ u.email }}</div>
        <ul class="list-disc pl-5 text-sm text-slate-700">
          <li v-for="p in u.posts" :key="p.id">
            <span class="font-medium">{{ p.title }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

// point this to your laravel url/port
const BASE_API = import.meta.env.VITE_LARAVEL_BASE;
const API = `${BASE_API}/api/users`;

const page = ref(1);
const rows = ref([]);
const meta = ref(null);

async function load() {
  const { data } = await axios.get(API, {
    params: { page: page.value, per_page: 5 },
  });
  rows.value = data.data || [];
  meta.value = data.meta || null;
}
function next() {
  if (meta.value && page.value < meta.value.last_page) {
    page.value++;
    load();
  }
}
function prev() {
  if (meta.value && page.value > 1) {
    page.value--;
    load();
  }
}

onMounted(load);
</script>
