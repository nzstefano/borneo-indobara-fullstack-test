<template>
  <section
    class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
  >
    <h2 class="mb-3 text-base font-semibold">Todos</h2>

    <form @submit.prevent="add" class="mb-4 flex gap-2">
      <input
        v-model="title"
        placeholder="New todo title"
        class="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
      <button
        class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        Add
      </button>
    </form>

    <ul class="space-y-2">
      <li
        v-for="t in todos"
        :key="t.id"
        class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
      >
        <input
          type="checkbox"
          v-model="t.done"
          @change="toggle(t)"
          class="h-4 w-4 accent-indigo-600"
        />
        <span :class="t.done ? 'line-through text-slate-400' : ''">{{
          t.title
        }}</span>
        <button
          @click="remove(t)"
          class="ml-auto text-sm text-rose-700 hover:underline"
        >
          Delete
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import http from "../lib/http";

const title = ref("");
const todos = ref([]);

async function load() {
  const { data } = await http.get("/todos");
  todos.value = data;
}
async function add() {
  if (!title.value.trim()) return;
  const { data } = await http.post("/todos", { title: title.value });
  todos.value.push(data);
  title.value = "";
}
async function toggle(t) {
  const { data } = await http.patch(`/todos/${t.id}`, { done: t.done });
  Object.assign(t, data);
}
async function remove(t) {
  await http.delete(`/todos/${t.id}`);
  todos.value = todos.value.filter((x) => x.id !== t.id);
}

onMounted(load);
</script>
