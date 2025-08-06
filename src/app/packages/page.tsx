"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Package } from "@/types/package";
import PackageCard from "@/components/cards/packageCard";
import { toast } from "sonner";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const response = api.get("/packages");
    response.then((res) => {
      setPackages((res.data as { packages: Package[] }).packages);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/packages/${id}`);
    toast.success("Package deleted successfully");
  };
  return (
    <div className="p-8">
      <div className="flex flex-wrap gap-4">
        {packages.map((p) => (
          <PackageCard key={p._id} pkg={p} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
