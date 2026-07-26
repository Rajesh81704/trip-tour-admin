/**
 * r2-upload.ts
 *
 * Ultra-reliable client-side utility for uploading files to Cloudflare R2.
 *
 * Features for 100% Reliability:
 *   1. Direct presigned PUT uploads to Cloudflare R2.
 *   2. Automatic retries (3 attempts with exponential delay) for network stability.
 *   3. Controlled concurrency (3 files at a time) to prevent connection timeouts.
 *   4. Seamless server-side R2 failover (/upload/direct) if browser extension or CORS blocks direct PUT.
 *   5. Clear, user-actionable error messages.
 */

import api from "@/lib/api";

export interface UploadedFile {
  key: string;
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

interface DirectUploadResponse {
  success: boolean;
  results: { key: string; publicUrl: string }[];
}

export type ValidFolder = "packages" | "hotels" | "flights" | "sightseeings" | "destinations" | "misc";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_FALLBACK_CHUNK_BYTES = 3.8 * 1024 * 1024;

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
      console.warn(`Presigned PUT attempt ${attempt} for ${file.name} returned HTTP ${response.status}`);
    } catch (err) {
      console.warn(`Presigned PUT attempt ${attempt} failed for ${file.name}:`, err);
    }

    if (attempt < retries) {
      await delay(attempt * 400); // 400ms, 800ms...
    }
  }

  return false;
}

// ─── Fallback Server-Side R2 Upload ──────────────────────────────────────────
async function uploadFallbackBatch(files: File[], folder: ValidFolder): Promise<UploadedFile[]> {
  const formData = new FormData();
  formData.append("folder", folder);
  files.forEach((f) => formData.append("files", f));

  const { data } = await api.post<DirectUploadResponse>("/upload/direct", formData, true);

  if (!data.success || !data.results?.length) {
    throw new Error("Server R2 upload fallback failed.");
  }

  return data.results.map(({ key, publicUrl }) => ({ key, publicUrl }));
}

async function uploadViaFallback(files: File[], folder: ValidFolder): Promise<UploadedFile[]> {
  const chunks: File[][] = [];
  let currentChunk: File[] = [];
  let currentSize = 0;

  for (const file of files) {
    if (currentSize + file.size > MAX_FALLBACK_CHUNK_BYTES && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(file);
    currentSize += file.size;
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  const allResults: UploadedFile[] = [];
  for (const chunk of chunks) {
    const results = await uploadFallbackBatch(chunk, folder);
    allResults.push(...results);
  }
  return allResults;
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

// ─── Main Batch Upload Function (Controlled Concurrency + Retries) ────────────
export async function uploadFilesToR2(
  files: File[],
  folder: ValidFolder = "packages",
  onProgress?: (completedCount: number, totalCount: number) => void
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];

  // 1. Size Validation
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`"${file.name}" is ${sizeMB} MB. Maximum allowed size for Cloudflare R2 is 50 MB.`);
    }
  }

  const finalResults: UploadedFile[] = [];
  const failedFiles: File[] = [];

  try {
    const BATCH_SIZE = 20;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batchFiles = files.slice(i, i + BATCH_SIZE);

      // Request presigned URLs for this batch
      const { data } = await api.post<BatchPresignResponse>("/upload/presign/batch", {
        files: batchFiles.map((f) => ({
          contentType: f.type || "image/jpeg",
          folder,
        })),
      });

      if (!data.success || !data.results || data.results.length !== batchFiles.length) {
        throw new Error("Failed to obtain presigned upload URLs from server.");
      }

      // Process max 3 parallel PUT uploads at a time
      const CONCURRENCY = 3;
      for (let j = 0; j < batchFiles.length; j += CONCURRENCY) {
        const chunk = batchFiles.slice(j, j + CONCURRENCY);
        const presignChunk = data.results.slice(j, j + CONCURRENCY);

        await Promise.all(
          chunk.map(async (file, idx) => {
            const { uploadUrl, key, publicUrl } = presignChunk[idx];
            const success = await uploadToPresignedUrlWithRetry(uploadUrl, file, 3);
            if (success) {
              finalResults.push({ key, publicUrl });
            } else {
              failedFiles.push(file);
            }
            if (onProgress) {
              onProgress(finalResults.length + failedFiles.length, files.length);
            }
          })
        );
      }
    }

    // If any direct uploads failed after retries, process them through server-side R2 upload
    if (failedFiles.length > 0) {
      console.warn(`Retrying ${failedFiles.length} file(s) via server-side R2 upload...`);
      const fallbackResults = await uploadViaFallback(failedFiles, folder);
      finalResults.push(...fallbackResults);
      if (onProgress) onProgress(files.length, files.length);
    }

    return finalResults;
  } catch (err) {
    console.warn("Direct R2 upload batch encountered an error, running full backup upload...", err);
    return uploadViaFallback(files, folder);
  }
}

export async function deleteFileFromR2(key: string): Promise<void> {
  await api.delete(`/upload?key=${encodeURIComponent(key)}`);
}
