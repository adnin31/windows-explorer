import type { FileNode, FolderNode } from "../entities/folder";

export interface WorkspaceRepository {
  findRootFolders(): Promise<FolderNode[]>;
  findChildFolders(folderId: number): Promise<FolderNode[]>;
  findFilesInFolder(folderId: number): Promise<FileNode[]>;
  existsFolderById(folderId: number): Promise<boolean>;
  createFolder(input: {
    name: string;
    parentId: number | null;
  }): Promise<FolderNode>;
  createFileInFolder(input: {
    folderId: number;
    name: string;
    extension: string;
    size: number;
  }): Promise<FileNode>;
}
