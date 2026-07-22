"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Package } from "@/types/package";
import PackageCard from "@/components/cards/packageCard";
import { toast } from "sonner";
import { Plus, Search, Package as PackageIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<{ packages: Package[] }>("/packages");
        setPackages(res.data.packages || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to load packages");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/packages/${id}`);
    setPackages((prev) => prev.filter((p) => p._id !== id));
    toast.success("Package deleted successfully");
  };

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const q = searchQuery.toLowerCase();
    return packages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.city.toLowerCase().includes(q) ||
        p.location.state.toLowerCase().includes(q) ||
        p.location.destination.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [packages, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PackageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Travel Packages
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {packages.length}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage, edit, and organize all tour packages in your catalog.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/packages/new"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Package
        </Link>
      </div>

      {/* ── Filter / Search Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, city, state, destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-card border-border/60 text-sm focus-visible:ring-primary/40"
          />
        </div>

        {searchQuery && (
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredPackages.length} of {packages.length} packages
          </span>
        )}
      </div>

      {/* ── Packages Grid ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-card border border-border/60 rounded-2xl h-96 animate-pulse p-4 space-y-4"
            >
              <div className="w-full h-44 bg-muted rounded-xl" />
              <div className="h-5 bg-muted rounded-md w-3/4" />
              <div className="h-4 bg-muted rounded-md w-1/2" />
              <div className="h-10 bg-muted rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((p) => (
            <PackageCard key={p._id} pkg={p} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Packages Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchQuery
              ? `No packages match "${searchQuery}". Try a different keyword.`
              : "No packages exist in your catalog yet. Click below to add your first package."}
          </p>
          {!searchQuery && (
            <Link
              href="/packages/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs mt-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Package
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
