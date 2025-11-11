<template>
  <section
    class="min-h-screen flex items-center justify-center bg-slate-50 px-4"
  >
    <div
      class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div class="mb-6 space-y-1">
        <h2 class="text-lg font-semibold tracking-tight">
          Create your account
        </h2>
        <p class="text-sm text-slate-500">Sign up to get started.</p>
      </div>

      <form @submit.prevent="onRegister" class="space-y-4">
        <InputField
          id="name"
          label="Full Name"
          type="text"
          placeholder="Your name"
          v-model="name"
          :error="touchedName ? nameErr : ''"
          :shake="nameShake"
          @blur="touch('name')"
        />

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
          autocomplete="new-password"
          placeholder="••••••••"
          v-model="password"
          :error="touchedPwd ? pwdErr : ''"
          :shake="pwdShake"
          @blur="touch('password')"
        />

        <InputField
          id="confirm"
          label="Confirm Password"
          type="password"
          :toggleable="true"
          autocomplete="new-password"
          placeholder="••••••••"
          v-model="confirm"
          :error="touchedCfm ? cfmErr : ''"
          :shake="cfmShake"
          @blur="touch('confirm')"
        />

        <button
          :disabled="loading"
          class="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <span
            v-if="loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
          />
          {{ loading ? "Creating…" : "Register" }}
        </button>

        <p v-if="error" class="text-sm text-rose-700">{{ error }}</p>
        <p class="text-xs text-slate-500">
          Already have an account?
          <RouterLink class="text-indigo-600 hover:underline" to="/login"
            >Login</RouterLink
          >
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import InputField from "@components/ui/InputField.vue";
import http from "@lib/http";
import { setToken } from "@lib/http";
import { fetchMe } from "@lib/auth";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const error = ref("");

// validation state
const touchedName = ref(false);
const touchedEmail = ref(false);
const touchedPwd = ref(false);
const touchedCfm = ref(false);

const nameErr = ref("");
const emailErr = ref("");
const pwdErr = ref("");
const cfmErr = ref("");

const nameShake = ref(false);
const emailShake = ref(false);
const pwdShake = ref(false);
const cfmShake = ref(false);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName() {
  if (!name.value.trim()) return "Name is required";
  return "";
}
function validateEmail() {
  if (!email.value) return "Email is required";
  if (!EMAIL_RE.test(email.value)) return "Invalid email format";
  return "";
}
function validatePwd() {
  if (!password.value) return "Password is required";
  if (password.value.length < 6) return "Min 6 characters";
  return "";
}
function validateConfirm() {
  if (!confirm.value) return "Confirm your password";
  if (confirm.value !== password.value) return "Passwords do not match";
  return "";
}

function touch(field) {
  switch (field) {
    case "name":
      touchedName.value = true;
      nameErr.value = validateName();
      break;
    case "email":
      touchedEmail.value = true;
      emailErr.value = validateEmail();
      break;
    case "password":
      touchedPwd.value = true;
      pwdErr.value = validatePwd();
      break;
    case "confirm":
      touchedCfm.value = true;
      cfmErr.value = validateConfirm();
      break;
  }
}
function shake(refFlag) {
  refFlag.value = true;
  setTimeout(() => (refFlag.value = false), 420);
}

async function onRegister() {
  // validate all
  touchedName.value =
    touchedEmail.value =
    touchedPwd.value =
    touchedCfm.value =
      true;
  nameErr.value = validateName();
  emailErr.value = validateEmail();
  pwdErr.value = validatePwd();
  cfmErr.value = validateConfirm();

  if (nameErr.value || emailErr.value || pwdErr.value || cfmErr.value) {
    if (nameErr.value) shake(nameShake);
    if (emailErr.value) shake(emailShake);
    if (pwdErr.value) shake(pwdShake);
    if (cfmErr.value) shake(cfmShake);
    return;
  }

  error.value = "";
  loading.value = true;

  // Loading toast
  const t0 = Date.now();
  const MIN_LOADING_MS = 350;
  Swal.fire({
    toast: true,
    position: "bottom",
    title: "Creating account…",
    icon: undefined,
    showConfirmButton: false,
    showCloseButton: true,
    timer: undefined,
    backdrop: false,
    customClass: { popup: "rounded-2xl shadow-2xl" },
    didOpen: () => Swal.showLoading(),
  });

  try {
    // Hit your existing signup API (returns { token, user })
    const { data } = await http.post("/auth/signup", {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    // store token and fetch /auth/me
    setToken(data.token);
    await fetchMe();

    // ensure loading visible briefly
    const elapsed = Date.now() - t0;
    if (elapsed < MIN_LOADING_MS) {
      await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
    }

    Swal.close();
    Swal.fire({
      toast: true,
      position: "bottom",
      title: "Registered!",
      icon: "success",
      showConfirmButton: false,
      timer: 1200,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });

    router.replace("/dashboard");
  } catch (e) {
    const msg = e?.response?.data?.error || "Registration failed";
    error.value = msg;

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
      timer: 2000,
      backdrop: false,
      customClass: { popup: "rounded-2xl shadow-2xl" },
    });
  } finally {
    loading.value = false;
  }
}
</script>
