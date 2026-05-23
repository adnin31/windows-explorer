import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
  __resetWorkspaceStateForTests,
  useWorkspace,
} from "./useWorkspace";

function asJsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useWorkspace", () => {
  beforeEach(() => {
    __resetWorkspaceStateForTests();
  });

  it("loads roots and selects first root folder", async () => {
    globalThis.fetch = mock(async (url: string) => {
      if (url === "/api/v1/folders?root=true") {
        return asJsonResponse([
          { id: 1, name: "Documents", hasChildren: true },
          { id: 2, name: "Downloads", hasChildren: false },
        ]);
      }

      if (url === "/api/v1/folders/1/children") {
        return asJsonResponse({
          subfolders: [{ id: 3, name: "Work", hasChildren: false }],
          files: [{ id: 11, name: "resume", extension: "pdf", size: 1200 }],
        });
      }

      return asJsonResponse({ message: "not found" }, 404);
    }) as typeof fetch;

    const workspace = useWorkspace();
    await workspace.loadRoots();

    expect(workspace.roots.value.length).toBe(2);
    expect(workspace.selectedFolderId.value).toBe(1);
    expect(workspace.selectedChildren.value.files.length).toBe(1);
  });

  it("uses cache to avoid duplicate children request", async () => {
    let childrenCalls = 0;

    globalThis.fetch = mock(async (url: string) => {
      if (url === "/api/v1/folders/7/children") {
        childrenCalls += 1;
        return asJsonResponse({ subfolders: [], files: [] });
      }

      return asJsonResponse({ message: "not found" }, 404);
    }) as typeof fetch;

    const workspace = useWorkspace();
    await workspace.ensureFolderChildren(7);
    await workspace.ensureFolderChildren(7);

    expect(childrenCalls).toBe(1);
  });

  it("filters files by search query", async () => {
    const workspace = useWorkspace();

    workspace.selectedFolderId.value = 1;
    workspace.folderCache.set(1, {
      subfolders: [{ id: 2, name: "Finance", hasChildren: false }],
      files: [
        { id: 1, name: "budget", extension: "xlsx", size: 2000 },
        { id: 2, name: "resume", extension: "pdf", size: 1200 },
      ],
    });

    workspace.searchQuery.value = "budget";
    expect(workspace.filteredChildren.value.files.length).toBe(1);
    expect(workspace.filteredChildren.value.files[0]?.name).toBe("budget");
  });
});
