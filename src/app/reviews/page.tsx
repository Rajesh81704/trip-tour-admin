"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import ConfirmDelete from "@/components/cards/confirmDelete";
import { Star, MessageSquare, Package as PackageIcon, User, Search, Award } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
}

interface ReviewPackage {
  _id: string;
  title: string;
  description?: string;
  reviews?: Array<{ rating: number } | string>;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  review?: string;
  user?: ReviewUser;
  package?: ReviewPackage;
  createdAt?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/reviews");
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      if (response.status === 200 || response.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success("Review deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  // Helper to compute average rating for a package
  const getPkgAverageRating = (pkg?: ReviewPackage) => {
    if (!pkg || !pkg.reviews || pkg.reviews.length === 0) return null;
    let sum = 0;
    let count = 0;
    for (const r of pkg.reviews) {
      if (typeof r === "number") {
        sum += r;
        count++;
      } else if (r && typeof r === "object" && typeof r.rating === "number") {
        sum += r.rating;
        count++;
      }
    }
    if (count === 0) return null;
    return {
      avg: (sum / count).toFixed(1),
      total: pkg.reviews.length,
    };
  };

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        r.package?.title?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        (r.comment || r.review || "").toLowerCase().includes(q)
    );
  }, [reviews, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border/60 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              Customer Reviews & Ratings
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {reviews.length}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitor individual traveler ratings and respective package average scores.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by package title, reviewer name, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-card border-border/60 text-sm"
          />
        </div>

        {searchQuery && (
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
        )}
      </div>

      {/* ── Review Cards Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-card border border-border/60 rounded-2xl h-56 animate-pulse p-5 space-y-3">
              <div className="h-5 bg-muted rounded-md w-3/4" />
              <div className="h-4 bg-muted rounded-md w-1/2" />
              <div className="h-16 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((item) => {
            const pkgStats = getPkgAverageRating(item.package);
            const reviewText = item.comment || item.review || "No written review provided.";

            return (
              <div
                key={item._id}
                className="bg-card border border-border/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Package Header & Package Average Rating */}
                <div className="space-y-2 border-b border-border/40 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground line-clamp-1">
                      <PackageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{item.package?.title || "Unknown Package"}</span>
                    </div>

                    <ConfirmDelete
                      onConfirm={() => handleDelete(item._id)}
                      title="Review"
                      className="h-8 w-8 p-0 rounded-lg text-destructive hover:bg-destructive/10"
                    />
                  </div>

                  {/* Respective Package Average Rating Badge */}
                  {pkgStats ? (
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>Package Avg: {pkgStats.avg} ★ ({pkgStats.total} reviews)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-md">
                      Package Avg: Unrated
                    </div>
                  )}
                </div>

                {/* Individual Reviewer Rating & Comment */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-yellow-400/30">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating?.toFixed(1) || "5.0"} / 5.0</span>
                    </div>

                    {item.createdAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-foreground/90 italic leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/30 line-clamp-4">
                    "{reviewText}"
                  </p>
                </div>

                {/* User Information Footer */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{item.user?.name || item.user?.email || "Anonymous Traveler"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-2">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">No Reviews Found</h3>
          <p className="text-xs text-muted-foreground">
            {searchQuery ? `No reviews match "${searchQuery}".` : "No customer reviews have been submitted yet."}
          </p>
        </div>
      )}
    </div>
  );
}
