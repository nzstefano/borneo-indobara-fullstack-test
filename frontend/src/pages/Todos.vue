<template>
  <section style="max-width:520px;">
    <h2>Todos (Protected)</h2>
    <form @submit.prevent="add" style="display:flex;gap:8px;margin-bottom:10px;">
      <input v-model="title" placeholder="New todo title" />
      <button>Add</button>
    </form>
    <ul style="padding-left:18px;">
      <li v-for="t in todos" :key="t.id" style="display:flex;gap:8px;align-items:center;margin:6px 0;">
        <input type="checkbox" v-model="t.done" @change="toggle(t)" />
        <span :style="{ textDecoration: t.done ? line-through : none }">{{ t.title }}</span>
        <button @click="remove(t)" style="margin-left:auto;">Delete</button>
      </li>
    </ul>
  </section>
</template>
<script setup>
import { ref, onMounted } from "vue";
import http from "../lib/http";
const title = ref(""); const todos = ref([]);
async function load(){ const { data } = await http.get("/todos"); todos.value = data; }
async function add(){ if(!title.value.trim())return; const { data } = await http.post("/todos",{ title:title.value }); todos.value.push(data); title.value=""; }
async function toggle(t){ const { data } = await http.patch(`/todos/${t.id}`,{ done:t.done }); Object.assign(t, data); }
async function remove(t){ await http.delete(`/todos/${t.id}`); todos.value = todos.value.filter(x=>x.id!==t.id); }
onMounted(load);
</script>
