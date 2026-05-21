// Cloudinary unsigned upload
// .env.local-a əlavə et:
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=sənin_cloud_name
// NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sənin_preset (unsigned)

export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
};

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary konfiqurasiyası tapılmadı. .env.local-ı yoxlayın.");
  }

  // Fayl növünə görə resource_type
  const resourceType = getResourceType(file);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "eduflow");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          format: data.format,
          bytes: data.bytes,
        });
      } else {
        reject(new Error("Upload uğursuz oldu: " + xhr.responseText));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Şəbəkə xətası")));
    xhr.open("POST", url);
    xhr.send(formData);
  });
}

function getResourceType(file: File): string {
  const type = file.type;
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("image/")) return "image";
  // PDF, Word, digər fayllar
  return "raw";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getFileIcon(file: File): string {
  const type = file.type;
  if (type.startsWith("video/")) return "🎥";
  if (type.startsWith("image/")) return "🖼️";
  if (type === "application/pdf") return "📄";
  if (type.includes("word")) return "📝";
  return "📎";
}

export const ACCEPTED_FILE_TYPES = {
  VIDEO: "video/mp4,video/webm,video/ogg,video/avi,video/mov",
  PDF: "application/pdf",
  IMAGE: "image/jpeg,image/png,image/gif,image/webp",
  WORD: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ALL: "video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
