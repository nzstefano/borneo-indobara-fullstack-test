<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="mb-3 text-base font-semibold">Edit Profile</h2>

    <form @submit.prevent class="space-y-4">
      <!-- Name -->
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-600">Name</label>
        <input
          v-model.trim="form.name"
          @input="onFieldInput()"
          @blur="saveNow()"
          type="text"
          class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="Your name"
        />
      </div>

      <!-- Email -->
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-600">Email</label>
        <input
          v-model.trim="form.email"
          @input="onFieldInput()"
          @blur="saveNow()"
          type="email"
          class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="you@email.com"
        />
      </div>

      <!-- Profile Picture URL -->
      <div class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-600"
          >Profile Picture URL</label
        >
        <input
          v-model.trim="form.profilePicture"
          @input="onFieldInput()"
          @blur="saveNow()"
          type="url"
          class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          placeholder="https://…"
        />

        <!-- Preview -->
        <div class="mt-2 flex items-center gap-3">
          <img
            :src="profilePreviewUrl"
            alt="Preview"
            class="h-14 w-14 rounded-full border border-slate-200 object-cover bg-white"
            @error="onPreviewError"
          />
          <p class="text-xs text-slate-500">
            Preview updates as you type. Broken URLs fallback to initials.
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import Swal from "sweetalert2";
import { authState, updateMeNoState, fetchMe } from "@lib/auth";

const form = reactive({ name: "", email: "", profilePicture: "" });

let debTimer = null;
const saving = ref(false);
let resaveRequested = false;
const lastSentJSON = ref("");

// ---------- SweetAlert2 helpers (toast) ----------
function showSaving(msg = "Saving…") {
  Swal.fire({
    toast: true,
    position: "bottom",
    title: msg,
    icon: undefined,
    showConfirmButton: false,
    showCloseButton: true,
    timer: undefined, // persist while saving
    backdrop: false,
    customClass: { popup: "rounded-2xl shadow-2xl" },
    didOpen: () => Swal.showLoading(),
  });
}
function showSaved(msg = "Saved!", timer = 1200) {
  if (Swal.isVisible()) {
    Swal.update({ title: msg, icon: "success" });
    setTimeout(() => Swal.close(), timer);
  } else {
    Swal.fire({
      toast: true,
      position: "bottom",
      title: msg,
      icon: "success",
      showConfirmButton: false,
      timer,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });
  }
}
function showError(msg = "Failed to save", timer = 1800) {
  if (Swal.isVisible()) {
    Swal.update({ title: msg, icon: "error" });
    setTimeout(() => Swal.close(), timer);
  } else {
    Swal.fire({
      toast: true,
      position: "bottom",
      title: msg,
      icon: "error",
      showConfirmButton: false,
      timer,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });
  }
}

// ---------- data sync ----------
function syncFromAuth() {
  form.name = authState.me?.name || "";
  form.email = authState.me?.email || "";
  form.profilePicture = authState.me?.profilePicture || "";
}
onMounted(syncFromAuth);
watch(() => authState.me, syncFromAuth, { deep: true });

// ---------- avatar preview ----------
function fallbackAvatarSvg(seed = "U") {
  const initials =
    (seed || "U")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || "")
      .join("") || "U";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
    <rect width='100%' height='100%' rx='64' fill='#E5E7EB'/>
    <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'
      font-family='system-ui,Segoe UI,Roboto' font-size='48' fill='#111827'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const profilePreviewUrl = computed(() => {
  const url = form.profilePicture?.trim();
  return url && /^https?:\/\//i.test(url)
    ? url
    : fallbackAvatarSvg(form.name || form.email || "User");
});
function onPreviewError(e) {
  e.target.src = fallbackAvatarSvg(form.name || form.email || "User");
}

// ---------- debounce & save ----------
function buildPayload() {
  const payload = {
    name: form.name,
    email: form.email,
    profilePicture: form.profilePicture,
  };
  return { payload, sig: JSON.stringify(payload) };
}

function onFieldInput() {
  if (debTimer) clearTimeout(debTimer);
  debTimer = setTimeout(() => {
    debTimer = null;
    triggerSave();
  }, 2000); // 2s debounce
}

async function saveNow() {
  if (debTimer) {
    clearTimeout(debTimer);
    debTimer = null;
  }
  await triggerSave();
}

async function triggerSave() {
  if (saving.value) {
    resaveRequested = true;
    return;
  }
  await saveAll();
  if (resaveRequested) {
    resaveRequested = false;
    await saveAll();
  }
}

const MIN_LOADING_MS = 350; // force loading to be seen

async function saveAll() {
  const { payload, sig } = buildPayload();
  if (sig === lastSentJSON.value) return;

  const t0 = Date.now();

  // 1) ALWAYS show loading toast immediately
  Swal.fire({
    toast: true,
    position: "bottom",
    title: "Saving…",
    icon: undefined,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2000,
    backdrop: false,
    customClass: { popup: "rounded-2xl shadow-2xl" },
    didOpen: () => Swal.showLoading(),
  });

  // GIVE DELAY TO SHOW loading

  await new Promise((r) => setTimeout(r, 1500));

  try {
    await updateMeNoState(payload);
    lastSentJSON.value = sig;
    await fetchMe(); // navbar/dashboard update once

    // ensure loading is visible at least MIN_LOADING_MS
    const elapsed = Date.now() - t0;
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
    }

    // 2) CLOSE loading, then show a NEW success toast (don't update)
    // Swal.close();
    Swal.fire({
      toast: true,
      position: "bottom",
      title: "Saved!",
      icon: "success",
      showConfirmButton: false,
      timer: 1200,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });
  } catch (e) {
    const msg = e?.response?.data?.error || "Failed to save profile";

    const elapsed = Date.now() - t0;
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
    }

    Swal.close();
    Swal.fire({
      toast: true,
      position: "bottom",
      title: msg,
      icon: "error",
      showConfirmButton: false,
      timer: 1800,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });
  }
}

onBeforeUnmount(() => {
  if (debTimer) clearTimeout(debTimer);
});
</script>
