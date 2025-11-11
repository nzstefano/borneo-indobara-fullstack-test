<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <NavBar />

    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import NavBar from "@components/NavBar.vue";
import { fetchMe } from "@lib/auth";

onMounted(fetchMe);
</script>
