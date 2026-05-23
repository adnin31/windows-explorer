import {
  bigint,
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const folders = pgTable(
  "folders",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    parentId: integer("parent_id").references(() => folders.id, {
      onDelete: "cascade",
    }),
  },
  (table) => ({
    foldersParentIdx: index("idx_folders_parent_id").on(table.parentId),
    foldersNameTrgmIdx: index("idx_folders_name_trgm").using(
      "gin",
      table.name.op("gin_trgm_ops")
    ),
    foldersParentNameUnique: uniqueIndex("ux_folders_parent_name").on(
      table.parentId,
      table.name
    ),
  })
);

export const files = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    extension: varchar("extension", { length: 16 }).notNull(),
    sizeInBytes: bigint("size_in_bytes", { mode: "number" }).notNull(),
    folderId: integer("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    checksum: text("checksum"),
  },
  (table) => ({
    filesFolderIdx: index("idx_files_folder_id").on(table.folderId),
    filesNameTrgmIdx: index("idx_files_name_trgm").using(
      "gin",
      table.name.op("gin_trgm_ops")
    ),
    filesFolderNameExtUnique: uniqueIndex("ux_files_folder_name_extension").on(
      table.folderId,
      table.name,
      table.extension
    ),
  })
);

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type FileEntity = typeof files.$inferSelect;
export type NewFileEntity = typeof files.$inferInsert;
