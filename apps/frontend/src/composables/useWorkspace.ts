import { computed, reactive, ref } from "vue";
import {
  createFolder,
  fetchFolderChildren,
  fetchRootFolders,
  uploadFileToFolder,
} from "../services/api";
import type {
  BreadcrumbItem,
  FolderChildrenResponse,
  FolderItem,
} from "../types/workspace";

const roots = ref<FolderItem[]>([]);
const selectedFolderId = ref<number | null>(null);
const loadingRoots = ref(false);
const loadingFolderId = ref<number | null>(null);
const errorMessage = ref<string>("");
const searchQuery = ref("");
const uploading = ref(false);
const creatingFolder = ref(false);

const folderCache = reactive(new Map<number, FolderChildrenResponse>());
const parentById = reactive(new Map<number, number | null>());
const folderNameById = reactive(new Map<number, string>());

function registerFolders(folders: FolderItem[], parentId: number | null) {
  for (const folder of folders) {
    parentById.set(folder.id, parentId);
    folderNameById.set(folder.id, folder.name);
  }
}

async function loadRoots() {
  loadingRoots.value = true;
  errorMessage.value = "";

  try {
    const data = await fetchRootFolders();
    roots.value = data;
    registerFolders(data, null);

    if (data.length > 0 && selectedFolderId.value === null) {
      await selectFolder(data[0].id);
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load root folders";
  } finally {
    loadingRoots.value = false;
  }
}

async function ensureFolderChildren(folderId: number, force = false) {
  if (!force && folderCache.has(folderId)) {
    return;
  }

  loadingFolderId.value = folderId;
  errorMessage.value = "";

  try {
    const data = await fetchFolderChildren(folderId);
    folderCache.set(folderId, data);
    registerFolders(data.subfolders, folderId);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load folder children";
  } finally {
    loadingFolderId.value = null;
  }
}

async function selectFolder(folderId: number) {
  selectedFolderId.value = folderId;
  await ensureFolderChildren(folderId);
}

async function uploadToSelectedFolder(file: File) {
  if (selectedFolderId.value === null) {
    errorMessage.value = "Select a folder first";
    return;
  }

  uploading.value = true;
  errorMessage.value = "";

  try {
    await uploadFileToFolder(selectedFolderId.value, file);
    await ensureFolderChildren(selectedFolderId.value, true);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to upload file";
  } finally {
    uploading.value = false;
  }
}

async function createFolderFromSelection(name: string) {
  creatingFolder.value = true;
  errorMessage.value = "";

  try {
    const created = await createFolder({
      name,
      parentId: selectedFolderId.value,
    });

    if (selectedFolderId.value === null) {
      await loadRoots();
    } else {
      await ensureFolderChildren(selectedFolderId.value, true);
      await loadRoots();
    }

    await selectFolder(created.id);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to create folder";
  } finally {
    creatingFolder.value = false;
  }
}

const selectedChildren = computed<FolderChildrenResponse>(() => {
  if (selectedFolderId.value === null) {
    return { subfolders: [], files: [] };
  }

  return (
    folderCache.get(selectedFolderId.value) ?? { subfolders: [], files: [] }
  );
});

const filteredChildren = computed<FolderChildrenResponse>(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  if (!keyword) {
    return selectedChildren.value;
  }

  return {
    subfolders: selectedChildren.value.subfolders.filter((folder) =>
      folder.name.toLowerCase().includes(keyword)
    ),
    files: selectedChildren.value.files.filter((file) =>
      `${file.name}.${file.extension}`.toLowerCase().includes(keyword)
    ),
  };
});

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  if (selectedFolderId.value === null) {
    return [];
  }

  const items: BreadcrumbItem[] = [];
  let cursor: number | null = selectedFolderId.value;

  while (cursor !== null) {
    items.push({
      id: cursor,
      name: folderNameById.get(cursor) ?? `Folder ${cursor}`,
    });
    cursor = parentById.get(cursor) ?? null;
  }

  return items.reverse();
});

export function useWorkspace() {
  return {
    roots,
    selectedFolderId,
    loadingRoots,
    loadingFolderId,
    errorMessage,
    searchQuery,
    uploading,
    creatingFolder,
    folderCache,
    loadRoots,
    ensureFolderChildren,
    selectFolder,
    uploadToSelectedFolder,
    createFolderFromSelection,
    selectedChildren,
    filteredChildren,
    breadcrumbs,
  };
}
