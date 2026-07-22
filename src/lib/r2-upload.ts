/**
 * r2-upload.ts
 *
 * Client-side utility for uploading files to R2 via the backend.
 *
 * Flow:
 *   1. Send files as multipart/form-data to the backend (/upload/direct)
 *   2. Backend uploads them to R2 server-side (no CORS issues)
 *   3. Return { key, publicUrl } to be stored in the form / DB
 *
 * Files are automatically chunked into batches of ≤ 4 MB per request
 * to stay within the Next.js App Router body size limit.
 */

import api from "@/lib/api";

export interface UploadedFile {
  /** R2 object key — used as `public_id` in the DB */
  key: string;
  /** Public CDN URL — used as `url` in the DB */
  publicUrl: string;
}

interface DirectUploadResponse {
  success: boolean;
  results: { key: string; publicUrl: string }[];
}

/** Max payload size per request (4 MB with some headroom for form fields) */
const MAX_CHUNK_BYTES = 3.8 * 1024 * 1024; // ~3.8 MB to leave room for multipart overhead

// ─── Split files into batches that fit within the size limit ─────────────────
function chunkFiles(files: File[]): File[][] {
  const chunks: File[][] = [];
  let currentChunk: File[] = [];
  let currentSize = 0;

  for (const file of files) {
    // If a single file exceeds the limit, send it alone in its own chunk
    if (file.size > MAX_CHUNK_BYTES) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }
      chunks.push([file]);
      continue;
    }

    if (currentSize + file.size > MAX_CHUNK_BYTES && currentChunk.length > 0) {
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

// ─── Upload a single batch of files ──────────────────────────────────────────
async function uploadBatch(
  files: File[],
  folder: string,
): Promise<UploadedFile[]> {
  const formData = new FormData();
  formData.append("folder", folder);
  files.forEach((f) => formData.append("files", f));

  const { data } = await api.post<DirectUploadResponse>(
    "/upload/direct",
    formData,
    true, // isFormData = true
  );

  if (!data.success || !data.results?.length)
    throw new Error("Failed to upload files to server");

  return data.results.map(({ key, publicUrl }) => ({ key, publicUrl }));
}

// ─── Upload a single file ─────────────────────────────────────────────────────
export async function uploadFileToR2(
  file: File,
  folder: "packages" | "hotels" | "flights" | "sightseeings" | "destinations" | "misc" = "packages",
  _onProgress?: (pct: number) => void,
): Promise<UploadedFile> {
  const results = await uploadFilesToR2([file], folder);
  return results[0];
}

/** Max allowed size per individual file (must match backend multer limit) */
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Upload multiple files, chunked to stay under 4 MB per request ───────────
export async function uploadFilesToR2(
  files: File[],
  folder: "packages" | "hotels" | "flights" | "sightseeings" | "destinations" | "misc" = "packages",
  _onProgress?: (fileIndex: number, pct: number) => void,
): Promise<UploadedFile[]> {
  if (files.length === 0) return [];

  // Reject any file that exceeds the backend limit
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `"${file.name}" is ${sizeMB} MB — max allowed is 10 MB. Please compress or resize it.`
      );
    }
  }

  const chunks = chunkFiles(files);
  const allResults: UploadedFile[] = [];

  for (const chunk of chunks) {
    const results = await uploadBatch(chunk, folder);
    allResults.push(...results);
  }

  return allResults;
}

// ─── Delete a file by key ─────────────────────────────────────────────────────
export async function deleteFileFromR2(key: string): Promise<void> {
  await api.delete(`/upload?key=${encodeURIComponent(key)}`);
}
