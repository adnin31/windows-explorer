export type NodeKind = "folder" | "file";

export interface FolderDto {
  id: number;
  name: string;
  hasChildren: boolean;
}

export interface FileDto {
  id: number;
  name: string;
  extension: string;
  size: number;
}
