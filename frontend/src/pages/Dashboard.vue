<template>
  <section style="display:flex;gap:24px;align-items:flex-start;">
    <div style="flex:1;">
      <h2>Dashboard (Protected)</h2>
      <pre v-if="me" style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:12px;">{{ me }}</pre>
      <button @click="logout">Logout</button>
    </div>
    <div style="flex:1;">
      <UserProfile />
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted } from "vue";
import http, { setToken } from "../lib/http";
import { useRouter } from "vue-router";
import UserProfile from "../components/UserProfile.vue";
const me = ref(null);
const router = useRouter();
onMounted(async () => { const { data } = await http.get("/auth/me"); me.value = data; });
function logout(){ setToken(null); router.push("/login"); }
</script>
