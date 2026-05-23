import type { FileDto, FolderDto } from "@windows-explorer/shared";

export type FolderItem = FolderDto;
export type FileItem = FileDto;

export interface FolderChildrenResponse {
  subfolders: FolderItem[];
  files: FileItem[];
}

export interface BreadcrumbItem {
  id: number;
  name: string;
}
