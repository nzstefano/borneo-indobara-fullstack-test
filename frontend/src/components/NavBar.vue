<template>
  <header
    class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur"
  >
    <div class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
      <RouterLink to="/" class="flex items-center gap-2">
        <span
          class="grid h-7 w-7 place-items-center rounded-md bg-indigo-600 text-xs font-semibold text-white"
          >BI</span
        >
        <span class="text-base font-semibold tracking-tight"
          >Borneo Indobara Test</span
        >
      </RouterLink>

      <nav class="ml-auto flex items-center gap-3 text-sm">
        <RouterLink class="hover:text-indigo-600" to="/">Home</RouterLink>

        <template v-if="authed">
          <RouterLink class="hover:text-indigo-600" to="/dashboard"
            >Dashboard</RouterLink
          >
          <RouterLink class="hover:text-indigo-600" to="/todos"
            >Todos</RouterLink
          >
          <RouterLink class="hover:text-indigo-600" to="/logs">Logs</RouterLink>

          <span class="mx-1 h-5 w-px bg-slate-300" />

          <div class="flex items-center gap-2">
            <div
              class="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1"
            >
              <!-- Avatar: show image if valid URL and not errored; else initials pill -->
              <img
                v-if="avatarUrl && !imgErrored"
                :src="avatarUrl"
                @error="onAvatarError"
                alt="Avatar"
                class="h-6 w-6 rounded-full border border-slate-200 object-cover bg-white"
              />
              <div
                v-else
                class="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
                :title="displayName"
              >
                {{ initials }}
              </div>

              <span class="hidden text-xs text-slate-700 sm:inline">{{
                displayName
              }}</span>
            </div>

            <button
              @click="onLogout"
              class="text-xs text-slate-600 hover:text-rose-700"
            >
              Logout
            </button>
          </div>
        </template>

        <RouterLink v-else class="hover:text-indigo-600" to="/login"
          >Login</RouterLink
        >
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from "vue-router";
import { computed, ref, watch } from "vue";
import { authState, logout } from "@lib/auth";

const router = useRouter();
const authed = computed(() => !!authState.me);
const displayName = computed(
  () => authState.me?.name || authState.me?.email || ""
);
const initials = computed(() => {
  const n = displayName.value.trim();
  const parts = n.split(/\s+/);
  const v = (
    (parts[0]?.[0] || "") + (parts[1]?.[0] || "") ||
    n[0] ||
    "?"
  ).toUpperCase();
  return v;
});

// Avatar URL if valid http(s), else null
const imgErrored = ref(false);
const avatarUrl = computed(() => {
  const url = authState.me?.profilePicture?.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
});

watch(
  () => authState.me?.profilePicture,
  () => {
    imgErrored.value = false;
  } // reset error when URL changes
);

function onAvatarError() {
  imgErrored.value = true;
}

function onLogout() {
  logout();
  router.replace("/login");
}
</script>
