const MEDIA_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
};

const ACCEPTED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
] as const;

const ACCEPTED_MEDIA_EXTENSIONS = Object.keys(MEDIA_TYPE_BY_EXTENSION);

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot).toLowerCase();
}

export function resolveMediaMimeType(fileName: string, mimeType?: string | null) {
  const normalized = mimeType?.trim().toLowerCase();
  if (normalized && ACCEPTED_MEDIA_MIME_TYPES.includes(normalized as (typeof ACCEPTED_MEDIA_MIME_TYPES)[number])) {
    return normalized;
  }

  const extension = getExtension(fileName);
  return MEDIA_TYPE_BY_EXTENSION[extension] ?? null;
}

export function isAcceptedMediaFile(file: Pick<File, "name" | "type">) {
  return resolveMediaMimeType(file.name, file.type) !== null;
}

export function getAcceptedMediaMimeType(file: Pick<File, "name" | "type">) {
  return resolveMediaMimeType(file.name, file.type);
}

export function isAcceptedVideoMimeType(mimeType: string) {
  return mimeType.startsWith("video/");
}

export const ACCEPTED_MEDIA_INPUT = [
  ...ACCEPTED_MEDIA_MIME_TYPES,
  ...ACCEPTED_MEDIA_EXTENSIONS,
].join(",");

