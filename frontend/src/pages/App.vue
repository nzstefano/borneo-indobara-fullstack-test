<template>
  <div style="padding:24px;max-width:900px;margin:0 auto;">
    <header style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
      <h1 style="font-size:20px;margin:0;">Borneo Test</h1>
      <nav style="display:flex;gap:8px;margin-left:auto;">
        <router-link to="/">Home</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/todos">Todos</router-link>
        <router-link to="/login">Login</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>
<script setup></script>
