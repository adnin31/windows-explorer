import { Elysia } from "elysia";
import { WorkspaceService } from "../../../application/services/workspace-service";
import { DrizzleWorkspaceRepository } from "../../../infrastructure/repositories/drizzle-workspace-repository";
import { FolderController } from "../controllers/folder-controller";

const repository = new DrizzleWorkspaceRepository();
const service = new WorkspaceService(repository);
const controller = new FolderController(service);

export const folderRoutes = new Elysia({ prefix: "/api/v1/folders" })
  .post("", controller.createFolder)
  .get("", controller.getRootFolders)
  .get(":id/children", controller.getFolderChildren)
  .post(":id/files", controller.uploadFile);
