<template>
  <section
    class="min-h-screen flex items-center justify-center bg-slate-50 px-4"
  >
    <div
      class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div class="mb-6 space-y-1">
        <h2 class="text-lg font-semibold tracking-tight">Welcome back</h2>
        <p class="text-sm text-slate-500">Sign in to continue.</p>
      </div>

      <form @submit.prevent="onLogin" class="space-y-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          autocomplete="username"
          placeholder="you@email.com"
          v-model="email"
          :error="touchedEmail ? emailErr : ''"
          :shake="emailShake"
          @blur="touch('email')"
        />

        <InputField
          id="password"
          label="Password"
          type="password"
          :toggleable="true"
          autocomplete="current-password"
          placeholder="••••••••"
          v-model="password"
          :error="touchedPwd ? pwdErr : ''"
          :shake="pwdShake"
          @blur="touch('password')"
        />

        <button
          :disabled="loading"
          class="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <span
            v-if="loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
          />
          {{ loading ? "Signing in…" : "Login" }}
        </button>
        <p class="text-xs text-slate-500">
          Don’t have an account?
          <RouterLink to="/register" class="text-indigo-600 hover:underline"
            >Register</RouterLink
          >
        </p>

        <p v-if="error" class="text-sm text-rose-700">{{ error }}</p>
        <p class="text-xs text-slate-500">
          Demo: <code>demo@demo.com</code> / <code>password</code>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { login, fetchMe } from "@lib/auth";
import InputField from "@components/ui/InputField.vue";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const email = ref("demo@demo.com");
const password = ref("password");
const loading = ref(false);
const error = ref("");

// validation state
const touchedEmail = ref(false);
const touchedPwd = ref(false);
const emailErr = ref("");
const pwdErr = ref("");
const emailShake = ref(false);
const pwdShake = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail() {
  if (!email.value) return "Email is required";
  if (!EMAIL_RE.test(email.value)) return "Invalid email format";
  return "";
}
function validatePwd() {
  if (!password.value) return "Password is required";
  return "";
}
function touch(field) {
  if (field === "email") {
    touchedEmail.value = true;
    emailErr.value = validateEmail();
  } else {
    touchedPwd.value = true;
    pwdErr.value = validatePwd();
  }
}
function shake(flagRef) {
  flagRef.value = true;
  setTimeout(() => (flagRef.value = false), 420);
}

async function onLogin() {
  // validate all, trigger shake if missing
  touchedEmail.value = true;
  touchedPwd.value = true;
  emailErr.value = validateEmail();
  pwdErr.value = validatePwd();
  if (emailErr.value || pwdErr.value) {
    if (emailErr.value) shake(emailShake);
    if (pwdErr.value) shake(pwdShake);
    return;
  }

  error.value = "";
  loading.value = true;
  try {
    await login(email.value, password.value);
    await fetchMe();
    const redirect =
      typeof route.query.redirect === "string" &&
      route.query.redirect.startsWith("/")
        ? route.query.redirect
        : "/dashboard";
    router.replace(redirect);
  } catch (e) {
    const msg = e?.response?.data?.error || "Something Wrong";
    error.value = msg;

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
  } finally {
    loading.value = false;
  }
}
</script>
