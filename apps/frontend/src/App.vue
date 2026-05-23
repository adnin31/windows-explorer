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
              <span>Home</span>
              <template v-for="crumb in workspace.breadcrumbs.value" :key="crumb.id">
                <span class="sep">›</span>
                <button @click="workspace.selectFolder(crumb.id)">{{ crumb.name }}</button>
              </template>
            </nav>

            <div class="toolbar-actions">
              <button title="Grid view">▦</button>
              <button title="List view">☰</button>
              <button title="Sort">Sort</button>
            </div>
          </div>

          <div class="content-scroll">
            <ContentView
              :folder-name="activeFolderName"
              :subfolders="workspace.filteredChildren.value.subfolders"
              :files="workspace.filteredChildren.value.files"
              @open-folder="workspace.selectFolder"
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
