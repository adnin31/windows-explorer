import type {
  FileNode,
  FolderChildren,
  FolderNode,
} from "../../domain/entities/folder";
import type { WorkspaceRepository } from "../../domain/repositories/workspace-repository";

export class WorkspaceService {
  constructor(private readonly repository: WorkspaceRepository) {}

  async createFolder(input: {
    name: string;
    parentId?: number | null;
  }): Promise<FolderNode> {
    const name = input.name?.trim();

    if (!name) {
      throw new Error("Folder name is required");
    }

    if (name.length > 255) {
      throw new Error("Folder name is too long");
    }

    const parentId = input.parentId ?? null;

    if (parentId !== null) {
      if (!Number.isInteger(parentId) || parentId <= 0) {
        throw new Error("Parent folder id must be a positive integer");
      }

      const parentExists = await this.repository.existsFolderById(parentId);

      if (!parentExists) {
        throw new Error("Parent folder not found");
      }
    }

    return this.repository.createFolder({
      name,
      parentId,
    });
  }

  async getRootFolders(rootQueryValue: unknown): Promise<FolderNode[]> {
    const isRootRequested = rootQueryValue === true || rootQueryValue === "true";

    if (!isRootRequested) {
      throw new Error('Query parameter "root=true" is required');
    }

    return this.repository.findRootFolders();
  }

  async getFolderChildren(folderId: number): Promise<FolderChildren> {
    if (!Number.isInteger(folderId) || folderId <= 0) {
      throw new Error("Folder id must be a positive integer");
    }

    const exists = await this.repository.existsFolderById(folderId);

    if (!exists) {
      throw new Error("Folder not found");
    }

    const [subfolders, files] = await Promise.all([
      this.repository.findChildFolders(folderId),
      this.repository.findFilesInFolder(folderId),
    ]);

    return {
      subfolders,
      files,
    };
  }

  async uploadFile(folderId: number, file: File): Promise<FileNode> {
    if (!Number.isInteger(folderId) || folderId <= 0) {
      throw new Error("Folder id must be a positive integer");
    }

    const exists = await this.repository.existsFolderById(folderId);

    if (!exists) {
      throw new Error("Folder not found");
    }

    if (!file || !file.name) {
      throw new Error("File is required");
    }

    const cleanName = file.name.trim();
    if (!cleanName) {
      throw new Error("File name is invalid");
    }

    const lastDotIndex = cleanName.lastIndexOf(".");
    const namePart =
      lastDotIndex > 0 ? cleanName.slice(0, lastDotIndex) : cleanName;
    const extensionPart =
      lastDotIndex > 0 && lastDotIndex < cleanName.length - 1
        ? cleanName.slice(lastDotIndex + 1)
        : "bin";

    return this.repository.createFileInFolder({
      folderId,
      name: namePart,
      extension: extensionPart.toLowerCase(),
      size: file.size,
    });
  }
}
