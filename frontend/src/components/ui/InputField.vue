<template>
  <div :class="[{ 'animate-shake': shake }, 'space-y-1.5']">
    <label :for="id" class="block text-xs font-medium text-slate-600">{{
      label
    }}</label>

    <div class="relative">
      <input
        :id="id"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value.trimStart())"
        @blur="$emit('blur')"
        :aria-invalid="!!error"
        :class="[
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 pr-12',
          error
            ? 'border-rose-600 focus:border-rose-600 focus:ring-rose-100'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100',
        ]"
      />
      <button
        v-if="toggleable"
        type="button"
        class="absolute inset-y-0 right-2 my-1 rounded-md px-2 text-xs text-slate-500 hover:bg-slate-100"
        @click="visible = !visible"
        :aria-label="visible ? 'Hide password' : 'Show password'"
      >
        {{ visible ? "Hide" : "Show" }}
      </button>
    </div>

    <p v-if="error" class="text-xs text-rose-700">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: "" },
  type: { type: String, default: "text" }, // "text" | "email" | "password"
  placeholder: { type: String, default: "" },
  autocomplete: { type: String, default: "off" },
  error: { type: String, default: "" },
  toggleable: { type: Boolean, default: false }, // adds show/hide for password
  shake: { type: Boolean, default: false }, // triggers shake animation
});
defineEmits(["update:modelValue", "blur"]);

const visible = ref(false);
const inputType = computed(() =>
  props.toggleable ? (visible.value ? "text" : "password") : props.type
);

// reset visibility if not password field
watch(
  () => props.type,
  (t) => {
    if (t !== "password") visible.value = false;
  }
);
</script>
