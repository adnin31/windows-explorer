import { describe, expect, it } from "bun:test";
import { FolderController } from "./folder-controller";
import type { WorkspaceService } from "../../../application/services/workspace-service";

function makeController(overrides?: Partial<WorkspaceService>) {
  const service = {
    getRootFolders: async () => [],
    getFolderChildren: async () => ({ subfolders: [], files: [] }),
    createFolder: async ({ name }: { name: string; parentId?: number | null }) => ({
      id: 1,
      name,
      hasChildren: false,
    }),
    uploadFile: async (_folderId: number, file: File) => ({
      id: 1,
      name: file.name,
      extension: "txt",
      size: file.size,
    }),
    ...overrides,
  } as unknown as WorkspaceService;

  return new FolderController(service);
}

describe("FolderController", () => {
  it("returns 400 + message for invalid root query", async () => {
    const controller = makeController({
      getRootFolders: async () => {
        throw new Error('Query parameter "root=true" is required');
      },
    });

    const set: { status?: number } = {};
    const response = await controller.getRootFolders({ query: {}, set });

    expect(set.status).toBe(400);
    expect(response).toEqual({
      message: 'Query parameter "root=true" is required',
    });
  });

  it("returns 404 + message when folder children target is missing", async () => {
    const controller = makeController({
      getFolderChildren: async () => {
        throw new Error("Folder not found");
      },
    });

    const set: { status?: number } = {};
    const response = await controller.getFolderChildren({
      params: { id: "999" },
      set,
    });

    expect(set.status).toBe(404);
    expect(response).toEqual({ message: "Folder not found" });
  });

  it("returns 404 + payload error when parent folder is missing on create", async () => {
    const controller = makeController({
      createFolder: async () => {
        throw new Error("Parent folder not found");
      },
    });

    const set: { status?: number } = {};
    const response = await controller.createFolder({
      body: { name: "New Folder", parentId: 123 },
      set,
    });

    expect(set.status).toBe(404);
    expect(response).toEqual({ message: "Parent folder not found" });
  });

  it("returns 400 + payload error when upload body has no file", async () => {
    const controller = makeController();

    const set: { status?: number } = {};
    const response = await controller.uploadFile({
      params: { id: "1" },
      body: {},
      set,
    });

    expect(set.status).toBe(400);
    expect(response).toEqual({ message: "File is required" });
  });

  it("returns 404 + payload error when upload target folder is missing", async () => {
    const controller = makeController({
      uploadFile: async () => {
        throw new Error("Folder not found");
      },
    });

    const set: { status?: number } = {};
    const response = await controller.uploadFile({
      params: { id: "999" },
      body: { file: new File(["demo"], "demo.txt") },
      set,
    });

    expect(set.status).toBe(404);
    expect(response).toEqual({ message: "Folder not found" });
  });
});
