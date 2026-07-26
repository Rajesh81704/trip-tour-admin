"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import ConfirmDelete from "@/components/cards/confirmDelete";
import { Star, X, MessageSquare, User, Trash2, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  review?: string;
  user?: ReviewUser;
  createdAt?: string;
}

interface PackageReviewsModalProps {
  packageId: string;
  packageTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewsUpdated?: () => void;
}

export default function PackageReviewsModal({
  packageId,
  packageTitle,
  isOpen,
  onClose,
  onReviewsUpdated,
}: PackageReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!packageId) return;
    try {
      setLoading(true);
      const response = await api.get(`/reviews?packageId=${packageId}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching package reviews:", error);
      toast.error("Failed to load reviews for this package");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, fetchReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.status === 200 || res.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success("Review deleted successfully");
        if (onReviewsUpdated) {
          onReviewsUpdated();
        }
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  if (!isOpen) return null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-card border border-border/80 text-card-foreground rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground line-clamp-1">
                Reviews for {packageTitle}
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage traveler ratings and comments for this package
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Package Average Summary Bar */}
        {avgRating && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Overall Rating: {avgRating} / 5.0</span>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Total Reviews: {reviews.length}
            </span>
          </div>
        )}

        {/* Modal Body - Reviews List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading package reviews…</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((item) => {
              const commentText = item.comment || item.review || "No comment provided.";

              return (
                <div
                  key={item._id}
                  className="bg-muted/30 border border-border/60 rounded-xl p-4 space-y-3 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-yellow-400/30">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating?.toFixed(1) || "5.0"}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.user?.name || item.user?.email || "Traveler"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.createdAt && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}

                      <ConfirmDelete
                        onConfirm={() => handleDeleteReview(item._id)}
                        title="Review"
                        className="h-8 px-2 rounded-lg text-destructive hover:bg-destructive/10 border-0"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed italic bg-card p-3 rounded-lg border border-border/40">
                    "{commentText}"
                  </p>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-foreground">No Reviews Found</h4>
              <p className="text-xs">No traveler reviews have been submitted for this package yet.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
