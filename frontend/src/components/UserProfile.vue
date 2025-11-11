<template>
  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
    <h3 style="margin:0 0 8px;">User Profile (Autosave)</h3>
    <label style="display:block;margin-bottom:6px;">
      <span style="font-size:12px;">Name</span>
      <input v-model="form.name" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;" />
    </label>
    <label style="display:block;margin-bottom:6px;">
      <span style="font-size:12px;">Email</span>
      <input v-model="form.email" type="email" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;" />
    </label>
    <label style="display:block;margin-bottom:6px;">
      <span style="font-size:12px;">Profile Picture URL</span>
      <input v-model="form.profilePicture" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:6px;" />
    </label>
    <div style="height:18px;font-size:12px;margin-top:6px;">
      <span v-if="saving">Saving…</span>
      <span v-else-if="justSaved">Saved!</span>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import http from "../lib/http";
const form = ref({ name:"", email:"", profilePicture:"" });
const saving = ref(false); const justSaved = ref(false);
let debounceT=null, flashT=null;
async function saveProfile(payload){
  saving.value=true; justSaved.value=false;
  try{ await http.post("/todos",{ title:`profile-save:${payload.email||"unknown"}` }); }
  finally{ saving.value=false; justSaved.value=true; clearTimeout(flashT); flashT=setTimeout(()=>justSaved.value=false,1200); }
}
watch(form,(val)=>{ clearTimeout(debounceT); debounceT=setTimeout(()=>{ if(!val.name||!val.email) return; void saveProfile(val); },2000); },{deep:true});
onBeforeUnmount(()=>{ clearTimeout(debounceT); clearTimeout(flashT); });
</script>
