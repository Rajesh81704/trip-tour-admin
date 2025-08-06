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
        const response = await api.get(`/packages/${id}`);
        if (response.status !== 200) throw new Error("Failed to fetch package");

        const data = (response.data as { package: Package }).package;
        setPackageData(data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching package");
        router.push("/packages");
      }
    };
    fetchPackage();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await api.put(`/packages/${id}`, formData, true);
      if (response.status !== 200) throw new Error("Failed to update package");

      toast.success("Package updated successfully");
      router.push("/packages");
    } catch (error) {
      console.error(error);
      toast.error("Error updating package");
    }
  };

  if (!packageData) {
    return <div className="p-8 max-w-7xl mx-auto">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Package</h1>
      <PackageForm initialData={packageData} onSubmit={handleSubmit} />
    </div>
  );
}
