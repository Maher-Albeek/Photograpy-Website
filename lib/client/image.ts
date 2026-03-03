const HEIC_TYPES = new Set(["image/heic", "image/heif"]);
const HEIC_EXT = /\.(heic|heif)$/i;

function isHeicFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (HEIC_TYPES.has(type)) return true;
  return HEIC_EXT.test(file.name || "");
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image"));
    };
    img.src = objectUrl;
  });
}

async function convertHeicToJpeg(file: File): Promise<File | null> {
  const img = await loadImageFromFile(file).catch(() => null);
  if (!img) return null;
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) return null;

  const baseName = (file.name || "image").replace(HEIC_EXT, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export async function normalizeImageFile(file: File): Promise<File | null> {
  if (!isHeicFile(file)) return file;
  return convertHeicToJpeg(file);
}
