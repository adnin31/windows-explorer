import { asc, eq, sql } from "drizzle-orm";
import { files, folders } from "../../../drizzle/schema";
import type { FileNode, FolderNode } from "../../domain/entities/folder";
import type { WorkspaceRepository } from "../../domain/repositories/workspace-repository";
import { db } from "../database/client";

export class DrizzleWorkspaceRepository implements WorkspaceRepository {
  async findRootFolders(): Promise<FolderNode[]> {
    const result = await db.execute(sql<{
      id: number;
      name: string;
      has_children: boolean;
    }>`
      select
        f.id,
        f.name,
        exists(
          select 1
          from folders child
          where child.parent_id = f.id
        ) as has_children
      from folders f
      where f.parent_id is null
      order by f.name asc
    `);

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      hasChildren: Boolean(row.has_children),
    }));
  }

  async findChildFolders(folderId: number): Promise<FolderNode[]> {
    const result = await db.execute(sql<{
      id: number;
      name: string;
      has_children: boolean;
    }>`
      select
        f.id,
        f.name,
        exists(
          select 1
          from folders child
          where child.parent_id = f.id
        ) as has_children
      from folders f
      where f.parent_id = ${folderId}
      order by f.name asc
    `);

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      hasChildren: Boolean(row.has_children),
    }));
  }

  async findFilesInFolder(folderId: number): Promise<FileNode[]> {
    const rows = await db
      .select({
        id: files.id,
        name: files.name,
        extension: files.extension,
        size: files.sizeInBytes,
      })
      .from(files)
      .where(eq(files.folderId, folderId))
      .orderBy(asc(files.name), asc(files.extension));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      extension: row.extension,
      size: row.size,
    }));
  }

  async existsFolderById(folderId: number): Promise<boolean> {
    const rows = await db
      .select({ id: folders.id })
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1);

    return rows.length > 0;
  }

  async createFolder(input: {
    name: string;
    parentId: number | null;
  }): Promise<FolderNode> {
    const [row] = await db
      .insert(folders)
      .values({
        name: input.name,
        parentId: input.parentId,
      })
      .returning({
        id: folders.id,
        name: folders.name,
      });

    return {
      id: row.id,
      name: row.name,
      hasChildren: false,
    };
  }

  async createFileInFolder(input: {
    folderId: number;
    name: string;
    extension: string;
    size: number;
  }): Promise<FileNode> {
    const [row] = await db
      .insert(files)
      .values({
        folderId: input.folderId,
        name: input.name,
        extension: input.extension,
        sizeInBytes: input.size,
        checksum: `upload-${Date.now()}`,
      })
      .returning({
        id: files.id,
        name: files.name,
        extension: files.extension,
        size: files.sizeInBytes,
      });

    return {
      id: row.id,
      name: row.name,
      extension: row.extension,
      size: row.size,
    };
  }
}
