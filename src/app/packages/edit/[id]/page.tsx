"use client";

import { useEffect, useState, useCallback } from "react";
import PackageForm from "@/components/forms/package";
import { Package } from "@/types/package";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import ConfirmDelete from "@/components/cards/confirmDelete";
import { Star, MessageSquare, User, Award } from "lucide-react";

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
}

interface PackageReview {
  _id: string;
  rating: number;
  comment?: string;
  review?: string;
  user?: ReviewUser;
  createdAt?: string;
}

export default function EditPackagePage() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState<Package>();
  const [reviews, setReviews] = useState<PackageReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const router = useRouter();

  const fetchPackageAndReviews = useCallback(async () => {
    try {
      const response = await api.get<{ package: Package }>(`/packages/${id}`);
      if (response.status !== 200) throw new Error("Failed to fetch package");
      setPackageData(response.data.package);

      // Fetch reviews for this package
      try {
        setLoadingReviews(true);
        const reviewsRes = await api.get(`/reviews?packageId=${id}`);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching package");
      router.push("/packages");
    }
  }, [id, router]);

  useEffect(() => {
    fetchPackageAndReviews();
  }, [fetchPackageAndReviews]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const response = await api.put<{ success: boolean }>(`/packages/${id}`, data);
      if (response.status !== 200) throw new Error("Failed to update package");

      toast.success("Package updated successfully");
      router.push("/packages");
    } catch (error) {
      console.error(error);
      toast.error("Error updating package");
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.status === 200 || res.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success("Review deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
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

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Edit Package</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update package parameters, accommodations, pricing, and traveler reviews.
        </p>
      </div>

      <PackageForm initialData={packageData} onSubmit={handleSubmit} />

      {/* ── Package Reviews & Rating Section ──────────────────────────────── */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Package Reviews & Customer Ratings
              </h2>
              <p className="text-xs text-muted-foreground">
                View all traveler reviews for this package and delete invalid feedback
              </p>
            </div>
          </div>

          {avgRating && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{avgRating} / 5.0 ({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {loadingReviews ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading reviews for this package…
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {reviews.map((item) => {
              const text = item.comment || item.review || "No comment provided.";

              return (
                <div
                  key={item._id}
                  className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-yellow-400/30">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating?.toFixed(1) || "5.0"}</span>
                      </div>

                      <ConfirmDelete
                        onConfirm={() => handleDeleteReview(item._id)}
                        title="Review"
                        className="h-8 px-2 rounded-lg text-destructive hover:bg-destructive/10 border-0"
                      />
                    </div>

                    <p className="text-xs text-foreground/90 italic bg-card p-3 rounded-lg border border-border/40 leading-relaxed">
                      "{text}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{item.user?.name || item.user?.email || "Traveler"}</span>
                    </div>

                    {item.createdAt && (
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">No Reviews Submitted</p>
            <p>This package does not have any customer reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
