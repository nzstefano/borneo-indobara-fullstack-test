<template>
  <section class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Left column: info + profile card -->
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-base font-semibold">Dashboard</h2>

      <!-- Profile Card -->
      <div
        class="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <img
          :src="avatarUrl"
          alt="Profile"
          class="h-14 w-14 rounded-full border border-slate-200 object-cover bg-white"
          @error="onAvatarError"
        />
        <div>
          <div class="text-sm font-semibold text-slate-900">
            {{ me?.name || "—" }}
          </div>
          <div class="text-sm text-slate-600">
            {{ me?.email || "—" }}
          </div>
        </div>
      </div>

      <pre class="p-3 text-xs text-slate-800 whitespace-pre-wrap break-all">{{
        me
      }}</pre>
    </div>

    <!-- Right column: editable profile (emits 'saved') -->
    <UserProfile />
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import UserProfile from "../components/UserProfile.vue";
import { authState, fetchMe, updateMe } from "@lib/auth";

const me = computed(() => authState.me);

onMounted(fetchMe);

async function onProfileSaved(payload) {
  try {
    // Case A: child gave us a patch → do the update here
    if (
      payload &&
      typeof payload === "object" &&
      ("name" in payload ||
        "email" in payload ||
        "profilePicture" in payload) &&
      !("id" in payload)
    ) {
      const updated = await updateMe(payload); // PUT /auth/me, also updates authState.me
      authState.me = updated;
      return;
    }
    // Case B: child already returned updated user → accept it
    if (payload && typeof payload === "object" && "id" in payload) {
      authState.me = payload;
      return;
    }
    // Fallback: re-fetch
    await fetchMe();
  } catch {
    // On error, ensure UI reflects server truth
    await fetchMe();
  }
}

function onAvatarError(e) {
  e.target.src = fallbackAvatarSvg(me.value?.name || me.value?.email || "User");
}

const avatarUrl = computed(() => {
  const url = me.value?.profilePicture;
  return url && /^https?:\/\//i.test(url)
    ? url
    : fallbackAvatarSvg(me.value?.name || me.value?.email || "User");
});

function fallbackAvatarSvg(seed = "U") {
  const initials =
    seed
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || "")
      .join("") || "U";
  const bg = "#E5E7EB"; // slate-200
  const fg = "#111827"; // slate-900
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' rx='64' fill='${bg}'/>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'
            font-family='system-ui,Segoe UI,Roboto' font-size='48' fill='${fg}'>${initials}</text>
    </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
</script>
