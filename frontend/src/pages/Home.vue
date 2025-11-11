<template>
  <section>
    <h2>Home</h2>
    <p>Simple demo app. Use Login → Dashboard/Todos.</p>
    <p><strong>API:</strong> {{ api }}</p>
  </section>
</template>
<script setup>
const api = import.meta.env.VITE_API_BASE;
</script>
