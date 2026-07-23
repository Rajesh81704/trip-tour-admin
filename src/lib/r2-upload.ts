/**
 * r2-upload.ts
 *
 * Client-side utility for uploading files directly to Cloudflare R2 via presigned URLs.
 *
 * Flow:
 *   1. Request presigned PUT URLs from backend (/upload/presign/batch) with lightweight JSON metadata.
 *   2. Upload binary file bytes directly from browser to R2 via HTTP PUT (bypassing Next.js proxy limits).
 *   3. If direct presigned upload fails (e.g. CORS restriction), fall back to server-side /upload/direct.
 *   4. Return { key, publicUrl } to be stored in the form / DB.
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

interface DirectUploadResponse {
  success: boolean;
  results: { key: string; publicUrl: string }[];
}

export type ValidFolder = "packages" | "hotels" | "flights" | "sightseeings" | "destinations" | "misc";

/** Max allowed size per individual file (50 MB for direct R2, 10 MB for backend fallback) */
const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

/** Max payload size per request for direct backend fallback (3.8 MB) */
const MAX_FALLBACK_CHUNK_BYTES = 3.8 * 1024 * 1024;

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
    console.warn(`Direct upload to R2 presigned URL failed for ${file.name}:`, err);
    return false;
  }
}

// ─── Fallback: Chunk files & send to /upload/direct ──────────────────────────
function chunkFilesForFallback(files: File[]): File[][] {
  const chunks: File[][] = [];
  let currentChunk: File[] = [];
  let currentSize = 0;

  for (const file of files) {
    if (file.size > MAX_FALLBACK_CHUNK_BYTES) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }
      chunks.push([file]);
      continue;
    }

    if (currentSize + file.size > MAX_FALLBACK_CHUNK_BYTES && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(file);
    currentSize += file.size;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function uploadFallbackBatch(files: File[], folder: ValidFolder): Promise<UploadedFile[]> {
  const formData = new FormData();
  formData.append("folder", folder);
  files.forEach((f) => formData.append("files", f));

  const { data } = await api.post<DirectUploadResponse>("/upload/direct", formData, true);

  if (!data.success || !data.results?.length) {
    throw new Error("Fallback server upload failed");
  }

  return data.results.map(({ key, publicUrl }) => ({ key, publicUrl }));
}

async function uploadViaFallback(files: File[], folder: ValidFolder): Promise<UploadedFile[]> {
  const chunks = chunkFilesForFallback(files);
  const allResults: UploadedFile[] = [];
  for (const chunk of chunks) {
    const results = await uploadFallbackBatch(chunk, folder);
    allResults.push(...results);
  }
  return allResults;
}

// ─── Upload a single file ─────────────────────────────────────────────────────
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

// ─── Main Upload Function (Presigned URL + Fallback) ─────────────────────────
export async function uploadFilesToR2(
  files: File[],
  folder: ValidFolder = "packages",
  onProgress?: (completedCount: number, totalCount: number) => void,
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];

  // Validate file sizes
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `"${file.name}" is ${sizeMB} MB — max allowed file size is 50 MB.`
      );
    }
  }

  try {
    // Slices of 20 files per presign batch request (backend limit)
    const BATCH_SIZE = 20;
    const finalResults: UploadedFile[] = [];
    const failedFiles: File[] = [];

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
        throw new Error("Failed to generate presigned upload URLs from backend");
      }

      // Perform direct PUT upload to Cloudflare R2
      for (let j = 0; j < batchFiles.length; j++) {
        const file = batchFiles[j];
        const { uploadUrl, key, publicUrl } = data.results[j];

        const success = await uploadToPresignedUrl(uploadUrl, file);
        if (success) {
          finalResults.push({ key, publicUrl });
          if (onProgress) onProgress(finalResults.length + failedFiles.length, files.length);
        } else {
          failedFiles.push(file);
        }
      }
    }

    // If any direct uploads failed (e.g. CORS block), process failed files via fallback endpoint
    if (failedFiles.length > 0) {
      console.warn(`Falling back to direct server upload for ${failedFiles.length} file(s)...`);
      const fallbackResults = await uploadViaFallback(failedFiles, folder);
      finalResults.push(...fallbackResults);
      if (onProgress) onProgress(files.length, files.length);
    }

    return finalResults;
  } catch (err) {
    console.warn("Presigned URL upload failed, using direct backend upload fallback...", err);
    // Complete fallback for all files if presign API request failed
    return uploadViaFallback(files, folder);
  }
}

// ─── Delete a file by key ─────────────────────────────────────────────────────
export async function deleteFileFromR2(key: string): Promise<void> {
  await api.delete(`/upload?key=${encodeURIComponent(key)}`);
}

