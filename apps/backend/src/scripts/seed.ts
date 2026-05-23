import { eq, isNull } from "drizzle-orm";
import { files, folders } from "../../drizzle/schema";
import { db } from "../infrastructure/database/client";

async function seed() {
  console.log("Seeding database...");

  await db.delete(files);
  await db.delete(folders);

  const [documents] = await db
    .insert(folders)
    .values({ name: "Documents", parentId: null })
    .returning({ id: folders.id });

  const [downloads] = await db
    .insert(folders)
    .values({ name: "Downloads", parentId: null })
    .returning({ id: folders.id });

  const [pictures] = await db
    .insert(folders)
    .values({ name: "Pictures", parentId: null })
    .returning({ id: folders.id });

  const [work] = await db
    .insert(folders)
    .values({ name: "Work", parentId: documents.id })
    .returning({ id: folders.id });

  const [personal] = await db
    .insert(folders)
    .values({ name: "Personal", parentId: documents.id })
    .returning({ id: folders.id });

  const [invoices] = await db
    .insert(folders)
    .values({ name: "Invoices", parentId: work.id })
    .returning({ id: folders.id });

  const [reports] = await db
    .insert(folders)
    .values({ name: "Reports", parentId: work.id })
    .returning({ id: folders.id });

  const [travel] = await db
    .insert(folders)
    .values({ name: "Travel", parentId: personal.id })
    .returning({ id: folders.id });

  const [projects] = await db
    .insert(folders)
    .values({ name: "Projects", parentId: downloads.id })
    .returning({ id: folders.id });

  await db.insert(files).values([
    {
      name: "resume",
      extension: "pdf",
      sizeInBytes: 154_200,
      folderId: documents.id,
      checksum: "resume-pdf-001",
    },
    {
      name: "tax_2025",
      extension: "xlsx",
      sizeInBytes: 842_901,
      folderId: documents.id,
      checksum: "tax-xlsx-2025",
    },
    {
      name: "q1_report",
      extension: "pdf",
      sizeInBytes: 531_200,
      folderId: reports.id,
      checksum: "q1-report-pdf-01",
    },
    {
      name: "q2_report",
      extension: "pdf",
      sizeInBytes: 553_010,
      folderId: reports.id,
      checksum: "q2-report-pdf-01",
    },
    {
      name: "invoice_march",
      extension: "pdf",
      sizeInBytes: 220_004,
      folderId: invoices.id,
      checksum: "invoice-march-2026",
    },
    {
      name: "invoice_april",
      extension: "pdf",
      sizeInBytes: 231_112,
      folderId: invoices.id,
      checksum: "invoice-april-2026",
    },
    {
      name: "passport_scan",
      extension: "jpg",
      sizeInBytes: 124_550,
      folderId: travel.id,
      checksum: "passport-jpg-2026",
    },
    {
      name: "beach_photo",
      extension: "png",
      sizeInBytes: 2_104_232,
      folderId: pictures.id,
      checksum: "beach-png-0001",
    },
    {
      name: "backend_source",
      extension: "zip",
      sizeInBytes: 14_882_112,
      folderId: projects.id,
      checksum: "backend-zip-v1",
    },
  ]);

  const rootFolders = await db
    .select({ id: folders.id, name: folders.name })
    .from(folders)
    .where(isNull(folders.parentId));

  const documentsChildren = await db
    .select({ id: folders.id, name: folders.name })
    .from(folders)
    .where(eq(folders.parentId, documents.id));

  console.log(`Seed completed. Root folders: ${rootFolders.length}`);
  console.log(`Documents children: ${documentsChildren.length}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
