import { describe, expect, it } from "bun:test";
import { WorkspaceService } from "./workspace-service";
import type { WorkspaceRepository } from "../../domain/repositories/workspace-repository";

function makeRepositoryMock(): WorkspaceRepository {
  return {
    findRootFolders: async () => [{ id: 1, name: "Documents", hasChildren: true }],
    findChildFolders: async () => [{ id: 2, name: "Work", hasChildren: false }],
    findFilesInFolder: async () => [
      { id: 1, name: "resume", extension: "pdf", size: 1200 },
    ],
    existsFolderById: async () => true,
    createFolder: async ({ name, parentId }) => ({
      id: 99,
      name,
      hasChildren: false,
      parentId,
    } as any),
    createFileInFolder: async ({ folderId, name, extension, size }) => ({
      id: 88,
      name,
      extension,
      size,
      folderId,
    } as any),
  };
}

describe("WorkspaceService", () => {
  it("should return root folders only when root=true", async () => {
    const service = new WorkspaceService(makeRepositoryMock());

    const roots = await service.getRootFolders("true");
    expect(roots.length).toBe(1);

    await expect(service.getRootFolders("false")).rejects.toThrow(
      'Query parameter "root=true" is required'
    );
  });

  it("should return children and files for valid folder", async () => {
    const service = new WorkspaceService(makeRepositoryMock());

    const result = await service.getFolderChildren(1);
    expect(result.subfolders[0]?.name).toBe("Work");
    expect(result.files[0]?.extension).toBe("pdf");
  });

  it("should parse uploaded file name and extension", async () => {
    const service = new WorkspaceService(makeRepositoryMock());
    const file = new File(["hello"], "budget.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const created = await service.uploadFile(1, file);
    expect(created.name).toBe("budget");
    expect(created.extension).toBe("xlsx");
    expect(created.size).toBe(5);
  });

  it("should reject createFolder when name is empty", async () => {
    const service = new WorkspaceService(makeRepositoryMock());

    await expect(
      service.createFolder({ name: "   ", parentId: null })
    ).rejects.toThrow("Folder name is required");
  });
});
