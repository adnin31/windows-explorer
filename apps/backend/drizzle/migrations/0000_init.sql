CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  extension VARCHAR(16) NOT NULL,
  size_in_bytes BIGINT NOT NULL,
  folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  checksum TEXT
);

CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);

CREATE INDEX IF NOT EXISTS idx_folders_name_trgm
  ON folders USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_files_name_trgm
  ON files USING GIN (name gin_trgm_ops);

CREATE UNIQUE INDEX IF NOT EXISTS ux_folders_parent_name
  ON folders(parent_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS ux_files_folder_name_extension
  ON files(folder_id, name, extension);
