import type { FolderChildrenResponse, FolderItem } from "../types/workspace";

export async function fetchRootFolders(): Promise<FolderItem[]> {
  const response = await fetch("/api/v1/folders?root=true");

  if (!response.ok) {
    throw new Error("Failed to fetch root folders");
  }

  return (await response.json()) as FolderItem[];
}

export async function fetchFolderChildren(
  folderId: number
): Promise<FolderChildrenResponse> {
  const response = await fetch(`/api/v1/folders/${folderId}/children`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? "Failed to fetch folder children");
  }

  return (await response.json()) as FolderChildrenResponse;
}

export async function uploadFileToFolder(
  folderId: number,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/v1/folders/${folderId}/files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? "Failed to upload file");
  }
}

export async function createFolder(input: {
  name: string;
  parentId: number | null;
}): Promise<FolderItem> {
  const response = await fetch("/api/v1/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(payload?.message ?? "Failed to create folder");
  }

  return (await response.json()) as FolderItem;
}
