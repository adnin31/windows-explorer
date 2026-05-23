<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ContentView from "./components/ContentView.vue";
import FolderNode from "./components/FolderNode.vue";
import NewFolderModal from "./components/NewFolderModal.vue";
import { useWorkspace } from "./composables/useWorkspace";
import type { FolderChildrenResponse } from "./types/workspace";

const workspace = useWorkspace();

onMounted(() => {
  workspace.loadRoots();
});

const activeFolderName = computed(() => {
  if (workspace.selectedFolderId.value === null) {
    return "Choose a folder";
  }

  const last = workspace.breadcrumbs.value[workspace.breadcrumbs.value.length - 1];
  return last?.name ?? "Choose a folder";
});

function getChildren(folderId: number): FolderChildrenResponse | undefined {
  return workspace.folderCache.get(folderId);
}

const navGroups = [
  "Quick access",
  "Desktop",
  "Documents",
  "Downloads",
  "Pictures",
];

const uploaderRef = ref<HTMLInputElement | null>(null);
const showCreateFolderModal = ref(false);
const viewMode = ref<"grid" | "list">("grid");
const sortBy = ref<"name-asc" | "name-desc" | "size-desc">("name-asc");
const activeEntryKey = ref<string | null>(null);

function openUploader() {
  uploaderRef.value?.click();
}

function openCreateFolderModal() {
  showCreateFolderModal.value = true;
}

function closeCreateFolderModal() {
  if (workspace.creatingFolder.value) {
    return;
  }

  showCreateFolderModal.value = false;
}

async function onCreateFolder(name: string) {
  await workspace.createFolderFromSelection(name);

  if (!workspace.errorMessage.value) {
    showCreateFolderModal.value = false;
  }
}

async function onFilePicked(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  await workspace.uploadToSelectedFolder(file);
  input.value = "";
}

function onGoHome() {
  const firstRootId = workspace.roots.value[0]?.id;

  if (firstRootId) {
    workspace.selectFolder(firstRootId);
  }
}

function onSelectEntry(entryKey: string) {
  activeEntryKey.value = entryKey;
}

const sortedSubfolders = computed(() => {
  const list = [...workspace.filteredChildren.value.subfolders];

  if (sortBy.value === "name-desc") {
    return list.sort((a, b) => b.name.localeCompare(a.name));
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
});

const sortedFiles = computed(() => {
  const list = [...workspace.filteredChildren.value.files];

  if (sortBy.value === "name-desc") {
    return list.sort((a, b) =>
      `${b.name}.${b.extension}`.localeCompare(`${a.name}.${a.extension}`)
    );
  }

  if (sortBy.value === "size-desc") {
    return list.sort((a, b) => b.size - a.size);
  }

  return list.sort((a, b) =>
    `${a.name}.${a.extension}`.localeCompare(`${b.name}.${b.extension}`)
  );
});
</script>

<template>
  <main class="shell-wrap">
    <div class="explorer-shell">
      <header class="topbar">
        <div class="topbar-left">
          <div class="brand-cloud">☁</div>
          <h1 class="brand-title">CloudDrive</h1>
        </div>

        <div class="topbar-right">
          <input
            v-model="workspace.searchQuery.value"
            class="search-input"
            placeholder="Search files..."
            type="text"
          />
          <button class="icon-btn">⚙</button>
          <button class="icon-btn">?</button>
        </div>
      </header>

      <section class="workbench">
        <aside class="sidebar">
          <button
            class="new-folder-btn"
            :disabled="workspace.creatingFolder.value"
            @click="openCreateFolderModal"
          >
            <span v-if="workspace.creatingFolder.value">Creating...</span>
            <span v-else>＋ New Folder</span>
          </button>

          <p class="nav-title">NAVIGATION</p>
          <div class="tree-area">
            <div v-if="workspace.loadingRoots.value" class="tree-hint">Loading folders...</div>
            <div v-else-if="workspace.roots.value.length === 0" class="tree-hint">No folders found.</div>
            <div v-else class="space-y-1">
              <FolderNode
                v-for="folder in workspace.roots.value"
                :key="folder.id"
                :folder="folder"
                :depth="0"
                :selected-folder-id="workspace.selectedFolderId.value"
                :loading-folder-id="workspace.loadingFolderId.value"
                :get-children="getChildren"
                @toggle="workspace.ensureFolderChildren"
                @select="workspace.selectFolder"
              />
            </div>
          </div>
        </aside>

        <section class="content-panel">
          <div class="content-toprow">
            <nav class="breadcrumb" aria-label="Breadcrumb">
              <button class="home-link" @click="onGoHome">Home</button>
              <template v-for="crumb in workspace.breadcrumbs.value" :key="crumb.id">
                <span class="sep">›</span>
                <button @click="workspace.selectFolder(crumb.id)">{{ crumb.name }}</button>
              </template>
            </nav>

            <div class="toolbar-actions">
              <button
                :class="{ 'is-active': viewMode === 'grid' }"
                title="Grid view"
                @click="viewMode = 'grid'"
              >
                ▦
              </button>
              <button
                :class="{ 'is-active': viewMode === 'list' }"
                title="List view"
                @click="viewMode = 'list'"
              >
                ☰
              </button>
              <label class="sort-select-wrap">
                <span>Sort</span>
                <select v-model="sortBy" class="sort-select">
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="size-desc">Size High-Low</option>
                </select>
              </label>
            </div>
          </div>

          <div class="content-scroll">
            <ContentView
              :folder-name="activeFolderName"
              :subfolders="sortedSubfolders"
              :files="sortedFiles"
              :view-mode="viewMode"
              :active-entry-key="activeEntryKey"
              @open-folder="workspace.selectFolder"
              @select-entry="onSelectEntry"
            />
          </div>
        </section>
      </section>

      <p v-if="workspace.errorMessage.value" class="error-chip">{{ workspace.errorMessage.value }}</p>

      <NewFolderModal
        :open="showCreateFolderModal"
        :loading="workspace.creatingFolder.value"
        :current-folder-name="activeFolderName"
        @close="closeCreateFolderModal"
        @submit="onCreateFolder"
      />

      <input
        ref="uploaderRef"
        class="hidden"
        type="file"
        @change="onFilePicked"
      />

      <button
        class="floating-upload"
        :disabled="workspace.uploading.value"
        title="Upload file"
        @click="openUploader"
      >
        <span v-if="workspace.uploading.value">...</span>
        <span v-else>⤴</span>
      </button>
    </div>
  </main>
</template>
