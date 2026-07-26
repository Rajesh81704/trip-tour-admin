/**
 * r2-upload.ts
 *
 * Direct client-side utility for uploading files EXCLUSIVELY to Cloudflare R2 via presigned URLs.
 * Bypasses backend server proxying — binary file payload goes straight from browser to Cloudflare R2 CDN.
 */

import api from "@/lib/api";

export interface UploadedFile {
  /** R2 object key — stored as `public_id` in DB */
  key: string;
  /** Public CDN URL — stored as `url` in DB */
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

/** Max allowed size per file (50 MB) */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

// ─── Helper: Delay ────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Direct PUT to R2 presigned URL with 3 Retries ────────────────────────────
async function uploadToPresignedUrlWithRetry(
  uploadUrl: string,
  file: File,
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (response.ok) return true;
      console.warn(`Presigned PUT attempt ${attempt} for ${file.name} returned status ${response.status}`);
    } catch (err) {
      console.warn(`Presigned PUT attempt ${attempt} failed for ${file.name}:`, err);
    }

    if (attempt < retries) {
      await delay(attempt * 300); // 300ms, 600ms...
    }
  }

  return false;
}

// ─── Single File Upload ───────────────────────────────────────────────────────
export async function uploadFileToR2(
  file: File,
  folder: ValidFolder = "packages",
  onProgress?: (pct: number) => void
): Promise<UploadedFile> {
  const results = await uploadFilesToR2([file], folder, (current, total) => {
    if (onProgress) onProgress(Math.round((current / total) * 100));
  });
  return results[0];
}

// ─── Main Batch Upload Function (Direct Browser to R2 ONLY) ───────────────────
export async function uploadFilesToR2(
  files: File[],
  folder: ValidFolder = "packages",
  onProgress?: (completedCount: number, totalCount: number) => void
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];

  // Size Validation
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`"${file.name}" is ${sizeMB} MB. Maximum allowed size for Cloudflare R2 is 50 MB.`);
    }
  }

  const finalResults: UploadedFile[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batchFiles = files.slice(i, i + BATCH_SIZE);

    // 1. Request presigned URLs from backend
    const { data } = await api.post<BatchPresignResponse>("/upload/presign/batch", {
      files: batchFiles.map((f) => ({
        contentType: f.type || "image/jpeg",
        folder,
      })),
    });

    if (!data.success || !data.results || data.results.length !== batchFiles.length) {
      throw new Error("Failed to obtain presigned upload URLs for Cloudflare R2.");
    }

    // 2. Upload binary bytes directly from browser to R2 via PUT (3 parallel connections)
    const CONCURRENCY = 3;
    for (let j = 0; j < batchFiles.length; j += CONCURRENCY) {
      const chunk = batchFiles.slice(j, j + CONCURRENCY);
      const presignChunk = data.results.slice(j, j + CONCURRENCY);

      await Promise.all(
        chunk.map(async (file, idx) => {
          const { uploadUrl, key, publicUrl } = presignChunk[idx];
          const success = await uploadToPresignedUrlWithRetry(uploadUrl, file, 3);
          if (!success) {
            throw new Error(`Direct Cloudflare R2 upload failed for file "${file.name}".`);
          }
          finalResults.push({ key, publicUrl });
          if (onProgress) {
            onProgress(finalResults.length, files.length);
          }
        })
      );
    }
  }

  return finalResults;
}

export async function deleteFileFromR2(key: string): Promise<void> {
  await api.delete(`/upload?key=${encodeURIComponent(key)}`);
}
