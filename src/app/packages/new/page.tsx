"use client";
import PackageForm from "@/components/forms/package";
import api from "@/lib/api";

export default function NewPackagePage() {
  // Images are uploaded directly to Cloudflare R2 from the client-side UI.
  // The form sends the resulting image URLs in a clean JSON payload.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    await api.post("/packages", data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Create New Package</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the sections below. Itinerary days auto-populate when you set the duration.
          Images are uploaded directly.
        </p>
      </div>
      <PackageForm onSubmit={handleSubmit} />
    </div>
  );
}
