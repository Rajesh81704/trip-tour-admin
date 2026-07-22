"use client";
import { useEffect, useState } from "react";
import PackageForm from "@/components/forms/package";
import { Package } from "@/types/package";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

export default function EditPackagePage() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<Package>();
  const router = useRouter();

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await api.get<{ package: Package }>(`/packages/${id}`);
        if (response.status !== 200) throw new Error("Failed to fetch package");
        setPackageData(response.data.package);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching package");
        router.push("/packages");
      }
    };
    fetchPackage();
  }, [id, router]);

  // The form sends a FormData with JSON-serialised fields (images already uploaded to R2).
  // Re-parse into a plain object and PUT it as JSON.
  const handleSubmit = async (data: FormData) => {
    try {
      const body: Record<string, unknown> = {};
      data.forEach((value, key) => {
        if (typeof value === "string") {
          try { body[key] = JSON.parse(value); } catch { body[key] = value; }
        } else {
          body[key] = value;
        }
      });

      const response = await api.put<{ success: boolean }>(`/packages/${id}`, body);
      if (response.status !== 200) throw new Error("Failed to update package");

      toast.success("Package updated successfully");
      router.push("/packages");
    } catch (error) {
      console.error(error);
      toast.error("Error updating package");
      throw error; // re-throw so the form's catch also fires
    }
  };

  if (!packageData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 py-20 justify-center text-muted-foreground">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading package…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Edit Package</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Changes are saved to the server. New images upload directly to Cloudflare R2.
        </p>
      </div>
      <PackageForm initialData={packageData} onSubmit={handleSubmit} />
    </div>
  );
}
