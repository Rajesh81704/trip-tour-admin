"use client";
import PackageForm from "@/components/forms/package";
import api from "@/lib/api";

export default function NewPackagePage() {
  // The form now sends a FormData with JSON-serialised fields (no raw files).
  // We re-parse it into a plain object and POST it as JSON.
  const handleSubmit = async (data: FormData) => {
    const body: Record<string, unknown> = {};
    data.forEach((value, key) => {
      // Attempt to parse JSON strings back into objects/arrays
      if (typeof value === "string") {
        try { body[key] = JSON.parse(value); } catch { body[key] = value; }
      } else {
        body[key] = value;
      }
    });
    await api.post("/packages", body);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Create New Package</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the sections below. Itinerary days auto-populate when you set the duration.
          Images are uploaded directly to Cloudflare R2.
        </p>
      </div>
      <PackageForm onSubmit={handleSubmit} />
    </div>
  );
}
