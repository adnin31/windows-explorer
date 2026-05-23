<script setup lang="ts">
import { computed, ref } from "vue";
import type { FolderChildrenResponse, FolderItem } from "../types/workspace";

const props = defineProps<{
  folder: FolderItem;
  depth: number;
  selectedFolderId: number | null;
  loadingFolderId: number | null;
  getChildren: (folderId: number) => FolderChildrenResponse | undefined;
}>();

const emit = defineEmits<{
  toggle: [folderId: number];
  select: [folderId: number];
}>();

const isExpanded = ref(false);

const indentationStyle = computed(() => ({
  paddingLeft: `${props.depth * 16 + 8}px`,
}));

const isSelected = computed(() => props.selectedFolderId === props.folder.id);
const isLoading = computed(() => props.loadingFolderId === props.folder.id);

function onChevronClick() {
  isExpanded.value = !isExpanded.value;

  if (isExpanded.value) {
    emit("toggle", props.folder.id);
  }
}

function onFolderClick() {
  emit("select", props.folder.id);
}
</script>

<template>
  <div>
    <div
      class="tree-row group"
      :class="
        isSelected
          ? 'is-selected'
          : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
      "
      :style="indentationStyle"
    >
      <button
        class="chevron-btn"
        :disabled="!folder.hasChildren"
        @click.stop="onChevronClick"
      >
        <span v-if="folder.hasChildren">{{ isExpanded ? "▼" : "►" }}</span>
      </button>

      <button
        class="tree-label"
        @click="onFolderClick"
      >
        <span class="text-[14px]">📁</span>
        <span class="truncate">{{ folder.name }}</span>
      </button>

      <span v-if="isLoading" class="loading-dot" />
    </div>

    <template v-if="isExpanded">
      <FolderNode
        v-for="subfolder in getChildren(folder.id)?.subfolders ?? []"
        :key="subfolder.id"
        :folder="subfolder"
        :depth="depth + 1"
        :selected-folder-id="selectedFolderId"
        :loading-folder-id="loadingFolderId"
        :get-children="getChildren"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
    </template>
  </div>
</template>
