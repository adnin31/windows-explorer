<script setup lang="ts">
import { nextTick, ref, watch } from "vue";

const props = defineProps<{
  open: boolean;
  loading: boolean;
  currentFolderName: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [name: string];
}>();

const folderName = ref("New Folder");
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      folderName.value = "New Folder";
      return;
    }

    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select();
  }
);

function onClose() {
  if (props.loading) {
    return;
  }

  emit("close");
}

function onSubmit() {
  const value = folderName.value.trim();

  if (!value || props.loading) {
    return;
  }

  emit("submit", value);
}
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="onClose">
    <dialog open class="modal-card" aria-label="Create folder dialog">
      <h2 class="modal-title">Create New Folder</h2>
      <p class="modal-subtitle">Parent: {{ currentFolderName }}</p>

      <label class="modal-label" for="folder-name-input">Folder Name</label>
      <input
        id="folder-name-input"
        ref="inputRef"
        v-model="folderName"
        class="modal-input"
        :disabled="loading"
        type="text"
        placeholder="Enter folder name"
        @keydown.enter.prevent="onSubmit"
        @keydown.esc.prevent="onClose"
      />

      <div class="modal-actions">
        <button class="modal-btn ghost" :disabled="loading" @click="onClose">Cancel</button>
        <button class="modal-btn solid" :disabled="loading" @click="onSubmit">
          <span v-if="loading">Creating...</span>
          <span v-else>Create</span>
        </button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: rgba(15, 23, 42, 0.38);
  display: grid;
  place-items: center;
  padding: 16px;
}

.modal-card {
  width: min(420px, 100%);
  border-radius: 10px;
  border: 1px solid #cfd7e4;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.24);
  padding: 16px;
}

.modal-title {
  margin: 0;
  font-family: "Sora", sans-serif;
  font-size: 18px;
  color: #1f2937;
}

.modal-subtitle {
  margin: 6px 0 14px;
  font-size: 12px;
  color: #64748b;
}

.modal-label {
  display: block;
  font-size: 12px;
  color: #475569;
  margin-bottom: 6px;
}

.modal-input {
  width: 100%;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 13px;
  color: #334155;
}

.modal-input:focus {
  outline: 1px solid #93c5fd;
}

.modal-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-btn {
  height: 34px;
  min-width: 84px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
}

.modal-btn.ghost {
  background: #f8fafc;
  color: #334155;
}

.modal-btn.solid {
  background: #2c69bc;
  border-color: #2c69bc;
  color: #fff;
}

.modal-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
