import type { WorkspaceService } from "../../../application/services/workspace-service";

export class FolderController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  createFolder = async ({
    body,
    set,
  }: {
    body: { name?: string; parentId?: number | null };
    set: { status?: number };
  }) => {
    try {
      const created = await this.workspaceService.createFolder({
        name: body.name ?? "",
        parentId: body.parentId,
      });

      set.status = 201;
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      set.status = message.includes("not found") ? 404 : 400;
      return { message };
    }
  };

  getRootFolders = async ({ query, set }: { query: { root?: string | boolean }; set: { status?: number } }) => {
    try {
      return await this.workspaceService.getRootFolders(query.root);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      set.status = 400;
      return { message };
    }
  };

  getFolderChildren = async ({ params, set }: { params: { id: string }; set: { status?: number } }) => {
    const folderId = Number(params.id);

    try {
      return await this.workspaceService.getFolderChildren(folderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      set.status = message === "Folder not found" ? 404 : 400;
      return { message };
    }
  };

  uploadFile = async ({
    params,
    body,
    set,
  }: {
    params: { id: string };
    body: Record<string, unknown>;
    set: { status?: number };
  }) => {
    const folderId = Number(params.id);
    const file = body.file;
    const fileValue = file instanceof File ? file : null;

    if (!fileValue) {
      set.status = 400;
      return { message: "File is required" };
    }

    try {
      const created = await this.workspaceService.uploadFile(folderId, fileValue);
      set.status = 201;
      return created;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      set.status = message === "Folder not found" ? 404 : 400;
      return { message };
    }
  };
}
