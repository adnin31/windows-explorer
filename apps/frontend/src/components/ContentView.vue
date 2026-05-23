<script setup lang="ts">
import { computed } from "vue";
import type { FileItem, FolderItem } from "../types/workspace";

const props = defineProps<{
  folderName: string;
  subfolders: FolderItem[];
  files: FileItem[];
}>();

const emit = defineEmits<{
  openFolder: [folderId: number];
}>();

const hasData = computed(
  () => props.subfolders.length > 0 || props.files.length > 0
);

function extensionBadgeClass(extension: string) {
  const value = extension.toLowerCase();

  if (value === "pdf") return "file-badge red";
  if (value === "xlsx" || value === "csv") return "file-badge green";
  if (value === "zip") return "file-badge amber";

  return "file-badge blue";
}

function prettyBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
</script>

<template>
  <section class="content-grid-wrap">
    <header class="mb-5 flex items-center justify-between px-1">
      <h2 class="font-heading text-[17px] text-slate-700">{{ folderName }}</h2>
      <p class="text-xs text-slate-500">{{ subfolders.length }} folders · {{ files.length }} files</p>
    </header>

    <div v-if="!hasData" class="empty-state">
      Folder ini belum punya isi.
    </div>

    <div v-else class="content-grid">
      <article
        v-for="folder in subfolders"
        :key="`folder-${folder.id}`"
        class="entry-card folder-card"
        @click="emit('openFolder', folder.id)"
      >
        <div class="entry-icon">📁</div>
        <h3 class="entry-name">{{ folder.name }}</h3>
        <p class="entry-meta">Folder</p>
      </article>

      <article
        v-for="file in files"
        :key="`file-${file.id}`"
        class="entry-card file-card"
      >
        <div class="entry-top">
          <div class="entry-icon">📄</div>
          <span :class="extensionBadgeClass(file.extension)">
            .{{ file.extension }}
          </span>
        </div>
        <h3 class="entry-name">{{ file.name }}.{{ file.extension }}</h3>
        <p class="entry-meta">{{ prettyBytes(file.size) }}</p>
      </article>
    </div>
  </section>
</template>
