"use client";
import { useEffect } from "react";
import PackageForm from "@/components/forms/package";
import api from "@/lib/api";

export default function NewPackagePage() {
  const handleSubmit = async (data: FormData) => {
    const response = await api.post("/packages", data, true);
    console.log(response);
  };
  useEffect(() => {
    console.log("NewPackagePage");
  }, []);
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PackageForm onSubmit={handleSubmit} />
    </div>
  );
}
