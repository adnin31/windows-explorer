export interface FolderNode {
  id: number;
  name: string;
  hasChildren: boolean;
}

export interface FolderChildren {
  subfolders: FolderNode[];
  files: FileNode[];
}

export interface FileNode {
  id: number;
  name: string;
  extension: string;
  size: number;
}
