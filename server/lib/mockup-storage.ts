import { objectStorageClient } from "../replit_integrations/object_storage";

function getBucketName(): string {
  const searchPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const paths = searchPaths.split(",").map(p => p.trim()).filter(p => p.length > 0);
  if (paths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  const firstPath = paths[0];
  const parts = firstPath.startsWith("/") ? firstPath.slice(1).split("/") : firstPath.split("/");
  return parts[0];
}

function getPublicPrefix(): string {
  const searchPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const paths = searchPaths.split(",").map(p => p.trim()).filter(p => p.length > 0);
  if (paths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  const firstPath = paths[0];
  const parts = firstPath.startsWith("/") ? firstPath.slice(1).split("/") : firstPath.split("/");
  return parts.slice(1).join("/");
}

export async function uploadMockupBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const bucketName = getBucketName();
  const prefix = getPublicPrefix();
  const objectName = prefix ? `${prefix}/mockups/${filename}` : `mockups/${filename}`;

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(buffer, {
    contentType,
    resumable: false,
  });

  return `/storage/mockups/${filename}`;
}
