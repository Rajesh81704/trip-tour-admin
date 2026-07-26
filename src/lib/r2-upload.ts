/**
 * r2-upload.ts
 *
 * Client-side utility for uploading files DIRECTLY to Cloudflare R2 via presigned URLs ONLY.
 *
 * Flow:
 *   1. Request presigned PUT URLs from backend (/upload/presign/batch) with file content types.
 *   2. Upload binary file bytes directly from browser to Cloudflare R2 via HTTP PUT.
 *   3. Return { key, publicUrl } to be stored in the package DB.
 */

import api from "@/lib/api";

export interface UploadedFile {
  /** R2 object key — used as `public_id` in the DB */
  key: string;
  /** Public CDN URL — used as `url` in the DB */
  publicUrl: string;
}

interface BatchPresignResponse {
  success: boolean;
  results: {
    uploadUrl: string;
    key: string;
    publicUrl: string;
  }[];
}

export type ValidFolder = "packages" | "hotels" | "flights" | "sightseeings" | "destinations" | "misc";

/** Max allowed size per individual file (50 MB for direct R2 upload) */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Upload a single file directly to R2 presigned URL ───────────────────────
async function uploadToPresignedUrl(uploadUrl: string, file: File): Promise<boolean> {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });
    return response.ok;
  } catch (err) {
    console.error(`Direct PUT upload to Cloudflare R2 failed for ${file.name}:`, err);
    return false;
  }
}

// ─── Upload a single file to R2 ─────────────────────────────────────────────
export async function uploadFileToR2(
  file: File,
  folder: ValidFolder = "packages",
  onProgress?: (pct: number) => void,
): Promise<UploadedFile> {
  const results = await uploadFilesToR2([file], folder, (current, total) => {
    if (onProgress) onProgress(Math.round((current / total) * 100));
  });
  return results[0];
}

// ─── Direct R2 Upload Function ONLY (Strictly Presigned PUT) ─────────────────
export async function uploadFilesToR2(
  files: File[],
  folder: ValidFolder = "packages",
  onProgress?: (completedCount: number, totalCount: number) => void,
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];

  // Validate file sizes before sending
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`"${file.name}" is ${sizeMB} MB — max allowed file size for Cloudflare R2 is 50 MB.`);
    }
  }

  // Slices of 20 files per presign batch request (backend limit)
  const BATCH_SIZE = 20;
  const finalResults: UploadedFile[] = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batchFiles = files.slice(i, i + BATCH_SIZE);

    // Request presigned URLs from backend
    const { data } = await api.post<BatchPresignResponse>("/upload/presign/batch", {
      files: batchFiles.map((f) => ({
        contentType: f.type || "image/jpeg",
        folder,
      })),
    });

    if (!data.success || !data.results || data.results.length !== batchFiles.length) {
      throw new Error("Failed to generate presigned upload URLs for Cloudflare R2.");
    }

    // Perform direct HTTP PUT upload to Cloudflare R2
    for (let j = 0; j < batchFiles.length; j++) {
      const file = batchFiles[j];
      const { uploadUrl, key, publicUrl } = data.results[j];

      const success = await uploadToPresignedUrl(uploadUrl, file);
      if (!success) {
        throw new Error(`Direct Cloudflare R2 upload failed for file "${file.name}".`);
      }

      finalResults.push({ key, publicUrl });
      if (onProgress) onProgress(finalResults.length, files.length);
    }
  }

  return finalResults;
}

// ─── Delete a file by key from R2 ────────────────────────────────────────────
export async function deleteFileFromR2(key: string): Promise<void> {
  await api.delete(`/upload?key=${encodeURIComponent(key)}`);
}
