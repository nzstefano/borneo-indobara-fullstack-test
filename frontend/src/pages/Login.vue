<template>
  <section style="max-width:360px;">
    <h2>Login</h2>
    <form @submit.prevent="onLogin" style="display:flex;flex-direction:column;gap:8px;">
      <input v-model="email" placeholder="email" />
      <input v-model="password" type="password" placeholder="password" />
      <button>Login</button>
      <p v-if="error" style="color:crimson;">{{ error }}</p>
    </form>
    <p style="font-size:12px;opacity:.7;margin-top:8px;">Try: demo@demo.com / password</p>
  </section>
</template>
<script setup>
import { ref } from "vue";
import http, { setToken } from "../lib/http";
import { useRouter, useRoute } from "vue-router";
const email = ref("demo@demo.com");
const password = ref("password");
const error = ref("");
const router = useRouter();
const route = useRoute();
async function onLogin(){
  error.value = "";
  try{
    const { data } = await http.post("/auth/login", { email: email.value, password: password.value });
    setToken(data.token);
    router.push(route.query.redirect || "/dashboard");
  }catch{
    error.value = "Invalid credentials";
  }
}
</script>
